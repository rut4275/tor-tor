/*
  # מערכת קביעת תורים - מסד נתונים

  1. טבלאות חדשות
    - `business_types` - סוגי עסקים
    - `client_genders` - מין לקוחות
    - `users` - משתמשים (קוסמטיקאית/מנהלת)
    - `clients` - לקוחות
    - `preferences` - העדפות
    - `weekdays` - ימי השבוע
    - `working_hours` - שעות עבודה
    - `rules` - כללים
    - `treatments` - טיפולים
    - `answer_types` - סוגי תשובה
    - `client_questions` - שאלות ללקוח חדש
    - `appointment_questions` - שאלות בקביעת תור
    - `bot_messages` - הודעות הבוט
    - `appointment_sources` - דרכים לקבוע תור
    - `appointments` - תורים
    - `calendar_settings` - הגדרות יומן
    - `themes` - ערכות נושא

  2. אבטחה
    - הפעלת RLS על כל הטבלאות
    - מדיניות גישה למשתמשים מורשים בלבד
*/

-- טבלת סוגי עסקים
CREATE TABLE IF NOT EXISTS business_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- טבלת מין לקוחות
CREATE TABLE IF NOT EXISTS client_genders (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- טבלת משתמשים (קוסמטיקאית/מנהלת)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id uuid REFERENCES auth.users(id),
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    email TEXT,
    whatsapp BOOLEAN DEFAULT false,
    whatsapp_number TEXT,
    business_name TEXT,
    business_type_id INT REFERENCES business_types(id),
    client_gender_id INT REFERENCES client_genders(id),
    created_at TIMESTAMP DEFAULT now()
);

-- טבלת לקוחות
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    name TEXT,
    phone TEXT,
    email TEXT,
    extra_data JSONB DEFAULT '{}',
    notes TEXT,
    joined_date DATE DEFAULT CURRENT_DATE
);

-- טבלת העדפות
CREATE TABLE IF NOT EXISTS preferences (
    id SERIAL PRIMARY KEY,
    level TEXT
);

-- טבלת ימי השבוע
CREATE TABLE IF NOT EXISTS weekdays (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
);

-- טבלת שעות עבודה
CREATE TABLE IF NOT EXISTS working_hours (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    weekday_id INT REFERENCES weekdays(id),
    start_time TIME,
    end_time TIME,
    preference_id INT REFERENCES preferences(id)
);

-- טבלת כללים
CREATE TABLE IF NOT EXISTS rules (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    rule_text TEXT,
    description TEXT,
    is_hard BOOLEAN DEFAULT false,
    is_predefined BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    score INT DEFAULT 0
);

-- טבלת טיפולים
CREATE TABLE IF NOT EXISTS treatments (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    name TEXT,
    duration_minutes INT,
    fixed_duration BOOLEAN DEFAULT true,
    fixed_price BOOLEAN DEFAULT true,
    price NUMERIC DEFAULT 0,
    price_per_minutes INT DEFAULT 0,
    min_interval_minutes INT DEFAULT 0
);

-- טבלת סוגי תשובה
CREATE TABLE IF NOT EXISTS answer_types (
    id SERIAL PRIMARY KEY,
    name TEXT
);

-- טבלת שאלות ללקוח חדש
CREATE TABLE IF NOT EXISTS client_questions (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    question TEXT,
    selection_option TEXT,
    answer_type_id INT REFERENCES answer_types(id)
);

-- טבלת שאלות בקביעת תור
CREATE TABLE IF NOT EXISTS appointment_questions (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    question TEXT,
    answer_type_id INT REFERENCES answer_types(id)
);

-- טבלת הודעות הבוט
CREATE TABLE IF NOT EXISTS bot_messages (
    id SERIAL PRIMARY KEY,
    code INT,
    message TEXT,
    description TEXT
);

-- טבלת דרכים לקבוע תור
CREATE TABLE IF NOT EXISTS appointment_sources (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    source_name TEXT
);

-- טבלת תורים
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    client_id INT REFERENCES clients(id),
    treatment_id INT REFERENCES treatments(id),
    date DATE,
    start_time TIME,
    end_time TIME,
    score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    source_id INT REFERENCES appointment_sources(id),
    is_paid BOOLEAN DEFAULT false,
    expected_cost NUMERIC DEFAULT 0,
    actual_cost NUMERIC DEFAULT 0,
    duration_minutes INT,
    client_answers JSONB DEFAULT '{}',
    notes TEXT
);

-- טבלת הגדרות יומן
CREATE TABLE IF NOT EXISTS calendar_settings (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    daily_view BOOLEAN DEFAULT false,
    week_from_sunday BOOLEAN DEFAULT false,
    theme_id INT,
    view_type TEXT DEFAULT 'week'
);

-- טבלת ערכות נושא
CREATE TABLE IF NOT EXISTS themes (
    id SERIAL PRIMARY KEY,
    name TEXT,
    primary_color TEXT DEFAULT '#1976d2',
    secondary_color TEXT DEFAULT '#4caf50'
);

-- הוספת נתונים בסיסיים
INSERT INTO business_types (name) VALUES 
    ('קוסמטיקה'),
    ('עיצוב גבות'),
    ('מניקור'),
    ('פדיקור'),
    ('עיסוי'),
    ('טיפוח פנים'),
    ('הסרת שיער'),
    ('אחר')
ON CONFLICT DO NOTHING;

INSERT INTO client_genders (name) VALUES 
    ('נשים'),
    ('גברים'),
    ('משולב')
ON CONFLICT DO NOTHING;

-- הפעלת RLS
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- מדיניות RLS
CREATE POLICY "Anyone can read business types" ON business_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read client genders" ON client_genders FOR SELECT USING (true);

CREATE POLICY "Users can manage their own data" ON users 
    FOR ALL USING (auth.uid() = auth_id);

CREATE POLICY "Users can manage their clients" ON clients 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their preferences" ON preferences 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their weekdays" ON weekdays 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their working hours" ON working_hours 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their rules" ON rules 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their treatments" ON treatments 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their answer types" ON answer_types 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their client questions" ON client_questions 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their appointment questions" ON appointment_questions 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their bot messages" ON bot_messages 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their appointment sources" ON appointment_sources 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their appointments" ON appointments 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their calendar settings" ON calendar_settings 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage their themes" ON themes 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));