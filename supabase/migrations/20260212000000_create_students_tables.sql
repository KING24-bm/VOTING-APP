-- Migration: Create students tables and seed test data
-- Run: supabase migration up

-- Create test_students table
CREATE TABLE IF NOT EXISTS test_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class_id VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class_id VARCHAR(10) NOT NULL,
  has_voted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_test_students_student_id ON test_students(student_id);

-- Enable RLS
ALTER TABLE test_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for now)
CREATE POLICY "Anyone can read test_students" ON test_students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert test_students" ON test_students FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read students" ON students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students has_voted" ON students FOR UPDATE USING (true);

-- Add voter_token to votes if not exists (migrate from voter_id)
ALTER TABLE votes ADD COLUMN IF NOT EXISTS voter_token TEXT;
-- Note: Run manually if needed: UPDATE votes SET voter_token = voter_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_voter_token_role ON votes(voter_token, role_id);

-- Seed test_students (subset of DUMMY_STUDENTS)
INSERT INTO test_students (student_id, name, class_id) VALUES
('2122ES060713', 'Aahana Kashyap', 'X'),
('2122ES060720', 'Arshi Sharma', 'X'),
('2122ES060735', 'Sheshali Yeligeti', 'X'),
('2122ES060724', 'Hansika V Sachin', 'X'),
('2223ES060027', 'Angela Liza Sebastian', 'X'),
('2324ES060110', 'Aditya A', 'X'),
('2223ES060160', 'Advik Kiran', 'X'),
('2324ES060060', 'Gautham Sahu', 'X'),
('2425ES110153', 'ATHARRV P G', 'X'),
('2122ES060732', 'Renesh P J', 'X')
ON CONFLICT (student_id) DO NOTHING;

