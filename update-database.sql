-- ============================================
-- PropheticPD Database Schema Updates
-- ============================================
-- Run this file once in phpMyAdmin after uploading files
-- This ensures all necessary columns exist in your tables

-- ============================================
-- CHALLENGES TABLE UPDATES
-- ============================================

ALTER TABLE `Challenges` 
ADD COLUMN IF NOT EXISTS `Description` TEXT NULL AFTER `Title`;

-- ============================================
-- CHALLENGESCORES TABLE UPDATES  
-- ============================================

ALTER TABLE `ChallengeScores`
ADD COLUMN IF NOT EXISTS `ResponseText` TEXT NULL AFTER `DateSubmitted`,
ADD COLUMN IF NOT EXISTS `FileUrl` VARCHAR(255) NULL AFTER `ResponseText`;

-- ============================================
-- QUIZSCORE TABLE UPDATES
-- ============================================

ALTER TABLE `QuizScore`
ADD COLUMN IF NOT EXISTS `DateTaken` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `ScoreAcheived`;

-- ============================================
-- REFLECTIONSCORE TABLE UPDATES
-- ============================================

ALTER TABLE `ReflectionScore`
ADD COLUMN IF NOT EXISTS `DateSubmitted` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `ScoreAchieved`,
ADD COLUMN IF NOT EXISTS `ResponseText` TEXT NULL AFTER `DateSubmitted`;

-- ============================================
-- VIDEO TABLE UPDATES
-- ============================================

ALTER TABLE `Video`
ADD COLUMN IF NOT EXISTS `video_link` VARCHAR(255) NULL AFTER `title`,
ADD COLUMN IF NOT EXISTS `video_title` VARCHAR(255) NULL AFTER `video_link`,
ADD COLUMN IF NOT EXISTS `description` TEXT NULL AFTER `video_title`;

-- ============================================
-- QUIZ TABLE UPDATES (Add options A, B, C, D)
-- ============================================

ALTER TABLE `Quiz`
ADD COLUMN IF NOT EXISTS `option_a` VARCHAR(200) NULL AFTER `question`,
ADD COLUMN IF NOT EXISTS `option_b` VARCHAR(200) NULL AFTER `option_a`,
ADD COLUMN IF NOT EXISTS `option_c` VARCHAR(200) NULL AFTER `option_b`,
ADD COLUMN IF NOT EXISTS `option_d` VARCHAR(200) NULL AFTER `option_c`,
ADD COLUMN IF NOT EXISTS `is_correct` VARCHAR(1) NULL AFTER `option_d`;

-- ============================================
-- SET ADMIN ROLE
-- ============================================

-- Update existing admin user
UPDATE Users SET Role = 'Admin' WHERE Email = 'ahmed@email.com';

-- Verify admin users exist
SELECT 'Admin Users:' as Info, UserID, Name, Email, Role 
FROM Users 
WHERE Role IN ('Admin', 'Instructor');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all columns were added successfully
SELECT 'Database updated successfully!' as Status;

SELECT 'Challenges table columns:' as Info;
SHOW COLUMNS FROM Challenges;

SELECT 'Video table columns:' as Info;
SHOW COLUMNS FROM Video;

SELECT 'Quiz table columns:' as Info;
SHOW COLUMNS FROM Quiz;

-- ============================================
-- NOTES
-- ============================================
-- After running this script:
-- 1. Check that no errors occurred
-- 2. Verify admin user role is set
-- 3. Test admin panel login
-- 4. Test CRUD operations
-- ============================================
