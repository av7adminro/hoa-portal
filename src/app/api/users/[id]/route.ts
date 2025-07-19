import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      throw error;
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { full_name, apartment_number, role, password } = body;

    // Update profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        apartment_number,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    // Update auth user metadata and password if provided
    const updateData: any = {
      user_metadata: {
        full_name,
        apartment_number,
        role
      }
    };

    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      resolvedParams.id,
      updateData
    );

    if (authError) {
      console.error('Auth update error:', authError);
      // Don't fail the request if auth update fails
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'User updated successfully'
    });

  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Delete from auth (this will cascade to profiles via foreign key)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(resolvedParams.id);

    if (authError) {
      throw authError;
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user'
    }, { status: 500 });
  }
}