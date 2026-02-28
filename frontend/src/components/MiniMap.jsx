import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MiniMap({ hospital }) {
  const mapRef = useRef(null);

  // Handle no-latitude gracefully
  if (!hospital || !hospital.latitude || !hospital.longitude) {
    return null;
  }

  const hospitalPosition = [hospital.latitude, hospital.longitude];

  // Custom blue marker for hospital
  const getMarkerIcon = () => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: #3498db;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">H</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  return (
    <div className="mini-map-container" style={{ 
      height: '200px', 
      borderRadius: '10px', 
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginTop: '15px'
    }}>
      <MapContainer 
        center={hospitalPosition} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Hospital Marker */}
        <Marker position={hospitalPosition} icon={getMarkerIcon()}>
          <Popup>
            <div style={{ minWidth: '120px', fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', color: '#3498db' }}>{hospital.name}</div>
              <div style={{ color: '#7f8c8d', marginTop: '3px' }}>📍 {hospital.location}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default MiniMap;
