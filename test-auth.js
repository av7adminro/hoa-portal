const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthentication() {
  console.log('🔍 Testing Supabase authentication...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');
  
  // Test 1: Check if profiles table exists
  console.log('\n1. Testing profiles table access...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Profiles table error:', error.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('Found profiles:', data.length);
      data.forEach(profile => {
        console.log(`  - ${profile.full_name} (${profile.role}) - ${profile.email || 'No email'}`);
      });
    }
  } catch (err) {
    console.error('❌ Profiles table exception:', err.message);
  }

  // Test 2: Test login with demo credentials
  console.log('\n2. Testing login with admin credentials...');
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@asociatia.ro',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ Admin login error:', authError.message);
    } else {
      console.log('✅ Admin login successful');
      console.log('User ID:', authData.user.id);
      console.log('Email:', authData.user.email);
      
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError.message);
      } else {
        console.log('✅ Profile loaded');
        console.log('Name:', profile.full_name);
        console.log('Role:', profile.role);
        console.log('Apartment:', profile.apartment_number);
      }
    }
  } catch (err) {
    console.error('❌ Admin login exception:', err.message);
  }

  // Test 3: Test login with tenant credentials
  console.log('\n3. Testing login with tenant credentials...');
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'locatar@asociatia.ro',
      password: 'locatar123'
    });

    if (authError) {
      console.error('❌ Tenant login error:', authError.message);
    } else {
      console.log('✅ Tenant login successful');
      console.log('User ID:', authData.user.id);
      console.log('Email:', authData.user.email);
      
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError.message);
      } else {
        console.log('✅ Profile loaded');
        console.log('Name:', profile.full_name);
        console.log('Role:', profile.role);
        console.log('Apartment:', profile.apartment_number);
      }
    }
  } catch (err) {
    console.error('❌ Tenant login exception:', err.message);
  }

  console.log('\n🎯 Test completed!');
}

testAuthentication().catch(console.error);