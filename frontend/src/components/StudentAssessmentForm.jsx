import React, { useState } from 'react';

const StudentAssessmentForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    // Academic
    gpa: '',
    failed_subjects: '',
    gpa_trend: 'stable',
    // Personal (Likert scale: Never, Rarely, Sometimes, Often, Always)
    study_habits: 'sometimes',
    time_management: 'sometimes',
    lms_engagement: 'sometimes',
    attendance: 'sometimes',
    motivation: 'sometimes',
    assignment_completion: 'sometimes',
    class_participation: 'sometimes',
    // Financial
    family_income_level: 'medium',
    scholarship_status: 'no',
    working_student: 'no',
    transportation_difficulty: 'sometimes'
  });

  const likertOptions = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
  const trendOptions = ['Declining', 'Stable', 'Improving'];
  const incomeOptions = ['Low', 'Medium', 'High'];
  const binaryOptions = ['No', 'Yes'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Self-Assessment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your student ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        {/* Academic Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current GPA (1.0 - 5.0)
              </label>
              <input
                type="number"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                required
                min="1"
                max="5"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Failed Subjects
              </label>
              <input
                type="number"
                name="failed_subjects"
                value={formData.failed_subjects}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA Trend
              </label>
              <select
                name="gpa_trend"
                value={formData.gpa_trend}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {trendOptions.map(option => (
                  <option key={option.toLowerCase()} value={option.toLowerCase()}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Personal Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Factors</h3>
          <p className="text-sm text-gray-600 mb-4">Rate each statement based on your experience</p>
          
          <div className="space-y-4">
            {[
              { name: 'study_habits', label: 'I study regularly and consistently' },
              { name: 'time_management', label: 'I manage my time effectively' },
              { name: 'lms_engagement', label: 'I actively engage with the Learning Management System' },
              { name: 'attendance', label: 'I attend classes regularly' },
              { name: 'motivation', label: 'I feel motivated to complete my studies' },
              { name: 'assignment_completion', label: 'I submit assignments on time' },
              { name: 'class_participation', label: 'I participate actively in class discussions' }
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {likertOptions.map(option => (
                    <option key={option.toLowerCase()} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Financial Factors</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Family Income Level
              </label>
              <select
                name="family_income_level"
                value={formData.family_income_level}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {incomeOptions.map(option => (
                  <option key={option.toLowerCase()} value={option.toLowerCase()}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Do you have a scholarship?
                </label>
                <select
                  name="scholarship_status"
                  value={formData.scholarship_status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {binaryOptions.map(option => (
                    <option key={option.toLowerCase()} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Are you a working student?
                </label>
                <select
                  name="working_student"
                  value={formData.working_student}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {binaryOptions.map(option => (
                    <option key={option.toLowerCase()} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transportation difficulty affects attendance
                </label>
                <select
                  name="transportation_difficulty"
                  value={formData.transportation_difficulty}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {likertOptions.map(option => (
                    <option key={option.toLowerCase()} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="border-t pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            Get Prediction
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentAssessmentForm;
