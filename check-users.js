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

async function checkAllUsers() {
  console.log('🔍 Checking all users in Supabase...');
  console.log('URL:', supabaseUrl);
  
  // Lista de credentiale de testat
  const testCredentials = [
    { email: 'admin@asociatia.ro', password: 'admin123', expectedRole: 'admin' },
    { email: 'locatar@asociatia.ro', password: 'locatar123', expectedRole: 'tenant' },
    { email: 'test@asociatia.ro', password: 'test123', expectedRole: 'unknown' },
    { email: 'user@asociatia.ro', password: 'user123', expectedRole: 'unknown' },
    { email: 'demo@asociatia.ro', password: 'demo123', expectedRole: 'unknown' }
  ];

  const foundUsers = [];
  
  for (let i = 0; i < testCredentials.length; i++) {
    const creds = testCredentials[i];
    console.log(`\n${i + 1}. Testing login: ${creds.email}`);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password
      });

      if (authError) {
        console.log(`❌ Login failed: ${authError.message}`);
      } else {
        console.log(`✅ Login successful!`);
        console.log(`   User ID: ${authData.user.id}`);
        console.log(`   Email: ${authData.user.email}`);
        console.log(`   Created: ${authData.user.created_at}`);
        console.log(`   Last Sign In: ${authData.user.last_sign_in_at || 'Never'}`);
        
        // Check if user has metadata
        if (authData.user.user_metadata && Object.keys(authData.user.user_metadata).length > 0) {
          console.log(`   Metadata:`, authData.user.user_metadata);
        }
        
        foundUsers.push({
          id: authData.user.id,
          email: authData.user.email,
          created_at: authData.user.created_at,
          last_sign_in_at: authData.user.last_sign_in_at,
          metadata: authData.user.user_metadata
        });
        
        // Logout after each test
        await supabase.auth.signOut();
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(50));
  console.log(`Total users found: ${foundUsers.length}`);
  
  if (foundUsers.length > 0) {
    console.log('\nUser details:');
    foundUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Last login: ${user.last_sign_in_at || 'Never'}`);
      if (user.metadata && Object.keys(user.metadata).length > 0) {
        console.log(`   Metadata: ${JSON.stringify(user.metadata)}`);
      }
      console.log('');
    });
  }

  // Test if profiles table exists
  console.log('\n🔍 Testing profiles table access...');
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
      console.log('   This is expected if you haven\'t run supabase-setup.sql yet');
    } else {
      console.log('✅ Profiles table accessible');
      console.log(`   Found ${profiles.length} profiles`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.full_name} (${profile.role}) - ID: ${profile.id}`);
      });
    }
  } catch (err) {
    console.log('❌ Profiles table exception:', err.message);
  }

  console.log('\n🎯 Check completed!');
}

checkAllUsers().catch(console.error);