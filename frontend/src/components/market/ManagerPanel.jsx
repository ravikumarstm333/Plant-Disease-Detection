import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Plus, ChevronDown, DollarSign } from 'lucide-react';
import { marketAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const ManagerPanel = ({ listings, prices, onPriceUpdate, onListingUpdate }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [newPrice, setNewPrice] = useState({ vegetableName: '', price: '' });
  const [loading, setLoading] = useState(false);

  const pendingListings = listings.filter(l => l.status === 'pending');

  const handleApprove = async (id) => {
    try {
      await marketAPI.approveListing(id);
      toast.success('Listing approved successfully!');
      onListingUpdate();
    } catch (error) {
      toast.error('Failed to approve listing');
    }
  };

  const handleReject = async (id) => {
    try {
      await marketAPI.rejectListing(id);
      toast.success('Listing rejected');
      onListingUpdate();
    } catch (error) {
      toast.error('Failed to reject listing');
    }
  };

  const handleSetPrice = async (e) => {
    e.preventDefault();
    if (!newPrice.vegetableName || !newPrice.price) return;
    
    setLoading(true);
    try {
      await marketAPI.setMarketPrice(newPrice);
      toast.success(`Market price for ${newPrice.vegetableName} updated`);
      setNewPrice({ vegetableName: '', price: '' });
      setShowPriceForm(false);
      onPriceUpdate(newPrice);
    } catch (error) {
      toast.error('Failed to update market price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-panel">
      <div className="panel-header">
        <Shield size={24} />
        <h3>Manager Dashboard</h3>
        <button
          className="add-price-btn"
          onClick={() => setShowPriceForm(!showPriceForm)}
        >
          <DollarSign size={16} />
          Add/Update Price
        </button>
      </div>

      <AnimatePresence>
        {showPriceForm && (
          <motion.form
            className="price-form-modern"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSetPrice}
          >
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
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Market Price'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="panel-tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals
          {pendingListings.length > 0 && (
            <span className="badge">{pendingListings.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          Current Prices
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'pending' && (
          <div className="pending-listings">
            {pendingListings.length > 0 ? (
              pendingListings.map(listing => (
                <motion.div
                  key={listing._id}
                  className="pending-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="pending-info">
                    <h4>{listing.vegetableName}</h4>
                    <p>₹{listing.price}/kg • {listing.quantity}kg</p>
                    <p className="location">{listing.location}</p>
                    <p className="farmer">Farmer: {listing.farmerName}</p>
                  </div>
                  <div className="pending-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(listing._id)}
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(listing._id)}
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-pending">No pending approvals</div>
            )}
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="current-prices">
            {prices.map(price => (
              <div key={price._id} className="price-item">
                <span className="veg-name">{price.vegetableName}</span>
                <span className="veg-price">₹{price.price}/kg</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPanel;