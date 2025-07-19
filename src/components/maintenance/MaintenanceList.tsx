"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { MaintenanceRequest } from '../../lib/supabase';

interface MaintenanceListProps {
  refreshTrigger?: number;
  userRole?: 'admin' | 'tenant';
}

interface MaintenanceRequestWithUser extends MaintenanceRequest {
  user_name?: string;
  apartment_number?: string;
}

export default function MaintenanceList({ refreshTrigger, userRole }: MaintenanceListProps) {
  const [requests, setRequests] = useState<MaintenanceRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [refreshTrigger]);

  const initializeTable = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch('/api/init-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.sql) {
          // Show the SQL in a dialog or copy to clipboard
          const textarea = document.createElement('textarea');
          textarea.value = data.sql;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert('SQL-ul a fost copiat în clipboard! Mergi la Supabase Dashboard > SQL Editor și lipește-l acolo.');
        } else {
          alert('Tabela a fost inițializată cu succes!');
          setIsTableMissing(false);
          setError('');
          loadRequests();
        }
      } else {
        alert('Eroare la inițializarea tabelei: ' + (data.error || 'Eroare necunoscută'));
      }
    } catch (error) {
      alert('Eroare la inițializarea tabelei: ' + (error instanceof Error ? error.message : 'Eroare'));
    } finally {
      setIsInitializing(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // First get the maintenance requests
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (maintenanceError) {
        console.log('Maintenance error:', maintenanceError);
        if (maintenanceError.message && maintenanceError.message.includes('relation "public.maintenance_requests" does not exist')) {
          setIsTableMissing(true);
          setError('Tabela pentru solicitări nu există. Administratorul trebuie să o configureze.');
          console.log('Table missing set to true');
        } else {
          setError('Eroare la încărcarea solicitărilor: ' + maintenanceError.message);
        }
        return;
      }

      // Then get the user profiles for each request
      const userIds = [...new Set(maintenanceData?.map(req => req.user_id).filter(Boolean) || [])];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, apartment_number')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Create a map of user profiles
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Combine the data
      const data = maintenanceData?.map(request => ({
        ...request,
        profiles: profilesMap.get(request.user_id) || null
      }));


      const requestsWithUser = (data || []).map(request => ({
        ...request,
        user_name: request.profiles?.full_name || 'Utilizator necunoscut',
        apartment_number: request.profiles?.apartment_number || 'N/A'
      }));

      setRequests(requestsWithUser);
    } catch (error) {
      setError('Eroare necunoscută: ' + (error instanceof Error ? error.message : 'Eroare'));
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const updateData: Partial<MaintenanceRequest> = { 
        status: newStatus as MaintenanceRequest['status'] 
      };
      
      if (newStatus === 'completed') {
        updateData.completion_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        alert('Eroare la actualizarea statusului: ' + error.message);
        return;
      }

      loadRequests();
      alert('Statusul a fost actualizat cu succes!');
    } catch (error) {
      alert('Eroare la actualizarea statusului: ' + (error instanceof Error ? error.message : 'Eroare'));
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această solicitare?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        alert('Eroare la ștergerea solicitării: ' + error.message);
        return;
      }

      loadRequests();
      alert('Solicitarea a fost ștearsă cu succes!');
    } catch (error) {
      alert('Eroare la ștergerea solicitării: ' + (error instanceof Error ? error.message : 'Eroare'));
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-white text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'În așteptare';
      case 'in_progress': return 'În progres';
      case 'completed': return 'Finalizată';
      case 'cancelled': return 'Anulată';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-white text-white';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-white text-white';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Mică';
      case 'medium': return 'Medie';
      case 'high': return 'Mare';
      case 'urgent': return 'Urgentă';
      default: return priority;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plumbing': return '🚿';
      case 'electrical': return '⚡';
      case 'heating': return '🔥';
      case 'cleaning': return '🧹';
      case 'other': return '🔧';
      default: return '🔧';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'plumbing': return 'Instalații sanitare';
      case 'electrical': return 'Instalații electrice';
      case 'heating': return 'Încălzire';
      case 'cleaning': return 'Curățenie';
      case 'other': return 'Altele';
      default: return category;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Se încarcă solicitările...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white">Solicitări Mentenanță</h3>
        
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:bg-white/30 transition-all duration-300"
          >
            <option value="all" className="text-gray-900">Toate statusurile</option>
            <option value="pending" className="text-gray-900">În așteptare</option>
            <option value="in_progress" className="text-gray-900">În progres</option>
            <option value="completed" className="text-gray-900">Finalizate</option>
            <option value="cancelled" className="text-gray-900">Anulate</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100">
          {error}
          {(isTableMissing || error.includes('nu există')) && userRole === 'admin' && (
            <div className="mt-4">
              <p className="text-sm mb-2">Pentru a configura tabela:</p>
              <button
                onClick={initializeTable}
                disabled={isInitializing}
                className="mt-3 px-4 py-2 bg-blue-500/20 text-blue-100 rounded-lg hover:bg-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInitializing ? 'Se pregătește...' : 'Copiază SQL în clipboard'}
              </button>
              <p className="text-xs mt-3">Sau manual:</p>
              <ol className="text-sm list-decimal list-inside space-y-1">
                <li>Accesați Supabase Dashboard</li>
                <li>Mergeți la SQL Editor</li>
                <li>Executați scriptul din fișierul create-maintenance-table.sql</li>
              </ol>
            </div>
          )}
          {/* Debug info - remove later */}
          {userRole === 'admin' && (
            <div className="mt-2 text-xs text-blue-200">
              Debug: isTableMissing={isTableMissing ? 'true' : 'false'}, userRole={userRole}
            </div>
          )}
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔧</div>
          <p className="text-white text-lg">Nu au fost găsite solicitări</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">
                    {getCategoryIcon(request.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-white">
                        {request.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {getPriorityText(request.priority)}
                      </span>
                    </div>
                    
                    <p className="text-white/90 mb-3 leading-relaxed">
                      {request.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-white/70 mb-2">
                      <span>📋 {getCategoryText(request.category)}</span>
                      <span>📍 {request.location}</span>
                      <span>📅 {formatDate(request.created_at)}</span>
                      {request.completion_date && (
                        <span>✅ Finalizat: {formatDate(request.completion_date)}</span>
                      )}
                    </div>
                    
                    {userRole === 'admin' && (
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>🏠 Ap. {request.apartment_number}</span>
                        <span>👤 {request.user_name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {userRole === 'admin' && (
                  <div className="flex items-center space-x-2">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'in_progress')}
                        className="px-3 py-1 bg-blue-500/20 text-blue-100 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-sm"
                      >
                        Începe lucru
                      </button>
                    )}
                    
                    {request.status === 'in_progress' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'completed')}
                        className="px-3 py-1 bg-green-500/20 text-green-100 rounded-lg hover:bg-green-500/30 transition-all duration-300 text-sm"
                      >
                        Finalizează
                      </button>
                    )}
                    
                    {request.status !== 'completed' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'cancelled')}
                        className="px-3 py-1 bg-red-500/20 text-red-100 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm"
                      >
                        Anulează
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteRequest(request.id)}
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