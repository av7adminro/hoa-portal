import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Use direct HTTP request to Supabase REST API to execute SQL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const createTableSQL = `
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

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view own maintenance requests" ON public.maintenance_requests;
      DROP POLICY IF EXISTS "Admins can view all maintenance requests" ON public.maintenance_requests;
      DROP POLICY IF EXISTS "Users can create own maintenance requests" ON public.maintenance_requests;
      DROP POLICY IF EXISTS "Admins can update maintenance requests" ON public.maintenance_requests;
      DROP POLICY IF EXISTS "Admins can delete maintenance requests" ON public.maintenance_requests;

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

      -- Create or replace the trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Drop existing trigger if it exists
      DROP TRIGGER IF EXISTS update_maintenance_requests_updated_at ON public.maintenance_requests;

      -- Create trigger
      CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE
          ON public.maintenance_requests
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      -- Grant permissions
      GRANT ALL ON public.maintenance_requests TO authenticated;
    `;

    return NextResponse.json(
      { 
        error: 'Automatic table creation is not supported. Please create the table manually.',
        instructions: 'Go to Supabase Dashboard > SQL Editor and execute the script below:',
        sql: createTableSQL
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error initializing maintenance table:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize maintenance table',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to initialize the maintenance table',
    sql: `Check the create-maintenance-table.sql file for the SQL commands`
  });
}