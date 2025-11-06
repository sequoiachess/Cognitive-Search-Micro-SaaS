import React, { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/v1/data/ingest", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadResult(response.data);
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "An error occurred while uploading the file"
      );
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

        <button
          type="submit"
          disabled={uploading || !file}
          className={`btn btn-success ${
            uploading || !file ? "btn-disabled" : ""
          }`}
        >
          {uploading ? "Uploading..." : "Upload Document"}
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
            File: {uploadResult.filename} (
            {(uploadResult.file_size / 1024).toFixed(2)} KB)
          </p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
