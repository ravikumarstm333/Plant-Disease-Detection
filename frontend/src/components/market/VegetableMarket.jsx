import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './VegetableMarket.css';

const VegetableMarket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [prices, setPrices] = useState([]);
  const [newPrice, setNewPrice] = useState({ vegetableName: '', price: '' });
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(false);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const [listingsRes, pricesRes] = await Promise.all([
        marketAPI.getListings(),
        marketAPI.getMarketPrices()
      ]);

      setListings(listingsRes.data.listings || []);
      setPrices(pricesRes.data.prices || []);
      setSearchResults(false);
    } catch (error) {
      console.error('Error loading market data:', error);
      toast.error('Failed to load market data');
      setListings([]);
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  // Manager: Approve a listing
  const handleApprove = async (id) => {
    try {
      await marketAPI.approveListing(id);
      toast.success('Listing approved and is now live');
      loadMarketData();
    } catch (error) {
      toast.error('Failed to approve listing');
    }
  };

  // Manager: Reject a listing
  const handleReject = async (id) => {
    try {
      await marketAPI.rejectListing(id);
      toast.warn('Listing rejected');
      loadMarketData();
    } catch (error) {
      toast.error('Failed to reject listing');
    }
  };

  // Manager: Set official market price
  const handleSetPrice = async (e) => {
    e.preventDefault();
    if (!newPrice.vegetableName || !newPrice.price) return;
    
    try {
      await marketAPI.setMarketPrice(newPrice);
      toast.success(`Market price for ${newPrice.vegetableName} updated`);
      setNewPrice({ vegetableName: '', price: '' });
      loadMarketData();
    } catch (error) {
      toast.error('Failed to update market price');
    }
  };

  const handleLocationSearch = async () => {
    if (!location.trim()) {
      loadMarketData();
      return;
    }

    try {
      setLoading(true);
      const response = await marketAPI.getListings(location);
      setListings(response.data.listings || []);
      setSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search by location');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setLocation('');
    setSearchResults(false);
    loadMarketData();
  };

  const handleContactFarmer = (listing) => {
    // Copy phone to clipboard and inform user
    navigator.clipboard.writeText(listing.contact);
    toast.success(`Farmer contact copied: ${listing.contact}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="vegetable-market">
      <div className="market-header">
        <h1>🌱 Local Vegetable Market</h1>
        <p>Find fresh vegetables from local farmers</p>
      </div>

      {/* Market Manager Panel: Set Prices */}
      {user?.role === 'market_manager' && (
        <div className="manager-price-control">
          <h2>🛡️ Manager: Update Official Prices</h2>
          <form onSubmit={handleSetPrice} className="price-form">
            <input
              type="text"
              placeholder="Vegetable Name"
              value={newPrice.vegetableName}
              onChange={(e) => setNewPrice({ ...newPrice, vegetableName: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Price per kg (₹)"
              value={newPrice.price}
              onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
              required
            />
            <button type="submit" className="set-price-btn">Update Price</button>
          </form>
        </div>
      )}

      <div className="market-controls">
        <div className="location-search">
          <input
            type="text"
            placeholder="Search by location (e.g., Delhi, Mumbai, Punjab)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLocationSearch();
              }
            }}
          />
          <button onClick={handleLocationSearch} className="search-btn">🔍 Search</button>
          {searchResults && (
            <button onClick={handleClearSearch} className="clear-btn">Clear</button>
          )}
          <button 
            onClick={() => navigate('/sell-vegetable')} 
            className="sell-btn"
          >
            ➕ Sell Vegetables
          </button>
        </div>
      </div>

      <div className="market-prices">
        <h2>📊 Official Market Prices</h2>
        {prices.length > 0 ? (
          <div className="prices-grid">
            {prices.map((price) => (
              <div key={price._id} className="price-card">
                <h3>{price.vegetableName}</h3>
                <p className="price">₹{price.price}/kg</p>
                <small>Updated: {new Date(price.updated_at).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No market prices set yet.</p>
        )}
      </div>

      {/* Market Manager Panel: Pending Approvals */}
      {user?.role === 'market_manager' && (
        <div className="market-listings approvals-section">
          <h2 className="text-warning">📋 Pending Approvals</h2>
          {listings.filter(l => l.status === 'pending').length > 0 ? (
            <div className="listings-grid">
              {listings.filter(l => l.status === 'pending').map((listing) => (
                <div key={listing._id} className="listing-card pending">
                  <div className="listing-header">
                    <h3>{listing.vegetableName}</h3>
                    <span className="badge-pending">Pending</span>
                  </div>
                  <div className="listing-details">
                    <p>₹{listing.price}/kg | {listing.quantity}kg</p>
                    <p>📍 {listing.location}</p>
                  </div>
                  <div className="listing-actions manager-actions">
                    <button onClick={() => handleApprove(listing._id)} className="approve-btn">Approve</button>
                    <button onClick={() => handleReject(listing._id)} className="reject-btn">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No listings currently awaiting approval.</p>
          )}
        </div>
      )}

      <div className="market-listings">
        <h2>🛒 Active Market Listings {searchResults && `(Found: ${listings.length})`}</h2>
        {listings && listings.filter(l => l.status === 'approved' || !l.status).length > 0 ? (
          <div className="listings-grid">
            {listings.filter(l => l.status === 'approved' || !l.status).map((listing) => (
              <div key={listing._id} className="listing-card">
                <div className="listing-header">
                  <h3>{listing.vegetableName}</h3>
                  <span className="status-badge">In Stock</span>
                </div>
                <div className="listing-details">
                  <p className="price">
                    <strong>₹{Number(listing.price).toFixed(2)}/kg</strong>
                  </p>
                  <p className="quantity">📦 {Number(listing.quantity).toFixed(2)} kg available</p>
                  <p className="location">📍 {listing.location}</p>
                  <p className="farmer">👤 {listing.farmerName}</p>
                  <p className="contact">📞 {listing.contact}</p>
                </div>
                <div className="listing-actions">
                  <button 
                    className="contact-btn"
                    onClick={() => handleContactFarmer(listing)}
                  >
                    📱 Copy Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">
            {searchResults 
              ? `No listings found in "${location}". Try another location.` 
              : 'No listings available. Be the first to add your vegetables!'}
          </p>
        )}
      </div>
    </div>
  );
};

export default VegetableMarket;