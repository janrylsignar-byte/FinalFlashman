from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import joblib
import numpy as np
from datetime import datetime
import os

app = FastAPI(title="Student At-Risk Prediction API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Category weights (fixed)
CATEGORY_WEIGHTS = {
    "academic": 0.50,
    "personal": 0.30,
    "financial": 0.20
}

# Feature mapping to categories
FEATURE_CATEGORIES = {
    # Academic features
    "gpa": "academic",
    "failed_subjects": "academic",
    "gpa_trend": "academic",
    # Personal features
    "study_habits": "personal",
    "time_management": "personal",
    "lms_engagement": "personal",
    "attendance": "personal",
    "motivation": "personal",
    "assignment_completion": "personal",
    "class_participation": "personal",
    # Financial features
    "family_income_level": "financial",
    "scholarship_status": "financial",
    "working_student": "financial",
    "transportation_difficulty": "financial"
}

# Text to numeric encoding
TEXT_TO_NUMERIC = {
    "never": 1,
    "rarely": 2,
    "sometimes": 3,
    "often": 4,
    "always": 5
}

# Feature order for model (must match training)
FEATURE_ORDER = [
    "gpa", "failed_subjects", "gpa_trend",
    "study_habits", "time_management", "lms_engagement", "attendance", 
    "motivation", "assignment_completion", "class_participation",
    "family_income_level", "scholarship_status", "working_student", "transportation_difficulty"
]


class StudentAssessment(BaseModel):
    student_id: str
    full_name: str
    # Academic
    gpa: float
    failed_subjects: int
    gpa_trend: str  # "improving", "stable", "declining"
    # Personal (text inputs)
    study_habits: str
    time_management: str
    lms_engagement: str
    attendance: str
    motivation: str
    assignment_completion: str
    class_participation: str
    # Financial (text inputs)
    family_income_level: str
    scholarship_status: str
    working_student: str
    transportation_difficulty: str


class PredictionResponse(BaseModel):
    student_id: str
    full_name: str
    prediction: str  # "Good Standing" or "At-Risk"
    confidence: float
    category_contributions: Optional[Dict[str, float]] = None
    explanation: Optional[str] = None
    recommendations: Optional[List[str]] = None


def convert_text_to_numeric(value: str, field_type: str = "likert") -> float:
    """Convert text input to numeric value"""
    if field_type == "likert":
        return float(TEXT_TO_NUMERIC.get(value.lower(), 3))
    elif field_type == "gpa_trend":
        trend_map = {"declining": 1, "stable": 2, "improving": 3}
        return float(trend_map.get(value.lower(), 2))
    elif field_type == "income":
        income_map = {"low": 1, "medium": 2, "high": 3}
        return float(income_map.get(value.lower(), 2))
    elif field_type == "binary":
        binary_map = {"no": 0, "yes": 1}
        return float(binary_map.get(value.lower(), 0))
    return 3.0


def prepare_features(assessment: StudentAssessment) -> np.ndarray:
    """Convert assessment to numeric feature array"""
    features = []
    
    # Academic
    features.append(assessment.gpa)
    features.append(float(assessment.failed_subjects))
    features.append(convert_text_to_numeric(assessment.gpa_trend, "gpa_trend"))
    
    # Personal (Likert scale 1-5)
    personal_fields = [
        "study_habits", "time_management", "lms_engagement", "attendance",
        "motivation", "assignment_completion", "class_participation"
    ]
    for field in personal_fields:
        value = getattr(assessment, field)
        features.append(convert_text_to_numeric(value, "likert"))
    
    # Financial
    features.append(convert_text_to_numeric(assessment.family_income_level, "income"))
    features.append(convert_text_to_numeric(assessment.scholarship_status, "binary"))
    features.append(convert_text_to_numeric(assessment.working_student, "binary"))
    features.append(convert_text_to_numeric(assessment.transportation_difficulty, "likert"))
    
    return np.array(features).reshape(1, -1)


def calculate_category_contributions(features: np.ndarray, scaler, model) -> Dict[str, float]:
    """
    Calculate category contribution percentages based on actual student data.
    Category weights are applied internally, but final percentages are based on actual risk indicators.
    If a category has no risk indicators, it contributes 0% to the At-Risk classification.
    """
    # Get feature importance if available
    if hasattr(model, 'feature_importances_'):
        importance = model.feature_importances_
    elif hasattr(model, 'coef_'):
        importance = np.abs(model.coef_[0])
    else:
        # Default equal importance if model doesn't provide it
        importance = np.ones(len(FEATURE_ORDER))
    
    # Normalize importance
    importance = importance / importance.sum()
    
    # Calculate category risk scores based on actual feature values
    category_risk_scores = {"academic": 0.0, "personal": 0.0, "financial": 0.0}
    
    for i, feature_name in enumerate(FEATURE_ORDER):
        category = FEATURE_CATEGORIES[feature_name]
        # Normalize feature value to 0-1 range (assuming 1-5 scale for most)
        normalized_value = (features[0][i] - 1) / 4 if features[0][i] <= 5 else features[0][i] / 5
        # For academic features, lower values indicate higher risk
        if category == "academic" and feature_name in ["gpa"]:
            normalized_value = 1 - normalized_value
        # For failed subjects, higher is worse
        if feature_name == "failed_subjects":
            normalized_value = min(features[0][i] / 5, 1.0)
        
        # Accumulate risk score for each category (higher = more risk)
        category_risk_scores[category] += importance[i] * normalized_value
    
    # Normalize risk scores to 0-1 range for each category
    # Academic has more features, so normalize accordingly
    max_academic_risk = 3.0  # GPA, failed_subjects, gpa_trend
    max_personal_risk = 7.0  # 7 personal features
    max_financial_risk = 4.0  # 4 financial features
    
    normalized_risk_scores = {
        "academic": min(category_risk_scores["academic"] / max_academic_risk, 1.0),
        "personal": min(category_risk_scores["personal"] / max_personal_risk, 1.0),
        "financial": min(category_risk_scores["financial"] / max_financial_risk, 1.0)
    }
    
    # Calculate raw risk contribution for each category based on actual risk scores
    # If a category has no risk (normalized score = 0), it contributes 0% to the At-Risk classification
    raw_academic_contribution = normalized_risk_scores["academic"] * CATEGORY_WEIGHTS["academic"]
    raw_personal_contribution = normalized_risk_scores["personal"] * CATEGORY_WEIGHTS["personal"]
    raw_financial_contribution = normalized_risk_scores["financial"] * CATEGORY_WEIGHTS["financial"]
    
    total_raw_contribution = raw_academic_contribution + raw_personal_contribution + raw_financial_contribution
    
    # Convert to percentages - only categories with actual risk contribute
    if total_raw_contribution > 0:
        contributions = {
            "academic": (raw_academic_contribution / total_raw_contribution) * 100,
            "personal": (raw_personal_contribution / total_raw_contribution) * 100,
            "financial": (raw_financial_contribution / total_raw_contribution) * 100
        }
    else:
        # No risk in any category
        contributions = {"academic": 0.0, "personal": 0.0, "financial": 0.0}
    
    return contributions


def generate_explanation(contributions: Dict[str, float]) -> str:
    """Generate explanation text based on category contributions"""
    sorted_contrib = sorted(contributions.items(), key=lambda x: x[1], reverse=True)
    top_category, top_percent = sorted_contrib[0]
    second_category, second_percent = sorted_contrib[1]
    third_category, third_percent = sorted_contrib[2]
    
    category_names = {
        "academic": "Academic",
        "personal": "Personal",
        "financial": "Financial"
    }
    
    # Check if all contributions are 0 (Good Standing case)
    if top_percent == 0:
        return "The student is classified as Good Standing. The student shows positive indicators across all categories with no significant risk factors contributing to academic concerns."
    
    # Build explanation based on actual contributions
    explanation = f"The student is classified as At-Risk primarily due to {category_names[top_category]} factors ({top_percent:.1f}%)"
    
    if second_percent > 0:
        explanation += f", followed by {category_names[second_category]} factors ({second_percent:.1f}%)"
    
    if third_percent > 0:
        explanation += f", and {category_names[third_category]} factors ({third_percent:.1f}%)"
    else:
        explanation += f". {category_names[third_category]} factors did not contribute to the risk classification"
    
    explanation += "."
    
    return explanation


def generate_recommendations(contributions: Dict[str, float]) -> List[str]:
    """Generate recommendations based on highest contributing category"""
    sorted_contrib = sorted(contributions.items(), key=lambda x: x[1], reverse=True)
    top_category = sorted_contrib[0][0]
    top_percent = sorted_contrib[0][1]
    
    # If top category has 0% contribution (Good Standing), return general recommendations
    if top_percent == 0:
        return [
            "Maintain current academic performance",
            "Consider joining honor societies or academic programs",
            "Explore leadership opportunities in student organizations"
        ]
    
    recommendations_map = {
        "academic": [
            "Enroll in tutoring support for struggling subjects",
            "Schedule academic advising session",
            "Develop a structured study plan with regular milestones",
            "Consider joining peer study groups"
        ],
        "personal": [
            "Improve study habits through structured scheduling",
            "Attend time management training workshops",
            "Join peer study groups for accountability",
            "Schedule counseling session for personal support",
            "Set up regular check-ins with academic advisor"
        ],
        "financial": [
            "Apply for scholarship assistance programs",
            "Explore financial aid options with the financial aid office",
            "Consider on-campus student job opportunities",
            "Consult with financial aid office for budget planning"
        ]
    }
    
    return recommendations_map.get(top_category, [])


@app.post("/predict", response_model=PredictionResponse)
async def predict(assessment: StudentAssessment):
    """Predict student risk status with explanation"""
    try:
        # Load model and scaler
        model_path = "backend/models/best_model.pkl"
        scaler_path = "backend/models/scaler.pkl"
        
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail="Model not found. Please train the model first.")
        
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        
        # Prepare features
        features = prepare_features(assessment)
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction_proba = model.predict_proba(features_scaled)[0]
        prediction_idx = np.argmax(prediction_proba)
        confidence = float(prediction_proba[prediction_idx]) * 100
        
        # Map prediction to label (0 = Good Standing, 1 = At-Risk)
        prediction_label = "Good Standing" if prediction_idx == 0 else "At-Risk"
        
        # Build response
        response = PredictionResponse(
            student_id=assessment.student_id,
            full_name=assessment.full_name,
            prediction=prediction_label,
            confidence=confidence
        )
        
        # Add detailed explanation only for At-Risk students
        if prediction_label == "At-Risk":
            contributions = calculate_category_contributions(features, scaler, model)
            explanation = generate_explanation(contributions)
            recommendations = generate_recommendations(contributions)
            
            response.category_contributions = contributions
            response.explanation = explanation
            response.recommendations = recommendations
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/student/{student_id}")
async def get_student_prediction(student_id: str):
    """Retrieve stored prediction for a student"""
    # This would query Supabase in production
    # For now, return a placeholder
    return {
        "student_id": student_id,
        "message": "Prediction retrieval from database not implemented yet"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
