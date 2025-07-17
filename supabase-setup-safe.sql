-- HOA Portal Database Setup - Safe Version
-- This script avoids system table modifications and focuses on application tables

-- =============================================
-- CORE TABLES (Missing from current structure)
-- =============================================

-- Create profiles table (MISSING - ESSENTIAL!)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  apartment_number TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tenant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (id)
);

-- Create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can insert profiles (for user management)
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) OR auth.uid() = id
  );

-- =============================================
-- EXTENDED TABLES (For complete functionality)
-- =============================================

-- Create associations table
CREATE TABLE IF NOT EXISTS public.associations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  tax_number TEXT NOT NULL UNIQUE,
  phone TEXT,
  email TEXT,
  president_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create buildings table
CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  floors INTEGER NOT NULL,
  apartments_count INTEGER NOT NULL,
  construction_year INTEGER,
  total_area DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create apartments table
CREATE TABLE IF NOT EXISTS public.apartments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  apartment_number TEXT NOT NULL,
  floor INTEGER NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  rooms INTEGER NOT NULL,
  ownership_type TEXT CHECK (ownership_type IN ('owner', 'tenant')),
  monthly_fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create residents table (relationship between users and apartments)
CREATE TABLE IF NOT EXISTS public.residents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE,
  resident_type TEXT CHECK (resident_type IN ('owner', 'tenant', 'family_member')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('plumbing', 'electrical', 'heating', 'other')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES auth.users(id),
  cost_estimate DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('maintenance', 'utilities', 'services', 'repairs', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  invoice_number TEXT,
  supplier TEXT,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  agenda TEXT,
  minutes TEXT,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  quorum_required INTEGER DEFAULT 50,
  quorum_achieved INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  vote_type TEXT CHECK (vote_type IN ('simple_majority', 'qualified_majority', 'unanimous')),
  options TEXT[],
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  total_votes INTEGER DEFAULT 0,
  results JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =============================================
-- ENSURE EXISTING TABLES HAVE PROPER RLS
-- =============================================

-- Enable RLS on existing tables (safe to run multiple times)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on new tables
ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for existing tables (drop and recreate for consistency)
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view own water indices" ON public.water_indices;
DROP POLICY IF EXISTS "Users can insert own water indices" ON public.water_indices;
DROP POLICY IF EXISTS "Admins can view all water indices" ON public.water_indices;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view targeted notifications" ON public.notifications;

-- Recreate policies for existing tables
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own water indices" ON public.water_indices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water indices" ON public.water_indices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all water indices" ON public.water_indices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view targeted notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = ANY(target_users));

-- Basic policies for new tables (admins can manage, users can view relevant data)
CREATE POLICY "Admins can manage associations" ON public.associations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view associations" ON public.associations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage buildings" ON public.buildings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view buildings" ON public.buildings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage apartments" ON public.apartments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view apartments" ON public.apartments
  FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS (WITHOUT SYSTEM TABLE TRIGGERS)
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for tables with updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_associations_updated_at ON public.associations;
CREATE TRIGGER update_associations_updated_at
    BEFORE UPDATE ON public.associations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_buildings_updated_at ON public.buildings;
CREATE TRIGGER update_buildings_updated_at
    BEFORE UPDATE ON public.buildings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_apartments_updated_at ON public.apartments;
CREATE TRIGGER update_apartments_updated_at
    BEFORE UPDATE ON public.apartments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_residents_updated_at ON public.residents;
CREATE TRIGGER update_residents_updated_at
    BEFORE UPDATE ON public.residents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_requests_updated_at ON public.maintenance_requests;
CREATE TRIGGER update_maintenance_requests_updated_at
    BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetings_updated_at ON public.meetings;
CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_votes_updated_at ON public.votes;
CREATE TRIGGER update_votes_updated_at
    BEFORE UPDATE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert default association (if not exists)
INSERT INTO public.associations (name, address, registration_number, tax_number, president_name)
VALUES (
  'Asociația de Proprietari Demo',
  'Str. Exemplu, Nr. 1, București',
  'AP123456',
  'RO12345678',
  'Administrator Demo'
) ON CONFLICT (registration_number) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as message;