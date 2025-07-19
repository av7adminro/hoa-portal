-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical', 'heating', 'cleaning', 'other')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location TEXT NOT NULL,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_user_id ON public.maintenance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON public.maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON public.maintenance_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own maintenance requests
CREATE POLICY "Users can view own maintenance requests" ON public.maintenance_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all maintenance requests
CREATE POLICY "Admins can view all maintenance requests" ON public.maintenance_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Users can create their own maintenance requests
CREATE POLICY "Users can create own maintenance requests" ON public.maintenance_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Only admins can update maintenance requests
CREATE POLICY "Admins can update maintenance requests" ON public.maintenance_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can delete maintenance requests
CREATE POLICY "Admins can delete maintenance requests" ON public.maintenance_requests
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE
    ON public.maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.maintenance_requests TO authenticated;
GRANT USAGE ON SEQUENCE maintenance_requests_id_seq TO authenticated;

-- Insert some sample data (optional)
-- INSERT INTO public.maintenance_requests (user_id, title, description, category, priority, location)
-- SELECT 
--     id,
--     'Problemă la chiuvetă' || CASE WHEN RANDOM() > 0.5 THEN ' - Bucătărie' ELSE ' - Baie' END,
--     'Chiuveta curge și necesită reparație urgentă. Problema persistă de câteva zile.',
--     CASE WHEN RANDOM() < 0.33 THEN 'plumbing' WHEN RANDOM() < 0.66 THEN 'electrical' ELSE 'heating' END,
--     CASE WHEN RANDOM() < 0.25 THEN 'low' WHEN RANDOM() < 0.5 THEN 'medium' WHEN RANDOM() < 0.75 THEN 'high' ELSE 'urgent' END,
--     'Apartament ' || apartment_number
-- FROM public.profiles
-- WHERE role = 'tenant'
-- LIMIT 3;