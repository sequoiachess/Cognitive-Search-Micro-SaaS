# Cognitive Search Micro-SaaS

A full-stack application that enables document ingestion and intelligent querying using Google's Gemini 2.0 Flash API.

## Technology Stack

- **Frontend:** React (no build tool required for CodeSandbox)
- **Backend:** Python FastAPI
- **LLM:** Google Gemini 2.0 Flash API
- **Database:** PostgreSQL
- **Container:** Docker Compose

## Prerequisites

- Node.js 18+ and npm (for local development)
- Python 3.11+
- Docker and Docker Compose
- Google Cloud API Key with Gemini API access

## Setup Instructions

### Option 1: CodeSandbox (Easiest)

1. Create a new React sandbox on CodeSandbox
2. Upload all frontend files to the sandbox
3. CodeSandbox will automatically detect React and install dependencies
4. For backend, you'll need to run it locally or deploy separately

### Option 2: Local Development

#### 1. Clone and Configure Environment
```bash
# Navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
```

#### 2. Start Database with Docker Compose
```bash
# From project root
docker-compose up -d
```

#### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (create tables)
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

#### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user

### Data Management
- `POST /api/v1/data/ingest` - Upload PDF document

### Query
- `POST /api/v1/query/llm` - Query using Gemini 2.0 Flash

## Testing
```bash
cd backend
pytest tests/test_api.py -v
```

## Security Notes

- Rate limiting implemented (10 requests per minute per IP)
- Passwords hashed with bcrypt
- API keys stored in environment variables
- CORS configured for frontend domain

## License

MIT
