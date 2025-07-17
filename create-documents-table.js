const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createDocumentsTableIfNeeded() {
  console.log('🔧 Verificarea și crearea tabelului documents...');
  
  // Check if table exists
  const { data: existingData, error: existingError } = await supabase
    .from('documents')
    .select('*')
    .limit(1);
  
  if (existingError && existingError.code === 'PGRST116') {
    console.log('📋 Tabelul documents nu există. Creez structura...');
    
    // SQL to create documents table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.documents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type TEXT NOT NULL,
        uploaded_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable RLS
      ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      CREATE POLICY "Documents are viewable by authenticated users" ON public.documents
        FOR SELECT USING (auth.role() = 'authenticated');
        
      CREATE POLICY "Documents can be inserted by authenticated users" ON public.documents
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
      CREATE POLICY "Documents can be updated by their creator" ON public.documents
        FOR UPDATE USING (auth.uid() = uploaded_by);
        
      CREATE POLICY "Documents can be deleted by their creator" ON public.documents
        FOR DELETE USING (auth.uid() = uploaded_by);
    `;
    
    console.log('🔧 SQL pentru crearea tabelului:');
    console.log(createTableSQL);
    console.log('\n💡 Copiază și rulează acest SQL în Supabase SQL Editor!');
    
  } else if (existingError) {
    console.log('❌ Eroare la verificarea tabelului:', existingError.message);
  } else {
    console.log('✅ Tabelul documents există deja');
    console.log('📄 Înregistrări existente:', existingData.length);
  }
}

createDocumentsTableIfNeeded().catch(console.error);