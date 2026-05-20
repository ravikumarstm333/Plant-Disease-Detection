import React, { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const INDIA_BOUNDS = [
  [6.4626999, 68.1097],
  [35.513327, 97.395561],
];

const INDIA_CENTER = [22.9734, 78.6569];

const isInsideIndia = (lat, lon) => {
  const [[minLat, minLon], [maxLat, maxLon]] = INDIA_BOUNDS;
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
};

const ClickPicker = ({ onPick, onInvalidPick }) => {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      if (!isInsideIndia(lat, lon)) {
        if (onInvalidPick) onInvalidPick();
        return;
      }
      onPick(lat, lon);
    },
  });
  return null;
};

const FlyToSelection = ({ lat, lon }) => {
  const map = useMap();

  useEffect(() => {
    if (!lat || !lon) return;
    map.flyTo([Number(lat), Number(lon)], Math.max(map.getZoom(), 13), {
      animate: true,
      duration: 0.8,
    });
  }, [lat, lon, map]);

  return null;
};

const LocationPickerMap = ({ lat, lon, onPick, onInvalidPick }) => {
  const center = useMemo(() => {
    if (lat && lon) return [Number(lat), Number(lon)];
    return INDIA_CENTER;
  }, [lat, lon]);

  return (
    <div style={{ height: 320, borderRadius: 10, overflow: 'hidden', border: '1px solid #d6e5da' }}>
      <MapContainer
        center={center}
        zoom={lat && lon ? 13 : 5}
        minZoom={5}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickPicker onPick={onPick} onInvalidPick={onInvalidPick} />
        <FlyToSelection lat={lat} lon={lon} />
        {lat && lon && <Marker position={[Number(lat), Number(lon)]} />}
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;
