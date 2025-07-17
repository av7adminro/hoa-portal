"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StoragePolicies() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- Supabase Storage RLS Policies for 'documents' bucket
-- Run this in the Supabase SQL Editor

-- First, ensure RLS is enabled on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files to the documents bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow authenticated users to view all files in the documents bucket
CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Policy 3: Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6">Configurare Politici RLS pentru Storage</h1>
          
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-2">⚠️ Eroare: Row-level security policy</h2>
            <p className="text-white/90">
              Bucket-ul a fost creat, dar politicile RLS trebuie configurate manual în Supabase.
            </p>
          </div>

          <div className="mb-6 p-4 bg-white/10 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-2">Pași pentru rezolvare:</h2>
            <ol className="list-decimal list-inside space-y-2 text-white/90">
              <li>Copiază script-ul SQL de mai jos</li>
              <li>Deschide <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">Supabase Dashboard</a></li>
              <li>Navighează la SQL Editor</li>
              <li>Lipește și rulează script-ul</li>
              <li>Revino și testează upload-ul din nou</li>
            </ol>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">Script SQL:</h3>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-300"
              >
                {copied ? '✓ Copiat!' : 'Copiază Script'}
              </button>
            </div>
            <pre className="p-4 bg-black/30 rounded-xl overflow-x-auto text-sm text-white/90">
              <code>{sqlScript}</code>
            </pre>
          </div>

          <div className="flex gap-4">
            <a
              href="https://app.supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300"
            >
              Deschide Supabase Dashboard
            </a>

            <button
              onClick={() => router.push('/documents')}
              className="bg-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all duration-300"
            >
              Înapoi la Documente
            </button>
          </div>

          <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <h3 className="text-lg font-semibold text-yellow-100 mb-2">Alternativă rapidă:</h3>
            <p className="text-yellow-100/90 text-sm mb-2">
              Pentru testare rapidă, poți dezactiva temporar RLS pentru bucket:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-yellow-100/90 text-sm">
              <li>În Supabase Dashboard → Storage</li>
              <li>Click pe bucket &quot;documents&quot;</li>
              <li>Tab Configuration → Dezactivează &quot;Enable Row Level Security&quot;</li>
              <li className="text-red-200">⚠️ Nu recomandăm asta pentru producție!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}