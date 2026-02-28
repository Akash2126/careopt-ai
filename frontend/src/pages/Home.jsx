import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useAppContext } from '../context/AppContext';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { setSearchParams, setHospitals, setSelectedHospital } = useAppContext();
  const [formData, setFormData] = useState({
    treatment: '',
    city: '',
    budget: 100000
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const treatments = [
    'Appendix Surgery',
    'Kidney Stone Treatment',
    'Normal Delivery',
    'C-Section Delivery',
    'Cataract Surgery'
  ];

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Ahmedabad'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.treatment && formData.city) {
      setLoading(true);
      setError(null);

      try {
        // Clear previous hospital state before new search
        setHospitals([]);
        setSelectedHospital(null);
        
        // Call backend API
        const result = await apiService.searchHospitals(formData);

        if (result.success) {
          // Update context with search params
          setSearchParams(formData);
          
          // Update context with hospitals data (can be empty)
          const hospitalsData = result.data.hospitals || [];
          setHospitals(hospitalsData);
          
          // Set first hospital as selected ONLY if hospitals array is not empty
          if (hospitalsData.length > 0) {
            setSelectedHospital(hospitalsData[0]);
          }
          
          // Navigate to recommendation page
          navigate('/recommendation');
        } else {
          setError(result.error || 'Failed to fetch recommendations. Please try again.');
        }
      } catch (err) {
        setError('An unexpected error occurred. Please check your connection and try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="home-page">
      <div className="home-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="container">
        <div className="home-content">
          <div className="hero-section animate-fade-in">
            <div className="hero-badge">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z"/>
              </svg>
              <span>AI-Powered Healthcare Solutions</span>
            </div>
            <h1 className="hero-title">
              Find the Most <span className="text-gradient">Affordable Hospital</span> with AI
            </h1>
            <p className="hero-subtitle">
              Get personalized hospital recommendations based on treatment type, location, and budget. 
              Our AI analyzes thousands of options to find the best match for you.
            </p>
          </div>

          <div className="search-card card animate-fade-in">
            <div className="card-header">
              <h2>Start Your Search</h2>
              <p>Fill in your details to get AI-powered recommendations</p>
            </div>

            <form onSubmit={handleSubmit} className="search-form">
              {error && (
                <div className="error-message">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H9v-2h2v2zm0-4H9V6h2v5z"/>
                  </svg>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="treatment">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                    <rect x="7" y="2" width="4" height="14" rx="1" />
                    <rect x="2" y="7" width="14" height="4" rx="1" />
                  </svg>
                  Select Treatment
                </label>
                <select
                  id="treatment"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose a treatment...</option>
                  {treatments.map((treatment, index) => (
                    <option key={index} value={treatment}>{treatment}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="city">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                    <path d="M9 2C6.24 2 4 4.24 4 7c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                  Select City
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose a city...</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="budget">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                    <path d="M9 2C5.13 2 2 5.13 2 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm.5 3v1.5h1V8h-1v4.5h-1V8H7V6.5h1.5V5h1zm-1 7.5h1v1h-1v-1z"/>
                  </svg>
                  Budget Range
                </label>
                <div className="budget-slider-container">
                  <input
                    type="range"
                    id="budget"
                    name="budget"
                    min="50000"
                    max="1000000"
                    step="10000"
                    value={formData.budget}
                    onChange={handleInputChange}
                  />
                  <div className="budget-display">
                    <span className="budget-value">₹{formData.budget.toLocaleString()}</span>
                    <span className="budget-label">Maximum Budget</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="spinner">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25"/>
                      <path d="M10 2a8 8 0 018 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16a6 6 0 100-12 6 6 0 000 12zm11.707 1.293l-4.82-4.82A8 8 0 108 16a7.965 7.965 0 004.9-1.688l4.82 4.82a1 1 0 001.414-1.414z"/>
                    </svg>
                    Find Best Hospital
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="features-section animate-fade-in">
            <div className="feature-card">
              <div className="feature-icon ai">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 4l-2 6-6 2 6 2 2 6 2-6 6-2-6-2-2-6zM8 20l-1 3-3 1 3 1 1 3 1-3 3-1-3-1-1-3zM24 20l-1 3-3 1 3 1 1 3 1-3 3-1-3-1-1-3z"/>
                </svg>
              </div>
              <h3>AI-Powered Matching</h3>
              <p>Advanced algorithms analyze your needs and match you with the most suitable hospitals</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon cost">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6zm1 4v2h2v2h-2v6h-2v-6h-2v-2h2v-2h2zm-1 10h2v2h-2v-2z"/>
                </svg>
              </div>
              <h3>Cost Optimization</h3>
              <p>Find the best healthcare value without compromising on quality of treatment</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon scheme">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M28 8H4v16h24V8zM6 22v-6h20v6H6zm20-8H6v-4h20v4z"/>
                  <rect x="8" y="18" width="6" height="2" />
                </svg>
              </div>
              <h3>Scheme Eligibility</h3>
              <p>Discover government and insurance schemes you qualify for to reduce costs further</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
