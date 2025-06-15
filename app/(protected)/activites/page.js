'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fonction pour générer le contenu HTML pour l'impression
  const generatePrintContent = (activity) => {
    const getStatutLabel = (statut) => {
      const statuts = [
        { value: 'approuve', label: 'Approuvé' },
        { value: 'rejete', label: 'Rejeté' },
        { value: 'en_attente', label: 'En attente' }
      ];
      const statutObj = statuts.find(s => s.value === statut);
      return statutObj ? statutObj.label : statut;
    };

    const photosHtml = activity.photos && activity.photos.length > 0 
      ? activity.photos.map((photo, index) => {
          if (!photo || typeof photo !== 'string' || photo.trim() === '') return '';
          
          const cleanPhoto = photo.trim();
          let imageUrl;
          if (cleanPhoto.startsWith('/api/images/')) {
            imageUrl = cleanPhoto;
          } else {
            imageUrl = `/api/images/${encodeURIComponent(cleanPhoto)}`;
          }
          
          return `
            <div style="display: inline-block; margin: 10px; text-align: center;">
              <img src="${window.location.origin}${imageUrl}" 
                   alt="Photo ${index + 1}" 
                   style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;" 
                   onerror="this.style.display='none'" />
              <p style="margin: 5px 0; font-size: 12px; color: #666;">Photo ${index + 1}</p>
            </div>
          `;
        }).join('')
      : '<p style="color: #666; font-style: italic;">Aucune photo disponible</p>';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Activité - ${activity.type}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #10b981;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #10b981;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0 0 0;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #374151;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #4b5563;
              display: block;
              margin-bottom: 2px;
            }
            .info-value {
              color: #111827;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-approuve {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-rejete {
              background-color: #fee2e2;
              color: #991b1b;
            }
            .status-en_attente {
              background-color: #fef3c7;
              color: #92400e;
            }
            .beneficiaires-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              text-align: center;
              margin: 15px 0;
            }
            .beneficiaire-item {
              padding: 10px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            .beneficiaire-number {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .beneficiaire-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
            }
            .photos-section {
              page-break-inside: avoid;
            }
            .photos-grid {
              text-align: center;
              margin: 20px 0;
            }
            .comments {
              background-color: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #10b981;
              white-space: pre-wrap;
            }
            .total-beneficiaires {
              text-align: center;
              padding: 10px;
              background-color: #f3f4f6;
              border-radius: 8px;
              margin-top: 15px;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport d'Activité</h1>
            <p>SuiviCluster - Gestion des Sites Agricoles</p>
          </div>

          <div class="section">
            <h2>Informations Générales</h2>
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <span class="info-label">Type d'activité :</span>
                  <span class="info-value">${activity.type}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Thématique :</span>
                  <span class="info-value">${activity.thematique}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Durée :</span>
                  <span class="info-value">${activity.duree} heures</span>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <span class="info-label">Statut :</span>
                  <span class="status-badge status-${activity.statut}">${getStatutLabel(activity.statut)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date de création :</span>
                  <span class="info-value">${new Date(activity.dateCreation).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Renseigné par :</span>
                  <span class="info-value">${activity.createdBy ? `${activity.createdBy.prenom} ${activity.createdBy.nom}` : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Localisation</h2>
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <span class="info-label">Région :</span>
                  <span class="info-value">${activity.region?.nom || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Site :</span>
                  <span class="info-value">${activity.site?.nom || 'N/A'}</span>
                </div>
              </div>
              <div>
                ${activity.geolocalisation ? `
                  <div class="info-item">
                    <span class="info-label">Coordonnées GPS :</span>
                    <span class="info-value">${activity.geolocalisation.lat}, ${activity.geolocalisation.lng}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Bénéficiaires</h2>
            <div class="beneficiaires-grid">
              <div class="beneficiaire-item">
                <div class="beneficiaire-number" style="color: #2563eb;">${activity.beneficiaires?.hommes || 0}</div>
                <div class="beneficiaire-label">Hommes</div>
              </div>
              <div class="beneficiaire-item">
                <div class="beneficiaire-number" style="color: #ec4899;">${activity.beneficiaires?.femmes || 0}</div>
                <div class="beneficiaire-label">Femmes</div>
              </div>
              <div class="beneficiaire-item">
                <div class="beneficiaire-number" style="color: #10b981;">${activity.beneficiaires?.jeunes || 0}</div>
                <div class="beneficiaire-label">Jeunes</div>
              </div>
            </div>
            <div class="total-beneficiaires">
              Total : ${(activity.beneficiaires?.hommes || 0) + (activity.beneficiaires?.femmes || 0)} bénéficiaires
            </div>
          </div>

          ${activity.photos && activity.photos.length > 0 ? `
            <div class="section photos-section">
              <h2>Photos (${activity.photos.length})</h2>
              <div class="photos-grid">
                ${photosHtml}
              </div>
            </div>
          ` : ''}

          ${activity.commentaires ? `
            <div class="section">
              <h2>Commentaires</h2>
              <div class="comments">${activity.commentaires}</div>
            </div>
          ` : ''}

          <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </body>
      </html>
    `;
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchActivities();
    fetchRegions();
    fetchCurrentUser();
  }, []);

  // Refetch activities when filters change
  useEffect(() => {
    fetchActivities();
  }, [filterRegion, filterType, filterStatut]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRegion) params.append('regionId', filterRegion);
      if (filterStatut) params.append('statut', filterStatut);

      const response = await fetch(`/api/activites?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement des activités');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/regions');
      if (response.ok) {
        const regionsData = await response.json();
        setRegions(regionsData);
      } else {
        console.error('Failed to fetch regions');
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        console.error('Failed to fetch current user');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };
  const types = ['Formation', 'Sensibilisation', 'Suivi technique', 'Distribution de matériel', 'Réunion', 'Autre'];
  const statuts = [
    { value: 'approuve', label: 'Approuvé' },
    { value: 'rejete', label: 'Rejeté' },
    { value: 'en_attente', label: 'En attente' }
  ];

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'approuve':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatutLabel = (statut) => {
    const statutObj = statuts.find(s => s.value === statut);
    return statutObj ? statutObj.label : statut;
  };

  const handleViewActivity = async (activityId) => {
    try {
      const response = await fetch(`/api/activites/${activityId}`);
      if (response.ok) {
        const activity = await response.json();
        console.log('Activity loaded:', activity); // Debug log
        console.log('Photos:', activity.photos); // Debug log for photos
        setSelectedActivity(activity);
        setShowModal(true);
      } else {
        alert('Erreur lors du chargement de l\'activité');
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      alert('Erreur de connexion');
    }
  };

  const handleApproveActivity = async (activityId, newStatus) => {
    try {
      const response = await fetch(`/api/activites/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: newStatus }),
      });

      if (response.ok) {
        // Update the activity in the list
        setActivities(activities.map(activity => 
          activity.id === activityId 
            ? { ...activity, statut: newStatus }
            : activity
        ));
        alert(`Activité ${newStatus === 'approuve' ? 'approuvée' : 'rejetée'} avec succès`);
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error || 'Impossible de modifier le statut'}`);
      }
    } catch (error) {
      console.error('Error updating activity status:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.thematique.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.site?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = !filterRegion || activity.region.id.toString() === filterRegion;
    const matchesType = !filterType || activity.type === filterType;
    const matchesStatut = !filterStatut || activity.statut === filterStatut;
    
    return matchesSearch && matchesRegion && matchesType && matchesStatut;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Activités
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez les activités réalisées sur les différents sites
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/activites/export');
                    if (!response.ok) throw new Error('Erreur lors de l\'exportation');
                    
                    // Récupérer le blob
                    const blob = await response.blob();
                    
                    // Créer un lien de téléchargement
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'activites.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    
                    // Nettoyer
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('Error exporting activities:', error);
                    alert('Erreur lors de l\'exportation des activités');
                  }
                }}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exporter en Excel
              </button>
              <Link
                href="/activites/add"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter une activité
              </Link>
            </div>
          </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Type, thématique, site..."
              />
            </div>
            <div>
              <label htmlFor="filterRegion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Région
              </label>
              <select
                id="filterRegion"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
              >
                <option value="">Toutes les régions</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type d'activité
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Tous les types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterStatut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                id="filterStatut"
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Tous les statuts</option>
                {statuts.map((statut) => (
                  <option key={statut.value} value={statut.value}>
                    {statut.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRegion('');
                  setFilterType('');
                  setFilterStatut('');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des activités...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {filteredActivities.length} activité{filteredActivities.length !== 1 ? 's' : ''} trouvée{filteredActivities.length !== 1 ? 's' : ''}
            </h3>
          </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ease-in-out">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {activity.type}
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      {activity.thematique}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(activity.statut)}`}>
                      {getStatutLabel(activity.statut)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Site:</span> {activity.site?.nom || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Région:</span> {activity.region?.nom || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Durée:</span> {activity.duree}h
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(activity.dateCreation).toLocaleDateString('fr-FR')}
                    </div>
                    <div>
                      <span className="font-medium">Renseigné par:</span> {activity.createdBy ? `${activity.createdBy.prenom} ${activity.createdBy.nom}` : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Bénéficiaires:</span> {' '}
                      {(activity.beneficiaires?.hommes || 0) + (activity.beneficiaires?.femmes || 0)}
                      {' '}({activity.beneficiaires?.hommes || 0} H, {activity.beneficiaires?.femmes || 0} F, {activity.beneficiaires?.jeunes || 0} J)
                    </div>
                    <div>
                      <span className="font-medium">Photos:</span> Voir détails
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 ml-4">
                  {/* Bouton Consulter */}
                  <button
                    onClick={() => handleViewActivity(activity.id)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors duration-200 ease-in-out"
                    title="Consulter l'activité"
                  >
                    Consulter
                  </button>
                  
                  {/* Bouton Modifier (pour les conseillers sur leurs activités en attente) */}
                  {activity.statut === 'en_attente' && currentUser && currentUser.role === 'conseiller' && activity.createdBy?.id === currentUser.userId && (
                    <Link
                      href={`/activites/edit/${activity.id}`}
                      className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 rounded-lg transition-colors duration-200 ease-in-out"
                      title="Modifier l'activité"
                    >
                      Modifier
                    </Link>
                  )}
                  
                  {/* Boutons d'approbation (seulement pour les activités en attente et les admin/superadmin/superviseur) */}
                  {activity.statut === 'en_attente' && currentUser && ['admin', 'superadmin', 'superviseur'].includes(currentUser.role) && (
                    // Pour les superviseurs, vérifier qu'ils sont dans la bonne région
                    currentUser.role !== 'superviseur' || (currentUser.regions && currentUser.regions.includes(activity.region?.id))
                  ) && (
                    <>
                      <button
                        onClick={() => handleApproveActivity(activity.id, 'approuve')}
                        className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-lg transition-colors duration-200 ease-in-out"
                        title="Approuver l'activité"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleApproveActivity(activity.id, 'rejete')}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors duration-200 ease-in-out"
                        title="Rejeter l'activité"
                      >
                        Rejeter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucune activité trouvée</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Aucune activité ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
        </div>
      )}

      {/* Modal de consultation d'activité */}
      {showModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Détails de l'activité
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations générales */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                    Informations générales
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Type d'activité</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedActivity.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Thématique</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedActivity.thematique}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Durée</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedActivity.duree} heures</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Statut</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(selectedActivity.statut)}`}>
                      {getStatutLabel(selectedActivity.statut)}
                    </span>
                  </div>
                </div>

                {/* Localisation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                    Localisation
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Région</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedActivity.region?.nom}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Site</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedActivity.site?.nom}</p>
                  </div>
                  {selectedActivity.geolocalisation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Coordonnées GPS</label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {selectedActivity.geolocalisation.lat}, {selectedActivity.geolocalisation.lng}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bénéficiaires */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                    Bénéficiaires
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedActivity.beneficiaires?.hommes || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Hommes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-pink-600">{selectedActivity.beneficiaires?.femmes || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Femmes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedActivity.beneficiaires?.jeunes || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Jeunes</p>
                    </div>
                  </div>
                  <div className="text-center pt-2 border-t">
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Total: {(selectedActivity.beneficiaires?.hommes || 0) + (selectedActivity.beneficiaires?.femmes || 0)}
                    </p>
                  </div>
                </div>

                {/* Informations de création */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                    Informations de création
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Renseigné par</label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedActivity.createdBy ? `${selectedActivity.createdBy.prenom} ${selectedActivity.createdBy.nom}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Date de création</label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(selectedActivity.dateCreation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Photos</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedActivity.photos?.length || 0} photo(s)</p>
                  </div>
                </div>
              </div>

              {/* Photos - Section toujours visible */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 mb-4">
                  Photos {selectedActivity.photos && selectedActivity.photos.length > 0 ? `(${selectedActivity.photos.length})` : '(0)'}
                </h3>
                
                {selectedActivity.photos && selectedActivity.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedActivity.photos.map((photo, index) => {
                      // Validate photo data
                      if (!photo || typeof photo !== 'string' || photo.trim() === '') {
                        console.warn(`Invalid photo data at index ${index}:`, photo);
                        return null;
                      }

                      // Clean the photo filename and handle both formats
                      const cleanPhoto = photo.trim();
                      
                      // Check if photo already contains the full path
                      let imageUrl;
                      if (cleanPhoto.startsWith('/api/images/')) {
                        // Photo already contains full path
                        imageUrl = cleanPhoto;
                      } else {
                        // Photo is just filename, construct full path
                        imageUrl = `/api/images/${encodeURIComponent(cleanPhoto)}`;
                      }
                      
                      console.log(`Photo ${index + 1}:`, cleanPhoto, '-> URL:', imageUrl);
                      
                      return (
                        <div key={index} className="relative group">
                          <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`Photo ${index + 1} de l'activité`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity duration-200"
                              onClick={() => {
                                try {
                                  // Ouvrir l'image en grand
                                  const newWindow = window.open();
                                  if (newWindow) {
                                    newWindow.document.write(`
                                      <html>
                                        <head><title>Photo ${index + 1}</title></head>
                                        <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                                          <img src="${imageUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="Photo ${index + 1}" />
                                        </body>
                                      </html>
                                    `);
                                  }
                                } catch (error) {
                                  console.error('Error opening image in new window:', error);
                                }
                              }}
                              onLoad={(e) => {
                                console.log(`Image ${index + 1} loaded successfully`);
                              }}
                              onError={(e) => {
                                console.error(`Error loading image ${index + 1}:`, cleanPhoto);
                                // Replace with error placeholder
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20';
                                errorDiv.innerHTML = `
                                  <div class="text-center">
                                    <svg class="mx-auto h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p class="text-xs text-red-600 mt-1">Image non trouvée</p>
                                  </div>
                                `;
                                e.target.parentElement.replaceChild(errorDiv, e.target);
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Aucune photo disponible pour cette activité
                    </p>
                  </div>
                )}
              </div>

              {/* Commentaires */}
              {selectedActivity.commentaires && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 mb-4">
                    Commentaires
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {selectedActivity.commentaires}
                    </p>
                  </div>
                </div>
              )}

              {/* Bouton d'impression */}
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    // Créer une nouvelle fenêtre pour l'impression
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      const printContent = generatePrintContent(selectedActivity);
                      printWindow.document.write(printContent);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                      printWindow.close();
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Imprimer en PDF</span>
                </button>
                
                {/* Actions d'approbation (seulement pour les admin/superadmin/superviseur) */}
                {selectedActivity.statut === 'en_attente' && currentUser && ['admin', 'superadmin', 'superviseur'].includes(currentUser.role) && (
                  // Pour les superviseurs, vérifier qu'ils sont dans la bonne région
                  currentUser.role !== 'superviseur' || (currentUser.regions && currentUser.regions.includes(selectedActivity.region?.id))
                ) && (
                  <>
                    <button
                      onClick={() => {
                        handleApproveActivity(selectedActivity.id, 'approuve');
                        setShowModal(false);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      Approuver l'activité
                    </button>
                    <button
                      onClick={() => {
                        handleApproveActivity(selectedActivity.id, 'rejete');
                        setShowModal(false);
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Rejeter l'activité
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
