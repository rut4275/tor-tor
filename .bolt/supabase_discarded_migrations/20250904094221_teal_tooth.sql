/*
  # Populate answer types table

  1. Data Population
    - Add default answer types for question responses
    - Types include: text, number, yes/no, multiple choice, date, time
  
  2. Security
    - Enable RLS on answer_types table
    - Add policy for public read access
*/

-- Insert default answer types
INSERT INTO answer_types (name) VALUES 
  ('טקסט חופשי'),
  ('מספר'),
  ('כן/לא'),
  ('בחירה מרובה'),
  ('תאריך'),
  ('שעה')
ON CONFLICT DO NOTHING;

-- Enable RLS and add policy
ALTER TABLE answer_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can read answer types"
  ON answer_types
  FOR SELECT
  TO public
  USING (true);