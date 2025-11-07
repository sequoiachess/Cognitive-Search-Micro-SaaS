import React, { useState } from 'react';
import './ApiKeyModal.css';

function ApiKeyModal({ onSave, onClose, currentKey }) {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }
    
    if (!apiKey.startsWith('AIzaSy')) {
      setError('Invalid Gemini API key format');
      return;
    }
    
    onSave(apiKey);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">🔑 Enter Your Gemini API Key</h2>
        
        <p className="modal-description">
          To use Cognitive Search, you need a Google Gemini API key. 
          Your key is stored locally in your browser and never sent to our servers.
        </p>
        
        <div className="modal-instructions">
          <p><strong>How to get your API key:</strong></p>
          <ol>
            <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Click "Create API Key"</li>
            <li>Copy and paste it below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">Gemini API Key:</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="AIzaSy..."
              className="api-key-input"
            />
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="modal-actions">
            {currentKey && (
              <button 
                type="button" 
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit"
              className="btn btn-primary"
            >
              {currentKey ? 'Update Key' : 'Save Key'}
            </button>
          </div>
        </form>

        <div className="modal-note">
          <strong>Note:</strong> This app runs entirely in your browser. 
          Your API key and documents are stored locally and never sent to external servers.
        </div>
      </div>
    </div>
  );
}

export default ApiKeyModal;
