import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { managerAPI, marketAPI } from '../../services/api';
import LocationPickerMap from '../map/LocationPickerMap';
import './manager-activity.css';

const ManagerActivity = () => {
  const [data, setData] = useState(null);
  const [prices, setPrices] = useState([]);
  const [vegetableOptions, setVegetableOptions] = useState([]);
  const [form, setForm] = useState({
    vegetableName: '',
    marketName: '',
    lat: '',
    lon: '',
    pricePerKg: '',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [activityRes, pricesRes] = await Promise.all([
        managerAPI.getActivity(),
        managerAPI.getMarketPrices(),
      ]);
      setData(activityRes.data);
      setPrices(pricesRes.data.prices || []);
      const listingsRes = await marketAPI.getListings();
      const listingNames = (listingsRes.data.listings || []).map((l) => l.vegetableName).filter(Boolean);
      const priceNames = (pricesRes.data.prices || []).map((p) => p.vegetableName).filter(Boolean);
      setVegetableOptions(Array.from(new Set([...listingNames, ...priceNames])).sort());
    } catch (error) {
      toast.error('Failed to load manager dashboard');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitPrice = async (e) => {
    e.preventDefault();
    const vegetableName = form.vegetableName.trim();
    const pricePerKg = Number(form.pricePerKg);
    const marketName = form.marketName.trim();
    const lat = Number(form.lat);
    const lon = Number(form.lon);

    if (!vegetableName) {
      toast.error('Enter vegetable name');
      return;
    }
    if (!pricePerKg || pricePerKg <= 0) {
      toast.error('Enter valid price per kg');
      return;
    }
    if (!marketName) {
      toast.error('Enter market name');
      return;
    }
    if (!lat || !lon) {
      toast.error('Select market location');
      return;
    }

    setSaving(true);
    try {
      await managerAPI.setMarketPrice({ vegetableName, marketName, lat, lon, pricePerKg });
      toast.success(`Price updated for ${vegetableName} at ${marketName}`);
      setForm({ vegetableName: '', marketName: '', lat: '', lon: '', pricePerKg: '' });
      await load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update price');
    } finally {
      setSaving(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((prev) => ({
          ...prev,
          lat: String(coords.latitude),
          lon: String(coords.longitude),
        }));
      },
      () => toast.error('Unable to get current location'),
    );
  };

  if (!data) return <div className="page">Loading...</div>;
  return (
    <div className="manager-dashboard-page">
      <div className="manager-dashboard-shell">
        <header className="manager-hero">
          <p className="manager-kicker">Manager Dashboard</p>
          <h2>Market Control Center</h2>
          <p>Set prices for any vegetable and monitor platform activity in real time.</p>
        </header>

        <section className="manager-stats">
          <article className="manager-stat-card"><span>Total Users</span><strong>{data.users}</strong></article>
          <article className="manager-stat-card"><span>Farmers</span><strong>{data.farmers}</strong></article>
          <article className="manager-stat-card"><span>Buyers</span><strong>{data.buyers}</strong></article>
          <article className="manager-stat-card"><span>Managers</span><strong>{data.managers}</strong></article>
          <article className="manager-stat-card"><span>Active Listings</span><strong>{data.activeListings}</strong></article>
          <article className="manager-stat-card"><span>Orders</span><strong>{data.orders}</strong></article>
        </section>

        <section className="manager-grid">
          <form className="price-form-card" onSubmit={submitPrice}>
            <h3>Add / Update Vegetable Price</h3>
            <p>Select vegetable and your current market location to set local market price.</p>
            <label>
              Vegetable Name
              <input
                list="vegetable-options"
                value={form.vegetableName}
                onChange={(e) => setForm((prev) => ({ ...prev, vegetableName: e.target.value }))}
                placeholder="e.g. Tomato"
                required
              />
              <datalist id="vegetable-options">
                {vegetableOptions.map((veg) => (
                  <option key={veg} value={veg} />
                ))}
              </datalist>
            </label>
            <label>
              Market Name
              <input
                value={form.marketName}
                onChange={(e) => setForm((prev) => ({ ...prev, marketName: e.target.value }))}
                placeholder="e.g. Indore Mandi"
                required
              />
            </label>
            <label>
              Price per Kg
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerKg}
                onChange={(e) => setForm((prev) => ({ ...prev, pricePerKg: e.target.value }))}
                placeholder="e.g. 45"
                required
              />
            </label>
            <div className="location-row">
              <input
                value={form.lat}
                onChange={(e) => setForm((prev) => ({ ...prev, lat: e.target.value }))}
                placeholder="Latitude"
                required
              />
              <input
                value={form.lon}
                onChange={(e) => setForm((prev) => ({ ...prev, lon: e.target.value }))}
                placeholder="Longitude"
                required
              />
            </div>
            <button type="button" className="location-btn" onClick={useCurrentLocation}>
              Use My Current Location
            </button>
            <LocationPickerMap
              lat={form.lat}
              lon={form.lon}
              onPick={(lat, lon) => setForm((prev) => ({ ...prev, lat: String(lat), lon: String(lon) }))}
              onInvalidPick={() => toast.error('Please select a location inside India')}
            />
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Market Price'}
            </button>
          </form>

          <div className="price-list-card">
            <h3>Current Market Prices</h3>
            {prices.length === 0 ? (
              <p className="empty-prices">No prices added yet.</p>
            ) : (
              <div className="price-table">
                {prices.map((item) => (
                  <div className="price-row" key={item._id || item.vegetableName}>
                    <span>{item.vegetableName} - {item.marketName || 'Unknown Market'}</span>
                    <strong>Rs {item.pricePerKg}/kg</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManagerActivity;
