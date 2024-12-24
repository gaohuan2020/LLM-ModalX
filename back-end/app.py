from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from urllib.parse import urlparse
import pypandoc

from agent.rag.tools import VectorStore
from agent.rag.rag import get_rag_answer
from agent.writter.report_masitro.masitro import get_report_masitro
from audio.asr import ASRService
from utilities import extract_text_from_url, allowed_file, create_response

# Constants
UPLOAD_FOLDER = 'uploads/audio'
ALLOWED_ORIGINS = ["http://localhost:3000", "http://45.252.106.202:3000"]

# Flask app configuration
app = Flask(__name__)
CORS(app,
     resources={
         r"/api/*": {
             "origins": ALLOWED_ORIGINS,
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type"]
         }
     })

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('temp',
            exist_ok=True)  # Create temp directory for file conversions

# Initialize services
vectorstore = VectorStore(path="./chroma_db")
asr_service = ASRService()

# Mock database (TODO: replace with real database in production)
users = {"admin@example.com": {"password": "admin123", "role": "admin"}}


@app.route('/api/login', methods=['POST'])
def login():
    """Handle user login requests."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return create_response(error='Missing email or password',
                                   status_code=400)

        user = users.get(email)
        if user and user['password'] == password:
            return create_response({'email': email, 'role': user['role']})

        return create_response(error='Invalid credentials', status_code=401)
    except Exception as e:
        return create_response(error=str(e), status_code=500)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if the service is running."""
    return create_response({
        'status': 'healthy',
        'message': 'Service is running'
    })


@app.route('/api/upload-audio', methods=['POST'])
def upload_audio():
    """Handle audio file uploads and transcription."""
    try:
        if 'audio' not in request.files:
            return create_response(error='No audio file', status_code=400)

        audio_file = request.files['audio']
        if audio_file.filename == '':
            return create_response(error='No selected file', status_code=400)

        if not allowed_file(audio_file.filename):
            return create_response(error='Invalid file type', status_code=400)

        filename = secure_filename(audio_file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        final_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], final_filename)

        audio_file.save(filepath)
        transcription = asr_service.transcribe(filepath)

        doc = vectorstore.create_document(transcription, "audio")
        vectorstore.create_index([doc])

        return create_response({
            'message': 'File uploaded successfully',
            'filename': final_filename,
            'transcription': transcription
        })
    except Exception as e:
        return create_response(error=str(e), status_code=500)


@app.route('/api/search', methods=['POST'])
def search():
    """Handle vector search requests."""
    data = request.get_json()
    query = data.get('query')

    if not query:
        return jsonify({'error': 'Missing query'}), 400

    try:
        docs = vectorstore.search(query)
        results = []
        rag_answer = get_rag_answer(query, vectorstore)
        for i, doc in enumerate(docs):
            results.append({
                'id': i + 1,
                'name': 'AI Response',
                'content': doc.page_content,
                'type': doc.metadata.get("source"),
                'status': 'completed',
                'timestamp': 'just now',
                'avatar': f'https://picsum.photos/seed/ai{i+1}/200'
            })
        return jsonify({'results': results, 'rag_answer': rag_answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/parse-url', methods=['POST'])
def parse_url():
    """Handle URL parsing requests."""
    data = request.get_json()
    url = data.get('url')
    need_js = data.get('need_js', False)

    if not url:
        return jsonify({'error': 'Missing URL'}), 400

    try:
        # Validate URL
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return jsonify({'error': 'Invalid URL format'}), 400

        # Extract text content
        content = extract_text_from_url(url, need_js)

        # Create document and add to vector store
        doc = vectorstore.create_document(content, "text")
        vectorstore.create_index([doc])

        return jsonify({
            'message': 'URL parsed successfully',
            'content': content
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate', methods=['POST'])
def generate():
    """Generate markdown content based on title and configuration."""
    data = request.get_json()
    title = data.get('title')
    config = data.get('config')  # 获取配置信息

    if not title:
        return jsonify({'error': 'Missing title'}), 400

    try:
        # 将配置信息传递给生成函数
        report = get_report_masitro(title, vectorstore, config)

        return jsonify({
            'content': report,
            'message': 'Content generated successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def cleanup_temp_file(filepath):
    """Helper function to clean up temporary files"""
    if filepath and os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception:
            pass


@app.route('/api/convert-to-docx', methods=['POST'])
def convert_to_docx():
    """Convert markdown to DOCX and return the file."""
    temp_file = None
    try:
        data = request.get_json()
        markdown_content = data.get('markdown')
        title = data.get('title', 'document')

        if not markdown_content:
            return create_response(error='No content provided',
                                   status_code=400)

        temp_file = os.path.abspath(os.path.join('temp', f"temp_{title}.docx"))
        pypandoc.convert_text(markdown_content,
                              'docx',
                              format='md',
                              outputfile=temp_file)

        return send_file(
            temp_file,
            as_attachment=True,
            download_name=f"{title}.docx",
            mimetype=
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        return create_response(error=str(e), status_code=500)
    finally:
        cleanup_temp_file(temp_file)


@app.route('/api/convert-to-podcast', methods=['POST'])
def convert_to_podcast():
    """Convert text to speech and return as MP3."""
    try:
        data = request.get_json()
        text = data.get('text')
        title = data.get('title', 'podcast')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # TODO: Remove debug mode and hardcoded IP in production
    app.run(host='45.252.106.202', port=5000, debug=True)
