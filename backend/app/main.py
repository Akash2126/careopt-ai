from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncpg
import os
from pathlib import Path
from dotenv import load_dotenv
from urllib.parse import quote_plus

from app.models.schemas import SearchRequest
from app.db.queries import get_hospitals
from app.services.transport import get_nearby_transport
from app.services.ocr import extract_text_from_image, is_tesseract_available
from app.services.rag.ayushman_rag import check_ayushman_eligibility

# Load .env from backend directory
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Check for DATABASE_URL first, then fall back to individual variables
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Use DATABASE_URL directly (for production deployment like Render)
    pass
else:
    # Validate required environment variables for individual config
    required_vars = ["DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Individual database configuration with safe defaults
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = os.getenv("DB_PORT", "5432")
    
    # Encode password to handle special characters
    encoded_password = quote_plus(DB_PASSWORD)
    
    # Construct DATABASE_URL properly - handle IPv6 addresses
    if ":" in DB_HOST:  # IPv6 detected
        DATABASE_URL = (
            f"postgresql://{DB_USER}:{encoded_password}"
            f"@[{DB_HOST}]:{DB_PORT}/{DB_NAME}"
        )
    else:
        DATABASE_URL = (
            f"postgresql://{DB_USER}:{encoded_password}"
            f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )

# 🔥 Lifespan event to create DB pool
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=1,
            max_size=10
        )
        print("✅ Database connected successfully")
    except Exception as e:
        print("❌ Database connection failed")
        print(f"   Error: {str(e)}")
        raise e
    yield
    await app.state.pool.close()
    print("❌ Database disconnected")

app = FastAPI(lifespan=lifespan)

# CORS - Configure for production
# In production, replace with your actual frontend domain
cors_origins = os.getenv("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "API running"}

@app.post("/api/recommend")
async def recommend(data: SearchRequest):

    hospitals = await get_hospitals(
        pool=app.state.pool,
        city=data.city,
        treatment=data.treatment,
        budget=data.budget
    )

    return {
        "hospitals": hospitals,
        "schemes": [],
        "recommendation": "Best hospital based on cost."
    }

@app.get("/api/nearby-transport")
async def nearby_transport(
    latitude: float = Query(..., description="User's latitude"),
    longitude: float = Query(..., description="User's longitude")
):
    """
    Get nearby transportation options (airports, bus stations, metro stations)
    within 10km radius using OpenStreetMap Overpass API.
    """
    result = await get_nearby_transport(latitude, longitude)
    return result

@app.get("/api/ocr/status")
async def ocr_status():
    """
    Check if Tesseract OCR is available and properly configured.
    """
    available = is_tesseract_available()
    return {
        "available": available,
        "message": "Tesseract OCR is available" if available else "Tesseract OCR is not configured"
    }

@app.post("/api/ocr/extract")
async def ocr_extract(file: bytes = Body(...)):
    """
    Extract text from an uploaded image using Tesseract OCR.
    
    Send raw bytes of the image file in the request body.
    """
    result = extract_text_from_image(file)
    return result


@app.post("/api/ayushman/eligibility")
async def ayushman_eligibility(
    user_info: str = Body(..., description="User's occupation, residence, and background"),
    annual_income: float = Body(None, description="Optional annual income in INR")
):
    """
    Check Ayushman Bharat PM-JAY eligibility using RAG-based system.
    
    This endpoint uses a local knowledge base to determine eligibility based on:
    - Occupation (rural/urban workers)
    - Residence type (rural/urban)
    - Social category (SC/ST)
    - Income level
    - Other socioeconomic factors
    """
    result = check_ayushman_eligibility(user_info, annual_income)
    return result


# Main entry point for running with uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "10000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
