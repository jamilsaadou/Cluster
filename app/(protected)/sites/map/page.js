'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import dynamique de la carte pour éviter les erreurs SSR
const MapComponent = dynamic(() => import('../../../components/Map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Chargement de la carte...</p>
      </div>
    </div>
  )
});

export default function SitesMap() {
  const [sites, setSites] = useState([]);
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    showSites: true,
    showActivites: true,
    selectedRegion: '',
    selectedType: ''
  });
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les sites avec coordonnées
      const sitesResponse = await fetch('/api/sites?limit=1000');
      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json();
        // Filtrer seulement les sites avec coordonnées
        const sitesArray = sitesData.sites || [];
        const sitesWithCoords = Array.isArray(sitesArray) ? sitesArray.filter(site => 
          site.coordonnees && 
          site.coordonnees.lat && 
          site.coordonnees.lng
        ) : [];
        setSites(sitesWithCoords);
      }

      // Récupérer les activités avec géolocalisation
      const activitesResponse = await fetch('/api/activites?limit=1000');
      if (activitesResponse.ok) {
        const activitesData = await activitesResponse.json();
        // Filtrer seulement les activités avec géolocalisation
        // Note: L'API activités retourne directement un tableau, pas un objet avec une propriété 'activites'
        const activitesWithCoords = Array.isArray(activitesData) ? activitesData.filter(activite => 
          activite.geolocalisation && 
          activite.geolocalisation.lat && 
          activite.geolocalisation.lng
        ) : [];
        setActivites(activitesWithCoords);
      }

      // Récupérer les régions pour les filtres
      const regionsResponse = await fetch('/api/regions');
      if (regionsResponse.ok) {
        const regionsData = await regionsResponse.json();
        setRegions(regionsData.regions || []);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données de cartographie');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Filtrer les données selon les filtres actifs
  const filteredSites = sites.filter(site => {
    if (!filters.showSites) return false;
    if (filters.selectedRegion && site.regionId !== parseInt(filters.selectedRegion)) return false;
    return true;
  });

  const filteredActivites = activites.filter(activite => {
    if (!filters.showActivites) return false;
    if (filters.selectedRegion && activite.regionId !== parseInt(filters.selectedRegion)) return false;
    if (filters.selectedType && activite.type !== filters.selectedType) return false;
    return true;
  });

  // Types d'activités uniques pour le filtre
  const activityTypes = [...new Set(activites.map(a => a.type))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de la cartographie...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Cartographie des Sites et Activités
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualisation géographique des exploitations agricoles et des activités
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Filtres de visualisation
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Affichage des sites */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showSites"
              checked={filters.showSites}
              onChange={(e) => handleFilterChange('showSites', e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="showSites" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Afficher les sites ({filteredSites.length})
            </label>
          </div>

          {/* Affichage des activités */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showActivites"
              checked={filters.showActivites}
              onChange={(e) => handleFilterChange('showActivites', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showActivites" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Afficher les activités ({filteredActivites.length})
            </label>
          </div>

          {/* Filtre par région */}
          <div>
            <label htmlFor="regionFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Région
            </label>
            <select
              id="regionFilter"
              value={filters.selectedRegion}
              onChange={(e) => handleFilterChange('selectedRegion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Toutes les régions</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par type d'activité */}
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type d'activité
            </label>
            <select
              id="typeFilter"
              value={filters.selectedType}
              onChange={(e) => handleFilterChange('selectedType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Tous les types</option>
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sites géolocalisés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredSites.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Activités géolocalisées</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredActivites.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Régions couvertes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{regions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Carte */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Carte interactive
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Sites</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Activités</span>
              </div>
            </div>
          </div>
          
          <div className="h-96 lg:h-[600px] rounded-lg overflow-hidden">
            <MapComponent 
              sites={filteredSites}
              activites={filteredActivites}
              showSites={filters.showSites}
              showActivites={filters.showActivites}
            />
          </div>
        </div>
      </div>

      {/* Légende et informations */}
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Informations sur la carte
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Sites agricoles</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Les marqueurs verts représentent les exploitations agricoles avec leurs coordonnées GPS.
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Cliquez sur un marqueur pour voir les détails du site</li>
              <li>• Informations: nom, commune, village, superficie</li>
              <li>• Données sur les opérateurs et les systèmes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Activités</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Les marqueurs bleus représentent les activités géolocalisées.
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Formations, sensibilisations, etc.</li>
              <li>• Informations: type, thématique, durée</li>
              <li>• Données sur les bénéficiaires</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
