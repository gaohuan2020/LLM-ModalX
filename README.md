# LLM-ModalX

LLM-ModalX represents a revolutionary leap in the realm of data processing. This innovative product harnesses the power of advanced Large Language Models (LLMs) to perform comprehensive and intelligent operations on multimodal data. In the collection phase, it scours diverse digital landscapes, adeptly gathering text, images, audio, and video from a multitude of sources, ensuring a rich and varied data pool. When it comes to organization, LLM-ModalX employs its sophisticated algorithms to structure and classify the collected multimodal data, discerning meaningful relationships between different modalities to create an orderly and accessible framework. Finally, in the generation stage, it leverages the knowledge gleaned from the processed data to produce novel and valuable multimodal outputs, such as accurate image captions, incisive audio-visual summaries, and even creative multimodal combinations. Whether it's for research, content creation, or data analysis, LLM-ModalX is the go-to solution for unlocking the full potential of multimodal data with the prowess of LLMs.


## Getting Started

### Frontend Setup
bash
cd front-end
npm install
npm run dev

### Backend Setup
```bash
cd back-end
pip install -r requirements.txt
python app.py
```

### LLM Service Setup
To start the vLLM OpenAI-compatible service:

python -m vllm.entrypoints.openai.api_server \
--model Models/Qwen2.5-72b-Instruct \
--host 127.0.0.1 \
--port 8000
```

## Configuration

The system configuration is managed through `back-end/agent/rag/config.yaml`. Here's a breakdown of the key components:

### LLM Configuration
```yaml
llm:
  api_base: "http://127.0.0.1:8000/v1"   # vLLM OpenAI-compatible API endpoint
  model: "Models/Qwen2.5-72b-Instruct"   # LLM model path or identifier
  api_key: "token-abc123"                # API authentication token
  temperature: 0.0                       # Controls randomness in generation (0.0 = deterministic)
```

### Embeddings Configuration
```yaml
embeddings:
  model: "custom-embedding-zh"           # Embedding model identifier
  base_url: "http://45.252.106.202:9997/v1"  # XInference API endpoint
  api_key: "not empty"                   # API authentication token
```

### Prompts Configuration
The config includes several specialized prompts for different components:
- `retrieval_grader`: Evaluates relevance of retrieved documents
- `hallucination_grader`: Checks if LLM outputs are grounded in retrieved facts
- `answer_grader`: Assesses if answers properly address questions
- `question_rewriter`: Optimizes questions for better vector store retrieval