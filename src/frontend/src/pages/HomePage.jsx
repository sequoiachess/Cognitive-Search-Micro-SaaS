import React, { useState } from "react";
import axios from "axios";
import FileUpload from "../components/FileUpload";
import "./HomePage.css";

function HomePage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a query");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await axios.post("/api/v1/query/llm", {
        user_query: query,
      });
      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "An error occurred while processing your query"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Cognitive Search</h1>
        <p className="subtitle">Powered by Gemini 2.0 Flash</p>
      </div>

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
            disabled={loading}
            className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
          >
            {loading ? "Processing..." : "Submit Query"}
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
                  <span
                    className={`badge badge-${response.response.confidence}`}
                  >
                    {response.response.confidence}
                  </span>
                </div>
              )}

              {response.response.sources &&
                response.response.sources.length > 0 && (
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
                      {response.response.follow_up_questions.map(
                        (question, index) => (
                          <li key={index}>{question}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              <div className="response-footer">
                <p className="model-info">Model: {response.model}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <FileUpload />
    </div>
  );
}

export default HomePage;
