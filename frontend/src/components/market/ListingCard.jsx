import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, Package, DollarSign, Heart, MessageCircle } from 'lucide-react';

const ListingCard = ({ listing, isFavorite, onToggleFavorite, onContact }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="listing-card-modern"
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      <div className="card-image-area">
        <div className="image-placeholder">
          <span className="vegetable-emoji">🥬</span>
        </div>
        <button
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(listing._id)}
        >
          <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} />
        </button>
        <div className="stock-badge">
          <Package size={14} />
          {listing.quantity}kg
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3>{listing.vegetableName}</h3>
          <div className="price-tag">
            <DollarSign size={16} />
            <span>₹{Number(listing.price).toFixed(2)}</span>
            <small>/kg</small>
          </div>
        </div>

        <div className="card-details">
          <div className="detail-item">
            <User size={16} />
            <span>{listing.farmerName}</span>
          </div>
          <div className="detail-item">
            <MapPin size={16} />
            <span>{listing.location}</span>
          </div>
          <div className="detail-item contact-info">
            <Phone size={16} />
            <span className="phone-number">{listing.contact}</span>
            <button
              className="copy-contact"
              onClick={() => onContact(listing)}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="card-actions">
          <button
            className="contact-farmer-btn"
            onClick={() => onContact(listing)}
          >
            <MessageCircle size={18} />
            Contact Farmer
          </button>
        </div>

        {isHovered && (
          <motion.div
            className="card-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default ListingCard;