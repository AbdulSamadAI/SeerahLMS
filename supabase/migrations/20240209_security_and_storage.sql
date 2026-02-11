-- 1. Enable RLS on content tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections_lms ENABLE ROW LEVEL SECURITY;

-- 2. Define Admin Access Helper (Optional, but using direct checks for clarity)

-- =================================================================
--                              VIDEOS
-- =================================================================

-- Drop existing policies if any (to be safe during dev iterations)
DROP POLICY IF EXISTS "Student View Active Week Only" ON videos;
DROP POLICY IF EXISTS "Admin Full Access" ON videos;

-- Student: Can only see videos strictly in the active week
CREATE POLICY "Student View Active Week Only" ON videos
FOR SELECT
TO authenticated
USING (
  -- Allow if Admin/Instructor
  ((SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor'))
  OR
  -- Or if week matches active week
  (week_number = (SELECT week_id FROM dashboard_config LIMIT 1))
);

-- Admin: Full Access (Insert, Update, Delete)
CREATE POLICY "Admin Full Access" ON videos
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor')
);


-- =================================================================
--                           QUIZ HEADERS
-- =================================================================
DROP POLICY IF EXISTS "Student View Active Week Only" ON quiz_headers;
DROP POLICY IF EXISTS "Admin Full Access" ON quiz_headers;

CREATE POLICY "Student View Active Week Only" ON quiz_headers
FOR SELECT
TO authenticated
USING (
  ((SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor'))
  OR
  (week_number = (SELECT week_id FROM dashboard_config LIMIT 1))
);

CREATE POLICY "Admin Full Access" ON quiz_headers
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor')
);


-- =================================================================
--                            CHALLENGES
-- =================================================================
DROP POLICY IF EXISTS "Student View Active Week Only" ON challenges;
DROP POLICY IF EXISTS "Admin Full Access" ON challenges;

CREATE POLICY "Student View Active Week Only" ON challenges
FOR SELECT
TO authenticated
USING (
  ((SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor'))
  OR
  (week_number = (SELECT week_id FROM dashboard_config LIMIT 1))
);

CREATE POLICY "Admin Full Access" ON challenges
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor')
);


-- =================================================================
--                          REFLECTIONS
-- =================================================================
-- Reflections are user-generated.
-- Students see their own. Admins see all.
DROP POLICY IF EXISTS "Users See Own Reflections" ON reflections_lms;
DROP POLICY IF EXISTS "Admin Full Access" ON reflections_lms;

CREATE POLICY "Users See Own Reflections" ON reflections_lms
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR
  ((SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor'))
);

CREATE POLICY "Users Insert Own Reflections" ON reflections_lms
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
);

-- Admins can do anything intended? Mostly read, but let's give full access just in case.
CREATE POLICY "Admin Full Access" ON reflections_lms
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor')
);


-- =================================================================
--                        STORAGE BUCKET
-- =================================================================
-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('lms-videos', 'lms-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Note: Storage policies are attached to storage.objects

DROP POLICY IF EXISTS "Public Video Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Video Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Video Delete" ON storage.objects;

-- Public (or Authenticated) Read Access
CREATE POLICY "Public Video Access" ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'lms-videos' );

-- Admin Upload
CREATE POLICY "Admin Video Upload" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lms-videos' AND
  (SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor')
);

-- Admin Update/Delete
CREATE POLICY "Admin Video Delete" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'lms-videos' AND
  (SELECT role FROM users_extended WHERE id = auth.uid()) IN ('Admin', 'Instructor')
);
