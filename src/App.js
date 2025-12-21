import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Use environment variable or fallback to relative path for local dev
const API_URL = process.env.REACT_APP_API_URL || '';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
      } else {
        setError('Please select a valid image file');
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post(`${API_URL}/api/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.error || 'Prediction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="logo-title">GenderPredictor</h1>
          </div>
        </header>

        <div className="hero-section">
          <h2 className="main-title">Identify gender from visuals.</h2>
          <p className="main-subtitle">Upload any portrait to instantly reveal the predicted gender and confidence score using our advanced AI models.</p>
        </div>

        <div className="content-grid">
          <div className="left-panel">
            <div className="panel-header">
              <span className="panel-title">INPUT IMAGE</span>
              <span className="file-formats">JPG, PNG, WEBP</span>
            </div>
            
            <div 
              className={`upload-zone ${preview ? 'has-image' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              {!preview ? (
                <>
                  <div className="upload-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V17M7 10L12 5M12 5L17 10M12 5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="upload-text">Drag & drop your image here</h3>
                  <p className="upload-subtext">or click to browse files</p>
                </>
              ) : (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />

            <div className="action-buttons">
              <button 
                className="btn-secondary" 
                onClick={handleReset}
                disabled={loading || !preview}
              >
                Clear
              </button>
              <button 
                className="btn-primary" 
                onClick={handleUpload}
                disabled={loading || !preview}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Predict Gender
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="right-panel">
            <div className="panel-header">
              <span className="panel-title">Analysis Result</span>
              {result && (
                <span className="status-badge success">SUCCESS</span>
              )}
            </div>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {result ? (
              <div className="result-display">
                <div className={`gender-icon ${result.gender.toLowerCase()}`}>
                  {result.gender.toLowerCase() === 'female' ? (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M12 13v8m0 0H9m3 0h3m-3-5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="14" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M14 10l5-5m0 0h-4m4 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                
                <h3 className="gender-label">{result.gender}</h3>
                <p className="detection-source">Detected from facial features</p>

                <div className="confidence-section">
                  <div className="confidence-header">
                    <span>Confidence Score</span>
                    <span className="confidence-percentage">{result.confidence}%</span>
                  </div>
                  <div className="confidence-bar-container">
                    <div 
                      className="confidence-bar-fill"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                  <p className="confidence-note">High certainty based on key biometric</p>
                </div>

                <div className="probability-grid">
                  <div className="probability-item">
                    <span className="prob-label">Female Probability</span>
                    <span className="prob-value">{result.gender.toLowerCase() === 'female' ? result.confidence : (100 - result.confidence).toFixed(1)}%</span>
                  </div>
                  <div className="probability-item">
                    <span className="prob-label">Male Probability</span>
                    <span className="prob-value">{result.gender.toLowerCase() === 'male' ? result.confidence : (100 - result.confidence).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="privacy-notice">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="privacy-text">
                    <strong>Your Privacy Matters</strong>
                    <p>No images are stored. Analysis is performed instantly and data is immediately discarded.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p>Upload an image to see the analysis result</p>
              </div>
            )}
          </div>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Fast & Accurate</h3>
            <p>Powered by TensorFlow & MobileNetV2 for instant results with high accuracy</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>100% Private</h3>
            <p>No data collection, no image storage - your photos are processed and immediately deleted</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>Real-time Analysis</h3>
            <p>Get predictions in seconds with confidence scores and detailed probability breakdown</p>
          </div>
        </div>

        <footer className="footer">
          <p>© 2025 Gender Predictor AI. All rights reserved. • Powered by TensorFlow & MobileNetV2</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
