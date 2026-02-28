import './HospitalCard.css';

function HospitalCard({ hospital }) {
  return (
    <div className="hospital-card animate-fade-in">
      <div className="hospital-card-header">
        <div className="hospital-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="url(#hospital-gradient)" opacity="0.1" />
            <rect x="18" y="12" width="12" height="24" rx="2" fill="url(#hospital-gradient)" />
            <rect x="21" y="15" width="6" height="3" fill="white" />
            <rect x="22.5" y="13.5" width="3" height="6" fill="white" />
            <defs>
              <linearGradient id="hospital-gradient" x1="12" y1="12" x2="36" y2="36">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="hospital-info">
          <h3 className="hospital-name">{hospital.name}</h3>
          <p className="hospital-location">{hospital.location}</p>
        </div>
        <div className="hospital-badge">
          <span className="badge badge-primary">AI Recommended</span>
        </div>
      </div>

      <div className="hospital-card-body">
        <div className="hospital-stats">
          <div className="stat-item">
            <div className="stat-icon type">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                <circle cx="10" cy="10" r="3"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Type</span>
              <span className="stat-value">{hospital.type}</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon cost">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2C8.9 2 8 2.9 8 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2c0-1.1-.9-2-2-2zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-1 4h2v1h1v2h-1v1h-2v-1H8v-2h1V8z"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Estimated Cost</span>
              <span className="stat-value cost-value">₹{hospital.estimatedCost?.toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon score">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 1l2.5 6.5L19 8.5l-5 4.5L15.5 19 10 15.5 4.5 19 6 13l-5-4.5 6.5-1z"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">AI Match Score</span>
              <span className="stat-value score-value">{hospital.aiScore}%</span>
            </div>
          </div>
        </div>

        {hospital.features && hospital.features.length > 0 && (
          <div className="hospital-features">
            {hospital.features.map((feature, index) => (
              <span key={index} className="feature-tag">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z"/>
                </svg>
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalCard;
