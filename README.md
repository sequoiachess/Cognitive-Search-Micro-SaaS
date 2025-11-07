# Cognitive Search Micro-SaaS (Serverless)

A fully serverless, browser-based AI document search application powered by Google Gemini 2.0 Flash with RAG (Retrieval-Augmented Generation).

## 🚀 Features

✅ **100% Serverless** - No backend server needed
✅ **User-Provided API Keys** - Users enter their own Gemini API key
✅ **Browser-Based Processing** - PDF processing happens in the browser
✅ **Firebase Firestore** - Cloud database for documents and embeddings
✅ **RAG System** - Search your uploaded documents
✅ **One-Click Deploy** - Deploy to Vercel instantly
✅ **Secure** - API keys stored locally in browser
✅ **Cost-Effective** - Only pay for what you use (Firebase + Gemini free tiers)

## 🏗️ Architecture
```
┌─────────────────┐
│   User Browser  │
│                 │
│  - React App    │
│  - PDF.js       │
│  - API Key      │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌────────────────┐  ┌──────────────────┐
│  Gemini API    │  │ Firebase         │
│  - Embeddings  │  │ Firestore        │
│  - Generation  │  │ - Documents      │
└────────────────┘  │ - Chunks         │
                    │ - Embeddings     │
                    └──────────────────┘
```

## 📋 Prerequisites

1. **Firebase Account** (free)
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project

2. **Gemini API Key** (free tier available)
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key

3. **Vercel Account** (free)
   - Go to [Vercel](https://vercel.com/)
   - Sign up with GitHub

## 🛠️ Setup Instructions

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: `cognitive-search`
3. Go to **Firestore Database** → **Create database**
4. Select **"Start in test mode"**
5. Choose your region
6. Go to **Project Settings** → **General**
7. Scroll to **"Your apps"** → Click **Web** icon (`</>`)
8. Register app: `cognitive-search-web`
9. Copy the `firebaseConfig` object

### Step 2: Update Firebase Configuration

Edit `frontend/src/firebase.js` and replace with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 3: Local Development
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Deploy to Vercel

#### Option A: Deploy via Git (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Serverless Cognitive Search"
git push origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **"Add New"** → **"Project"**
4. Import your GitHub repository
5. Framework Preset: **Create React App**
6. Root Directory: `frontend`
7. Click **"Deploy"**

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow the prompts
# Set root directory to: ./
# Build command: npm run build
# Output directory: build
```

### Step 5: Configure Firebase Security Rules

In Firebase Console, go to **Firestore Database** → **Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** These are permissive rules for development. For production, add proper authentication.

## 🎯 How to Use

### 1. Enter Your API Key

When you first open the app, you'll see a modal asking for your Gemini API key:

1. Click the link to get your API key
2. Paste it into the input field
3. Click "Save Key"

Your API key is stored in your browser's `localStorage` and never sent to any server.

### 2. Upload a Document

1. Go to the **"Upload Document"** section
2. Click **"Select PDF File"**
3. Choose a PDF from your computer
4. Click **"Upload Document"**
5. Wait for processing (30-60 seconds)
   - Text extraction
   - Chunking
   - Embedding creation
   - Storage in Firestore

### 3. Ask Questions

1. Type your question in the text area
2. Enable **"Search uploaded documents"** checkbox
3. Click **"Submit Query"**
4. View the AI-generated response with sources

### Example Queries

**After uploading a document:**
```
Summarize the key points from the document
```
```
What are the main topics covered?
```
```
Extract any important dates or numbers
```

**General knowledge (no documents):**
```
What is machine learning?
```

## 📊 Firestore Database Structure
```
documents/
├── {documentId}
│   ├── filename: string
│   ├── fileSize: number
│   ├── totalChunks: number
│   └── uploadDate: string

document_chunks/
├── {chunkId}
│   ├── documentId: string
│   ├── chunkIndex: number
│   ├── content: string
│   └── embedding: array<number>
```

## 🔒 Security & Privacy

✅ **API Key Storage**: Stored only in browser localStorage
✅ **No Server**: All processing happens in your browser
✅ **Firebase**: Documents stored in your Firebase project
✅ **HTTPS**: Vercel provides automatic HTTPS
✅ **No Tracking**: No analytics or tracking scripts

## 💰 Cost Breakdown

### Free Tier Limits:

**Gemini API (Free Tier):**
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

**Firebase (Free Tier):**
- 1 GB storage
- 50,000 reads/day
- 20,000 writes/day
- 10 GB bandwidth/month

**Vercel (Free Tier):**
- 100 GB bandwidth/month
- Automatic HTTPS
- Unlimited deployments

**Total Cost**: $0/month for moderate use!

## 🐛 Troubleshooting

### "Please enter your Gemini API key first"
- Click "🔑 Change API Key" button
- Enter a valid Gemini API key

### "Invalid Gemini API key format"
- Ensure your key starts with `AIzaSy`
- Get a new key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### "Failed to create embeddings"
- Check your API rate limits
- Wait a few minutes and try again
- Use smaller documents

### PDF Upload Fails
- Ensure PDF has extractable text (not just images)
- Try a smaller PDF first
- Check browser console for errors

### Document Not Found in Queries
- Verify document uploaded successfully
- Check Firebase Console → Firestore Database
- Ensure "Search uploaded documents" is checked

## 📁 Project Structure
```
cognitive-search-micro-saas/
├── frontend/
│   ├── public/
│   │   └── index.html          (includes PDF.js)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApiKeyModal.jsx
│   │   │   ├── ApiKeyModal.css
│   │   │   ├── FileUpload.jsx
│   │   │   └── FileUpload.css
│   │   ├── pages/
│   │   │   ├── homepage.jsx
│   │   │   └── homepage.css
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   └── documentService.js
│   │   ├── utils/
│   │   │   └── pdfUtils.js
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── vercel.json
├── .gitignore
└── README.md
```

## 🚀 Deployment Checklist

- [ ] Create Firebase project
- [ ] Enable Firestore Database
- [ ] Update `frontend/src/firebase.js` with your config
- [ ] Test locally with `npm start`
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Update Firebase security rules (for production)
- [ ] Get Gemini API key
- [ ] Test deployed app

## 🆕 What's Different from v1.0

| Feature | v1.0 (Python) | v2.0 (Serverless) |
|---------|---------------|-------------------|
| Backend | FastAPI | None |
| Database | PostgreSQL | Firebase Firestore |
| Deployment | Complex | One-click |
| API Key | Server-side | User-provided |
| Processing | Server | Browser |
| Cost | ~$20/month | ~$0/month |

---

## 🎉 You're Ready!

Your serverless Cognitive Search app is now complete and ready to deploy!

**Next Steps:**
1. Update Firebase config
2. Test locally
3. Deploy to Vercel
4. Share with users!

**Live Demo**: [Your Vercel URL after deployment]
