-- Add monochrome_icons setting to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monochrome_icons boolean DEFAULT false;