-- Migration to add Learning Resources and Facilities columns to students table
-- Run this in Supabase SQL Editor to update the database schema

-- Add Learning Resources and Facilities columns (Likert 1-5)
ALTER TABLE students ADD COLUMN IF NOT EXISTS classrooms_comfortable INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS facilities_help_focus INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS environment_motivates_attendance INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS computer_labs_support_studies INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS facilities_affect_participation INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS furniture_adequate INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS classrooms_need_improvements INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS learning_equipment_helps_performance INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS internet_supports_studies INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS maintained_environment_encourages_attendance INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS temperature_affects_concentration INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS physical_condition_influences_motivation INTEGER DEFAULT 3;

-- Add concerns column for open-ended feedback
ALTER TABLE students ADD COLUMN IF NOT EXISTS concerns TEXT;

-- Add try_improve_grades column if it doesn't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS try_improve_grades INTEGER DEFAULT 3;
