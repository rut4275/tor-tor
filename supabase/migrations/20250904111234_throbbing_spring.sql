/*
  # הוספת שדות צבע לטבלת ערכות נושא

  1. שינויים בטבלה
    - הוספת עמודות צבע חדשות לטבלת `themes`:
      - `dark_color` - צבע כהה
      - `light_color` - צבע בהיר  
      - `medium_color` - צבע ביניים
      - `background_color` - צבע רקע

  2. עדכון נתונים
    - מילוי הצבעים החדשים לכל ערכות הנושא הקיימות
    - צבעים מותאמים לכל ערכת נושא
*/

-- הוספת עמודות צבע חדשות
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'themes' AND column_name = 'dark_color'
  ) THEN
    ALTER TABLE themes ADD COLUMN dark_color text DEFAULT '#2c3e50';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'themes' AND column_name = 'light_color'
  ) THEN
    ALTER TABLE themes ADD COLUMN light_color text DEFAULT '#ecf0f1';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'themes' AND column_name = 'medium_color'
  ) THEN
    ALTER TABLE themes ADD COLUMN medium_color text DEFAULT '#95a5a6';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'themes' AND column_name = 'background_color'
  ) THEN
    ALTER TABLE themes ADD COLUMN background_color text DEFAULT '#ffffff';
  END IF;
END $$;

-- עדכון הצבעים לכל ערכת נושא
UPDATE themes SET 
  dark_color = '#8e1538',
  light_color = '#fce4ec', 
  medium_color = '#ca5184',
  background_color = '#ffffff'
WHERE name = 'ורוד קלאסי';

UPDATE themes SET 
  dark_color = '#1565c0',
  light_color = '#e3f2fd',
  medium_color = '#42a5f5', 
  background_color = '#f8f9fa'
WHERE name = 'כחול מקצועי';

UPDATE themes SET 
  dark_color = '#2e7d32',
  light_color = '#e8f5e8',
  medium_color = '#66bb6a',
  background_color = '#f1f8e9'
WHERE name = 'ירוק טבעי';

UPDATE themes SET 
  dark_color = '#e65100',
  light_color = '#fff3e0',
  medium_color = '#ff9800',
  background_color = '#fafafa'
WHERE name = 'כתום חם';

UPDATE themes SET 
  dark_color = '#4a148c',
  light_color = '#f3e5f5',
  medium_color = '#ab47bc',
  background_color = '#fafafa'
WHERE name = 'סגול מלכותי';

UPDATE themes SET 
  dark_color = '#37474f',
  light_color = '#eceff1',
  medium_color = '#78909c',
  background_color = '#fafafa'
WHERE name = 'אפור מינימלי';