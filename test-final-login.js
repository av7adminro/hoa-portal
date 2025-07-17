const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFinalLogin() {
  console.log('🎯 Test final login pentru costelmiron51@gmail.com\n');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'costelmiron51@gmail.com',
    password: '53715371mcM1..'
  });

  if (error) {
    console.log('❌ Login eșuat:', error.message);
  } else {
    console.log('✅ Login reușit!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    
    // Verifică profilul
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (!profileError && profile) {
      console.log('\n✅ Profil găsit:');
      console.log('Nume:', profile.full_name);
      console.log('Rol:', profile.role);
      console.log('Apartament:', profile.apartment_number);
    }
  }
  
  console.log('\n📱 Acum poți accesa:');
  console.log('- Local: http://localhost:3000/login');
  console.log('- Server: http://av7.rowebhost.ro/login');
  console.log('\nCredențiale:');
  console.log('Email: costelmiron51@gmail.com');
  console.log('Parola: 53715371mcM1..');
}

testFinalLogin().catch(console.error);