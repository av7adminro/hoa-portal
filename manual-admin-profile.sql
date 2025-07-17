-- Script pentru crearea manuală a profilului admin
-- Rulează acest script în Supabase SQL Editor după crearea utilizatorului

-- 1. Dezactivează RLS temporar pentru a putea insera
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Șterge profilul vechi dacă există (înlocuiește USER_ID cu ID-ul real)
-- DELETE FROM public.profiles WHERE id = 'USER_ID';

-- 3. Inserează noul profil admin (înlocuiește USER_ID cu ID-ul real din consola)
INSERT INTO public.profiles (id, full_name, apartment_number, role, created_at, updated_at)
VALUES (
  'USER_ID', -- Înlocuiește cu User ID din consolă
  'Costel Miron',
  'ADMIN',
  'admin', -- IMPORTANT: Acesta îl face admin
  NOW(),
  NOW()
);

-- 4. Verifică inserarea
SELECT * FROM public.profiles WHERE role = 'admin';

-- 5. Reactivează RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Verifică că totul funcționează
SELECT id, full_name, role, apartment_number 
FROM public.profiles 
WHERE email = 'costelmiron51@gmail.com' OR full_name = 'Costel Miron';