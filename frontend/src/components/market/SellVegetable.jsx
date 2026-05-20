import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import LocationPickerMap from '../map/LocationPickerMap';
import './SellVegetable.css';

const VEGETABLE_OPTIONS = [
  'Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Cauliflower',
  'Spinach', 'Brinjal', 'Capsicum', 'Cucumber', 'Pumpkin',
];

const INDIA_BOUNDS = {
  minLat: 6.4626999,
  maxLat: 35.513327,
  minLon: 68.1097,
  maxLon: 97.395561,
};

const isInsideIndia = (lat, lon) => (
  lat >= INDIA_BOUNDS.minLat
  && lat <= INDIA_BOUNDS.maxLat
  && lon >= INDIA_BOUNDS.minLon
  && lon <= INDIA_BOUNDS.maxLon
);

const SellVegetable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vegetableName: '',
    pricePerKg: '',
    quantityKg: '',
    location: '',
    lat: '',
    lon: '',
    description: '',
    image: null,
  });
  const [locLoading, setLocLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const reverseGeocodeInEnglish = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Reverse geocoding failed');
    const data = await res.json();
    const addr = data.address || {};
    const area = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.town || addr.city || addr.county || '';
    const state = addr.state || '';
    const country = addr.country || '';
    const name = [area, state, country].filter(Boolean).join(', ');
    return name || data.display_name || '';
  };

  const applyLocation = async (lat, lon) => {
    if (!isInsideIndia(lat, lon)) {
      toast.error('Location must be inside India');
      return;
    }
    setLocLoading(true);
    try {
      const englishName = await reverseGeocodeInEnglish(lat, lon);
      setForm((prev) => ({
        ...prev,
        lat: String(lat),
        lon: String(lon),
        location: englishName,
      }));
    } catch (error) {
      setForm((prev) => ({ ...prev, lat: String(lat), lon: String(lon) }));
      toast.error('Could not detect area name');
    } finally {
      setLocLoading(false);
    }
  };

  const onPick = (lat, lon) => {
    applyLocation(lat, lon);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => applyLocation(coords.latitude, coords.longitude),
      () => toast.error('Unable to get current location'),
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') body.append(k, v);
      });
      await marketAPI.createListing(body);
      toast.success('Listing created');
      navigate('/my-listings');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sell-vegetable">
      <div className="sell-header">
        <h1>Sell Vegetables</h1>
        <p>Create a listing with quantity, image, and location</p>
      </div>
      <div className="sell-form-container">
        <form onSubmit={submit} className="sell-form">
          <div className="form-group">
            <label>Vegetable Name</label>
            <select name="vegetableName" value={form.vegetableName} onChange={onChange} required>
              <option value="">Select vegetable</option>
              {VEGETABLE_OPTIONS.map((veg) => (
                <option key={veg} value={veg}>{veg}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price per KG</label>
              <input type="number" min="0.1" step="0.01" name="pricePerKg" value={form.pricePerKg} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label>Quantity (KG)</label>
              <input type="number" min="0.1" step="0.01" name="quantityKg" value={form.quantityKg} onChange={onChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Pick Location on Map</label>
            <LocationPickerMap
              lat={form.lat}
              lon={form.lon}
              onPick={onPick}
              onInvalidPick={() => toast.error('Please select a location inside India')}
            />
            <button type="button" className="sell-btn" onClick={useCurrentLocation} style={{ marginTop: 10 }}>
              {locLoading ? 'Detecting...' : 'Use My Current Location'}
            </button>
          </div>
          <div className="form-group">
            <label>Location Name</label>
            <input name="location" value={form.location} onChange={onChange} placeholder="Auto-detected village/area/city" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input type="number" step="any" name="lat" value={form.lat} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input type="number" step="any" name="lon" value={form.lon} onChange={onChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows="4" required />
          </div>
          <div className="form-group">
            <label>Image</label>
            <input type="file" name="image" accept="image/*" onChange={onChange} />
          </div>
          <button type="submit" className="sell-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellVegetable;
