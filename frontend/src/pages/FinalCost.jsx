import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SchemeCard from '../components/SchemeCard.jsx';
import MiniMap from '../components/MiniMap.jsx';
import { useAppContext } from '../context/AppContext';
import './FinalCost.css';

function FinalCost() {
  const navigate = useNavigate();
  const { selectedHospital, searchParams } = useAppContext();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transform hospital data to add required fields
  const hospital = selectedHospital ? {
    ...selectedHospital,
    location: selectedHospital.location || selectedHospital.city || searchParams?.city,
    estimatedCost: selectedHospital.estimatedCost || Math.round((selectedHospital.minCost + selectedHospital.maxCost) / 2)
  } : null;

  useEffect(() => {
    // Mock schemes data (in production, this would come from backend)
    const mockSchemes = [
      {
        name: 'Ayushman Bharat Yojana',
        short_name: 'ABY',
        description: 'National health protection scheme providing coverage up to ₹5 lakhs per family',
        coverage_pct: 50,
        max_benefit: 500000,
        savings: 0,
        eligible: true
      },
      {
        name: 'Chief Minister Health Insurance',
        short_name: 'CMHI',
        description: 'State-level health insurance scheme for eligible residents',
        coverage_pct: 30,
        max_benefit: 200000,
        savings: 0,
        eligible: true
      },
      {
        name: 'Employee State Insurance',
        short_name: 'ESI',
        description: 'Health insurance for employees and their family members',
        coverage_pct: 25,
        max_benefit: 150000,
        savings: 0,
        eligible: false
      },
      {
        name: 'Private Insurance',
        short_name: 'PI',
        description: 'Comprehensive private health insurance coverage',
        coverage_pct: 20,
        max_benefit: 100000,
        savings: 0,
        eligible: false
      }
    ];

    // Calculate savings for each scheme based on hospital cost
    if (hospital) {
      const baseCost = hospital.estimatedCost || 
        Math.round((hospital.minCost + hospital.maxCost) / 2);
      
      const schemesWithSavings = mockSchemes.map(scheme => ({
        ...scheme,
        savings: Math.min(
          Math.round(baseCost * (scheme.coverage_pct / 100)),
          scheme.max_benefit
        ),
        requirements: [
          'Valid government ID',
          'Income certificate',
          'Medical documents'
        ]
      }));
      
      setSchemes(schemesWithSavings);
    }
    
    setLoading(false);
  }, [hospital]);

  // Calculate costs using selected hospital data
  const baseCost = hospital?.estimatedCost || 
    (hospital ? Math.round((hospital.minCost + hospital.maxCost) / 2) : 0);

  const eligibleSchemes = schemes.filter(s => s.eligible);
  const totalSavings = eligibleSchemes.reduce((sum, scheme) => sum + scheme.savings, 0);
  const finalCost = Math.max(0, baseCost - totalSavings);

  const handleStartNewSearch = () => {
    navigate('/');
  };

  const handleDownloadReport = () => {
    alert('Download feature will be implemented with backend integration');
  };

  const handleBookAppointment = () => {
    alert('Appointment booking feature will be implemented with backend integration');
  };

  // Check if no valid search or hospital exists - redirect or show fallback
  if (!searchParams || !searchParams.treatment || !searchParams.city || !hospital) {
    return (
      <div className="final-cost-page">
        <div className="container">
          <div className="empty-state card">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="32" cy="32" r="30" />
              <path d="M32 20v24M20 32h24" />
            </svg>
            <h2>No active search found</h2>
            <p>Please start a new search to get recommendations</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="final-cost-page">
        <div className="container">
          <div className="loading-state card">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="spinner-large">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
              <path d="M32 4a28 28 0 0128 28" stroke="currentColor" strokeWidth="4" fill="none"/>
            </svg>
            <h2>Calculating Your Savings...</h2>
            <p>Analyzing scheme eligibility and final costs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="final-cost-page">
      <div className="container">
        <div className="page-header animate-fade-in">
          <div className="breadcrumb">
            <button onClick={() => navigate('/')} className="breadcrumb-link">Home</button>
            <span className="breadcrumb-separator">/</span>
            <button onClick={() => navigate('/recommendation')} className="breadcrumb-link">
              Recommendations
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Final Cost</span>
          </div>
          <h1>Your Final Cost Breakdown</h1>
          <p className="page-subtitle">
            Based on treatment at <strong>{hospital.name}</strong>, {hospital.location}
          </p>
          
          {/* Mini Map Preview */}
          <MiniMap hospital={hospital} />
        </div>

        <div className="cost-summary-section animate-fade-in">
          <div className="cost-summary-card">
            <div className="summary-header">
              <h2>Cost Summary</h2>
              <div className="summary-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z"/>
                </svg>
                AI Optimized
              </div>
            </div>

            <div className="cost-breakdown">
              <div className="cost-item original">
                <div className="cost-label">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                    <circle cx="10" cy="10" r="3"/>
                  </svg>
                  Original Hospital Cost
                </div>
                <div className="cost-amount">₹{baseCost.toLocaleString()}</div>
                <div className="cost-range">
                  (₹{hospital.minCost?.toLocaleString()} - ₹{hospital.maxCost?.toLocaleString()})
                </div>
              </div>

              <div className="cost-divider">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>

              <div className="cost-item savings">
                <div className="cost-label">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-1 13l-4-4 1.41-1.41L9 12.17l5.59-5.59L16 8l-7 7z"/>
                  </svg>
                  Scheme Savings
                </div>
                <div className="cost-amount savings-amount">-₹{totalSavings.toLocaleString()}</div>
              </div>

              <div className="cost-divider total">
                <div className="divider-line"></div>
              </div>

              <div className="cost-item final">
                <div className="cost-label">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 1l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z"/>
                  </svg>
                  Final Cost (You Pay)
                </div>
                <div className="cost-amount final-amount">₹{finalCost.toLocaleString()}</div>
              </div>
            </div>

            <div className="savings-highlight">
              <div className="savings-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9l3-9z"/>
                </svg>
                <div className="savings-text">
                  <span className="savings-label">Total Savings</span>
                  <span className="savings-value">₹{totalSavings.toLocaleString()}</span>
                </div>
                <div className="savings-percentage">
                  {baseCost > 0 ? Math.round((totalSavings / baseCost) * 100) : 0}% OFF
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="schemes-section animate-slide-in">
          <div className="section-header">
            <h2>Scheme Eligibility</h2>
            <p>Government and insurance schemes you qualify for</p>
          </div>

          <div className="schemes-grid">
            {schemes.map((scheme, index) => (
              <SchemeCard key={index} scheme={scheme} />
            ))}
          </div>
        </div>

        <div className="next-steps-section animate-fade-in">
          <div className="section-header">
            <h2>Next Steps</h2>
            <p>Complete your healthcare journey</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Download Full Report</h3>
                <p>Get a detailed PDF with all cost breakdowns and scheme information</p>
                <button onClick={handleDownloadReport} className="btn btn-outline">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12l-4-4h3V2h2v6h3l-4 4zM4 16h12v2H4v-2z"/>
                  </svg>
                  Download Report
                </button>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Book Appointment</h3>
                <p>Schedule a consultation with the recommended hospital</p>
                <button onClick={handleBookAppointment} className="btn btn-primary">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 2h8v2H6V2zM4 6h12v12H4V6zm2 2v8h8V8H6z"/>
                  </svg>
                  Book Appointment
                </button>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>New Search</h3>
                <p>Looking for another treatment? Start a new AI-powered search</p>
                <button onClick={handleStartNewSearch} className="btn btn-secondary">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 16a6 6 0 100-12 6 6 0 000 12zm11.707 1.293l-4.82-4.82A8 8 0 108 16a7.965 7.965 0 004.9-1.688l4.82 4.82a1 1 0 001.414-1.414z"/>
                  </svg>
                  Start New Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalCost;
