"use client";

import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState<any>({});
  
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test 1: Check if supabase is initialized
      setStatus(prev => ({ ...prev, initialized: !!supabase }));
      
      // Test 2: Try to fetch from a table
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      setStatus(prev => ({ 
        ...prev, 
        connection: error ? 'Failed' : 'Success',
        error: error?.message 
      }));
      
    } catch (err: any) {
      setStatus(prev => ({ ...prev, error: err.message }));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(status, null, 2)}
      </pre>
      <div className="mt-4">
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
      </div>
    </div>
  );
}