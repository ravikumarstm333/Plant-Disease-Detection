// VegetableMarket.jsx
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { marketAPI } from '../../services/api';
import { toast } from "react-hot-toast";
import { 
  Search, 
  X, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  MessageCircle,
  ShoppingBag,
  Filter,
  Grid,
  List,
  ChevronDown,
  Heart
} from 'lucide-react';
import './VegetableMarket.css';

// Lazy load components
const ListingCard = lazy(() => import('./ListingCard'));
const PriceDashboard = lazy(() => import('./PriceDashboard'));
const ManagerPanel = lazy(()=> import('./ManagerPanel'))

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="skeleton-container">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="skeleton-card">
        <div className="skeleton-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-badge"></div>
        </div>
        <div className="skeleton-details">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-actions"></div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState = ({ icon: Icon, title, message, action }) => (
  <motion.div 
    className="empty-state"
    variants={fadeInUp}
    initial="initial"
    animate="animate"
  >
    <div className="empty-state-icon">
      <Icon size={64} strokeWidth={1.5} />
    </div>
    <h3>{title}</h3>
    <p>{message}</p>
    {action && (
      <button onClick={action.onClick} className="empty-state-btn">
        {action.label}
      </button>
    )}
  </motion.div>
);

const VegetableMarket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadMarketData();
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('vegetableFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const [listingsRes, pricesRes] = await Promise.all([
        marketAPI.getListings(),
        marketAPI.getMarketPrices()
      ]);
      setListings(listingsRes.data.listings || []);
      setPrices(pricesRes.data.prices || []);
    } catch (error) {
      console.error('Error loading market data:', error);
      toast.error('Failed to load market data', {
        icon: '❌',
        style: { background: '#ff4757', color: '#fff' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = [...listings];
    
    // Filter by status
    filtered = filtered.filter(l => l.status === 'approved' || !l.status);
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(l => 
        l.vegetableName?.toLowerCase().includes(term) ||
        l.farmerName?.toLowerCase().includes(term) ||
        l.location?.toLowerCase().includes(term)
      );
    }
    
    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(l => 
        l.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(l => l.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(l => l.price <= Number(priceRange.max));
    }
    
    // Sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'latest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [listings, searchTerm, locationFilter, priceRange, sortBy]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    const locs = new Set();
    listings.forEach(l => l.location && locs.add(l.location));
    return Array.from(locs);
  }, [listings]);

  const handleContactFarmer = async (listing) => {
    try {
      await navigator.clipboard.writeText(listing.contact);
      toast.success(`Contact number copied!`, {
        icon: '📞',
        duration: 2000,
        style: { background: '#4caf50', color: '#fff' }
      });
    } catch (err) {
      toast.error('Failed to copy contact', {
        icon: '❌'
      });
    }
  };

  const handleToggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
        toast('Removed from favorites', { icon: '💔' });
      } else {
        newFavorites.add(id);
        toast.success('Added to favorites', { icon: '❤️' });
      }
      localStorage.setItem('vegetableFavorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setPriceRange({ min: '', max: '' });
    setSortBy('latest');
    toast.success('All filters cleared');
  };

  const handlePriceUpdate = (updatedPrice) => {
    setPrices(prev => prev.map(p => 
      p.vegetableName === updatedPrice.vegetableName ? updatedPrice : p
    ));
  };

  if (loading) {
    return (
      <div className="vegetable-market">
        <div className="market-header">
          <h1>Fresh Harvest Market</h1>
          <p>Farm fresh vegetables delivered to your doorstep</p>
        </div>
        <div className="market-content">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="vegetable-market">
      {/* Animated Header */}
      <motion.div 
        className="market-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <h1>
            <span className="header-icon"></span>
            Fresh Harvest Market
          </h1>
          <p>Connect directly with local farmers for the freshest produce</p>
        </div>
        
        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <ShoppingBag size={20} />
            <span>{filteredListings.length} Listings</span>
          </div>
          <div className="stat-item">
            <Star size={20} />
            <span>{favorites.size} Favorites</span>
          </div>
          <div className="stat-item">
            <MapPin size={20} />
            <span>{locations.length} Locations</span>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by vegetable, farmer, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search">
                <X size={16} />
              </button>
            )}
          </div>
          
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
            <ChevronDown size={16} className={`chevron ${showFilters ? 'rotate' : ''}`} />
          </button>

          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="filters-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filter-group">
                <label>Location</label>
                <select 
                  value={locationFilter} 
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Price Range (₹/kg)</label>
                <div className="price-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="latest">Latest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>

              <button onClick={handleClearFilters} className="clear-all-filters">
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Market Prices Dashboard */}
      <Suspense fallback={<div className="loading-prices">Loading prices...</div>}>
        <PriceDashboard prices={prices} />
      </Suspense>

      {/* Manager Panel */}
      {user?.role === 'market_manager' && (
        <Suspense fallback={<div className="loading-manager">Loading manager panel...</div>}>
          <ManagerPanel 
            listings={listings}
            prices={prices}
            onPriceUpdate={handlePriceUpdate}
            onListingUpdate={loadMarketData}
          />
        </Suspense>
      )}

      {/* Listings Section */}
      <div className="listings-section">
        <div className="section-header">
          <h2>
            <ShoppingBag size={24} />
            Available Fresh Produce
          </h2>
          {searchTerm && (
            <span className="search-results-count">
              Found {filteredListings.length} results
            </span>
          )}
        </div>

        {filteredListings.length > 0 ? (
          <motion.div 
            className={`listings-${viewMode}`}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence>
              {filteredListings.map((listing, index) => (
                <motion.div
                  key={listing._id}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Suspense fallback={<div className="listing-card-skeleton"></div>}>
                    <ListingCard
                      listing={listing}
                      isFavorite={favorites.has(listing._id)}
                      onToggleFavorite={handleToggleFavorite}
                      onContact={handleContactFarmer}
                    />
                  </Suspense>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState
            icon={searchTerm || locationFilter ? Search : ShoppingBag}
            title={searchTerm || locationFilter ? "No results found" : "No listings available"}
            message={searchTerm || locationFilter 
              ? "Try adjusting your search or filters to find what you're looking for"
              : "Be the first to list your vegetables in the marketplace!"
            }
            action={!searchTerm && !locationFilter ? {
              label: "Sell Your Vegetables",
              onClick: () => navigate('/sell-vegetable')
            } : null}
          />
        )}
      </div>
    </div>
  );
};

export default VegetableMarket;