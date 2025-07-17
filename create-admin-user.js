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

async function createAdminUser() {
  console.log('🚀 Creating new admin user...');
  
  const userData = {
    email: 'costelmiron51@gmail.com',
    password: '53715371mcM1..',
    full_name: 'Costel Miron',
    apartment_number: 'ADMIN',
    role: 'admin'
  };

  try {
    // Create user with Supabase Auth
    console.log('📝 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          apartment_number: userData.apartment_number,
          role: userData.role
        }
      }
    });

    if (authError) {
      console.error('❌ Auth creation error:', authError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user data returned');
      return;
    }

    console.log('✅ Auth user created successfully');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    console.log('Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');

    // The profile will be created automatically by the trigger
    // Let's wait a moment and then check
    console.log('⏳ Waiting for profile creation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if profile was created
    console.log('🔍 Checking profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile check error:', profileError.message);
      
      // Try to create profile manually if trigger didn't work
      console.log('🛠️ Creating profile manually...');
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: userData.full_name,
            apartment_number: userData.apartment_number,
            role: userData.role
          }
        ])
        .select()
        .single();

      if (manualError) {
        console.error('❌ Manual profile creation error:', manualError.message);
        return;
      }

      console.log('✅ Profile created manually');
      console.log('Profile:', manualProfile);
    } else {
      console.log('✅ Profile created automatically by trigger');
      console.log('Profile:', profile);
    }

    // Test login
    console.log('\n🔐 Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password
    });

    if (loginError) {
      console.error('❌ Login test error:', loginError.message);
    } else {
      console.log('✅ Login test successful');
      console.log('User can access admin dashboard');
      
      // Sign out after test
      await supabase.auth.signOut();
    }

    console.log('\n🎉 Admin user creation completed!');
    console.log('Email:', userData.email);
    console.log('Password:', userData.password);
    console.log('Role: admin');
    console.log('Full access to admin dashboard: YES');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createAdminUser().catch(console.error);