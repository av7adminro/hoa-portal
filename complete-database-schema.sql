-- Complete HOA Portal Database Schema
-- Run this in Supabase SQL Editor

-- 1. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('monthly_fee', 'utilities', 'maintenance', 'other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    due_date DATE NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'other')),
    transaction_id TEXT,
    invoice_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'admins', 'tenants', 'specific')),
    target_users UUID[], -- Array of specific user IDs if target_audience is 'specific'
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    read_by UUID[] DEFAULT '{}', -- Array of user IDs who have read this notification
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WATER INDICES TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS public.water_indices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    apartment_number TEXT NOT NULL,
    reading_date DATE NOT NULL,
    current_index INTEGER NOT NULL,
    previous_index INTEGER,
    consumption INTEGER GENERATED ALWAYS AS (current_index - COALESCE(previous_index, 0)) STORED,
    unit_price DECIMAL(6,4) DEFAULT 2.5,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (consumption * unit_price) STORED,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'billed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MAINTENANCE REQUESTS TABLE
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

-- 5. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('general', 'maintenance', 'event', 'urgent')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'tenants', 'owners')),
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);

CREATE INDEX IF NOT EXISTS idx_notifications_target_audience ON public.notifications(target_audience);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

CREATE INDEX IF NOT EXISTS idx_water_indices_user_id ON public.water_indices(user_id);
CREATE INDEX IF NOT EXISTS idx_water_indices_reading_date ON public.water_indices(reading_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_user_id ON public.maintenance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON public.maintenance_requests(priority);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_publish_date ON public.announcements(publish_date);

-- ROW LEVEL SECURITY POLICIES

-- Payments policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert payments" ON public.payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update payments" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications for them" ON public.notifications
    FOR SELECT USING (
        target_audience = 'all' OR
        (target_audience = 'admins' AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )) OR
        (target_audience = 'tenants' AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'tenant'
        )) OR
        (target_audience = 'specific' AND auth.uid() = ANY(target_users))
    );

CREATE POLICY "Admins can manage notifications" ON public.notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Water indices policies
ALTER TABLE public.water_indices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own water indices" ON public.water_indices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all water indices" ON public.water_indices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own water indices" ON public.water_indices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all water indices" ON public.water_indices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Maintenance requests policies
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own maintenance requests" ON public.maintenance_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all maintenance requests" ON public.maintenance_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create maintenance requests" ON public.maintenance_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update maintenance requests" ON public.maintenance_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Announcements policies
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view published announcements" ON public.announcements
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- FUNCTIONS FOR AUTOMATIC UPDATES

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_water_indices_updated_at BEFORE UPDATE ON public.water_indices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SAMPLE DATA
INSERT INTO public.payments (user_id, amount, description, category, status, due_date) VALUES
    ((SELECT id FROM profiles WHERE email = 'costel@example.com'), 150.00, 'Întreținere Ianuarie 2025', 'monthly_fee', 'pending', '2025-01-31'),
    ((SELECT id FROM profiles WHERE email = 'costel@example.com'), 45.50, 'Consum apă Decembrie 2024', 'utilities', 'paid', '2024-12-31'),
    ((SELECT id FROM profiles WHERE email = 'maria@example.com'), 150.00, 'Întreținere Ianuarie 2025', 'monthly_fee', 'pending', '2025-01-31');

INSERT INTO public.notifications (title, message, type, target_audience, created_by) VALUES
    ('Întreținere săptămânală', 'Întreținerea scării va avea loc în fiecare luni dimineața între 8:00-10:00.', 'info', 'all', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('Întrerupere furnizare apă', 'Furnizarea apei va fi întreruptă mâine între 10:00-14:00 pentru lucrări de mentenanță.', 'warning', 'all', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('Plată restantă', 'Aveți plăți restante. Vă rugăm să efectuați plata cât mai curând posibil.', 'error', 'specific', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1));

-- 6. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    apartment TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    response TEXT,
    responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR CONTACT MESSAGES
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);

-- Contact messages policies
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all contact messages" ON public.contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own contact messages" ON public.contact_messages
    FOR SELECT USING (email = (
        SELECT email FROM profiles WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Admins can update contact messages" ON public.contact_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- GRANT PERMISSIONS
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.water_indices TO authenticated;
GRANT ALL ON public.maintenance_requests TO authenticated;
GRANT ALL ON public.announcements TO authenticated;
GRANT ALL ON public.contact_messages TO authenticated;

GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.water_indices TO service_role;
GRANT ALL ON public.maintenance_requests TO service_role;
GRANT ALL ON public.announcements TO service_role;
GRANT ALL ON public.contact_messages TO service_role;

GRANT INSERT ON public.contact_messages TO anon;