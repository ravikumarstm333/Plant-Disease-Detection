import React, { useState ,useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './dashboard.css';

// Hub for Farmer and Market Manager Dashboards
const Dashboard = () => {
  const { user } = useAuth();
  
  const farmerSections = [
    {
      title: 'Disease Detection',
      description: 'Upload plant images to detect diseases and get treatment recommendations',
      icon: '🔍',
      link: '/upload',
      color: '#4caf50'
    },
    {
      title: 'Detection History',
      description: 'View your previous disease detection results and recommendations',
      icon: '📋',
      link: '/history',
      color: '#2196f3'
    },
    {
      title: 'Sell Vegetables',
      description: 'Create listings to sell your vegetables in the local market',
      icon: '🛒',
      link: '/sell-vegetable',
      color: '#ff9800'
    },
    {
      title: 'My Listings',
      description: 'Manage your vegetable listings and track sales',
      icon: '📦',
      link: '/my-listings',
      color: '#9c27b0'
    },
    {
      title: 'Market Prices',
      description: 'Check current market prices for vegetables',
      icon: '💰',
      link: '/market',
      color: '#f44336'
    },
    {
      title: 'Chatbot Assistant',
      description: 'Get instant answers about plant diseases, fertilizers, and farming tips',
      icon: '🤖',
      link: '/chat',
      color: '#00bcd4'
    }
  ];

  const marketManagerSections = [
    {
      title: 'Market Control Center',
      description: 'Update official market prices and review pending farmer listings',
      icon: '💰',
      link: '/market',
      color: '#4caf50'
    },
    {
      title: 'Market Statistics',
      description: 'Analyze market trends, supply volume, and pricing history',
      icon: '📊',
      link: '/market',
      color: '#ff9800'
    }
  ];

  const sections = user?.role === 'market_manager' ? marketManagerSections : farmerSections;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p className="user-role">{user?.role === 'market_manager' ? 'Market Manager' : 'Farmer'} Dashboard</p>
        <p className="user-location">{user?.location}</p>
      </div>

      <div className="dashboard-grid">
        {sections.map((section, index) => (
          <Link to={section.link} key={index} className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: section.color }}>
              {section.icon}
            </div>
            <div className="card-content">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        ))}
      </div>
      <br></br>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h4>Total Detections</h4>
          <p className="stat-number">{history.length}</p>
        </div>
        <div className="stat-card">
          <h4>Active Listings</h4>
          <p className="stat-number">Comming soon</p>
        </div>
        <div className="stat-card">
          <h4>Market Value</h4>
          <p className="stat-number">Comming soon</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;