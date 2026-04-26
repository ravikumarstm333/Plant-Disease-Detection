import React, { useState, useEffect } from 'react';
import { marketAPI } from '../../services/api';
import { toast } from 'react-toastify';
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
      setListings(response.data.listings);
    } catch (error) {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId, vegetableName) => {
    if (!window.confirm(`Are you sure you want to delete the "${vegetableName}" listing? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(listingId);
      await marketAPI.deleteListing(listingId);
      toast.success('✅ Listing deleted successfully!');
      setListings(prevListings => prevListings.filter(l => l._id !== listingId));
    } catch (error) {
      console.error('Delete error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to delete listing';
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'rejected': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return <div className="loading">Loading your listings...</div>;
  }

  return (
    <div className="my-listings">
      <div className="listings-header">
        <h1>📦 My Vegetable Listings</h1>
        <p>Manage your vegetable listings and track their status</p>
      </div>

      {listings.length > 0 ? (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="listing-card">
              <div className="listing-header">
                <h3>{listing.vegetableName}</h3>
                <span
                  className="confidence-badge"
                  style={{ backgroundColor: getStatusColor(listing.status) }}
                >
                  {getStatusIcon(listing.status)} {listing.status}
                </span>
              </div>

              <div className="listing-details">
                <div className="detail-row">
                  <span className="label">Price:</span>
                  <span className="value">₹{listing.price}/kg</span>
                </div>
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{listing.quantity} kg</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{listing.location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="listing-actions">
                {listing.status === 'pending' && (
                  <p className="pending-note">
                    Your listing is under review by market managers.
                  </p>
                )}
                {(listing.status === 'approved' || listing.status === 'active') && (
                  <div className="approved-actions">
                    <button className="edit-btn">Edit Listing</button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteListing(listing._id, listing.vegetableName)}
                      disabled={deletingId === listing._id}
                    >
                      {deletingId === listing._id ? '⏳ Deleting...' : '🗑️ Remove Listing'}
                    </button>
                  </div>
                )}
                {listing.status === 'rejected' && (
                  <p className="rejected-note">
                    This listing was rejected. Please contact support for details.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-listings">
          <div className="no-listings-content">
            <h3>No listings yet</h3>
            <p>You haven't created any vegetable listings yet.</p>
            <a href="/sell-vegetable" className="create-listing-btn">
              Create Your First Listing
            </a>
          </div>
        </div>
      )}

      <div className="dashboard-stats" style={{ marginTop: '3rem' }}>
        <div className="stat-card">
          <h4>Total Listings</h4>
          <p className="stat-number">{listings.length}</p>
        </div>
        <div className="stat-card">
          <h4>Approved</h4>
          <p className="stat-number" style={{ color: 'var(--success-color)' }}>
            {listings.filter(l => l.status === 'approved').length}
          </p>
        </div>
        <div className="stat-card">
          <h4>Pending</h4>
          <p className="stat-number" style={{ color: 'var(--warning-color)' }}>
            {listings.filter(l => l.status === 'pending').length}
          </p>
        </div>
        <div className="stat-card">
          <h4>Rejected</h4>
          <p className="stat-number" style={{ color: 'var(--error-color)' }}>
            {listings.filter(l => l.status === 'rejected').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyListings;