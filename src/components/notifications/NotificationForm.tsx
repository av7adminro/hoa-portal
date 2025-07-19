"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface NotificationFormProps {
  onNotificationComplete?: () => void;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  apartment_number: string;
}

export default function NotificationForm({ onNotificationComplete }: NotificationFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetAudience, setTargetAudience] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, apartment_number')
        .order('apartment_number');

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message) {
      setError('Te rugam sa completezi titlul si mesajul');
      return;
    }

    if (targetAudience === 'specific' && selectedUsers.length === 0) {
      setError('Te rugam sa selectezi cel putin un utilizator');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Trebuie sa fii autentificat');
        return;
      }

      const notificationData = {
        title,
        message,
        type,
        target_audience: targetAudience,
        target_users: targetAudience === 'specific' ? selectedUsers : null,
        created_by: user.id,
        expires_at: expiresAt || null
      };

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (insertError) {
        setError('Eroare la crearea notificarii: ' + insertError.message);
        return;
      }

      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      setTargetAudience('all');
      setSelectedUsers([]);
      setExpiresAt('');
      
      if (onNotificationComplete) {
        onNotificationComplete();
      }

      alert('Notificarea a fost creata cu succes!');
    } catch (error) {
      setError('Eroare necunoscuta: ' + (error instanceof Error ? error.message : 'Eroare'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6">Creare Notificare</h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">
            Titlu *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
            placeholder="Titlul notificarii"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Tip notificare *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
          >
            <option value="info" className="text-white">ℹ️ Informare</option>
            <option value="warning" className="text-white">⚠️ Avertisment</option>
            <option value="error" className="text-white">❌ Eroare</option>
            <option value="success" className="text-white">✅ Succes</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Destinatari *
          </label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
          >
            <option value="all" className="text-white">Toți utilizatorii</option>
            <option value="admins" className="text-white">Doar administratorii</option>
            <option value="tenants" className="text-white">Doar locatarii</option>
            <option value="specific" className="text-white">Utilizatori specifici</option>
          </select>
        </div>

        {targetAudience === 'specific' && (
          <div>
            <label className="block text-white font-medium mb-2">
              Selectați utilizatorii
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-white/5 rounded-xl">
              {users.map((user) => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelection(user.id)}
                    className="rounded"
                  />
                  <span className="text-white text-sm">
                    Ap. {user.apartment_number} - {user.full_name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-white font-medium mb-2">
            Mesaj *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300 h-32"
            placeholder="Conținutul notificarii..."
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Data expirare (opțional)
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Se trimite...' : 'Trimite Notificare'}
        </button>
      </form>
    </div>
  );
}