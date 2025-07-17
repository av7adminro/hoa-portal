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

async function addProfilesForExistingUsers() {
  console.log('🔍 Adding profiles for existing users...');
  
  // First, login as admin to get user ID
  console.log('\n1. Getting admin user ID...');
  const { data: adminAuth, error: adminAuthError } = await supabase.auth.signInWithPassword({
    email: 'admin@asociatia.ro',
    password: 'admin123'
  });

  if (adminAuthError) {
    console.error('❌ Admin login error:', adminAuthError.message);
    return;
  }

  const adminUserId = adminAuth.user.id;
  console.log('✅ Admin user ID:', adminUserId);

  // Logout admin
  await supabase.auth.signOut();

  // Login as tenant to get user ID
  console.log('\n2. Getting tenant user ID...');
  const { data: tenantAuth, error: tenantAuthError } = await supabase.auth.signInWithPassword({
    email: 'locatar@asociatia.ro',
    password: 'locatar123'
  });

  if (tenantAuthError) {
    console.error('❌ Tenant login error:', tenantAuthError.message);
    return;
  }

  const tenantUserId = tenantAuth.user.id;
  console.log('✅ Tenant user ID:', tenantUserId);

  // Logout tenant
  await supabase.auth.signOut();

  // Now we need to insert profiles using service role
  // For now, we'll use a different approach - create a function to insert profiles
  console.log('\n3. Creating profiles...');
  
  // You'll need to run this SQL in Supabase Dashboard with service role:
  console.log('Run this SQL in Supabase Dashboard:');
  console.log(`
INSERT INTO public.profiles (id, full_name, apartment_number, role)
VALUES 
  ('${adminUserId}', 'Administrator Demo', 'Admin', 'admin'),
  ('${tenantUserId}', 'Ion Popescu', 'Ap. 15', 'tenant')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  apartment_number = EXCLUDED.apartment_number,
  role = EXCLUDED.role;
  `);

  console.log('\n✅ Profile creation SQL generated!');
  console.log('Copy and run the SQL above in Supabase Dashboard SQL Editor.');
}

addProfilesForExistingUsers().catch(console.error);