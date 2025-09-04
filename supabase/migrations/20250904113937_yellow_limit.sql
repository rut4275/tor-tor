/*
  # פיצול טבלת כללים לשתי טבלאות

  1. New Tables
    - `system_rules` - כללים מובנים במערכת
      - `id` (serial, primary key)
      - `rule_text` (text) - טקסט הכלל
      - `description` (text) - תיאור הכלל
    
    - `user_rules` - כללים של משתמשים
      - `id` (serial, primary key)
      - `rule_id` (integer, optional) - קישור לכלל מובנה
      - `user_id` (uuid) - קישור למשתמש
      - `rule_text` (text) - טקסט הכלל
      - `description` (text) - תיאור הכלל
      - `is_hard` (boolean) - כלל קשיח
      - `is_approved` (boolean) - כלל מאושר
      - `start_date` (date) - תאריך התחלה
      - `end_date` (date) - תאריך סיום
      - `is_active` (boolean) - כלל פעיל
      - `score` (integer) - ניקוד הכלל

  2. Data Migration
    - העברת נתונים קיימים מטבלת rules לטבלת user_rules
    - מחיקת טבלת rules הישנה

  3. Security
    - Enable RLS on both tables
    - Add policies for user access to user_rules
    - Add read-only policy for system_rules
*/

-- יצירת טבלת כללים מובנים במערכת
CREATE TABLE IF NOT EXISTS system_rules (
  id SERIAL PRIMARY KEY,
  rule_text TEXT NOT NULL,
  description TEXT
);

-- יצירת טבלת כללים של משתמשים
CREATE TABLE IF NOT EXISTS user_rules (
  id SERIAL PRIMARY KEY,
  rule_id INTEGER REFERENCES system_rules(id),
  user_id uuid REFERENCES users(id) NOT NULL,
  rule_text TEXT NOT NULL,
  description TEXT,
  is_hard BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- העברת נתונים קיימים מטבלת rules לטבלת user_rules
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rules') THEN
    INSERT INTO user_rules (
      user_id, 
      rule_text, 
      description, 
      is_hard, 
      is_approved, 
      start_date, 
      end_date, 
      is_active, 
      score
    )
    SELECT 
      user_id,
      rule_text,
      description,
      is_hard,
      is_approved,
      start_date,
      end_date,
      is_active,
      score
    FROM rules
    WHERE user_id IS NOT NULL;
  END IF;
END $$;

-- מחיקת טבלת rules הישנה
DROP TABLE IF EXISTS rules;

-- הפעלת RLS
ALTER TABLE system_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rules ENABLE ROW LEVEL SECURITY;

-- מדיניות אבטחה לטבלת כללים מובנים - קריאה לכולם
CREATE POLICY "Anyone can read system rules"
  ON system_rules
  FOR SELECT
  TO public
  USING (true);

-- מדיניות אבטחה לטבלת כללי משתמשים - משתמשים יכולים לנהל את הכללים שלהם
CREATE POLICY "Users can manage their rules"
  ON user_rules
  FOR ALL
  TO authenticated
  USING (user_id IN (
    SELECT users.id
    FROM users
    WHERE users.auth_id = auth.uid()
  ))
  WITH CHECK (user_id IN (
    SELECT users.id
    FROM users
    WHERE users.auth_id = auth.uid()
  ));

-- הוספת כמה כללים מובנים לדוגמה
INSERT INTO system_rules (rule_text, description) VALUES
  ('לא לקבוע תורים בשעות הארוחות', 'מניעת קביעת תורים בזמני ארוחה'),
  ('מרווח של 15 דקות בין תורים', 'זמן מנוחה וניקיון בין לקוחות'),
  ('לא לקבוע תורים בסופי שבוע', 'שמירה על זמן אישי'),
  ('מקסימום 8 תורים ביום', 'מניעת עומס יתר'),
  ('אישור תור עד 24 שעות מראש', 'זמן הכנה מתאים');