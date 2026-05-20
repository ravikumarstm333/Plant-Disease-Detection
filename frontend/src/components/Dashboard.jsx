import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  const linksByRole = {
    admin: [
      {
        title: 'Create Manager',
        link: '/admin/managers',
        icon: '👨‍💼',
        description: 'Add and manage market managers',
        color: '#4caf50'
      },
      {
        title: 'Marketplace',
        link: '/market',
        icon: '🛒',
        description: 'View all market activity',
        color: '#ff9800'
      },
    ],

    manager: [
      {
        title: 'Marketplace',
        link: '/market',
        icon: '🛒',
        description: 'Manage market listings',
        color: '#4caf50'
      },
      {
        title: 'Manager Activity',
        link: '/manager/activity',
        icon: '📊',
        description: 'Track your activities',
        color: '#2196f3'
      },
    ],

    farmer: [
      {
        title: 'Detect Disease',
        link: '/upload',
        icon: '🔍',
        description: 'Upload plant image for disease detection',
        color: '#4caf50'
      },
      {
        title: 'Sell Vegetables',
        link: '/sell-vegetable',
        icon: '🛒',
        description: 'Create vegetable listings',
        color: '#ff9800'
      },
      {
        title: 'My Listings',
        link: '/my-listings',
        icon: '📦',
        description: 'Manage your products',
        color: '#9c27b0'
      },
      {
        title: 'Orders',
        link: '/orders',
        icon: '📋',
        description: 'Track customer orders',
        color: '#2196f3'
      },
    ],

    buyer: [
      {
        title: 'Nearby Listings',
        link: '/market',
        icon: '📍',
        description: 'Find fresh vegetables near you',
        color: '#4caf50'
      },
      {
        title: 'My Orders',
        link: '/orders',
        icon: '📦',
        description: 'View your order history',
        color: '#2196f3'
      },
      {
        title: 'Market Prices',
        link: '/market',
        icon: '💰',
        description: 'Check latest prices',
        color: '#ff9800'
      },
    ],
  };

  const links = linksByRole[role] || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}</h1>
        <p className="user-role">{role} dashboard</p>
      </div>

      <div className="dashboard-grid">
        {links.map((item) => (
          <Link to={item.link} key={item.title} className="dashboard-card">

            <div className="card-icon" style={{ backgroundColor: item.color }}>
              {item.icon}
            </div>

            <div className="card-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>

            <div className="card-arrow">→</div>

          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;