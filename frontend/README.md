# AI Health Expense Optimizer

A modern React application that helps users find the most affordable hospitals using AI-powered recommendations and government scheme eligibility checking.

## Features

- 🏥 **AI-Powered Hospital Matching**: Get personalized hospital recommendations based on treatment, location, and budget
- 💰 **Cost Optimization**: See estimated costs and potential savings
- 📋 **Scheme Eligibility**: Discover which government health schemes you qualify for
- 📊 **Department Analytics**: View AI-analyzed performance metrics for hospital departments
- 🎨 **Modern UI**: Clean, responsive healthcare-themed interface with smooth animations

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Pure CSS** - Custom styling with CSS variables and modern features
- **No external UI libraries** - Lightweight and performant

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx              # Landing page with search form
│   │   ├── Home.css
│   │   ├── Recommendation.jsx    # Hospital recommendation page
│   │   ├── Recommendation.css
│   │   ├── FinalCost.jsx         # Final cost breakdown with schemes
│   │   └── FinalCost.css
│   ├── components/
│   │   ├── Navbar.jsx            # Navigation component
│   │   ├── Navbar.css
│   │   ├── HospitalCard.jsx      # Hospital information card
│   │   ├── HospitalCard.css
│   │   ├── SchemeCard.jsx        # Government scheme card
│   │   └── SchemeCard.css
│   ├── App.jsx                   # Main app component with routing
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global styles and design system
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
└── vite.config.js               # Vite configuration
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Design System

The application uses a comprehensive design system defined in `index.css`:

### Color Palette
- **Primary**: Blue gradient (#3b82f6 → #2563eb)
- **Accent**: Teal (#14b8a6), Green (#10b981), Purple (#8b5cf6)
- **Neutral**: Gray scale from 50 to 900
- **Semantic**: Success, Warning, Error, Info colors

### Components
- Cards with hover effects and shadows
- Modern form inputs with focus states
- Gradient buttons with animations
- Badge system for status indicators
- Responsive grid layouts

### Animations
- Fade-in animations for page loads
- Slide-in effects for content
- Smooth hover transitions
- Floating gradient backgrounds

## User Flow

1. **Home Page**: User selects treatment, city, and budget
2. **Recommendation Page**: AI-powered hospital recommendation with department analytics
3. **Final Cost Page**: Cost breakdown with scheme eligibility and savings

## Key Features Explained

### AI Hospital Matching
The app analyzes user requirements and matches them with hospitals based on:
- Treatment type compatibility
- Location proximity
- Budget constraints
- Historical success rates
- Department performance

### Department Performance Metrics
Each hospital displays AI-analyzed scores for:
- Cardiology
- Orthopedics
- Neurology
- Oncology

### Scheme Eligibility
The app checks eligibility for:
- Ayushman Bharat
- CGHS (Central Government Health Scheme)
- ESIC (Employee State Insurance)
- State Health Insurance

## Responsive Design

The application is fully responsive with breakpoints:
- **Desktop**: > 768px
- **Tablet**: 480px - 768px
- **Mobile**: < 480px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Backend API integration for real hospital data
- User authentication and profile management
- Appointment booking system
- PDF report generation
- Multi-language support
- Dark mode theme

## License

MIT License - feel free to use this project for learning or production purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
