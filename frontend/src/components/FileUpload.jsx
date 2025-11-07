import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { DocumentService } from '../services/documentService';
import { extractTextFromPDF, chunkText } from '../utils/pdfUtils';
import './FileUpload.css';

function FileUpload({ apiKey, onDocumentUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  const documentService = new DocumentService();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!apiKey) {
      setError('Please enter your Gemini API key first');
      return;
    }

    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);
    setProgress('Extracting text from PDF...');

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      
      if (text.length < 100) {
        throw new Error('PDF appears to be empty or text could not be extracted');
      }

      setProgress(`Extracted ${text.length} characters. Creating chunks...`);

      // Split into chunks
      const textChunks = chunkText(text);
      setProgress(`Created ${textChunks.length} chunks. Creating embeddings...`);

      // Create embeddings for each chunk
      const geminiService = new GeminiService(apiKey);
      const chunksWithEmbeddings = [];

      for (let i = 0; i < textChunks.length; i++) {
        try {
          setProgress(`Creating embedding ${i + 1}/${textChunks.length}...`);
          const embedding = await geminiService.createEmbedding(textChunks[i]);
          
          chunksWithEmbeddings.push({
            content: textChunks[i],
            embedding: embedding
          });

          // Add delay to avoid rate limits
          if (i > 0 && i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          console.error(`Error creating embedding for chunk ${i}:`, err);
          // Continue with other chunks
        }
      }

      if (chunksWithEmbeddings.length === 0) {
        throw new Error('Failed to create embeddings for document');
      }

      setProgress('Storing document in database...');

      // Upload to Firestore
      const result = await documentService.uploadDocument(
        file.name,
        file.size,
        chunksWithEmbeddings
      );

      setUploadResult({
        message: 'Document ingested successfully',
        filename: file.name,
        file_size: file.size,
        chunks_created: result.chunksCreated
      });

      setFile(null);
      setProgress('');
      e.target.reset();

      // Notify parent component
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred while uploading the file');
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Upload Document</h2>

      <form onSubmit={handleUpload}>
        <div className="form-group">
          <label className="form-label">Select PDF File</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
            disabled={uploading}
          />
        </div>

        {file && (
          <div className="file-info">
            <p>
              <span className="file-label">Selected:</span> {file.name} (
              {(file.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

        {progress && (
          <div className="progress-info">
            <p>{progress}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file || !apiKey}
          className={`btn btn-success ${uploading || !file || !apiKey ? 'btn-disabled' : ''}`}
        >
          {uploading ? 'Processing...' : 'Upload Document'}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      {uploadResult && (
        <div className="alert alert-success">
          <p className="alert-title">{uploadResult.message}</p>
          <p className="alert-subtitle">
            File: {uploadResult.filename} ({(uploadResult.file_size / 1024).toFixed(2)} KB)
          </p>
          <p className="alert-subtitle">Chunks created: {uploadResult.chunks_created}</p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
