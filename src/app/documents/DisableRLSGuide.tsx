"use client";

import { useState } from 'react';

export default function DisableRLSGuide() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="mb-6">
      {!showGuide ? (
        <button
          onClick={() => setShowGuide(true)}
          className="text-blue-600 hover:text-blue-700 underline text-sm"
        >
          Primești eroare &quot;row-level security policy&quot;? Click aici pentru soluție
        </button>
      ) : (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-blue-900">
              Rezolvare rapidă pentru eroarea RLS
            </h3>
            <button
              onClick={() => setShowGuide(false)}
              className="text-blue-600 hover:text-blue-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 text-blue-800">
            <p className="font-medium">
              Pentru a permite upload-ul de fișiere, urmează acești pași:
            </p>
            
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Deschide <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
              <li>Navighează la <strong>Storage</strong> din meniul lateral</li>
              <li>Click pe bucket-ul <strong>&quot;documents&quot;</strong></li>
              <li>Mergi la tab-ul <strong>Configuration</strong></li>
              <li>Dezactivează opțiunea <strong>&quot;Enable Row Level Security&quot;</strong></li>
              <li>Click pe <strong>Save</strong></li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Notă:</strong> Aceasta este o soluție temporară. Pentru producție, 
                configurează politicile RLS corespunzător din tab-ul Policies.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}