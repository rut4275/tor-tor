/*
  # Populate themes table with default themes

  1. New Data
    - Default themes with color schemes
    - Primary and secondary colors for each theme

  2. Security
    - Enable RLS on themes table
    - Add policy for public read access
*/

-- Insert default themes
INSERT INTO themes (name, primary_color, secondary_color) VALUES
('כחול קלאסי', '#1976d2', '#4caf50'),
('ורוד נשי', '#e91e63', '#ff4081'),
('ירוק טבעי', '#4caf50', '#8bc34a'),
('סגול אלגנטי', '#9c27b0', '#e1bee7'),
('כתום חם', '#ff9800', '#ffb74d'),
('אפור מינימלי', '#607d8b', '#90a4ae');

-- Enable RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access
CREATE POLICY "Anyone can read themes"
  ON themes
  FOR SELECT
  TO public
  USING (true);