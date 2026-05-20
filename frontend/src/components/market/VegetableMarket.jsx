import React, { useEffect, useState } from 'react';
import { marketAPI, ordersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LocationPickerMap from '../map/LocationPickerMap';
import NearbyListingsMap from '../map/NearbyListingsMap';
import './VegetableMarket.css';

const VegetableMarket = () => {
  const INDIA_BOUNDS = {
    minLat: 6.4626999,
    maxLat: 35.513327,
    minLon: 68.1097,
    maxLon: 97.395561,
  };
  const RANGE_OPTIONS = [2, 5, 10, 20];
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyerLat, setBuyerLat] = useState('');
  const [buyerLon, setBuyerLon] = useState('');
  const [rangeKm, setRangeKm] = useState(10);
  const [buyQty, setBuyQty] = useState({});
  const rangeIndex = Math.max(0, RANGE_OPTIONS.indexOf(rangeKm));
  const isInsideIndia = (lat, lon) => (
    lat >= INDIA_BOUNDS.minLat
    && lat <= INDIA_BOUNDS.maxLat
    && lon >= INDIA_BOUNDS.minLon
    && lon <= INDIA_BOUNDS.maxLon
  );

  const load = async () => {
    setLoading(true);
    try {
      const [l, p] = await Promise.all([marketAPI.getListings(), marketAPI.getMarketPrices()]);
      setListings(l.data.listings || []);
      setPrices(p.data.prices || []);
    } catch (e) {
      toast.error('Failed to load market');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const searchNearby = async () => {
    if (!buyerLat || !buyerLon) return toast.error('Enter buyer latitude and longitude');
    try {
      const res = await marketAPI.getNearbyListings(buyerLat, buyerLon, rangeKm);
      setListings(res.data.listings || []);
    } catch (e) {
      toast.error('Nearby search failed');
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!isInsideIndia(coords.latitude, coords.longitude)) {
          toast.error('Detected location is outside India');
          return;
        }
        setBuyerLat(String(coords.latitude));
        setBuyerLon(String(coords.longitude));
      },
      () => toast.error('Unable to get current location'),
    );
  };

  const placeOrder = async (listingId) => {
    const qty = Number(buyQty[listingId] || 0);
    if (qty <= 0) return toast.error('Enter valid quantity');
    try {
      await ordersAPI.placeOrder({
        listingId,
        quantityKg: qty,
        buyerLocation: { lat: Number(buyerLat), lon: Number(buyerLon) },
      });
      toast.success('Order placed');
      await load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Order failed');
    }
  };

  if (loading) return <div className="page"><h2>Loading market...</h2></div>;

  return (
    <div className="vegetable-market">
      <section className="market-header">
        <div className="header-content">
          <h1>Buyer Marketplace</h1>
          <p>Discover nearby vegetables, compare market prices, and place quantity-based orders.</p>
          <div className="stats-bar">
            <div className="stat-item">Prices: {prices.length}</div>
            <div className="stat-item">Listings: {listings.length}</div>
            <div className="stat-item">Radius: {rangeKm} km</div>
          </div>
        </div>
      </section>

      <section className="listings-section buyer-prices-wrap">
        <div className="section-header">
          <h2>Current Market Prices</h2>
        </div>
        <div className="buyer-prices-grid">
          {prices.map((p) => (
            <div key={p._id || `${p.vegetableName}-${p.marketKey || 'x'}`} className="buyer-price-card">
              <h4>{p.vegetableName}</h4>
              <p>Rs {p.pricePerKg}/kg</p>
              <span>{p.marketName || 'General Market'}</span>
            </div>
          ))}
        </div>
      </section>

      {user?.role === 'buyer' && (
        <section className="listings-section buyer-search-wrap">
          <div className="section-header">
            <h2>Nearby Search</h2>
          </div>
          <div className="buyer-search-card">
            <div className="buyer-coords-row">
              <input className="buyer-input" placeholder="Latitude" value={buyerLat} onChange={(e) => setBuyerLat(e.target.value)} />
              <input className="buyer-input" placeholder="Longitude" value={buyerLon} onChange={(e) => setBuyerLon(e.target.value)} />
              <button className="buyer-btn buyer-btn-outline" onClick={useCurrentLocation}>Use Current Location</button>
            </div>
            <div className="buyer-range-row">
              <label>Range: {rangeKm} km</label>

              <button className="buyer-btn" onClick={searchNearby}>Find Nearby</button>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={rangeIndex}
              onChange={(e) => setRangeKm(RANGE_OPTIONS[Number(e.target.value)])}
              className="buyer-range-slider"
            />
            <div className="buyer-range-labels">
              <span>2</span><span>5</span><span>10</span><span>20</span>
            </div>

            <div className="buyer-map-wrap">
              <LocationPickerMap
                lat={buyerLat}
                lon={buyerLon}
                onPick={(lat, lon) => { setBuyerLat(String(lat)); setBuyerLon(String(lon)); }}
                onInvalidPick={() => toast.error('Please select a location inside India')}
              />
            </div>

            <NearbyListingsMap buyerLat={buyerLat} buyerLon={buyerLon} rangeKm={rangeKm} listings={listings} />
          </div>
        </section>
      )}

      <section className="listings-section buyer-listings-wrap">
        <div className="section-header">
          <h2>Listings</h2>
        </div>
      <div className="buyer-listings-grid">
        {listings.map((l) => (
          <div key={l._id} className="buyer-listing-card">
            <h4>{l.vegetableName}</h4>
            <p>Farmer: {l.farmerName}</p>
            <p>Price: Rs {l.pricePerKg}/kg</p>
            <p>Available: {l.quantityKg} kg</p>
            <p>Location: {l.locationName}</p>
            {user?.role === 'buyer' && l.quantityKg > 0 && (
              <div className="buyer-buy-row">
                <input
                  className="buyer-input"
                  placeholder="Buy qty (kg)"
                  value={buyQty[l._id] || ''}
                  onChange={(e) => setBuyQty((prev) => ({ ...prev, [l._id]: e.target.value }))}
                />
                <button className="buyer-btn" onClick={() => placeOrder(l._id)}>Buy Partial Quantity</button>
              </div>
            )}
          </div>
        ))}
      </div>
      </section>
    </div>
  );
};

export default VegetableMarket;
