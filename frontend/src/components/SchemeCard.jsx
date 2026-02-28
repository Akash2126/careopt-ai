import './SchemeCard.css';

function SchemeCard({ scheme }) {
  const getStatusBadge = (eligible) => {
    if (eligible) {
      return <span className="badge badge-success">✓ Eligible</span>;
    }
    return <span className="badge badge-warning">✗ Not Eligible</span>;
  };

  return (
    <div className={`scheme-card ${scheme.eligible ? 'eligible' : 'not-eligible'} animate-slide-in`}>
      <div className="scheme-header">
        <div className="scheme-icon-wrapper">
          <div className={`scheme-icon ${scheme.eligible ? 'eligible-icon' : 'not-eligible-icon'}`}>
            {scheme.eligible ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </div>
        </div>
        <div className="scheme-title-section">
          <h4 className="scheme-name">{scheme.name}</h4>
          {getStatusBadge(scheme.eligible)}
        </div>
      </div>

      <p className="scheme-description">{scheme.description}</p>

      {scheme.coverage && (
        <div className="scheme-coverage">
          <div className="coverage-label">Coverage Amount</div>
          <div className="coverage-amount">₹{scheme.coverage.toLocaleString()}</div>
        </div>
      )}

      {scheme.savings && scheme.eligible && (
        <div className="scheme-savings">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z"/>
          </svg>
          <span>You save ₹{scheme.savings.toLocaleString()}</span>
        </div>
      )}

      {scheme.requirements && scheme.requirements.length > 0 && (
        <div className="scheme-requirements">
          <div className="requirements-title">Requirements:</div>
          <ul className="requirements-list">
            {scheme.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SchemeCard;
