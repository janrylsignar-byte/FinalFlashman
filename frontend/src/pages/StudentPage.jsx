import React, { useState } from 'react';
import StudentAssessmentForm from '../components/StudentAssessmentForm';
import PredictionResult from '../components/PredictionResult';
import { predictionApi } from '../api/predictionApi';

const StudentPage = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAssessmentSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const result = await predictionApi.predict(formData);
      setPredictionResult(result);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPredictionResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Student At-Risk Prediction System
          </h1>
          <p className="text-gray-600">
            Complete the self-assessment below to receive a personalized prediction
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!predictionResult && !loading && (
          <StudentAssessmentForm onSubmit={handleAssessmentSubmit} />
        )}

        {loading && (
          <PredictionResult result={null} loading={true} />
        )}

        {predictionResult && !loading && (
          <>
            <PredictionResult result={predictionResult} loading={false} />
            <div className="max-w-4xl mx-auto mt-6 text-center">
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Submit New Assessment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentPage;
