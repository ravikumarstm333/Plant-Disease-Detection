import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ExternalLink, Loader } from "lucide-react";
import "./FertilizerStore.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FertilizerStor() {
  const [diseaseData, setDiseaseData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiseaseInfo();
  }, []);

  const fetchDiseaseInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/diseaseInfo`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch disease information");
      }
      
      const data = await response.json();
      setDiseaseData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching disease info:", err);
      setError(err.message);
      toast.error("Failed to load fertilizer information");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = (url) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="fertilizer-loading">
        <Loader size={48} className="spinner" />
        <p>Loading fertilizer recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fertilizer-error">
        <h2>Error Loading Fertilizer Store</h2>
        <p>{error}</p>
        <button onClick={fetchDiseaseInfo} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fertilizer-store">
      <div className="fertilizer-header">
        <h1>🌿 Fertilizer Store</h1>
        <p>Get optimal fertilizer recommendations for your plants</p>
      </div>

      <div className="fertilizer-container">
        {Object.entries(diseaseData).length > 0 ? (
          <div className="fertilizer-grid">
            {Object.entries(diseaseData).map(([key, info]) => (
              <div key={key} className="fertilizer-card">
                <div className="card-header">
                  <h3>{info.disease || key}</h3>
                </div>

                <div className="card-content">
                  <div className="treatment-section">
                    <h4>Treatment</h4>
                    <p>{info.treatment}</p>
                  </div>

                  <div className="fertilizer-section">
                    <h4>Fertilizer Recommendation</h4>
                    <p>{info.fertilizer}</p>
                  </div>

                  {info.fertilizer_links && info.fertilizer_links.length > 0 && (
                    <div className="fertilizer-products">
                      <h5>Recommended Products:</h5>
                      <div className="products-grid">
                        {info.fertilizer_links.map((link, idx) => (
                          <div key={idx} className="product-item">
                            <div className="product-image">
                              <img
                                src={link.image}
                                alt={`Fertilizer product ${idx + 1}`}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/150?text=Product+Image";
                                }}
                              />
                            </div>
                            <button
                              className="buy-btn"
                              onClick={() => handleOpenLink(link.url)}
                              title={link.url}
                            >
                              <ExternalLink size={16} />
                              View Product
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>No fertilizer data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FertilizerStor;