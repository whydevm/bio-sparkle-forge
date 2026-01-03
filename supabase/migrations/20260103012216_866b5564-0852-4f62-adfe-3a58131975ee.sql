-- Drop the existing check constraint
ALTER TABLE public.badges DROP CONSTRAINT IF EXISTS badges_badge_type_check;

-- Add owner and manager badges
INSERT INTO public.badges (name, description, icon, badge_type) VALUES 
  ('Owner', 'Be an owner of the platform.', '👑', 'owner'),
  ('Manager', 'Be a manager of the platform.', '🔧', 'manager');