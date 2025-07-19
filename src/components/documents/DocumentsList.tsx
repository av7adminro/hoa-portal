"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { downloadFile, deleteFile } from '../../utils/storage';

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
}

interface DocumentsListProps {
  refreshTrigger?: number;
}

export default function DocumentsList({ refreshTrigger }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Eroare la incarcarea documentelor: ' + error.message);
        return;
      }

      // Pentru moment, nu avem numele utilizatorului
      const documentsWithUploader = data.map(doc => ({
        ...doc,
        uploader_name: 'Administrator'
      }));

      setDocuments(documentsWithUploader);
    } catch (error) {
      setError('Eroare necunoscuta: ' + (error instanceof Error ? error.message : 'Eroare'));
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    try {
      console.log('Attempting to download:', filePath, fileName);
      const { data, error } = await downloadFile(filePath);
      
      if (error) {
        console.error('Download error:', error);
        alert('Eroare la descarcarea documentului: ' + error.message);
        return;
      }
      
      if (data) {
        // Create a download link
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Nu s-au primit date de la server');
      }
    } catch (error) {
      console.error('Download exception:', error);
      alert('Eroare la descarcarea documentului: ' + (error instanceof Error ? error.message : 'Eroare necunoscută'));
    }
  };

  const deleteDocument = async (id: string, filePath: string) => {
    if (!confirm('Esti sigur ca vrei sa stergi acest document?')) {
      return;
    }

    try {
      // Delete from storage first
      const { error: storageError } = await deleteFile(filePath);
      
      if (storageError) {
        alert('Eroare la stergerea fisierului: ' + (storageError instanceof Error ? storageError.message : 'Eroare necunoscută'));
        return;
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) {
        alert('Eroare la stergerea documentului: ' + dbError.message);
        return;
      }

      loadDocuments();
      alert('Document sters cu succes!');
    } catch (error) {
      alert('Eroare la stergerea documentului: ' + (error instanceof Error ? error.message : 'Eroare'));
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.category === filter;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'facturi': return '💳';
      case 'procese-verbale': return '📋';
      case 'regulamente': return '📜';
      case 'contracte': return '📄';
      case 'corespondenta': return '✉️';
      default: return '📁';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'facturi': return 'bg-green-100 text-green-800';
      case 'procese-verbale': return 'bg-blue-100 text-blue-800';
      case 'regulamente': return 'bg-purple-100 text-purple-800';
      case 'contracte': return 'bg-orange-100 text-orange-800';
      case 'corespondenta': return 'bg-pink-100 text-pink-800';
      default: return 'bg-white text-white';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Se incarca documentele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white">Lista Documente</h3>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cauta documente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
          >
            <option value="all">Toate categoriile</option>
            <option value="facturi">Facturi</option>
            <option value="procese-verbale">Procese Verbale</option>
            <option value="regulamente">Regulamente</option>
            <option value="contracte">Contracte</option>
            <option value="corespondenta">Corespondenta</option>
            <option value="altele">Altele</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-white text-lg">Nu au fost gasite documente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">
                    {getCategoryIcon(document.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-white">
                        {document.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                        {document.category}
                      </span>
                    </div>
                    
                    {document.description && (
                      <p className="text-white mb-2">
                        {document.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-white">
                      <span>📄 {document.file_name}</span>
                      <span>📏 {formatFileSize(document.file_size)}</span>
                      <span>📅 {formatDate(document.created_at)}</span>
                      <span>👤 {document.uploader_name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadDocument(document.file_path, document.file_name)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-sm"
                  >
                    Descarca
                  </button>
                  
                  <button
                    onClick={() => deleteDocument(document.id, document.file_path)}
                    className="px-3 py-1 bg-red-500/20 text-red-700 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm"
                  >
                    Sterge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}