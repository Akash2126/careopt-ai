import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import HospitalCard from '../components/HospitalCard.jsx';
import HospitalMap from '../components/HospitalMap.jsx';
import { useAppContext } from '../context/AppContext';
import './Recommendation.css';

function Recommendation() {
  const navigate = useNavigate();
  const { searchParams, hospitals, selectedHospital } = useAppContext();
  const mapSectionRef = useRef(null);

  // Transform hospital data to add required fields for HospitalCard
  const recommendedHospital = (hospitals && hospitals.length > 0 && selectedHospital) 
    ? {
        ...selectedHospital,
        location: selectedHospital.city || searchParams.city,
        aiScore: selectedHospital.aiScore || Math.round(85 + Math.random() * 10),
        features: selectedHospital.features || [
          '24/7 Emergency',
          'Advanced Equipment',
          'Expert Surgeons',
          'Insurance Accepted'
        ]
      }
    : null;

  // No valid search params - show fallback message
  if (!searchParams || !searchParams.treatment || !searchParams.city) {
    return (
      <div className="recommendation-page">
        <div className="container">
          <div className="empty-state card">
            <h2>No active search found</h2>
            <p>Please start a new search to get recommendations</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No hospitals found for the search - show fallback message
  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="recommendation-page">
        <div className="container">
          <div className="empty-state card">
            <h2>No hospitals found</h2>
            <p>No hospitals found for selected city and treatment.</p>
            <p>Please try a different search criteria.</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Start New Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No hospital selected but hospitals exist - should not normally happen but handle it
  if (!recommendedHospital) {
    return (
      <div className="recommendation-page">
        <div className="container">
          <div className="empty-state card">
            <h2>No Recommendations Found</h2>
            <p>Please try a different search</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-page">
      <div className="container">
        <div className="page-header animate-fade-in">
          <h1>Your AI-Powered Recommendation</h1>
          <p className="page-subtitle">
            Based on your search for{' '}
            <strong>{searchParams.treatment}</strong> in{' '}
            <strong>{searchParams.city}</strong>
          </p>
        </div>

        <div className="recommendation-section animate-fade-in">
          <HospitalCard hospital={recommendedHospital} />
        </div>

        {/* Map showing hospital location and nearby transport */}
        <div className="map-section animate-fade-in" ref={mapSectionRef}>
          <HospitalMap hospital={recommendedHospital} />
        </div>

        <div className="departments-section animate-slide-in">
          <div className="departments-grid">
            {[
              { name: 'Cardiology', rating: 4.8, score: 96, specialists: 12, color: 'blue' },
              { name: 'Orthopedics', rating: 4.7, score: 94, specialists: 10, color: 'green' },
              { name: 'Neurology', rating: 4.9, score: 98, specialists: 8, color: 'purple' },
              { name: 'Oncology', rating: 4.6, score: 92, specialists: 15, color: 'orange' }
            ].map((dept, index) => (
              <div key={index} className={`department-card dept-${dept.color}`}>
                <div className="dept-header">
                  <div className="dept-info">
                    <h3>{dept.name}</h3>
                    <div className="dept-specialists">{dept.specialists} Specialists</div>
                  </div>
                  <div className="dept-rating">⭐ {dept.rating}</div>
                </div>
                <div className="dept-score">
                  <div className="score-bar-container">
                    <div className="score-bar" style={{ width: `${dept.score}%` }}></div>
                  </div>
                  <div className="score-value">
                    <span className="score-number">{dept.score}</span>
                    <span className="score-label">AI Score</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="action-section animate-fade-in">
          <div className="action-card">
            <div className="action-content">
              <div className="action-text">
                <h3>Ready to See Your Savings?</h3>
                <p>Check which government schemes and insurance benefits you're eligible for</p>
              </div>
            </div>
            <button onClick={() => navigate('/final-cost')} className="btn btn-success action-button">
              Check Final Cost with Schemes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recommendation;
