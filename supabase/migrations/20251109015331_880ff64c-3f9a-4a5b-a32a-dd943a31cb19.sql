-- Add columns for entry splash screen and text customization
ALTER TABLE profiles
ADD COLUMN entry_text TEXT DEFAULT 'Click to Enter',
ADD COLUMN display_name_font TEXT DEFAULT 'font-sans',
ADD COLUMN display_name_color TEXT DEFAULT 'text-foreground',
ADD COLUMN bio_font TEXT DEFAULT 'font-sans',
ADD COLUMN bio_color TEXT DEFAULT 'text-muted-foreground';