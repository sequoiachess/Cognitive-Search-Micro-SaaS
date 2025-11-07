import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import { GeminiService } from '../services/geminiService';
import { DocumentService } from '../services/documentService';
import './HomePage.css';

function HomePage({ apiKey, onChangeApiKey }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [useDocuments, setUseDocuments] = useState(true);

  const geminiService = apiKey ? new GeminiService(apiKey) : null;
  const documentService = new DocumentService();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await documentService.listDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiKey) {
      setError('Please enter your Gemini API key first');
      return;
    }

    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let documentContext = null;
      let sourcesUsed = [];

      // Search documents if enabled and documents exist
      if (useDocuments && documents.length > 0) {
        try {
          const queryEmbedding = await geminiService.createEmbedding(query);
          const relevantChunks = await documentService.searchChunks(queryEmbedding, 3);

          if (relevantChunks.length > 0) {
            documentContext = relevantChunks
              .map((chunk, idx) => `[Document excerpt ${idx + 1}]:\n${chunk.content}`)
              .join('\n\n');

            // Get unique document IDs
            const docIds = [...new Set(relevantChunks.map(c => c.documentId))];
            sourcesUsed = documents
              .filter(doc => docIds.includes(doc.id))
              .map(doc => doc.filename);
          }
        } catch (err) {
          console.error('Error searching documents:', err);
          // Continue without document context
        }
      }

      const result = await geminiService.query(query, documentContext);

      setResponse({
        query: query,
        response: result,
        model: 'gemini-2.0-flash-exp',
        sources_used: sourcesUsed
      });
    } catch (err) {
      console.error('Query error:', err);
      setError(err.message || 'An error occurred while processing your query');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = () => {
    loadDocuments();
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Cognitive Search</h1>
        <p className="subtitle">Powered by Gemini 2.0 Flash with RAG</p>
        <button 
          onClick={onChangeApiKey}
          className="btn-change-key"
        >
          🔑 Change API Key
        </button>
      </div>

      {documents.length > 0 && (
        <div className="documents-info">
          <p>📄 {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded</p>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useDocuments}
              onChange={(e) => setUseDocuments(e.target.checked)}
            />
            Search uploaded documents
          </label>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Ask a Question</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query here..."
              className="textarea"
              rows="4"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !apiKey}
            className={`btn btn-primary ${loading || !apiKey ? 'btn-disabled' : ''}`}
          >
            {loading ? 'Processing...' : 'Submit Query'}
          </button>
        </form>

        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        {response && (
          <div className="response-card">
            <h3 className="response-title">Response</h3>

            <div className="response-content">
              <div className="response-section">
                <p className="response-label">Answer:</p>
                <p className="response-text">{response.response.answer}</p>
              </div>

              {response.response.confidence && (
                <div className="response-section">
                  <p className="response-label">Confidence:</p>
                  <span className={`badge badge-${response.response.confidence}`}>
                    {response.response.confidence}
                  </span>
                </div>
              )}

              {response.sources_used && response.sources_used.length > 0 && (
                <div className="response-section">
                  <p className="response-label">📄 Documents Used:</p>
                  <ul className="source-list">
                    {response.sources_used.map((source, index) => (
                      <li key={index} style={{ backgroundColor: '#dbeafe', fontWeight: '600' }}>
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {response.response.sources && response.response.sources.length > 0 && (
                <div className="response-section">
                  <p className="response-label">Sources:</p>
                  <ul className="source-list">
                    {response.response.sources.map((source, index) => (
                      <li key={index}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}

              {response.response.follow_up_questions &&
                response.response.follow_up_questions.length > 0 && (
                  <div className="response-section">
                    <p className="response-label">Follow-up Questions:</p>
                    <ul className="question-list">
                      {response.response.follow_up_questions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="response-footer">
                <p className="model-info">Model: {response.model}</p>
                {response.sources_used && response.sources_used.length > 0 && (
                  <p className="model-info" style={{ color: '#2563eb', fontWeight: '500' }}>
                    ✓ Using RAG with uploaded documents
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <FileUpload apiKey={apiKey} onDocumentUploaded={handleDocumentUploaded} />
    </div>
  );
}

export default HomePage;
