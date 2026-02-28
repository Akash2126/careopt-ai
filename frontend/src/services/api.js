// API configuration and service layer for FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Helper function to parse hospitals from backend format
// Backend returns: object with named keys (name, type, min_cost, max_cost, etc.)
const parseHospitals = (hospitalsArray) => {
  return hospitalsArray.map(hospital => ({
    name: hospital.name,
    type: hospital.type,
    city: hospital.city,
    area: hospital.area,
    rating: hospital.rating,
    treatmentName: hospital.treatment_name,
    minCost: hospital.min_cost,
    maxCost: hospital.max_cost,
    estimatedCost: hospital.estimated_cost || Math.round((hospital.min_cost + hospital.max_cost) / 2),
    latitude: hospital.latitude,
    longitude: hospital.longitude
  }));
};

// API service object
const apiService = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Search hospitals
  searchHospitals: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          treatment: formData.treatment,
          city: formData.city,
          budget: formData.budget
        })
      });

      const data = await handleResponse(response);

      const parsedHospitals = parseHospitals(data.hospitals || []);

      return {
        success: true,
        data: {
          hospitals: parsedHospitals,
          schemes: data.schemes || [],
          recommendation: data.recommendation || '',
          message: data.message || null
        }
      };
    } catch (error) {
      console.error('Search failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to search hospitals'
      };
    }
  },

  parseHospitals
};

export default apiService;
