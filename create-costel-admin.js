const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createCostelAdmin() {
  console.log('🚀 Crearea utilizatorului admin Costel Miron\n');
  
  // Step 1: Creează utilizatorul în Supabase Auth
  console.log('1️⃣ Creez utilizatorul în Supabase Auth...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'costelmiron51@gmail.com',
    password: '53715371mcM1..',
    options: {
      data: {
        full_name: 'Costel Miron',
        apartment_number: 'ADMIN',
        role: 'admin'
      }
    }
  });

  if (authError) {
    console.error('❌ Eroare la crearea utilizatorului:', authError.message);
    return;
  }

  console.log('✅ Utilizator creat cu succes!');
  console.log('   User ID:', authData.user.id);
  console.log('   Email:', authData.user.email);
  
  // Step 2: Așteaptă puțin pentru sincronizare
  console.log('\n2️⃣ Aștept sincronizarea...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 3: Creează profilul admin
  console.log('\n3️⃣ Creez profilul admin...');
  
  // Mai întâi dezactivăm RLS temporar pentru a putea insera
  console.log('   Dezactivez RLS temporar...');
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: authData.user.id,
      full_name: 'Costel Miron',
      apartment_number: 'ADMIN',
      role: 'admin' // IMPORTANT: Aici setăm rolul de admin
    }])
    .select()
    .single();

  if (profileError) {
    console.error('❌ Eroare la crearea profilului:', profileError.message);
    console.log('\n💡 Rulează în Supabase SQL Editor:');
    console.log(`
-- Dezactivează RLS temporar
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Inserează profilul admin
INSERT INTO public.profiles (id, full_name, apartment_number, role)
VALUES ('${authData.user.id}', 'Costel Miron', 'ADMIN', 'admin');

-- Reactivează RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    `);
    return;
  }

  console.log('✅ Profil admin creat cu succes!');
  console.log('   Profil:', profile);
  
  // Step 4: Testează login
  console.log('\n4️⃣ Testez login-ul...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'costelmiron51@gmail.com',
    password: '53715371mcM1..'
  });

  if (loginError) {
    console.error('❌ Eroare la login:', loginError.message);
  } else {
    console.log('✅ Login funcționează perfect!');
  }

  console.log('\n🎉 SUCCES! Utilizator admin creat complet!');
  console.log('\n📋 Detalii finale:');
  console.log('   Email: costelmiron51@gmail.com');
  console.log('   Parola: 53715371mcM1..');
  console.log('   Rol: ADMIN (acces complet)');
  console.log('   Nume: Costel Miron');
  console.log('\n🌐 Acum te poți loga la: http://av7.rowebhost.ro/login');
}

createCostelAdmin().catch(console.error);