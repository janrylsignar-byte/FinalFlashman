// API integration for Student At-Risk Prediction System
const API_BASE_URL = 'http://localhost:8000';

export const predictionApi = {
  // Submit assessment and get prediction
  async predict(assessmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Prediction API error:', error);
      throw error;
    }
  },

  // Get stored prediction for a student
  async getStudentPrediction(studentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get student prediction API error:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check API error:', error);
      throw error;
    }
  },
};
