'use client';

import { useState, useEffect } from 'react';

export default function Location({ data, onChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoadingRegions(true);
      const response = await fetch('/api/regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      } else {
        console.error('Error fetching regions');
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      onChange({
        [parent]: {
          ...data[parent],
          [child]: value
        }
      });
    } else {
      onChange({ [name]: value });
    }
  };

  const getLocation = async () => {
    setIsLoading(true);
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        onChange({
          coordinates: {
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          }
        });
      } else {
        alert('La géolocalisation n\'est pas supportée par votre navigateur');
      }
    } catch (error) {
      alert('Erreur lors de la récupération de la position. Veuillez vérifier vos paramètres de localisation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Localisation
      </h3>
      
      <div className="grid gap-6">
        {/* GPS Coordinates with Auto-detect */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coordonnées GPS *</span>
            <button
              type="button"
              onClick={getLocation}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {isLoading ? 'Détection...' : 'Détecter ma position'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="coordinates.lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                id="coordinates.lat"
                name="coordinates.lat"
                value={data.coordinates?.lat || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out"
                placeholder="Ex: 13.5124"
              />
            </div>
            <div>
              <label htmlFor="coordinates.lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                id="coordinates.lng"
                name="coordinates.lng"
                value={data.coordinates?.lng || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out"
                placeholder="Ex: 2.1098"
              />
            </div>
          </div>
        </div>

        {/* Region */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Région *
          </label>
          <select
            id="region"
            name="region"
            value={data.region || ''}
            onChange={handleChange}
            required
            disabled={loadingRegions}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out disabled:opacity-50"
          >
            <option value="">
              {loadingRegions ? 'Chargement des régions...' : 'Sélectionnez une région'}
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Commune */}
        <div>
          <label htmlFor="commune" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Commune *
          </label>
          <input
            type="text"
            id="commune"
            name="commune"
            value={data.commune || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out"
            placeholder="Entrez le nom de la commune"
          />
        </div>

        {/* Village */}
        <div>
          <label htmlFor="village" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Village *
          </label>
          <input
            type="text"
            id="village"
            name="village"
            value={data.village || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out"
            placeholder="Entrez le nom du village"
          />
        </div>

        {/* Area */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Superficie (hectares) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            id="area"
            name="area"
            value={data.area || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out"
            placeholder="Ex: 12.5"
          />
        </div>
      </div>
    </div>
  );
}
