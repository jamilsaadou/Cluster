'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchSites();
    fetchCurrentUser();
  }, []);

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

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sites?limit=100'); // Fetch more sites at once
      
      if (response.ok) {
        const data = await response.json();
        // Handle both old format (array) and new format (object with sites array)
        setSites(data.sites || data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement des sites');
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    router.push(`/sites/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const site = sites.find(s => s.id === id);
    const siteName = site ? site.nom : `Site ${id}`;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le site "${siteName}" ?\n\nCette action est irréversible.`)) {
      try {
        const response = await fetch(`/api/sites/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSites(sites.filter(site => site.id !== id));
          alert(`Site "${siteName}" supprimé avec succès`);
        } else {
          const errorData = await response.json();
          
          // Handle specific error cases
          if (errorData.activitiesCount && errorData.activitiesCount > 0) {
            const activitiesText = errorData.activitiesCount === 1 ? 'activité' : 'activités';
            const message = `Impossible de supprimer le site "${siteName}".\n\n` +
              `Ce site contient ${errorData.activitiesCount} ${activitiesText} qui doivent être supprimées en premier.\n\n` +
              `Voulez-vous aller à la page des activités pour les gérer ?`;
            
            if (confirm(message)) {
              router.push('/activites');
            }
          } else {
            alert(`Erreur lors de la suppression du site "${siteName}":\n\n${errorData.error || errorData.detail || 'Erreur inconnue'}`);
          }
        }
      } catch (error) {
        console.error('Error deleting site:', error);
        alert(`Erreur de connexion lors de la suppression du site "${siteName}"`);
      }
    }
  };

  const handleView = (id) => {
    router.push(`/sites/${id}`);
  };

  const handleAddSite = () => {
    router.push('/sites/add');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Sites Agricoles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestion et suivi des exploitations agricoles
        </p>
      </div>

      {/* Add New Site Button - Only for admin and superadmin */}
      {currentUser && ['admin', 'superadmin'].includes(currentUser.role) && (
        <div className="mb-6">
          <button 
            onClick={handleAddSite}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            + Ajouter un site
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des sites...</p>
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

      {/* Desktop Table View */}
      {!loading && !error && (
        <div className="hidden lg:block">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Superficie
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Exploitants
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Systèmes
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sites.map((site) => (
                    <tr key={site.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {site.nom}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="font-medium">{site.region?.nom}</div>
                          <div className="text-xs text-gray-500">{site.commune}, {site.village}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {site.superficie} ha
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {site.operateurs?.hommes || 0} H
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-3.866 0-7 1.79-7 4v2h14v-2c0-2.21-3.134-4-7-4z" />
                              </svg>
                              {site.operateurs?.femmes || 0} F
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {site.operateurs?.jeunes || 0} J
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Total: {(site.operateurs?.hommes || 0) + (site.operateurs?.femmes || 0) + (site.operateurs?.jeunes || 0)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="font-medium">Irrigation:</span> {site.systemes?.irrigationSystems?.join(', ') || 'N/A'}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Captage:</span> {site.systemes?.captureSystems?.join(', ') || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleView(site.id)}
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded transition-colors"
                            title="Voir"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {currentUser && ['admin', 'superadmin'].includes(currentUser.role) && (
                            <>
                              <button
                                onClick={() => handleEdit(site.id)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                                title="Modifier"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(site.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                                title="Supprimer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Card View */}
      {!loading && !error && (
        <div className="lg:hidden space-y-4">
          {sites.map((site) => (
            <div key={site.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {site.nom}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(site.id)}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  {currentUser && ['admin', 'superadmin'].includes(currentUser.role) && (
                    <>
                      <button
                        onClick={() => handleEdit(site.id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(site.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Région:</span>
                  <p className="text-gray-900 dark:text-gray-100">{site.region?.nom}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Localisation:</span>
                  <p className="text-gray-900 dark:text-gray-100">{site.commune}, {site.village}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Superficie:</span>
                  <p className="text-gray-900 dark:text-gray-100">{site.superficie} ha</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Exploitants:</span>
                  <div className="space-y-1 mt-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {site.operateurs?.hommes || 0} hommes
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                        {site.operateurs?.femmes || 0} femmes
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {site.operateurs?.jeunes || 0} jeunes
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Total: {(site.operateurs?.hommes || 0) + (site.operateurs?.femmes || 0) + (site.operateurs?.jeunes || 0)}
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Systèmes:</span>
                  <div className="mt-1 space-y-1">
                    <p className="text-gray-900 dark:text-gray-100">
                      <span className="text-xs font-medium">Irrigation:</span> {site.systemes?.irrigationSystems?.join(', ') || 'N/A'}
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      <span className="text-xs font-medium">Captage:</span> {site.systemes?.captureSystems?.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && sites.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Aucun site agricole
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {currentUser && ['admin', 'superadmin'].includes(currentUser.role) 
              ? 'Commencez par ajouter votre premier site agricole.'
              : 'Aucun site agricole n\'est disponible pour le moment.'
            }
          </p>
          {currentUser && ['admin', 'superadmin'].includes(currentUser.role) && (
            <button 
              onClick={handleAddSite}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              + Ajouter un site
            </button>
          )}
        </div>
      )}
    </div>
  );
}
