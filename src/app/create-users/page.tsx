"use client";

import { supabase } from '../../lib/supabase';
import { useState } from 'react';

export default function CreateUsers() {
  const [status, setStatus] = useState('');

  const createUsers = async () => {
    setStatus('Creating users...');

    // Create admin
    const { error: adminError } = await supabase.auth.signUp({
      email: 'admin@asociatia.ro',
      password: 'admin123',
    });

    if (adminError) {
      setStatus(`Admin error: ${adminError.message}`);
      return;
    }

    // Create tenant
    const { error: tenantError } = await supabase.auth.signUp({
      email: 'locatar@asociatia.ro',
      password: 'locatar123',
    });

    if (tenantError) {
      setStatus(`Tenant error: ${tenantError.message}`);
      return;
    }

    setStatus('Users created successfully!');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create Demo Users</h1>
      <button 
        onClick={createUsers}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Users
      </button>
      <p className="mt-4">{status}</p>
    </div>
  );
}