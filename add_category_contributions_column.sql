-- Add category_contributions column to predictions table
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS category_contributions JSONB DEFAULT '{}'::jsonb;
