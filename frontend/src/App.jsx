import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ApiKeyModal from './components/ApiKeyModal';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleSaveApiKey = (key) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setShowModal(false);
  };

  const handleChangeApiKey = () => {
    setShowModal(true);
  };

  return (
    <Router>
      <div className="app">
        {showModal && (
          <ApiKeyModal
            onSave={handleSaveApiKey}
            onClose={() => setShowModal(false)}
            currentKey={apiKey}
          />
        )}
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                apiKey={apiKey} 
                onChangeApiKey={handleChangeApiKey}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
