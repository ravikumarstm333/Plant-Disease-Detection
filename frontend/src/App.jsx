import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer } from 'react-toastify';
import { Leaf } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Upload from "./components/Upload";
import Result from "./components/Result";
import Chatbot from "./components/Chatbot";
import Dashboard from "./components/Dashboard";
import VegetableMarket from "./components/market/VegetableMarket";
import SellVegetable from "./components/market/SellVegetable";
import MyListings from "./components/market/MyListings";
import DiseaseHistory from "./components/DiseaseHistory";
import Footer from "./components/Footer";
import FertilizerStor from "./components/market/FertilizerStore";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Minimal Header - only shows Login/Signup buttons on public pages
const MinimalHeader = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navbar />;
  }

  // Hide on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Show minimal header on all other pages for non-authenticated users
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-80 backdrop-blur-glass h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-primary p-2 rounded-lg">
          <Leaf className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-gradient hidden sm:inline">
          DekhBhal
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-2 text-gray-700 font-semibold hover:text-primary-600 transition-colors"
        >
          Login
        </button>
        <button 
          onClick={() => navigate('/register')}
          className="px-6 py-2 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

// Conditional Navbar Component
const ConditionalNavbar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Hide navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Show full navbar only to authenticated users
  if (isAuthenticated) {
    return <Navbar />;
  }

  // Show minimal header with only login/signup buttons for non-authenticated users
  return <MinimalHeader />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ConditionalNavbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* Protected Routes */}
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } />
              <Route path="/result" element={
                <ProtectedRoute>
                  <Result />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/market" element={
                <ProtectedRoute>
                  <VegetableMarket />
                </ProtectedRoute>
              } />
              <Route path="/fertilizer-store" element={
                <ProtectedRoute>
                  <FertilizerStor />
                </ProtectedRoute>
              } />
              <Route path="/sell-vegetable" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <SellVegetable />
                </ProtectedRoute>
              } />
              <Route path="/my-listings" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <MyListings />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <DiseaseHistory />
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;