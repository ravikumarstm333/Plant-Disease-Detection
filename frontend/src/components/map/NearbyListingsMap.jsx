import React, { useMemo } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const NearbyListingsMap = ({ buyerLat, buyerLon, rangeKm, listings }) => {
  const center = useMemo(() => [Number(buyerLat), Number(buyerLon)], [buyerLat, buyerLon]);

  if (!buyerLat || !buyerLon) return null;

  return (
    <div style={{ height: 360, borderRadius: 10, overflow: 'hidden', border: '1px solid #d6e5da', marginBottom: 16 }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>Buyer Location</Popup>
        </Marker>
        <Circle center={center} radius={Number(rangeKm) * 1000} pathOptions={{ color: '#1f7a48', fillOpacity: 0.08 }} />
        {listings.map((listing) => {
          const coords = listing?.location?.coordinates || [];
          if (coords.length !== 2) return null;
          return (
            <Marker key={listing._id} position={[coords[1], coords[0]]}>
              <Popup>
                <div>
                  <strong>{listing.vegetableName}</strong>
                  <div>{listing.pricePerKg}/kg</div>
                  <div>{listing.quantityKg} kg</div>
                  <div>{listing.distanceKm} km away</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default NearbyListingsMap;
