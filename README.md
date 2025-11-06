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
- **Google Cloud API Key with Gemini API access** (Required)

## Getting Your Gemini API Key

Before running the application, you need to obtain a Google Gemini API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key
5. Keep it secure - you'll need it in the setup steps below

## Setup Instructions

### Option 1: CodeSandbox (Easiest)

1. Fork or clone this repository to CodeSandbox
2. **Configure Backend Environment Variables:**
```bash
   cd backend
   cp .env.example .env
```
3. **Edit the `.env` file and add your Gemini API key:**
```env
   DATABASE_URL=postgresql://dbuser:dbpassword@localhost:5432/cognitive_search
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   SECRET_KEY=your-secret-key-change-this-to-something-random-32-chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
```
4. **IMPORTANT:** Replace `your_actual_gemini_api_key_here` with your actual API key from Google AI Studio
5. Install frontend dependencies (CodeSandbox may do this automatically)
6. For backend, you'll need to run it separately (see Local Development)

### Option 2: Local Development

#### 1. Clone and Configure Environment
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cognitive-search-micro-saas.git
cd cognitive-search-micro-saas

# Navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use any text editor
```

**⚠️ CRITICAL STEP:** Open the `.env` file and replace the placeholder values with your actual credentials:
```env
DATABASE_URL=postgresql://dbuser:dbpassword@localhost:5432/cognitive_search
GEMINI_API_KEY=AIzaSy...your-actual-key-here  # ⚠️ REPLACE THIS
SECRET_KEY=your-secure-random-string-at-least-32-characters-long  # ⚠️ CHANGE THIS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
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

**Keep this terminal running!** Backend will be available at `http://localhost:8000`

#### 4. Frontend Setup (Open a NEW Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at `http://localhost:3000`

## Running Both Backend and Frontend Simultaneously

**You need BOTH servers running at the same time:**

### Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

The frontend automatically proxies API requests to the backend via the configuration in `package.json`.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user

### Data Management
- `POST /api/v1/data/ingest` - Upload PDF document

### Query
- `POST /api/v1/query/llm` - Query using Gemini 2.0 Flash

## Testing the Application

### Test Queries:

1. **Simple Query:**
```
   What is photosynthesis?
```

2. **Technical Query:**
```
   What are the differences between React and Vue.js?
```

3. **Complex Query:**
```
   Explain the benefits and challenges of cloud computing for small businesses
```

### Expected Response Format:
```json
{
  "answer": "Detailed answer (minimum 50 words)...",
  "confidence": "high/medium/low",
  "sources": ["Document Title 1", "Document Title 2"],
  "follow_up_questions": ["Question 1?", "Question 2?"]
}
```

### Testing PDF Upload:

1. Create or download any PDF file
2. Use the "Upload Document" section
3. You should see a success message with filename and size

## Testing
```bash
cd backend
pytest tests/test_api.py -v
```

## Security Notes

- **NEVER commit your `.env` file to GitHub** - it contains your API keys
- The `.gitignore` file is configured to exclude `.env` files
- Rate limiting implemented (10 requests per minute per IP)
- Passwords hashed with bcrypt
- API keys stored in environment variables only
- CORS configured for frontend domain

## Production Deployment (GCP)

1. Build Docker images
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Configure Cloud SQL for PostgreSQL
5. Set environment variables in Cloud Run (including your Gemini API key)
6. **Never hardcode API keys in your source code**

## Troubleshooting

### "Invalid API Key" Error
- Make sure you've created a `.env` file in the `backend/` directory
- Verify your Gemini API key is correct and has Gemini API access enabled
- Check that there are no extra spaces or quotes around the API key in `.env`

### "Invalid Host header" (Frontend)
- Create a `.env` file in `frontend/` directory with:
```
  DANGEROUSLY_DISABLE_HOST_CHECK=true
  WDS_SOCKET_PORT=0
```

### Backend won't start
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Make sure your virtual environment is activated
- Check that the `.env` file exists and has all required variables

### Frontend can't connect to Backend
- Verify both servers are running (backend on :8000, frontend on :3000)
- Check the proxy setting in `frontend/package.json` points to `http://localhost:8000`

## Environment Variables Reference

### Backend (.env)
```env
DATABASE_URL=postgresql://dbuser:dbpassword@localhost:5432/cognitive_search
GEMINI_API_KEY=<your-gemini-api-key>           # Required - Get from Google AI Studio
SECRET_KEY=<random-32-character-string>         # Required - Generate a secure random string
ALGORITHM=HS256                                 # Optional - Default is HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30                  # Optional - Default is 30
```

### Frontend (.env) - Optional
```env
DANGEROUSLY_DISABLE_HOST_CHECK=true  # Only needed for CodeSandbox/remote environments
WDS_SOCKET_PORT=0                     # Only needed for CodeSandbox/remote environments
```
---

## Important Security Reminders

🔒 **Your `.env` file should NEVER be committed to version control**

🔒 **Each person running this application needs their own Gemini API key**

🔒 **Change the `SECRET_KEY` to a unique, random value for production**
