import React from 'react';

const PredictionResult = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Analyzing your assessment...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const isAtRisk = result.prediction === 'At-Risk';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Prediction Result</h2>
      
      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
          isAtRisk 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {isAtRisk ? '⚠️ At-Risk' : '✓ Good Standing'}
        </span>
        <p className="mt-2 text-gray-600">
          Confidence: {result.confidence.toFixed(1)}%
        </p>
      </div>

      {/* Good Standing - Simple Message */}
      {!isAtRisk && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <p className="text-green-700">
            Great job! You are in good standing. Keep up the excellent work with your studies, 
            time management, and academic engagement. Continue maintaining your positive habits 
            to ensure ongoing success.
          </p>
        </div>
      )}

      {/* At-Risk - Detailed Explanation */}
      {isAtRisk && result.category_contributions && (
        <div className="space-y-6">
          {/* Category Contribution Breakdown */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Category Contribution Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(result.category_contributions).map(([category, percentage]) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-red-600 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Text */}
          {result.explanation && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Explanation</h3>
              <p className="text-yellow-700">{result.explanation}</p>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-blue-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Student Info */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-gray-500">
          Student ID: {result.student_id} | Name: {result.full_name}
        </p>
      </div>
    </div>
  );
};

export default PredictionResult;
