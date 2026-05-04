// FertilizerStore.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { 
  ExternalLink, 
  Search, 
  Filter, 
  X, 
  Heart, 
  Eye,
  Star,
  Leaf,
  ShoppingBag,
  AlertCircle
} from "lucide-react";
import "./FertilizerStore.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="fertilizer-grid">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="fertilizer-card skeleton">
        <div className="card-header skeleton-shine">
          <div className="skeleton-title"></div>
        </div>
        <div className="card-content">
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text short"></div>
          <div className="products-grid">
            <div className="skeleton-product"></div>
            <div className="skeleton-product"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState = ({ onClearFilters }) => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <Leaf size={64} />
    </div>
    <h3>No fertilizers found</h3>
    <p>Try adjusting your search or filters to find what you're looking for</p>
    <button onClick={onClearFilters} className="clear-filters-btn">
      Clear All Filters
    </button>
  </div>
);

// Fertilizer Card Component
const FertilizerCard = ({ fertilizer, onViewDetails, onToggleFavorite, isFavorite }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="fertilizer-card">
      <button 
        className="favorite-btn"
        onClick={() => onToggleFavorite(fertilizer.id)}
      >
        <Heart size={20} fill={isFavorite ? "#ff4757" : "none"} color={isFavorite ? "#ff4757" : "#999"} />
      </button>

      <div className="card-header">
        <h3>{fertilizer.disease || fertilizer.id}</h3>
        <div className="badges">
          {fertilizer.isOrganic && <span className="badge organic">🌱 Organic</span>}
          {fertilizer.isRecommended && <span className="badge recommended">⭐ Recommended</span>}
        </div>
      </div>

      <div className="card-content">
        <div className="treatment-section">
          <h4>Treatment</h4>
          <p>{fertilizer.treatment?.substring(0, 120)}...</p>
        </div>

        <div className="fertilizer-section">
          <h4>Fertilizer Recommendation</h4>
          <p>{fertilizer.fertilizer}</p>
        </div>

        {fertilizer.fertilizer_links && fertilizer.fertilizer_links.length > 0 && (
          <div className="fertilizer-products">
            <h5>Recommended Products:</h5>
            <div className="products-grid">
              {fertilizer.fertilizer_links.slice(0, 2).map((link, idx) => (
                <div key={idx} className="product-item">
                  <div className="product-image">
                    <img
                      src={!imageError ? link.image : "https://via.placeholder.com/150?text=Product"}
                      alt={`Fertilizer product ${idx + 1}`}
                      onError={() => setImageError(true)}
                    />
                  </div>
                  <button
                    className="buy-btn"
                    onClick={() => window.open(link.url, "_blank")}
                  >
                    <ShoppingBag size={14} />
                    View Product
                  </button>
                </div>
              ))}
            </div>
            {fertilizer.fertilizer_links.length > 2 && (
              <button 
                className="view-more-btn"
                onClick={() => onViewDetails(fertilizer)}
              >
                View All Products <Eye size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// View Details Modal
const ViewDetailsModal = ({ fertilizer, onClose }) => {
  if (!fertilizer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{fertilizer.disease || fertilizer.id}</h2>
          <div className="modal-badges">
            {fertilizer.isOrganic && <span className="badge organic">🌱 Organic</span>}
            {fertilizer.isRecommended && <span className="badge recommended">⭐ Recommended</span>}
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3>Treatment Details</h3>
            <p>{fertilizer.treatment}</p>
          </div>

          <div className="modal-section">
            <h3>Fertilizer Recommendation</h3>
            <p>{fertilizer.fertilizer}</p>
          </div>

          {fertilizer.fertilizer_links && fertilizer.fertilizer_links.length > 0 && (
            <div className="modal-section">
              <h3>All Products ({fertilizer.fertilizer_links.length})</h3>
              <div className="modal-products-grid">
                {fertilizer.fertilizer_links.map((link, idx) => (
                  <div key={idx} className="modal-product-item">
                    <img src={link.image} alt={`Product ${idx + 1}`} />
                    <button onClick={() => window.open(link.url, "_blank")}>
                      View Product <ExternalLink size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function FertilizerStore() {
  const [diseaseData, setDiseaseData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [selectedFertilizer, setSelectedFertilizer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDiseaseInfo();
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("fertilizerFavorites");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const fetchDiseaseInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/diseaseInfo`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch disease information");
      }
      
      const data = await response.json();
      // Transform data to add organic/recommended flags
      const enhancedData = {};
      Object.entries(data).forEach(([key, value]) => {
        enhancedData[key] = {
          ...value,
          id: key,
          isOrganic: Math.random() > 0.5, // Replace with actual logic
          isRecommended: value.fertilizer?.toLowerCase().includes("organic") || Math.random() > 0.7
        };
      });
      setDiseaseData(enhancedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching disease info:", err);
      setError(err.message);
      toast.error("Failed to load fertilizer information");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
        toast.info("Removed from favorites");
      } else {
        newFavorites.add(id);
        toast.success("Added to favorites");
      }
      localStorage.setItem("fertilizerFavorites", JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  }, []);

  // Get unique disease types and categories for filters
  const diseaseTypes = useMemo(() => {
    const types = new Set();
    Object.values(diseaseData).forEach(item => {
      if (item.disease) types.add(item.disease.split(' ')[0]);
    });
    return Array.from(types);
  }, [diseaseData]);

  const categories = useMemo(() => {
    const cats = new Set();
    Object.values(diseaseData).forEach(item => {
      if (item.fertilizer) cats.add(item.fertilizer.split(' ')[0]);
    });
    return Array.from(cats);
  }, [diseaseData]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    let results = Object.entries(diseaseData);
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(([_, info]) => 
        (info.disease && info.disease.toLowerCase().includes(term)) ||
        (info.fertilizer && info.fertilizer.toLowerCase().includes(term)) ||
        (info.treatment && info.treatment.toLowerCase().includes(term))
      );
    }
    
    // Disease type filter
    if (diseaseFilter) {
      results = results.filter(([_, info]) => 
        info.disease && info.disease.toLowerCase().includes(diseaseFilter.toLowerCase())
      );
    }
    
    // Category filter
    if (categoryFilter) {
      results = results.filter(([_, info]) => 
        info.fertilizer && info.fertilizer.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }
    
    return results;
  }, [diseaseData, searchTerm, diseaseFilter, categoryFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDiseaseFilter("");
    setCategoryFilter("");
    toast.info("All filters cleared");
  };

  if (loading) {
    return (
      <div className="fertilizer-store">
        <div className="fertilizer-header">
          <h1>🌿 Fertilizer Store</h1>
          <p>Get optimal fertilizer recommendations for your plants</p>
        </div>
        <div className="fertilizer-container">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fertilizer-error">
        <AlertCircle size={48} />
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

      {/* Search and Filter Bar */}
      <div className="search-filter-container">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by disease, fertilizer, or treatment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="clear-search">
              <X size={16} />
            </button>
          )}
        </div>

        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filters
        </button>

        <div className={`filter-dropdowns ${showFilters ? "show" : ""}`}>
          <select value={diseaseFilter} onChange={(e) => setDiseaseFilter(e.target.value)}>
            <option value="">All Disease Types</option>
            {diseaseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button onClick={handleClearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Stats */}
      <div className="results-stats">
        <p>Found {filteredData.length} fertilizer {filteredData.length === 1 ? 'recommendation' : 'recommendations'}</p>
        {favorites.size > 0 && <p className="favorites-count">❤️ {favorites.size} favorites</p>}
      </div>

      {/* Fertilizer Grid */}
      <div className="fertilizer-container">
        {filteredData.length > 0 ? (
          <div className="fertilizer-grid">
            {filteredData.map(([key, info]) => (
              <FertilizerCard
                key={key}
                fertilizer={info}
                onViewDetails={setSelectedFertilizer}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.has(key)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onClearFilters={handleClearFilters} />
        )}
      </div>

      {/* View Details Modal */}
      {selectedFertilizer && (
        <ViewDetailsModal
          fertilizer={selectedFertilizer}
          onClose={() => setSelectedFertilizer(null)}
        />
      )}
    </div>
  );
}

export default FertilizerStore;