"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Notification } from '../../lib/supabase';

interface NotificationsListProps {
  refreshTrigger?: number;
  userRole?: 'admin' | 'tenant';
  userId?: string;
}

interface NotificationWithAuthor extends Notification {
  author_name?: string;
}

export default function NotificationsList({ refreshTrigger, userRole, userId }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<NotificationWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, [refreshTrigger]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:created_by (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Eroare la incarcarea notificarilor: ' + error.message);
        return;
      }

      const notificationsWithAuthor = data.map(notification => ({
        ...notification,
        author_name: notification.profiles?.full_name || 'Administrator'
      }));

      setNotifications(notificationsWithAuthor);
    } catch (error) {
      setError('Eroare necunoscuta: ' + (error instanceof Error ? error.message : 'Eroare'));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      if (notification.read_by.includes(userId)) return;

      const updatedReadBy = [...notification.read_by, userId];

      const { error } = await supabase
        .from('notifications')
        .update({ read_by: updatedReadBy })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!confirm('Esti sigur ca vrei sa stergi aceasta notificare?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        alert('Eroare la stergerea notificarii: ' + error.message);
        return;
      }

      loadNotifications();
      alert('Notificarea a fost stearsa cu succes!');
    } catch (error) {
      alert('Eroare la stergerea notificarii: ' + (error instanceof Error ? error.message : 'Eroare'));
    }
  };

  const isNotificationForUser = (notification: Notification) => {
    if (notification.target_audience === 'all') return true;
    if (notification.target_audience === 'admins' && userRole === 'admin') return true;
    if (notification.target_audience === 'tenants' && userRole === 'tenant') return true;
    if (notification.target_audience === 'specific' && notification.target_users?.includes(userId || '')) return true;
    return false;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (userRole !== 'admin' && !isNotificationForUser(notification)) {
      return false;
    }

    if (filter === 'unread' && userId && notification.read_by.includes(userId)) {
      return false;
    }

    if (filter === 'read' && userId && !notification.read_by.includes(userId)) {
      return false;
    }

    return true;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const getAudienceText = (audience: string) => {
    switch (audience) {
      case 'all': return 'Toți utilizatorii';
      case 'admins': return 'Administratori';
      case 'tenants': return 'Locatari';
      case 'specific': return 'Utilizatori specifici';
      default: return audience;
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

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isUnread = (notification: Notification) => {
    return userId ? !notification.read_by.includes(userId) : false;
  };

  if (loading) {
    return (
      <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Se incarca notificarile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white">Notificări</h3>
        
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
          >
            <option value="all" className="text-gray-900">Toate</option>
            <option value="unread" className="text-gray-900">Necitite</option>
            <option value="read" className="text-gray-900">Citite</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100">
          {error}
        </div>
      )}

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-white text-lg">Nu au fost gasite notificari</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isUnread(notification) 
                  ? 'bg-white/15 border-white/30 hover:bg-white/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              } ${isExpired(notification.expires_at) ? 'opacity-50' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-white">
                        {notification.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      {isUnread(notification) && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    
                    <p className="text-white/90 mb-3 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <span>👤 {notification.author_name}</span>
                      <span>📅 {formatDate(notification.created_at)}</span>
                      {userRole === 'admin' && (
                        <span>📢 {getAudienceText(notification.target_audience)}</span>
                      )}
                      {notification.expires_at && (
                        <span className={isExpired(notification.expires_at) ? 'text-red-300' : 'text-yellow-300'}>
                          ⏰ {isExpired(notification.expires_at) ? 'Expirat' : `Expiră: ${formatDate(notification.expires_at)}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {userRole === 'admin' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
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