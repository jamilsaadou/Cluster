'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BasicInfo from '../../../components/sites/FormSections/BasicInfo';
import Location from '../../../components/sites/FormSections/Location';
import Operators from '../../../components/sites/FormSections/Operators';
import Systems from '../../../components/sites/FormSections/Systems';
import Crops from '../../../components/sites/FormSections/Crops';
import Photos from '../../../components/sites/FormSections/Photos';

export default function AddSite() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    basicInfo: {
      name: '',
    },
    location: {
      coordinates: { lat: '', lng: '' },
      region: '',
      commune: '',
      village: '',
      area: '',
    },
    operators: {
      men: '',
      women: '',
      youth: '',
    },
    systems: {
      captureSystems: [],
      irrigationSystems: [],
    },
    crops: {
      types: [],
    },
    photos: [],
  });

  const updateFormData = (section, data) => {
    if (section === 'photos') {
      // For photos, data is directly the array of photo URLs
      setFormData(prev => ({
        ...prev,
        [section]: data
      }));
    } else {
      // For other sections, merge the data object
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], ...data }
      }));
    }
  };

  const validateForm = () => {
    // Basic validation example: check required fields
    if (!formData.basicInfo.name.trim()) return false;
    if (!formData.location.region) return false;
    if (!formData.location.commune.trim()) return false;
    if (!formData.location.village.trim()) return false;
    if (!formData.location.area || Number(formData.location.area) <= 0) return false;
    if (!formData.operators.men && !formData.operators.women && !formData.operators.youth) return false;
    if (!formData.systems.captureSystems.length) return false;
    if (!formData.systems.irrigationSystems.length) return false;
    if (!formData.crops.types.length) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }

    try {
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Site créé avec succès !');
        // Redirect to sites list
        router.push('/sites');
      } else {
        alert(`Erreur: ${result.error || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erreur lors de la soumission du formulaire');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Ajouter un site
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Remplissez les informations ci-dessous pour ajouter un nouveau site
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <BasicInfo
              data={formData.basicInfo}
              onChange={(data) => updateFormData('basicInfo', data)}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Location
              data={formData.location}
              onChange={(data) => updateFormData('location', data)}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Operators
              data={formData.operators}
              onChange={(data) => updateFormData('operators', data)}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Systems
              data={formData.systems}
              onChange={(data) => updateFormData('systems', data)}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Crops
              data={formData.crops}
              onChange={(data) => updateFormData('crops', data)}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Photos
              data={formData.photos}
              onChange={(photos) => updateFormData('photos', photos)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/sites')}
            className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
