import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, History, Leaf } from 'lucide-react';
import Button from './ui/Button';


const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Detect Disease', path: '/upload' },
    { name: 'Market', path: '/market' },
    { name: 'Fertilizer Store', path: '/fertilizer-store' },
    { name: 'Chatbot', path: '/chat' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  const farmerLinks = [
    { name: 'Sell Vegetables', path: '/sell-vegetable' },
    { name: 'My Listings', path: '/my-listings' },
  ];

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white bg-opacity-90 backdrop-blur-glass shadow-lg'
            : 'bg-white bg-opacity-80 backdrop-blur-glass'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <Link
                to="/"
                className="flex items-center gap-2 group"
              >
                <div className="bg-gradient-primary p-2 rounded-lg group-hover:shadow-lg transition-all">
                  <Leaf className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold text-gradient hidden sm:inline">
                  DekhBhal
                </span>
              </Link>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                isAuthenticated || link.path === '/' ? (
                  <Link key={link.path} to={link.path}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      className={`relative pb-2 cursor-pointer font-semibold transition-colors ${
                        isActive(link.path)
                          ? 'text-primary-600'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      {link.name}
                      {isActive(link.path) && (
                        <motion.div
                          layoutId="underline"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary rounded-full"
                          transition={{ type: 'spring', stiffness: 300 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                ) : null
              ))}

              {/* Farmer Menu */}
              {isAuthenticated && user?.role === 'farmer' && (
                <div className="relative group">
                  <button className="text-gray-700 hover:text-primary-600 font-semibold">
                    Farmer
                  </button>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all"
                  >
                    {farmerLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="block px-4 py-3 text-gray-700 hover:bg-primary-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-700">{user?.name}</span>
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg"
                      >
                        <Link
                          to="/history"
                          className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-primary-50 first:rounded-t-lg transition-colors"
                        >
                          <History size={18} />
                          Disease History
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-primary-50 transition-colors"
                        >
                          <Settings size={18} />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg transition-colors"
                        >
                          <LogOut size={18} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/register')}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="text-gray-700" size={24} />
              ) : (
                <Menu className="text-gray-700" size={24} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 lg:hidden bg-white shadow-lg z-40"
          >
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                (isAuthenticated || link.path === '/') && (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-all ${
                      isActive(link.path)
                        ? 'bg-primary-100 text-primary-700 font-semibold'
                        : 'text-gray-700 hover:bg-primary-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}

              {isAuthenticated && user?.role === 'farmer' && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  {farmerLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-3 text-gray-700 hover:bg-primary-50 rounded-lg transition-all"
                    >
                      {link.name}
                    </Link>
                  ))}
                </>
              )}

              <div className="border-t border-gray-200 my-2" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/history"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:bg-primary-50 rounded-lg transition-all flex items-center gap-2"
                  >
                    <History size={18} />
                    Disease History
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigate('/login');
                      setIsOpen(false);
                    }}
                    className="flex-1"
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      navigate('/register');
                      setIsOpen(false);
                    }}
                    className="flex-1"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;