import React, { useState, useEffect } from 'react';
import { diseaseAPI } from '../services/api';
import { toast } from 'react-toastify';
import './DiseaseHistory.css';

const DiseaseHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiseaseHistory();
  }, []);

  const loadDiseaseHistory = async () => {
    try {
      setLoading(true);
      const response = await diseaseAPI.getHistory();
      setHistory(response.data.history);
    } catch (error) {
      toast.error('Failed to load disease history');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#4caf50';
    if (confidence >= 60) return '#ff9800';
    return '#f44336';
  };

  if (loading) {
    return <div className="loading">Loading your disease detection history...</div>;
  }

  return (
    <div className="disease-history">
      <div className="history-header">
        <h1>📋 Disease Detection History</h1>
        <p>View all your previous plant disease detections and recommendations</p>
      </div>

      {history.length > 0 ? (
        <div className="history-list">
          {history.map((item, index) => (
            <div key={item._id || index} className="history-card">
              <div className="history-header-row">
                <div className="disease-info">
                  <h3>{item.disease}</h3>
                  <span
                    className="confidence-badge"
                    style={{ backgroundColor: getConfidenceColor(item.confidence) }}
                  >
                    {item.confidence}% confidence
                  </span>
                </div>
                <div className="history-date">
                  {new Date(item.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="history-content">
                <div className="recommendations">
                  <div className="treatment">
                    <h4>💊 Treatment</h4>
                    <p>{item.fertilizer}</p>
                  </div>
                </div>

                {item.image && (
                  <div className="history-image">
                    <h4>📷 Uploaded Image</h4>
                    <img
                      src={`data:image/jpeg;base64,${item.image}`}
                      alt="Detected plant"
                      className="uploaded-image"
                    />
                  </div>
                )}
              </div>

              <div className="history-actions">
                <button
                  className="chat-btn"
                  onClick={() => {
                    // Navigate to chatbot with this disease context
                    window.location.href = `/chat?disease=${encodeURIComponent(item.disease)}`;
                  }}
                >
                  💬 Ask About This Disease
                </button>
                <button className="detect-again-btn">
                  🔍 Detect Again
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-history">
          <div className="no-history-content">
            <h3>No disease detection history</h3>
            <p>You haven't uploaded any plant images for disease detection yet.</p>
            <a href="/upload" className="detect-btn">
              Start Detecting Diseases
            </a>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-stats">
          <div className="stat-card">
            <h4>Total Detections</h4>
            <p className="stat-number">{history.length}</p>
          </div>
          <div className="stat-card">
            <h4>High Confidence (&gt;80%)</h4>
            <p className="stat-number">
              {history.filter(h => h.confidence > 80).length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Most Common Disease</h4>
            <p className="stat-text">
              {history.length > 0 ?
                Object.entries(
                  history.reduce((acc, h) => {
                    acc[h.disease] = (acc[h.disease] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1])[0][0]
                : 'None'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseHistory;