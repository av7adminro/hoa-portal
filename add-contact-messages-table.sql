-- Add contact messages table to the database
-- Run this in Supabase SQL Editor

-- Create contact_messages table
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

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);

-- Create trigger for updated_at
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
GRANT INSERT ON public.contact_messages TO anon;