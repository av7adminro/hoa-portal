"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface MaintenanceFormProps {
  onRequestComplete?: () => void;
}

export default function MaintenanceForm({ onRequestComplete }: MaintenanceFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category || !location) {
      setError('Te rugăm să completezi toate câmpurile obligatorii');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('Trebuie să fii autentificat pentru a crea o solicitare');
        return;
      }

      const { error: insertError } = await supabase
        .from('maintenance_requests')
        .insert({
          user_id: user.id,
          title,
          description,
          category,
          priority,
          location,
          status: 'pending'
        });

      if (insertError) {
        setError('Eroare la crearea solicitării: ' + insertError.message);
        return;
      }

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('medium');
      setLocation('');
      
      if (onRequestComplete) {
        onRequestComplete();
      }

      alert('Solicitarea a fost creată cu succes!');
    } catch (error) {
      setError('Eroare necunoscută: ' + (error instanceof Error ? error.message : 'Eroare'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6">Solicitare Nouă</h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">
            Titlu solicitare *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:bg-white/30 transition-all duration-300"
            placeholder="ex: Robinetul din baie picură"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Categorie *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:bg-white/30 transition-all duration-300"
            required
          >
            <option value="">Selectează categoria</option>
            <option value="plumbing" className="text-gray-900">Instalații sanitare</option>
            <option value="electrical" className="text-gray-900">Instalații electrice</option>
            <option value="heating" className="text-gray-900">Încălzire</option>
            <option value="cleaning" className="text-gray-900">Curățenie</option>
            <option value="other" className="text-gray-900">Altele</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Prioritate *
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:bg-white/30 transition-all duration-300"
            required
          >
            <option value="low" className="text-gray-900">Mică</option>
            <option value="medium" className="text-gray-900">Medie</option>
            <option value="high" className="text-gray-900">Mare</option>
            <option value="urgent" className="text-gray-900">Urgentă</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Locația *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:bg-white/30 transition-all duration-300"
            placeholder="ex: Apartament 15, baie"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Descriere detaliată *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:bg-white/30 transition-all duration-300 h-32"
            placeholder="Descrie problema în detaliu..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Se creează...' : 'Creează Solicitarea'}
        </button>
      </form>
    </div>
  );
}