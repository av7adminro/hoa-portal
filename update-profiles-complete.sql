-- Add all comprehensive profile fields to profiles table
ALTER TABLE public.profiles 
-- Contact information
ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS alternative_email VARCHAR(255),

-- Apartment information  
ADD COLUMN IF NOT EXISTS apartment_area DECIMAL(6,2), -- square meters
ADD COLUMN IF NOT EXISTS room_count INTEGER,
ADD COLUMN IF NOT EXISTS floor_number INTEGER,
ADD COLUMN IF NOT EXISTS parking_spots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parking_location TEXT,

-- Family information
ADD COLUMN IF NOT EXISTS adults_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS children_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pets_info TEXT, -- JSON format: [{"type": "dog", "name": "Rex", "breed": "Labrador"}]
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),

-- Notification preferences
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_types TEXT DEFAULT 'all', -- 'all', 'urgent', 'bills', 'announcements'

-- Property information
ADD COLUMN IF NOT EXISTS property_type VARCHAR(20) DEFAULT 'owner', -- 'owner', 'tenant'
ADD COLUMN IF NOT EXISTS move_in_date DATE,
ADD COLUMN IF NOT EXISTS special_notes TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_property_type ON public.profiles(property_type);
CREATE INDEX IF NOT EXISTS idx_profiles_floor_number ON public.profiles(floor_number);
CREATE INDEX IF NOT EXISTS idx_profiles_move_in_date ON public.profiles(move_in_date);

-- Update the trigger function to handle email field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    apartment_number, 
    role, 
    email,
    adults_count,
    property_type,
    move_in_date,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'apartment_number', 'TBD'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant'),
    NEW.email,
    1,
    'owner',
    CURRENT_DATE,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;