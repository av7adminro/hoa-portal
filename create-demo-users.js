const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDemoUsers() {
  console.log('Creating demo users...');

  // Create admin user
  const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@asociatia.ro',
    password: 'admin123',
    user_metadata: {
      full_name: 'Administrator Demo',
      apartment_number: 'Admin',
      role: 'admin'
    }
  });

  if (adminError) {
    console.error('Error creating admin user:', adminError);
  } else {
    console.log('✅ Admin user created:', adminData.user.email);
  }

  // Create tenant user
  const { data: tenantData, error: tenantError } = await supabase.auth.admin.createUser({
    email: 'locatar@asociatia.ro',
    password: 'locatar123',
    user_metadata: {
      full_name: 'Ion Popescu',
      apartment_number: 'Ap. 15',
      role: 'tenant'
    }
  });

  if (tenantError) {
    console.error('Error creating tenant user:', tenantError);
  } else {
    console.log('✅ Tenant user created:', tenantData.user.email);
  }

  // Wait for profiles to be created by trigger
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if profiles were created
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  } else {
    console.log('✅ Profiles created:', profiles.length);
    profiles.forEach(profile => {
      console.log(`  - ${profile.full_name} (${profile.role})`);
    });
  }

  console.log('\nDemo users created successfully!');
  console.log('You can now use these credentials:');
  console.log('Admin: admin@asociatia.ro / admin123');
  console.log('Tenant: locatar@asociatia.ro / locatar123');
}

createDemoUsers().catch(console.error);