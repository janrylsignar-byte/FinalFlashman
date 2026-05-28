# Student At-Risk Prediction System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                                    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        StudentPage.jsx                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    StudentAssessmentForm.jsx                    │  │  │
│  │  │  - Academic Inputs (GPA, Failed Subjects, GPA Trend)            │  │  │
│  │  │  - Personal Inputs (7 Likert-scale questions)                    │  │  │
│  │  │  - Financial Inputs (Income, Scholarship, Work, Transport)       │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                          │  │
│  │                              ▼                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     PredictionResult.jsx                         │  │  │
│  │  │  - Good Standing: Simple message only                            │  │  │
│  │  │  - At-Risk: Category breakdown, explanation, recommendations     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        predictionApi.js                               │  │
│  │  - POST /predict (submit assessment)                                │  │
│  │  - GET /student/{id} (retrieve stored prediction)                    │  │
│  │  - GET /health (health check)                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/REST API
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (FastAPI)                                   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                           main.py                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  │                      POST /predict                               │  │  │
│  │  │  1. Receive assessment data (text inputs)                       │  │  │
│  │  │  2. Convert text to numeric (Never=1, Rarely=2, etc.)           │  │  │
│  │  │  3. Prepare feature array (14 features)                          │  │  │
│  │  │  4. Scale features using StandardScaler                         │  │  │
│  │  │  5. Load trained model (best_model.pkl)                          │  │  │
│  │  │  6. Make prediction (Good Standing / At-Risk)                    │  │  │
│  │  │  7. Calculate confidence score                                   │  │  │
│  │  │  8. If At-Risk:                                                   │  │  │
│  │  │     - Calculate category contributions (Academic 50%, etc.)     │  │  │
│  │  │     - Generate explanation text                                   │  │  │
│  │  │     - Generate recommendations                                   │  │  │
│  │  │  9. Return prediction result                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      GET /student/{id}                            │  │  │
│  │  │  - Retrieve stored prediction from Supabase                      │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      GET /health                                  │  │  │
│  │  │  - Health check endpoint                                        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          train.py                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              ML Training Pipeline                                │  │  │
│  │  │  1. Generate/load training data                                │  │  │
│  │  │  2. Prepare features (14 features)                              │  │  │
│  │  │  3. Train/test split (70/30)                                     │  │  │
│  │  │  4. Scale features (StandardScaler)                             │  │  │
│  │  │  5. Train 5 algorithms:                                         │  │  │
│  │  │     - Decision Tree                                              │  │  │
│  │  │     - Random Forest                                              │  │  │
│  │  │     - SVM                                                        │  │  │
│  │  │     - KNN                                                        │  │  │
│  │  │     - Naive Bayes                                                │  │  │
│  │  │  6. Evaluate each model:                                         │  │  │
│  │  │     - Accuracy, Precision, Recall, F1 Score, ROC AUC             │  │  │
│  │  │     - 5-fold cross-validation                                   │  │  │
│  │  │  7. Select best model (highest F1 score)                         │  │  │
│  │  │  8. Save best model (best_model.pkl)                             │  │  │
│  │  │  9. Save scaler (scaler.pkl)                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ PostgreSQL Connection
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (Supabase/PostgreSQL)                        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          students                                     │  │
│  │  - id, student_id, full_name, email, course, year_level              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         assessments                                   │  │
│  │  - student_id, gpa, failed_subjects, gpa_trend                       │  │
│  │  - study_habits, time_management, lms_engagement, attendance          │  │
│  │  - motivation, assignment_completion, class_participation             │  │
│  │  - family_income_level, scholarship_status, working_student          │  │
│  │  - transportation_difficulty, raw_input (JSONB)                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         predictions                                   │  │
│  │  - assessment_id, student_id, prediction_label, confidence_score     │  │
│  │  - model_name, model_version                                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      category_scores                                  │  │
│  │  - prediction_id, student_id                                         │  │
│  │  - academic_percentage, personal_percentage, financial_percentage    │  │
│  │  - academic_weight (0.50), personal_weight (0.30), financial_weight   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      recommendations                                 │  │
│  │  - prediction_id, student_id, category, recommendation_text         │  │
│  │  - priority (1=high, 2=medium, 3=low)                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              student_prediction_summary (VIEW)                        │  │
│  │  - Joins all tables for complete student prediction summary          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
DATA FLOW
================================================================================

1. TRAINING PHASE (One-time or periodic):
   - Generate/load training data → train.py → Compare 5 models → Select best → 
     Save best_model.pkl & scaler.pkl

2. PREDICTION PHASE (Per student):
   Student fills form (React) → Text inputs → POST /predict → 
   Convert to numeric → Scale → Predict → Calculate contributions → 
   Generate explanation → Return result → Display (React)

3. STORAGE (Optional):
   Prediction result → Store in Supabase (assessments → predictions → 
   category_scores → recommendations)

================================================================================
KEY DESIGN DECISIONS
================================================================================

1. FIXED CATEGORY WEIGHTS:
   - Academic: 50%
   - Personal: 30%
   - Financial: 20%
   - Always used for explanation consistency

2. TEXT TO NUMERIC ENCODING:
   - Never = 1, Rarely = 2, Sometimes = 3, Often = 4, Always = 5
   - Ensures consistent encoding between training and prediction

3. CONDITIONAL EXPLANATION:
   - Good Standing: Simple message only
   - At-Risk: Detailed category breakdown + explanation + recommendations

4. MODEL SELECTION:
   - Automatic selection based on F1 score
   - Only best model deployed (no comparison UI)

5. LIGHTWEIGHT DESIGN:
   - No system-wide dashboards
   - Focus on per-student prediction
   - Thesis-friendly architecture

================================================================================
FEATURE MAPPING
================================================================================

ACADEMIC (50%):
- gpa (1.0-5.0)
- failed_subjects (0-5+)
- gpa_trend (declining=1, stable=2, improving=3)

PERSONAL (30%):
- study_habits (1-5)
- time_management (1-5)
- lms_engagement (1-5)
- attendance (1-5)
- motivation (1-5)
- assignment_completion (1-5)
- class_participation (1-5)

FINANCIAL (20%):
- family_income_level (low=1, medium=2, high=3)
- scholarship_status (no=0, yes=1)
- working_student (no=0, yes=1)
- transportation_difficulty (1-5)

Total: 14 features
