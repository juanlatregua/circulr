-- Add internal_notes column to ai_generations table
-- Used by consultants to store private notes about a generation/project
ALTER TABLE ai_generations
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

COMMENT ON COLUMN ai_generations.internal_notes IS 'Private notes from the consultant, not visible to the client';
