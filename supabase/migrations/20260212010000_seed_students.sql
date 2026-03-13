-- Seed main students table with test data (easy demo use)
INSERT INTO students (student_id, name, class_id, is_active) VALUES
('2122ES060713', 'Aahana Kashyap', 'X', true),
('2122ES060720', 'Arshi Sharma', 'X', true),
('2122ES060735', 'Sheshali Yeligeti', 'X', true),
('2122ES060724', 'Hansika V Sachin', 'X', true),
('2223ES060027', 'Angela Liza Sebastian', 'X', true)
ON CONFLICT (student_id) DO NOTHING;

-- Reset has_voted for testing
UPDATE students SET has_voted = false WHERE student_id IN ('2122ES060713', '2122ES060720', '2122ES060735', '2122ES060724', '2223ES060027');
