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

async function addProfileForExistingUsers() {
  console.log('🔧 Adding profiles for existing users...');
  
  const usersToProfile = [
    {
      email: 'admin@asociatia.ro',
      full_name: 'Administrator',
      apartment_number: 'ADMIN',
      role: 'admin'
    },
    {
      email: 'locatar@asociatia.ro', 
      full_name: 'Locatar Demo',
      apartment_number: '1A',
      role: 'tenant'
    },
    {
      email: 'costelmiron51@gmail.com',
      full_name: 'Costel Miron',
      apartment_number: 'ADMIN',
      role: 'admin'
    }
  ];

  for (const userData of usersToProfile) {
    console.log(`\n👤 Processing user: ${userData.email}`);
    
    try {
      // First, try to sign in to get user ID
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.email === 'admin@asociatia.ro' ? 'admin123' : 
                  userData.email === 'locatar@asociatia.ro' ? 'locatar123' : 
                  '53715371mcM1..'
      });

      if (authError) {
        console.error(`❌ Login error for ${userData.email}:`, authError.message);
        continue;
      }

      const userId = authData.user.id;
      console.log(`✅ User ID: ${userId}`);

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        console.log(`✅ Profile already exists for ${userData.email}`);
        console.log('Profile:', existingProfile);
      } else {
        // Create profile
        console.log(`📝 Creating profile for ${userData.email}...`);
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              full_name: userData.full_name,
              apartment_number: userData.apartment_number,
              role: userData.role
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.error(`❌ Profile creation error for ${userData.email}:`, profileError.message);
        } else {
          console.log(`✅ Profile created for ${userData.email}`);
          console.log('Profile:', newProfile);
        }
      }

      // Sign out after processing
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error(`❌ Error processing ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Profile setup completed!');
}

addProfileForExistingUsers().catch(console.error);