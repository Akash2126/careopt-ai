import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Haversine formula to calculate distance between two points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

function HospitalMap({ hospital }) {
  const [transportLocations, setTransportLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  // Handle no-latitude gracefully
  if (!hospital || !hospital.latitude || !hospital.longitude) {
    return null;
  }

  const hospitalPosition = [hospital.latitude, hospital.longitude];

  useEffect(() => {
    const fetchTransport = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/nearby-transport?latitude=${hospital.latitude}&longitude=${hospital.longitude}`
        );
        const data = await response.json();
        
        const locations = [];
        
        // Handle response format from backend transport service
        if (data.nearest_airport) {
          const dist = haversineDistance(
            hospital.latitude, hospital.longitude,
            data.nearest_airport.latitude, data.nearest_airport.longitude
          );
          locations.push({
            type: 'airport',
            name: data.nearest_airport.name,
            position: [data.nearest_airport.latitude, data.nearest_airport.longitude],
            distance: dist
          });
        }
        
        if (data.nearest_bus_station) {
          const dist = haversineDistance(
            hospital.latitude, hospital.longitude,
            data.nearest_bus_station.latitude, data.nearest_bus_station.longitude
          );
          locations.push({
            type: 'bus',
            name: data.nearest_bus_station.name,
            position: [data.nearest_bus_station.latitude, data.nearest_bus_station.longitude],
            distance: dist
          });
        }
        
        if (data.nearest_metro_station) {
          const dist = haversineDistance(
            hospital.latitude, hospital.longitude,
            data.nearest_metro_station.latitude, data.nearest_metro_station.longitude
          );
          locations.push({
            type: 'metro',
            name: data.nearest_metro_station.name,
            position: [data.nearest_metro_station.latitude, data.nearest_metro_station.longitude],
            distance: dist
          });
        }
        
        setTransportLocations(locations);
      } catch (error) {
        console.error('Failed to fetch transport:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransport();
  }, [hospital.latitude, hospital.longitude]);

  // Custom marker colors as per spec:
  // Hospital → Blue
  // Airport → Red
  // Bus → Green
  // Metro → Purple
  const getMarkerIcon = (type) => {
    const colors = {
      hospital: '#3498db',   // Blue
      airport: '#e74c3c',    // Red
      bus: '#27ae60',       // Green
      metro: '#9b59b6'      // Purple
    };
    
    const labels = {
      hospital: 'H',
      airport: '✈',
      bus: '🚌',
      metro: 'M'
    };

    const color = colors[type] || colors.hospital;
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">${labels[type]}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  // Popup styling
  const popupStyle = {
    minWidth: '150px',
    padding: '5px'
  };

  const popupTitleStyle = {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '5px',
    color: '#2c3e50'
  };

  const popupDetailStyle = {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '3px'
  };

  return (
    <div style={{ marginTop: '20px', height: '400px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer 
        center={hospitalPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Hospital Marker - Blue */}
        <Marker position={hospitalPosition} icon={getMarkerIcon('hospital')}>
          <Popup>
            <div style={popupStyle}>
              <div style={{...popupTitleStyle, color: '#3498db'}}>{hospital.name}</div>
              <div style={popupDetailStyle}>🏥 Hospital</div>
              {hospital.type && <div style={popupDetailStyle}>Type: {hospital.type}</div>}
              {hospital.estimatedCost && <div style={popupDetailStyle}>💰 Est. Cost: ₹{hospital.estimatedCost.toLocaleString()}</div>}
            </div>
          </Popup>
        </Marker>
        
        {/* Transport Markers */}
        {!loading && transportLocations.map((loc, index) => (
          <Marker 
            key={index} 
            position={loc.position} 
            icon={getMarkerIcon(loc.type)}
          >
            <Popup>
              <div style={popupStyle}>
                <div style={{...popupTitleStyle, color: loc.type === 'airport' ? '#e74c3c' : loc.type === 'bus' ? '#27ae60' : '#9b59b6'}}>
                  {loc.type === 'airport' && '✈ '}Airport
                  {loc.type === 'bus' && '🚌 '}Bus Station
                  {loc.type === 'metro' && '🚇 '}Metro Station
                </div>
                <div style={popupDetailStyle}>{loc.name}</div>
                <div style={{...popupDetailStyle, fontWeight: 'bold', marginTop: '5px'}}>
                  📍 {loc.distance.toFixed(1)} km
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Loading Overlay */}
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '20px 30px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#2c3e50' }}>Loading transport options...</span>
          </div>
        </div>
      )}

      {/* Legend */}
      {!loading && transportLocations.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '12px 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>Legend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ background: '#3498db', width: '16px', height: '16px', borderRadius: '50%', display: 'inline-block' }}></span>
            <span>Hospital</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ background: '#e74c3c', width: '16px', height: '16px', borderRadius: '50%', display: 'inline-block' }}></span>
            <span>Airport</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ background: '#27ae60', width: '16px', height: '16px', borderRadius: '50%', display: 'inline-block' }}></span>
            <span>Bus Station</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#9b59b6', width: '16px', height: '16px', borderRadius: '50%', display: 'inline-block' }}></span>
            <span>Metro Station</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalMap;
