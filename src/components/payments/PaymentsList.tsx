"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Payment } from '../../lib/supabase';

interface PaymentsListProps {
  refreshTrigger?: number;
  userRole?: 'admin' | 'tenant';
}

interface PaymentWithUser extends Payment {
  user_name?: string;
  apartment_number?: string;
}

export default function PaymentsList({ refreshTrigger, userRole }: PaymentsListProps) {
  const [payments, setPayments] = useState<PaymentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPayments();
  }, [refreshTrigger]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            apartment_number
          )
        `)
        .order('due_date', { ascending: false });

      if (error) {
        setError('Eroare la incarcarea platilor: ' + error.message);
        return;
      }

      const paymentsWithUser = data.map(payment => ({
        ...payment,
        user_name: payment.profiles?.full_name || 'Utilizator necunoscut',
        apartment_number: payment.profiles?.apartment_number || 'N/A'
      }));

      setPayments(paymentsWithUser);
    } catch (error) {
      setError('Eroare necunoscuta: ' + (error instanceof Error ? error.message : 'Eroare'));
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const updateData: Partial<Payment> = { status: newStatus as Payment['status'] };
      
      if (newStatus === 'paid') {
        updateData.paid_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) {
        alert('Eroare la actualizarea statusului: ' + error.message);
        return;
      }

      loadPayments();
      alert('Statusul a fost actualizat cu succes!');
    } catch (error) {
      alert('Eroare la actualizarea statusului: ' + (error instanceof Error ? error.message : 'Eroare'));
    }
  };

  const deletePayment = async (paymentId: string) => {
    if (!confirm('Esti sigur ca vrei sa stergi aceasta plata?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        alert('Eroare la stergerea platii: ' + error.message);
        return;
      }

      loadPayments();
      alert('Plata a fost stearsa cu succes!');
    } catch (error) {
      alert('Eroare la stergerea platii: ' + (error instanceof Error ? error.message : 'Eroare'));
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Plătită';
      case 'pending': return 'În așteptare';
      case 'overdue': return 'Restantă';
      case 'cancelled': return 'Anulată';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'monthly_fee': return 'Întreținere lunară';
      case 'utilities': return 'Utilitați';
      case 'maintenance': return 'Reparații';
      case 'other': return 'Altele';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'monthly_fee': return '🏠';
      case 'utilities': return '⚡';
      case 'maintenance': return '🔧';
      case 'other': return '📄';
      default: return '💰';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Se incarca platile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white">Lista Plăți</h3>
        
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
          >
            <option value="all" className="text-gray-900">Toate statusurile</option>
            <option value="pending" className="text-gray-900">În așteptare</option>
            <option value="paid" className="text-gray-900">Plătite</option>
            <option value="overdue" className="text-gray-900">Restante</option>
            <option value="cancelled" className="text-gray-900">Anulate</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100">
          {error}
        </div>
      )}

      {filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-white text-lg">Nu au fost gasite plati</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">
                    {getCategoryIcon(payment.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-white">
                        {payment.description}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-white/70 mb-2">
                      <span>📋 {getCategoryText(payment.category)}</span>
                      <span>💰 {formatAmount(payment.amount)}</span>
                      <span>📅 Scadenta: {formatDate(payment.due_date)}</span>
                      {payment.paid_date && (
                        <span>✅ Plătită: {formatDate(payment.paid_date)}</span>
                      )}
                    </div>
                    
                    {userRole === 'admin' && (
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>🏠 Ap. {payment.apartment_number}</span>
                        <span>👤 {payment.user_name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {userRole === 'admin' && (
                  <div className="flex items-center space-x-2">
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => updatePaymentStatus(payment.id, 'paid')}
                        className="px-3 py-1 bg-green-500/20 text-green-100 rounded-lg hover:bg-green-500/30 transition-all duration-300 text-sm"
                      >
                        Marcheaza Plătită
                      </button>
                    )}
                    
                    {payment.status === 'paid' && (
                      <button
                        onClick={() => updatePaymentStatus(payment.id, 'pending')}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-100 rounded-lg hover:bg-yellow-500/30 transition-all duration-300 text-sm"
                      >
                        Marcheaza Neplătită
                      </button>
                    )}
                    
                    <button
                      onClick={() => deletePayment(payment.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-100 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm"
                    >
                      Șterge
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}