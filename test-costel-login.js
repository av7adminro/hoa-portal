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

async function testCostelLogin() {
  console.log('🔍 Testing Costel login credentials...');
  
  const credentials = [
    { email: 'costelmiron51@gmail.com', password: '53715371mcM1..' },
    { email: 'costelmiron51@gmail.com', password: '53715371mcM1.' },
    { email: 'costelmiron51@gmail.com', password: '53715371mcM1' }
  ];

  for (let i = 0; i < credentials.length; i++) {
    const cred = credentials[i];
    console.log(`\n${i + 1}. Testing: ${cred.email} with password: ${cred.password}`);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      if (authError) {
        console.log(`❌ Login failed: ${authError.message}`);
      } else {
        console.log(`✅ Login successful!`);
        console.log(`   User ID: ${authData.user.id}`);
        console.log(`   Email: ${authData.user.email}`);
        console.log(`   Email confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`   Created: ${authData.user.created_at}`);
        
        // Check profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.log(`❌ Profile error: ${profileError.message}`);
        } else {
          console.log(`✅ Profile found:`);
          console.log(`   Name: ${profile.full_name}`);
          console.log(`   Role: ${profile.role}`);
          console.log(`   Apartment: ${profile.apartment_number}`);
        }
        
        // Sign out
        await supabase.auth.signOut();
        return; // Exit on success
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
    }
  }

  // If we get here, all attempts failed
  console.log('\n❌ All login attempts failed. Let\'s check user details...');
  
  // Check if user exists in auth
  console.log('\n🔍 Checking user existence...');
  
  // Try to get user info by signing in with other accounts first
  const { data: adminAuth, error: adminError } = await supabase.auth.signInWithPassword({
    email: 'admin@asociatia.ro',
    password: 'admin123'
  });

  if (!adminError) {
    console.log('✅ Admin login works');
    await supabase.auth.signOut();
  }

  // Reset password for Costel
  console.log('\n🔄 Attempting password reset for costelmiron51@gmail.com...');
  const { error: resetError } = await supabase.auth.resetPasswordForEmail('costelmiron51@gmail.com');
  
  if (resetError) {
    console.log(`❌ Password reset failed: ${resetError.message}`);
  } else {
    console.log('✅ Password reset email sent (if user exists)');
  }
}

testCostelLogin().catch(console.error);