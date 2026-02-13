-- Add total_points column to manual_quiz_grades table
ALTER TABLE manual_quiz_grades
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 10;

-- Update existing records to have a default total_points
-- (Assuming old quizzes were out of 10)
UPDATE manual_quiz_grades 
SET total_points = 10 
WHERE total_points IS NULL;

-- Make column required
ALTER TABLE manual_quiz_grades
ALTER COLUMN total_points SET NOT NULL;

COMMENT ON COLUMN manual_quiz_grades.total_points IS 'Total possible points for the quiz (e.g., 20) to show points obtained out of total.';
