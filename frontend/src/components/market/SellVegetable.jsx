import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { marketAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './SellVegetable.css';

const SellVegetable = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vegetableName: '',
    price: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        vegetableName: formData.vegetableName,
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity)
      };

      await marketAPI.createListing(data);
      toast.success('✅ Listing created successfully! Your vegetable is now live on the market.');

      // Reset form
      setFormData({
        vegetableName: '',
        price: '',
        quantity: ''
      });

      // Redirect to market page after 1.5 seconds
      setTimeout(() => {
        navigate('/market');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sell-vegetable">
      <div className="sell-header">
        <h1>🛒 Sell Your Vegetables</h1>
        <p>List your fresh produce in the local market</p>
      </div>

      <div className="sell-form-container">
        <form onSubmit={handleSubmit} className="sell-form">
          <div className="form-group">
            <label htmlFor="vegetableName">Vegetable Name</label>
            <select
              id="vegetableName"
              name="vegetableName"
              value={formData.vegetableName}
              onChange={handleChange}
              required
            >
              <option value="">Select vegetable</option>
              <option value="Tomato">Tomato</option>
              <option value="Potato">Potato</option>
              <option value="Onion">Onion</option>
              <option value="Carrot">Carrot</option>
              <option value="Cabbage">Cabbage</option>
              <option value="Cauliflower">Cauliflower</option>
              <option value="Spinach">Spinach</option>
              <option value="Lady Finger">Lady Finger</option>
              <option value="Brinjal">Brinjal</option>
              <option value="Capsicum">Capsicum</option>
              <option value="Green Chilli">Green Chilli</option>
              <option value="Cucumber">Cucumber</option>
              <option value="Bitter Gourd">Bitter Gourd</option>
              <option value="Bottle Gourd">Bottle Gourd</option>
              <option value="Pumpkin">Pumpkin</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price per kg (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 25"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity (kg)</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 100"
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="listing-info">
            <h3>Listing Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Location:</span>
                <span className="value">{user?.location}</span>
              </div>
              <div className="info-item">
                <span className="label">Contact:</span>
                <span className="value">{user?.phone}</span>
              </div>
              <div className="info-item">
                <span className="label">Farmer:</span>
                <span className="value">{user?.name}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="sell-btn"
            disabled={loading}
          >
            {loading ? 'Creating Listing...' : '📤 Create Listing'}
          </button>
        </form>
      </div>

      <div className="sell-tips">
        <h3>💡 Tips for Successful Sales</h3>
        <ul>
          <li>Set competitive prices based on current market rates</li>
          <li>Ensure your produce is fresh and high quality</li>
          <li>Provide accurate quantity and contact information</li>
          <li>Respond quickly to buyer inquiries</li>
          <li>Update your listings when quantities change</li>
        </ul>
      </div>
    </div>
  );
};

export default SellVegetable;