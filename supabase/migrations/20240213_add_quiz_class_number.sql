-- Add class_number column to manual_quiz_grades table
ALTER TABLE manual_quiz_grades
ADD COLUMN IF NOT EXISTS class_number INTEGER DEFAULT 1;

-- Set default for existing records
UPDATE manual_quiz_grades 
SET class_number = 1 
WHERE class_number IS NULL;

-- Make column required
ALTER TABLE manual_quiz_grades
ALTER COLUMN class_number SET NOT NULL;

-- Drop the old 2-column unique constraint (if it exists)
ALTER TABLE manual_quiz_grades
DROP CONSTRAINT IF EXISTS manual_quiz_grades_user_id_quiz_number_key;

-- Create new 3-column unique constraint
ALTER TABLE manual_quiz_grades
ADD CONSTRAINT manual_quiz_grades_user_id_quiz_number_class_number_key 
UNIQUE (user_id, quiz_number, class_number);

COMMENT ON COLUMN manual_quiz_grades.class_number IS 'Class number to filter quizzes by active class (matching videos and challenges behavior)';
