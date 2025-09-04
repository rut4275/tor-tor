/*
  # Create business info table

  1. New Tables
    - `business_info`
      - `id` (integer, primary key)
      - `user_id` (uuid, foreign key to users)
      - `business_details` (text, business information for bot responses)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `business_info` table
    - Add policy for users to manage their own business info
*/

CREATE TABLE IF NOT EXISTS business_info (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES users(id),
  business_details text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their business info"
  ON business_info
  FOR ALL
  TO public
  USING (user_id IN (
    SELECT users.id
    FROM users
    WHERE users.auth_id = uid()
  ));

-- Create unique constraint to ensure one record per user
CREATE UNIQUE INDEX IF NOT EXISTS business_info_user_id_unique 
  ON business_info(user_id);