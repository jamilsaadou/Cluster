'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BasicInfo from '../../../../components/sites/FormSections/BasicInfo';
import Location from '../../../../components/sites/FormSections/Location';
import Operators from '../../../../components/sites/FormSections/Operators';
import Systems from '../../../../components/sites/FormSections/Systems';
import Crops from '../../../../components/sites/FormSections/Crops';
import Photos from '../../../../components/sites/FormSections/Photos';

export default function EditSite() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id;
  
  const [formData, setFormData] = useState({
    basicInfo: { name: '' },
    location: { region: '', commune: '', village: '', area: '', coordinates: { lat: '', lng: '' } },
    operators: { men: 0, women: 0, youth: 0 },
    systems: { captureSystems: [], irrigationSystems: [] },
    crops: { types: [] },
    photos: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSite();
  }, [siteId]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sites/${siteId}`);
      
      if (response.ok) {
        const site = await response.json();
        
        // Transform site data to match form structure
        setFormData({
          basicInfo: { 
            name: site.nom || '' 
          },
          location: { 
            region: site.regionId?.toString() || '',
            commune: site.commune || '',
            village: site.village || '',
            area: site.superficie?.toString() || '',
            coordinates: {
              lat: site.coordonnees?.lat?.toString() || '',
              lng: site.coordonnees?.lng?.toString() || ''
            }
          },
          operators: { 
            men: site.operateurs?.hommes || 0,
            women: site.operateurs?.femmes || 0,
            youth: site.operateurs?.jeunes || 0
          },
          systems: { 
            captureSystems: site.systemes?.captureSystems || [],
            irrigationSystems: site.systemes?.irrigationSystems || []
          },
          crops: { 
            types: site.cultures?.types || []
          },
          photos: site.photos || []
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement du site');
      }
    } catch (error) {
      console.error('Error fetching site:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const validateForm = () => {
    if (!formData.basicInfo.name?.trim()) {
      alert('Le nom du site est obligatoire');
      return false;
    }
    
    if (!formData.location.region) {
      alert('La région est obligatoire');
      return false;
    }
    
    if (!formData.location.commune?.trim()) {
      alert('La commune est obligatoire');
      return false;
    }
    
    if (!formData.location.village?.trim()) {
      alert('Le village est obligatoire');
      return false;
    }
    
    if (!formData.location.area || Number(formData.location.area) <= 0) {
      alert('La superficie doit être un nombre positif');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Site modifié avec succès !');
        router.push('/sites');
      } else {
        alert(`Erreur: ${result.error || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      console.error('Error updating site:', error);
      alert('Erreur lors de la modification du site');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du site...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Modifier le site
          </h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Modifier le site
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modifiez les informations du site agricole
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8">
          {/* Informations de base */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <BasicInfo
              data={formData.basicInfo}
              onChange={(data) => handleSectionChange('basicInfo', data)}
            />
          </div>

          {/* Localisation */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Location
              data={formData.location}
              onChange={(data) => handleSectionChange('location', data)}
            />
          </div>

          {/* Opérateurs */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Operators
              data={formData.operators}
              onChange={(data) => handleSectionChange('operators', data)}
            />
          </div>

          {/* Systèmes */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Systems
              data={formData.systems}
              onChange={(data) => handleSectionChange('systems', data)}
            />
          </div>

          {/* Cultures */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Crops
              data={formData.crops}
              onChange={(data) => handleSectionChange('crops', data)}
            />
          </div>

          {/* Photos */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Photos
              data={formData.photos}
              onChange={(photos) => handleSectionChange('photos', photos)}
              title="Photos du site"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/sites/${siteId}`)}
            className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Modification...
              </div>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
