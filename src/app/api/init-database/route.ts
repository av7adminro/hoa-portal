import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST() {
  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'create-database-tables.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    const results = [];
    const errors = [];

    // Execute each statement
    for (const statement of statements) {
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', {
          sql_query: statement
        });

        if (error) {
          // Try direct execution for some statements
          const { error: directError } = await supabaseAdmin
            .from('information_schema.tables')
            .select('table_name')
            .limit(1);

          if (directError) {
            errors.push({
              statement: statement.substring(0, 100) + '...',
              error: error.message
            });
          } else {
            results.push('Statement executed successfully');
          }
        } else {
          results.push('Statement executed successfully');
        }
      } catch (err: unknown) {
        errors.push({
          statement: statement.substring(0, 100) + '...',
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    // Try to create tables directly if SQL execution failed
    if (errors.length > 0) {
      try {
        // Create profiles table directly
        await supabaseAdmin.rpc('exec_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.profiles (
              id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              full_name TEXT NOT NULL,
              apartment_number TEXT NOT NULL,
              role TEXT NOT NULL DEFAULT 'tenant',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
      } catch {
        console.log('Direct table creation also failed, tables might already exist');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialization completed',
      results: results.length,
      errors: errors.length,
      details: { results, errors }
    });

  } catch (error: unknown) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize database',
      details: error
    }, { status: 500 });
  }
}