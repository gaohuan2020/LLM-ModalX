from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
from functools import wraps
import os
from werkzeug.utils import secure_filename

# Flask app configuration
app = Flask(__name__)
CORS(app)

# Constants
UPLOAD_FOLDER = 'uploads/audio'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Mock database (TODO: replace with real database in production)
users = {"admin@example.com": {"password": "admin123", "role": "admin"}}


def allowed_file(filename: str) -> bool:
    """
    Check if the uploaded file has an allowed extension.
    
    Args:
        filename (str): Name of the uploaded file
        
    Returns:
        bool: True if file extension is allowed, False otherwise
    """
    return '.' in filename and filename.rsplit(
        '.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/login', methods=['POST'])
def login():
    """Handle user login requests."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400

    user = users.get(email)
    if user and user['password'] == password:
        return jsonify({'email': email, 'role': user['role']})

    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if the service is running."""
    return jsonify({'status': 'healthy', 'message': 'Service is running'})


@app.route('/api/upload-audio', methods=['POST'])
def upload_audio():
    """
    Handle audio file uploads.
    
    Returns:
        JSON response with upload status and filename
    """
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400

    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if audio_file and allowed_file(audio_file.filename):
        filename = secure_filename(audio_file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        final_filename = f"{timestamp}_{filename}"

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], final_filename)
        audio_file.save(filepath)

        return jsonify({
            'message': 'File uploaded successfully',
            'filename': final_filename
        })

    return jsonify({'error': 'Invalid file type'}), 400


if __name__ == '__main__':
    # TODO: Remove debug mode and hardcoded IP in production
    app.run(host='45.252.106.202', port=5000, debug=True)
