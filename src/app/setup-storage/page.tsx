"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupStorage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{message: string, bucket: string, note?: string} | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const initializeStorage = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/init-storage');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to initialize storage');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6">Setup Supabase Storage</h1>
          
          <div className="mb-6 p-4 bg-white/10 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-2">Pasi pentru configurare:</h2>
            <ol className="list-decimal list-inside space-y-2 text-white/90">
              <li>Asigura-te ca ai setat SUPABASE_SERVICE_ROLE_KEY in fisierul .env.local</li>
              <li>Click pe butonul de mai jos pentru a crea bucket-ul de storage</li>
              <li>Dupa creare, configureaza politicile RLS in dashboard-ul Supabase</li>
            </ol>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100">
              {error}
            </div>
          )}

          {result && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-100">
              <p className="font-semibold">{result.message}</p>
              <p className="text-sm mt-2">Bucket: {result.bucket}</p>
              {result.note && <p className="text-sm mt-2 text-yellow-200">{result.note}</p>}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={initializeStorage}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se initializeaza...' : 'Initializeaza Storage'}
            </button>

            <button
              onClick={() => router.push('/documents')}
              className="bg-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all duration-300"
            >
              Inapoi la Documente
            </button>
          </div>

          <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <h3 className="text-lg font-semibold text-yellow-100 mb-2">Nota Importanta:</h3>
            <p className="text-yellow-100/90 text-sm">
              Daca primesti eroare &quot;Bucket not found&quot;, trebuie sa:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-yellow-100/90 text-sm">
              <li>Te loghezi in dashboard-ul Supabase</li>
              <li>Mergi la Storage → Create new bucket</li>
              <li>Numele: &quot;documents&quot;, Public: OFF</li>
              <li>Seteaza politicile RLS pentru authenticated users</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}