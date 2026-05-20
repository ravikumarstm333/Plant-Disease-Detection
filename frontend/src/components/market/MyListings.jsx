import React, { useState, useEffect } from 'react';
import { marketAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import './MyListings.css';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      setLoading(true);
      const response = await marketAPI.getMyListings();
      setListings(response.data.listings || []);
    } catch (error) {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId, vegetableName) => {
    if (!window.confirm(`Are you sure you want to delete "${vegetableName}"?`)) return;
    try {
      setDeletingId(listingId);
      await marketAPI.deleteListing(listingId);
      toast.success('Listing deleted successfully');
      setListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'rejected': return '#f44336';
      case 'active': return '#2e7d32';
      default: return '#666';
    }
  };

  const formatLocation = (listing) => {
    if (listing.locationName) return listing.locationName;
    const coords = listing?.location?.coordinates;
    if (Array.isArray(coords) && coords.length === 2) {
      return `${Number(coords[1]).toFixed(6)}, ${Number(coords[0]).toFixed(6)}`;
    }
    return 'N/A';
  };

  if (loading) return <div className="loading">Loading your listings...</div>;

  return (
    <div className="my-listings">
      <div className="listings-header">
        <h1>My Vegetable Listings</h1>
        <p>Manage your listings and stock</p>
      </div>

      {listings.length > 0 ? (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="listing-card">
              <div className="listing-header">
                <h3>{listing.vegetableName}</h3>
                <span className="confidence-badge" style={{ backgroundColor: getStatusColor(listing.status) }}>
                  {listing.status || 'active'}
                </span>
              </div>

              <div className="listing-details">
                <div className="detail-row">
                  <span className="label">Price:</span>
                  <span className="value">Rs {listing.pricePerKg ?? listing.price}/kg</span>
                </div>
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{listing.quantityKg ?? listing.quantity} kg</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{formatLocation(listing)}</span>
                </div>
              </div>

              <div className="listing-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteListing(listing._id, listing.vegetableName)}
                  disabled={deletingId === listing._id}
                >
                  {deletingId === listing._id ? 'Deleting...' : 'Remove Listing'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-listings">
          <div className="no-listings-content">
            <h3>No listings yet</h3>
            <p>Create your first vegetable listing.</p>
            <a href="/sell-vegetable" className="create-listing-btn">Create Listing</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;
