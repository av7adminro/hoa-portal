"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface PaymentFormProps {
  onPaymentComplete?: () => void;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  apartment_number: string;
}

export default function PaymentForm({ onPaymentComplete }: PaymentFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
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
        .eq('role', 'tenant')
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
    
    if (!selectedUserId || !amount || !description || !category || !dueDate) {
      setError('Te rugam sa completezi toate campurile obligatorii');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          user_id: selectedUserId,
          amount: parseFloat(amount),
          description,
          category,
          due_date: dueDate,
          status: 'pending'
        });

      if (insertError) {
        setError('Eroare la crearea platii: ' + insertError.message);
        return;
      }

      // Reset form
      setSelectedUserId('');
      setAmount('');
      setDescription('');
      setCategory('');
      setDueDate('');
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }

      alert('Plata a fost creata cu succes!');
    } catch (error) {
      setError('Eroare necunoscuta: ' + (error instanceof Error ? error.message : 'Eroare'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6">Creare Plată Nouă</h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">
            Locatar *
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
            required
          >
            <option value="">Selecteaza locatarul</option>
            {users.map((user) => (
              <option key={user.id} value={user.id} className="text-gray-900">
                Ap. {user.apartment_number} - {user.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Suma (RON) *
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
            placeholder="150.00"
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
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
            required
          >
            <option value="">Selecteaza categoria</option>
            <option value="monthly_fee" className="text-gray-900">Întreținere lunară</option>
            <option value="utilities" className="text-gray-900">Utilitați</option>
            <option value="maintenance" className="text-gray-900">Reparații</option>
            <option value="other" className="text-gray-900">Altele</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Descriere *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300 h-24"
            placeholder="Descrierea platii..."
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Data scadenta *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Se creaza...' : 'Creaza Plata'}
        </button>
      </form>
    </div>
  );
}