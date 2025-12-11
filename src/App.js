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
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [stats, setStats] = useState(null);
  const [retraining, setRetraining] = useState(false);
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
    setFeedbackSubmitted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFeedback = async (correctGender) => {
    if (!selectedImage || !result) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('correctGender', correctGender);
    formData.append('prediction', result.gender);
    formData.append('confidence', result.confidence);

    try {
      const response = await axios.post(`${API_URL}/api/feedback`, formData);
      
      if (response.data.success) {
        setFeedbackSubmitted(true);
        fetchStats(); // Update statistics
        setTimeout(() => {
          handleReset();
        }, 2000);
      }
    } catch (err) {
      setError('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleSaveModel = async () => {
    if (!window.confirm('Save the current model state? This will create a backup.')) {
      return;
    }

    setRetraining(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/save-model`);
      
      if (response.data.success) {
        alert(`Model saved successfully!\n\nBackup created: ${response.data.backup_created}`);
        fetchStats();
      }
    } catch (err) {
      setError('Failed to save model');
    } finally {
      setRetraining(false);
    }
  };

  // Fetch stats on component mount
  React.useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2"/>
              <path d="M15 17C15 15.3431 16.3431 14 18 14C19.6569 14 21 15.3431 21 17C21 18.6569 19.6569 20 18 20C16.3431 20 15 18.6569 15 17Z" fill="white"/>
              <path d="M22 17C22 15.3431 23.3431 14 25 14C26.6569 14 28 15.3431 28 17C28 18.6569 26.6569 20 25 20C23.3431 20 22 18.6569 22 17Z" fill="white"/>
              <path d="M13 28C13 24.6863 15.6863 22 19 22H24C27.3137 22 30 24.6863 30 28V29H13V28Z" fill="white"/>
            </svg>
          </div>
          <h1 className="title">Gender Classifier</h1>
          <p className="subtitle">AI-Powered Photo Analysis</p>
        </header>

        <div className="main-content">
          <div 
            className={`upload-zone ${preview ? 'has-image' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            {!preview ? (
              <>
                <div className="upload-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Drop your image here</h3>
                <p>or click to browse</p>
                <span className="file-types">PNG, JPG, JPEG up to 10MB</span>
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

          {error && (
            <div className="alert error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}

          {result && !feedbackSubmitted && (
            <div className="result-card">
              <div className="result-header">
                <h2>Analysis Result</h2>
              </div>
              <div className="result-content">
                <div className={`gender-badge ${result.gender.toLowerCase()}`}>
                  {result.gender}
                </div>
                <div className="confidence-container">
                  <span className="confidence-label">Confidence</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                  <span className="confidence-value">{result.confidence}%</span>
                </div>
              </div>
              <div className="feedback-section">
                <p className="feedback-question">Is this prediction correct?</p>
                <div className="feedback-buttons">
                  <button 
                    className="feedback-btn correct"
                    onClick={() => handleFeedback(result.gender)}
                    disabled={loading}
                  >
                    ✓ Yes, Correct
                  </button>
                  <button 
                    className="feedback-btn incorrect"
                    onClick={() => handleFeedback(result.gender === 'Male' ? 'Female' : 'Male')}
                    disabled={loading}
                  >
                    ✗ No, It's {result.gender === 'Male' ? 'Female' : 'Male'}
                  </button>
                </div>
                <p className="feedback-note">🔒 Private & secure - Model learns instantly without storing your image</p>
              </div>
            </div>
          )}

          {feedbackSubmitted && (
            <div className="feedback-success">
              <div className="success-icon">✓</div>
              <h3>Model Updated!</h3>
              <p>AI learned from your feedback instantly. Your image was processed but not saved - complete privacy guaranteed.</p>
            </div>
          )}

          {stats && (
            <div className="stats-card">
              <div className="privacy-badge">
                🔒 Privacy-Safe Learning
              </div>
              <h3>Learning Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Feedback</span>
                  <span className="stat-value">{stats.total_feedback}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Accuracy</span>
                  <span className="stat-value">{stats.accuracy}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Correct</span>
                  <span className="stat-value">{stats.correct_predictions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Trainings</span>
                  <span className="stat-value">{stats.online_training_count}</span>
                </div>
              </div>
              <div className="privacy-note">
                <strong>🛡️ Your Privacy Matters:</strong>
                <p>No images are stored. The model learns instantly from your feedback and forgets the image immediately.</p>
              </div>
              {stats.total_feedback >= 10 && (
                <button 
                  className="retrain-btn"
                  onClick={handleSaveModel}
                  disabled={retraining}
                >
                  {retraining ? 'Saving...' : '💾 Save Model Progress'}
                </button>
              )}
            </div>
          )}

          <div className="button-group">
            {preview && !result && (
              <button 
                className="btn btn-primary" 
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Analyze Image
                  </>
                )}
              </button>
            )}
            
            {(preview || result) && (
              <button 
                className="btn btn-secondary" 
                onClick={handleReset}
                disabled={loading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Try Another Image
              </button>
            )}
          </div>
        </div>

        <footer className="footer">
          <p>Powered by TensorFlow & MobileNetV2</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
