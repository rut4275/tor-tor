/*
  # הוספת טבלת הודעות משתמש מותאמות אישית

  1. טבלה חדשה
    - `user_bot_messages` - הודעות ערוכות של המשתמש
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `bot_message_id` (int, foreign key)
      - `custom_message` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. אבטחה
    - הפעלת RLS על הטבלה החדשה
    - מדיניות גישה למשתמשים מורשים בלבד
*/

CREATE TABLE IF NOT EXISTS user_bot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  bot_message_id INT REFERENCES bot_messages(id),
  custom_message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- הפעלת RLS
ALTER TABLE user_bot_messages ENABLE ROW LEVEL SECURITY;

-- מדיניות RLS
CREATE POLICY "Users can manage their custom bot messages" ON user_bot_messages 
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- אינדקס לביצועים
CREATE INDEX IF NOT EXISTS idx_user_bot_messages_user_id ON user_bot_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bot_messages_bot_message_id ON user_bot_messages(bot_message_id);