-- Fix documents table structure
-- Run this in Supabase SQL Editor

-- First, check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documents' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop the table if it exists (to recreate with correct structure)
DROP TABLE IF EXISTS public.documents;

-- Create the documents table with correct structure
CREATE TABLE public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Documents are viewable by authenticated users" 
ON public.documents FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Documents can be inserted by authenticated users" 
ON public.documents FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Documents can be updated by their creator" 
ON public.documents FOR UPDATE 
USING (auth.uid() = uploaded_by);

CREATE POLICY "Documents can be deleted by their creator or admin" 
ON public.documents FOR DELETE 
USING (
    auth.uid() = uploaded_by OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Create index for better performance
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON public.documents(created_at);
CREATE INDEX idx_documents_category ON public.documents(category);

-- Grant permissions
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;