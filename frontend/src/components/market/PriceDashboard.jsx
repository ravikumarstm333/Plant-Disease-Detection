import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import './PriceDashboard.css'

const PriceDashboard = ({ prices }) => {
  const getPriceTrend = (price) => {
    // Simulate price trend (in real app, compare with previous price)
    return Math.random() > 0.5 ? 'up' : 'down';
  };

  return (
    <div className="price-dashboard">
      <div className="price-dashboard-header">
        <h3>
          <DollarSign size={20} />
          Official Market Prices
        </h3>
        <span className="update-time">
          <Clock size={14} />
          Updated daily
        </span>
      </div>
      
      {prices.length > 0 ? (
        <div className="price-grid">
          {prices.map((price, idx) => {
            const trend = getPriceTrend(price.price);
            return (
              <motion.div
                key={price._id}
                className="price-card-modern"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="price-card-header">
                  <span className="vegetable-icon">🥬</span>
                  <h4>{price.vegetableName}</h4>
                </div>
                <div className="price-value">
                  <span className="currency">₹</span>
                  <span className="amount">{price.price}</span>
                  <span className="unit">/kg</span>
                </div>
                <div className="price-trend">
                  {trend === 'up' ? (
                    <TrendingUp size={16} color="#10b981" />
                  ) : (
                    <TrendingDown size={16} color="#ef4444" />
                  )}
                  <span className={trend === 'up' ? 'trend-up' : 'trend-down'}>
                    {trend === 'up' ? '+2.5%' : '-1.2%'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="no-prices">No market prices available</div>
      )}
    </div>
  );
};

export default PriceDashboard;