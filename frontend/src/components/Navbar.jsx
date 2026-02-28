import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#gradient)" />
              <path d="M16 8L12 12H15V18H12L16 24L20 18H17V12H20L16 8Z" fill="white" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="brand-text">
            CareOpt <span className="brand-accent">AI</span>
          </span>
        </Link>

        <div className="navbar-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/recommendation" 
            className={`nav-link ${location.pathname === '/recommendation' ? 'active' : ''}`}
          >
            Recommendations
          </Link>
          <Link 
            to="/final-cost" 
            className={`nav-link ${location.pathname === '/final-cost' ? 'active' : ''}`}
          >
            Final Cost
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
