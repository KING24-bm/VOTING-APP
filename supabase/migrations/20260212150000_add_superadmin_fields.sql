-- Add Super Admin fields to teachers table
-- Run this migration in Supabase SQL Editor

-- Add new columns (safe: IF NOT EXISTS)
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS school_name text;

-- Update existing teachers to approved (if any from seeds)
UPDATE teachers SET is_approved = true WHERE username IN ('admin', 'teacher2'); -- from existing seeds

-- Seed SuperAdmin (only if not exists)
INSERT INTO teachers (username, password, is_super_admin, is_approved, email, school_name, staff_code)
VALUES ('SuperAdmin123', 'superadminpass', true, true, 'superadmin@school.com', 'Super Admin', 'SUPER001')
ON CONFLICT (username) DO NOTHING;

-- Optional: Soft delete for polls (deleted_at)
ALTER TABLE polls 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Update ViewPolls delete to soft delete (but keep hard delete for now)

-- RLS Updates: Superadmin can do everything
-- Existing RLS permissive, but add explicit policies if needed

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teachers_super_admin ON teachers(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_teachers_approved ON teachers(is_approved);
CREATE INDEX IF NOT EXISTS idx_polls_deleted_at ON polls(deleted_at);

-- Verify seed worked
SELECT username, is_super_admin, is_approved FROM teachers WHERE username = 'SuperAdmin123';
