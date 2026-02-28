# AI Health Expense Optimizer - Full Stack

A modern React + FastAPI application that helps users find the most affordable hospitals using AI-powered recommendations and government scheme eligibility checking.

**✅ FULLY INTEGRATED: React Frontend + FastAPI Backend (PostgreSQL + Gemini + Pinecone)**

---

## 🌟 Features

- 🏥 **Real Hospital Data**: Query PostgreSQL database for actual hospital information
- 🤖 **AI Recommendations**: Gemini Flash 2.5 powered recommendations  
- 🔍 **Smart Scheme Matching**: Pinecone RAG for relevant government schemes
- 💰 **Cost Optimization**: Real-time cost calculations and savings
- 📊 **Department Analytics**: Performance metrics visualization
- 🎨 **Modern UI**: Responsive healthcare-themed interface
- ⚡ **Fast API**: Lightning-fast FastAPI backend

---

## 🏗️ Architecture

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   React     │  HTTP    │   FastAPI    │  Query   │ PostgreSQL  │
│  Frontend   │ ◄─────► │   Backend    │ ◄─────► │  Database   │
│ (Port 5173) │          │ (Port 8000)  │          └─────────────┘
└─────────────┘          └──────┬───────┘
                                │
                   ┌────────────┴────────────┐
                   │                         │
              ┌────▼────┐              ┌────▼────┐
              │ Gemini  │              │Pinecone │
              │   AI    │              │   RAG   │
              └─────────┘              └─────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm  
- Python 3.8+
- PostgreSQL database (running)
- Gemini API key
- Pinecone API key and index

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
DB_NAME=your_database
DB_USER=your_username  
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

Run backend:
```bash
uvicorn app.main:app --reload --port 8000
```

✅ Backend running on: **http://localhost:8000**

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

Run frontend:
```bash
npm run dev
```

✅ Frontend running on: **http://localhost:5173**

---

## 📡 API Integration

### Backend Endpoints

#### 1. Health Check
```bash
GET /
Response: {"message": "AI Health Expense Optimizer API running"}
```

#### 2. Search Hospitals (Main Endpoint)
```bash
POST /search
Content-Type: application/json

Request Body:
{
  "treatment": "Orthopedics - Joint Replacement",
  "city": "Chennai"
}

Response:
{
  "hospitals": [
    ["Apollo Hospital", "Private Multi-specialty", 300000, 500000],
    ["Fortis Hospital", "Private", 250000, 450000]
  ],
  "schemes": "Ayushman Bharat covers...\nCGHS provides...",
  "recommendation": "Based on your requirements, Apollo Hospital..."
}
```

### Frontend API Service

Located at `src/services/api.js`:

```javascript
import apiService from '../services/api';

// Search hospitals
const result = await apiService.searchHospitals({
  treatment: 'Cardiology',
  city: 'Mumbai'  
});

// Parse hospital data
const hospitals = apiService.parseHospitals(result.data.hospitals);
```

---

## 🔄 Data Flow

```
1. User fills form (Home.jsx)
   ├─ Treatment: "Orthopedics - Joint Replacement"
   ├─ City: "Chennai"
   └─ Budget: ₹100,000

2. Frontend: POST /search → FastAPI

3. Backend Processing:
   ├─ queries.py: Query PostgreSQL for hospitals
   ├─ retrieve.py: Query Pinecone for schemes (RAG)
   └─ ai_recommender.py: Call Gemini for AI analysis

4. Backend Response:
   ├─ hospitals: [[name, type, min, max], ...]
   ├─ schemes: "text of relevant schemes"
   └─ recommendation: "AI analysis"

5. Frontend Display:
   ├─ Recommendation.jsx: Show best hospital
   └─ FinalCost.jsx: Show cost breakdown + schemes
```

---

## 📁 Project Structure

```
project/
├── frontend/                    # React Application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Search form + API call
│   │   │   ├── Recommendation.jsx   # Display results
│   │   │   └── FinalCost.jsx   # Cost breakdown
│   │   ├── components/
│   │   │   ├── HospitalCard.jsx
│   │   │   └── SchemeCard.jsx
│   │   ├── services/
│   │   │   └── api.js          # ⭐ Backend integration
│   │   └── App.jsx
│   ├── .env                    # API_URL configuration
│   └── package.json
│
└── backend/                    # FastAPI Application  
    ├── app/
    │   ├── main.py            # ⭐ API endpoints
    │   ├── db/
    │   │   ├── connection.py  # PostgreSQL
    │   │   └── queries.py     # Hospital queries
    │   ├── rag/
    │   │   └── retrieve.py    # Pinecone RAG
    │   └── services/
    │       └── ai_recommender.py  # Gemini AI
    └── requirements.txt
```

---

## 🧪 Testing Integration

### 1. Test Backend Directly
```bash
curl http://localhost:8000/

curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"treatment": "Cardiology", "city": "Mumbai"}'
```

### 2. Test Full Stack
1. Start both backend and frontend
2. Open http://localhost:5173
3. Fill form and submit
4. Check browser DevTools → Network tab
5. Verify `/search` API call succeeds

---

## 🛠️ Database Setup

### Create PostgreSQL Database

```sql
CREATE DATABASE health_optimizer;

CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    city VARCHAR(100),
    treatment VARCHAR(255),
    min_cost INTEGER,
    max_cost INTEGER
);

-- Sample data
INSERT INTO hospitals (name, type, city, treatment, min_cost, max_cost) VALUES
('Apollo Hospital', 'Private Multi-specialty', 'Chennai', 'Orthopedics', 300000, 500000),
('Fortis Hospital', 'Private', 'Mumbai', 'Cardiology', 400000, 600000),
('AIIMS', 'Government', 'Delhi', 'Neurology', 150000, 300000);
```

---

## 🐛 Troubleshooting

### CORS Issues
Add to `backend/app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Connection Refused
- ✅ Check backend is running: `curl http://localhost:8000/`
- ✅ Check `.env` files are correct
- ✅ Check firewall settings

### Database Errors
- ✅ Verify PostgreSQL is running: `psql -l`
- ✅ Test connection: `psql -h localhost -U user -d database`
- ✅ Check credentials in backend/.env

---

## 📚 Documentation

- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Complete integration guide
- **[README.md](./README.md)** - Original frontend docs

---

## 🎯 API Response Examples

### Successful Search
```json
{
  "hospitals": [
    ["Apollo Multispecialty Hospital", "Private Multi-specialty", 320000, 480000],
    ["Fortis Healthcare", "Private", 280000, 450000],
    ["Max Hospital", "Private", 300000, 500000]
  ],
  "schemes": "Ayushman Bharat: Coverage up to ₹5 lakhs...\n\nCGHS: For central govt employees...",
  "recommendation": "Based on your budget and treatment needs, Apollo Multispecialty Hospital offers the best balance of cost and quality. Estimated cost: ₹400,000. You may be eligible for Ayushman Bharat which could reduce your out-of-pocket expenses by up to 40%."
}
```

### No Hospitals Found
```json
{
  "message": "No hospitals found"
}
```

---

## ✨ Features In Action

### 1. Search Hospitals
- User selects treatment and city
- Frontend calls `apiService.searchHospitals()`
- Shows loading indicator
- Displays error if API fails

### 2. View Recommendations  
- Parses hospital array from backend
- Calculates average cost
- Shows best match with AI score
- Displays department performance

### 3. See Final Cost
- Shows original cost from backend
- Displays scheme savings
- Calculates final cost
- Shows eligibility for each scheme

---

## 🚧 Roadmap

- [ ] User authentication with JWT
- [ ] Save search history to database
- [ ] Real appointment booking
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Hospital reviews and ratings
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📄 License

MIT License - Free to use for learning and production

---

## 🤝 Contributing

Pull requests welcome! Please ensure:
- Backend tests pass
- Frontend builds without errors
- API integration works
- Code follows project style

---

**Status: ✅ PRODUCTION READY**

Full stack integration complete with real database, AI, and vector search!
