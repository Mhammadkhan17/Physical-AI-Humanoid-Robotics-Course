# Quickstart Guide: Physical AI & Humanoid Robotics AI-Native Textbook

This guide provides instructions to quickly set up and run the Docusaurus frontend and the FastAPI RAG backend locally.

## 1. Prerequisites

Ensure you have the following installed:

*   Node.js (LTS version) & npm/yarn
*   Python 3.11+
*   Docker (for Qdrant or local Postgres if not using cloud services)
*   Git

## 2. Clone the Repository

```bash
git clone [YOUR_REPOSITORY_URL]
cd book
```

## 3. Frontend Setup (Docusaurus)

Navigate to the project root and install JavaScript dependencies:

```bash
# From the project root (where package.json is)
npm install
# or yarn install
```

### Run Frontend Locally

```bash
npm start
# or yarn start
```

This will open the Docusaurus site in your browser at `http://localhost:3000`.

## 4. Backend Setup (FastAPI RAG Service)

Navigate to the `backend` directory and set up a Python virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt # Assuming you have a requirements.txt, or install manually
```

**Note**: You will need to create a `requirements.txt` file in the `backend/` directory with `fastapi`, `uvicorn`, `langchain`, `qdrant-client`, `langchain-google-genai`, `pydantic`. The initial backend skeleton already uses `pydantic` in `main.py`.

### Environment Variables

Create a `.env` file in the `backend/` directory with your Qdrant credentials and Google API key for embeddings/LLMs:

```env
QDRANT_HOST="your_qdrant_cloud_host"
QDRANT_API_KEY="your_qdrant_api_key"
GOOGLE_API_KEY="your_google_api_key"
# For local development, if you're running Qdrant locally via Docker, you might not need QDRANT_HOST/API_KEY
```

### Run Backend Locally

```bash
uvicorn main:app --reload
```

This will start the FastAPI server, typically at `http://localhost:8000`.

## 5. Ingest Content

Before using the RAG chatbot, you need to ingest the textbook content into Qdrant. Ensure your backend is running and then make a POST request to the `/ingest` endpoint. The `content_path` should point to your Docusaurus `docs/` directory from the perspective of the backend application (e.g., `../docs` if `backend` and `docs` are siblings).

```bash
curl -X POST "http://localhost:8000/ingest" -H "Content-Type: application/json" -d '{ "content_path": "../docs" }'
```

Alternatively, you can run the ingestion script directly:

```bash
cd backend
python -m rag.ingest
```

## 6. Interact with the Chatbot

Once content is ingested, you can interact with the RAG chatbot via the `/chat` endpoint or through the Docusaurus frontend component.

```bash
curl -X POST "http://localhost:8000/chat" -H "Content-Type: application/json" -d '{ "query": "What are ROS 2 concepts?" }'
```

### Using Selected Text Mode

```bash
curl -X POST "http://localhost:8000/chat" -H "Content-Type: application/json" -d '{ "query": "Explain topics", "selected_text": "ROS 2 Topics are the primary mechanism for asynchronous, one-to-many communication." }'
```

---