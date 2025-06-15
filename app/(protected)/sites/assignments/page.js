'use client';

import { useState, useEffect } from 'react';

export default function SiteAssignments() {
  const [conseillers, setConseillers] = useState([]);
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedConseiller, setSelectedConseiller] = useState('');
  const [selectedConseillerData, setSelectedConseillerData] = useState(null);
  const [selectedSites, setSelectedSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const [assignmentsPagination, setAssignmentsPagination] = useState(null);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch conseillers
      const conseillersResponse = await fetch('/api/users?role=conseiller');
      if (conseillersResponse.ok) {
        const conseillersData = await conseillersResponse.json();
        setConseillers(conseillersData.users || []);
      }

      // Fetch all sites
      const sitesResponse = await fetch('/api/sites?limit=1000');
      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json();
        setSites(sitesData.sites || []);
      }

      // Fetch assignments with pagination
      await fetchAssignments();
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (page = 1) => {
    try {
      setLoadingAssignments(true);
      const assignmentsResponse = await fetch(`/api/sites/assignments?page=${page}&limit=50`);
      
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        
        if (page === 1) {
          // First page - replace assignments
          setAssignments(assignmentsData.assignments || []);
        } else {
          // Additional pages - append to existing assignments
          setAssignments(prev => [...prev, ...(assignmentsData.assignments || [])]);
        }
        
        setAssignmentsPagination(assignmentsData.pagination);
        setAssignmentsPage(page);
      } else {
        // Handle error response
        const errorData = await assignmentsResponse.json();
        console.error('Error fetching assignments:', errorData);
        
        if (assignmentsResponse.status === 500) {
          // Likely the MySQL memory error - show user-friendly message
          alert('Trop de données à charger. Veuillez contacter l\'administrateur système.');
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      alert('Erreur lors du chargement des attributions.');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadMoreAssignments = () => {
    if (assignmentsPagination && assignmentsPage < assignmentsPagination.totalPages) {
      fetchAssignments(assignmentsPage + 1);
    }
  };

  const handleConseillerChange = async (conseillerId) => {
    setSelectedConseiller(conseillerId);
    setSelectedSites([]);
    setSelectedConseillerData(null);
    setFilteredSites([]);

    if (conseillerId) {
      try {
        // Récupérer les données du conseiller avec ses régions
        const conseillerResponse = await fetch(`/api/users/${conseillerId}`);
        if (conseillerResponse.ok) {
          const conseillerData = await conseillerResponse.json();
          setSelectedConseillerData(conseillerData.user);
          
          // Filtrer les sites selon les régions du conseiller
          const conseillerRegionIds = conseillerData.user.regions?.map(region => region.id) || [];
          const sitesInConseillerRegions = sites.filter(site => 
            conseillerRegionIds.includes(site.regionId)
          );
          setFilteredSites(sitesInConseillerRegions);
        }

        // Récupérer les sites déjà attribués au conseiller
        const assignmentsResponse = await fetch(`/api/sites/assignments?userId=${conseillerId}`);
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setSelectedSites(assignmentsData.assignedSites.map(site => site.id));
        }
      } catch (error) {
        console.error('Error fetching conseiller data:', error);
        alert('Erreur lors du chargement des données du conseiller');
      }
    }
  };

  const handleSiteToggle = (siteId) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedConseiller) {
      alert('Veuillez sélectionner un conseiller');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/sites/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(selectedConseiller),
          siteIds: selectedSites
        }),
      });

      if (response.ok) {
        alert('Attributions mises à jour avec succès !');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getAssignedSitesForConseiller = (conseillerId) => {
    const assignedSites = [];
    assignments.forEach(site => {
      const assignedUser = site.assignedUsers.find(user => user.id === conseillerId);
      if (assignedUser) {
        assignedSites.push(site);
      }
    });
    return assignedSites;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Attribution des sites aux conseillers
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez l'attribution des sites aux conseillers agricoles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section d'attribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Attribuer des sites
          </h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="conseiller" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sélectionner un conseiller
              </label>
              <select
                id="conseiller"
                value={selectedConseiller}
                onChange={(e) => handleConseillerChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Choisir un conseiller...</option>
                {conseillers.map((conseiller) => (
                  <option key={conseiller.id} value={conseiller.id}>
                    {conseiller.prenom} {conseiller.nom} - {conseiller.email}
                  </option>
                ))}
              </select>
            </div>

            {selectedConseiller && (
              <div>
                {/* Informations sur le conseiller et ses régions */}
                {selectedConseillerData && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Conseiller sélectionné
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedConseillerData.prenom} {selectedConseillerData.nom}
                    </p>
                    {selectedConseillerData.regions && selectedConseillerData.regions.length > 0 ? (
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        Régions: {selectedConseillerData.regions.map(r => r.nom).join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        ⚠️ Aucune région attribuée à ce conseiller
                      </p>
                    )}
                  </div>
                )}

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sites disponibles dans les régions du conseiller
                  {filteredSites.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({filteredSites.length} site{filteredSites.length > 1 ? 's' : ''})
                    </span>
                  )}
                </label>

                {filteredSites.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-2">
                    {filteredSites.map((site) => (
                      <label key={site.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedSites.includes(site.id)}
                          onChange={() => handleSiteToggle(site.id)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {site.nom}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {site.commune}, {site.village} - {site.region?.nom}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {selectedConseillerData?.regions?.length > 0 
                        ? "Aucun site disponible dans les régions de ce conseiller"
                        : "Ce conseiller n'a aucune région attribuée. Veuillez d'abord lui attribuer une région."
                      }
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveAssignments}
                    disabled={saving || filteredSites.length === 0}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder les attributions'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vue d'ensemble des attributions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Vue d'ensemble des attributions
            </h2>
            {assignmentsPagination && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {assignments.length} / {assignmentsPagination.total} sites
              </div>
            )}
          </div>

          <div className="space-y-4">
            {conseillers.map((conseiller) => {
              const assignedSites = getAssignedSitesForConseiller(conseiller.id);
              return (
                <div key={conseiller.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {conseiller.prenom} {conseiller.nom}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {assignedSites.length} site(s)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {conseiller.email}
                  </p>
                  
                  {assignedSites.length > 0 ? (
                    <div className="space-y-1">
                      {assignedSites.map((site) => (
                        <div key={site.id} className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                          {site.nom} - {site.commune}, {site.village}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Aucun site attribué
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {assignmentsPagination && assignmentsPage < assignmentsPagination.totalPages && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMoreAssignments}
                disabled={loadingAssignments}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAssignments ? 'Chargement...' : 'Charger plus de sites'}
              </button>
            </div>
          )}

          {/* Warning message if data might be incomplete */}
          {assignmentsPagination && assignmentsPagination.total > 50 && assignmentsPage === 1 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Affichage de {assignments.length} sites sur {assignmentsPagination.total}. 
                Cliquez sur "Charger plus" pour voir tous les sites.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
