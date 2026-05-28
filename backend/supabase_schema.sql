-- Student At-Risk Prediction System - Supabase Schema
-- This schema supports per-student prediction with explainability

-- Drop existing tables if they exist
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS category_scores CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Students table
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    course VARCHAR(255),
    year_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments table (stores raw student input)
CREATE TABLE assessments (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Academic inputs
    gpa NUMERIC NOT NULL,
    failed_subjects INTEGER NOT NULL,
    gpa_trend VARCHAR(50) NOT NULL,  -- 'improving', 'stable', 'declining'
    
    -- Personal inputs (text: Never, Rarely, Sometimes, Often, Always)
    study_habits VARCHAR(50) NOT NULL,
    time_management VARCHAR(50) NOT NULL,
    lms_engagement VARCHAR(50) NOT NULL,
    attendance VARCHAR(50) NOT NULL,
    motivation VARCHAR(50) NOT NULL,
    assignment_completion VARCHAR(50) NOT NULL,
    class_participation VARCHAR(50) NOT NULL,
    
    -- Financial inputs
    family_income_level VARCHAR(50) NOT NULL,  -- 'low', 'medium', 'high'
    scholarship_status VARCHAR(50) NOT NULL,   -- 'yes', 'no'
    working_student VARCHAR(50) NOT NULL,      -- 'yes', 'no'
    transportation_difficulty VARCHAR(50) NOT NULL,  -- 'never', 'rarely', 'sometimes', 'often', 'always'
    
    -- Raw JSON for flexibility
    raw_input JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Predictions table (stores ML prediction results)
CREATE TABLE predictions (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prediction output
    prediction_label VARCHAR(50) NOT NULL,  -- 'Good Standing', 'At-Risk'
    confidence_score NUMERIC NOT NULL,  -- 0-100
    
    -- Model metadata
    model_name VARCHAR(100),
    model_version VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Category scores table (stores category contribution percentages)
CREATE TABLE category_scores (
    id BIGSERIAL PRIMARY KEY,
    prediction_id BIGINT NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    
    -- Category contribution percentages (must sum to 100)
    academic_percentage NUMERIC NOT NULL,
    personal_percentage NUMERIC NOT NULL,
    financial_percentage NUMERIC NOT NULL,
    
    -- Category weights used (fixed: 50%, 30%, 20%)
    academic_weight NUMERIC DEFAULT 0.50,
    personal_weight NUMERIC DEFAULT 0.30,
    financial_weight NUMERIC DEFAULT 0.20,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    
    -- Ensure percentages sum to 100
    CONSTRAINT check_percentage_sum CHECK (
        ABS(academic_percentage + personal_percentage + financial_percentage - 100) < 0.01
    )
);

-- Recommendations table (stores generated recommendations)
CREATE TABLE recommendations (
    id BIGSERIAL PRIMARY KEY,
    prediction_id BIGINT NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    
    -- Recommendation details
    category VARCHAR(50) NOT NULL,  -- 'academic', 'personal', 'financial'
    recommendation_text TEXT NOT NULL,
    priority INTEGER DEFAULT 1,  -- 1=high, 2=medium, 3=low
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_assessments_student_id ON assessments(student_id);
CREATE INDEX idx_assessments_date ON assessments(assessment_date);
CREATE INDEX idx_predictions_student_id ON predictions(student_id);
CREATE INDEX idx_predictions_date ON predictions(prediction_date);
CREATE INDEX idx_predictions_label ON predictions(prediction_label);
CREATE INDEX idx_category_scores_prediction_id ON category_scores(prediction_id);
CREATE INDEX idx_recommendations_prediction_id ON recommendations(prediction_id);
CREATE INDEX idx_recommendations_category ON recommendations(category);

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust for production security needs)
CREATE POLICY "Enable all access for students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for assessments" ON assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for predictions" ON predictions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for category_scores" ON category_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for recommendations" ON recommendations FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for student prediction summary
CREATE OR REPLACE VIEW student_prediction_summary AS
SELECT 
    s.student_id,
    s.full_name,
    s.email,
    s.course,
    s.year_level,
    p.prediction_label,
    p.confidence_score,
    p.prediction_date,
    cs.academic_percentage,
    cs.personal_percentage,
    cs.financial_percentage,
    CASE 
        WHEN p.prediction_label = 'At-Risk' THEN 
            (SELECT STRING_AGG(recommendation_text, '; ' ORDER BY priority)
             FROM recommendations r 
             WHERE r.prediction_id = p.id)
        ELSE NULL
    END as recommendations
FROM students s
LEFT JOIN assessments a ON s.student_id = a.student_id
LEFT JOIN predictions p ON a.id = p.assessment_id
LEFT JOIN category_scores cs ON p.id = cs.prediction_id
ORDER BY p.prediction_date DESC;
