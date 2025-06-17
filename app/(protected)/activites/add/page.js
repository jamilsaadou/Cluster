'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Photos from '../../../components/sites/FormSections/Photos';

export default function AddActivity() {
  const [formData, setFormData] = useState({
    typeActivite: '',
    thematique: '',
    regionId: '',
    siteId: '',
    duree: '',
    geolocation: {
      latitude: '',
      longitude: ''
    },
    beneficiaires: {
      hommes: 0,
      femmes: 0,
      jeunes: 0
    },
    photos: [],
    commentaires: ''
  });

  const [regions, setRegions] = useState([]);
  const [sites, setSites] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);
  const router = useRouter();

  const typesActivite = [
    'Formation',
    'Sensibilisation',
    'Suivi technique',
    'Distribution de matériel',
    'Réunion',
    'Autre'
  ];

  const thematiques = [
    'Agriculture durable',
    'Irrigation',
    'Gestion des sols',
    'Protection des cultures',
    'Élevage',
    'Commercialisation',
    'Organisation des producteurs'
  ];

  useEffect(() => {
    fetchUserInfo();
    fetchRegions();
  }, []);

  useEffect(() => {
    if (userRole === 'conseiller') {
      // For conseillers, load their assigned sites directly
      fetchSites();
    } else if (formData.regionId) {
      // For other users, load sites by region
      fetchSites(formData.regionId);
    } else {
      setSites([]);
      setFormData(prev => ({ ...prev, siteId: '' }));
    }
  }, [formData.regionId, userRole]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

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

  const fetchSites = async (regionId) => {
    try {
      setLoadingSites(true);
      // For conseillers, fetch all their assigned sites (no region filter needed as API handles this)
      // For other users, filter by region
      const url = regionId ? `/api/sites?regionId=${regionId}` : '/api/sites';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSites(data.sites || []);
      } else {
        console.error('Error fetching sites');
        setSites([]);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
    } finally {
      setLoadingSites(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      if (name === 'siteId' && userRole === 'conseiller') {
        // For conseillers, auto-fill region when site is selected
        const selectedSite = sites.find(site => site.id === parseInt(value));
        if (selectedSite) {
          setFormData(prev => ({
            ...prev,
            [name]: value,
            regionId: selectedSite.regionId.toString()
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: value
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            geolocation: {
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString()
            }
          }));
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible d\'obtenir la position. Veuillez vérifier vos paramètres de localisation.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  const validateForm = () => {
    if (!formData.typeActivite) return false;
    if (!formData.thematique) return false;
    if (!formData.regionId) return false;
    if (!formData.siteId) return false;
    if (!formData.duree || Number(formData.duree) <= 0) return false;
    if (!formData.geolocation.latitude || !formData.geolocation.longitude) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }

    try {
      const response = await fetch('/api/activites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Activité créée avec succès !');
        // Reset form
        setFormData({
          typeActivite: '',
          thematique: '',
          regionId: '',
          siteId: '',
          duree: '',
          geolocation: {
            latitude: '',
            longitude: ''
          },
          beneficiaires: {
            hommes: 0,
            femmes: 0,
            jeunes: 0
          },
          photos: [],
          commentaires: ''
        });
        // Optionally redirect to activities list
        // router.push('/activites');
      } else {
        alert(`Erreur: ${result.error || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erreur lors de la soumission du formulaire');
    }
  };

  const totalBeneficiaires =
    Number(formData.beneficiaires.hommes) +
    Number(formData.beneficiaires.femmes);

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Ajouter une activité
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Remplissez les informations ci-dessous pour enregistrer une nouvelle activité
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8">
          {/* Type d'activité et Thématique */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Informations générales
            </h3>
            
            <div className="grid gap-6">
              <div>
                <label htmlFor="typeActivite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type d'activité *
                </label>
                <select
                  id="typeActivite"
                  name="typeActivite"
                  value={formData.typeActivite}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Sélectionner un type</option>
                  {typesActivite.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="thematique" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thématique *
                </label>
                <select
                  id="thematique"
                  name="thematique"
                  value={formData.thematique}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Sélectionner une thématique</option>
                  {thematiques.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Localisation
            </h3>
            
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRole === 'conseiller' ? (
                  // For conseillers, show site first, then region (auto-filled)
                  <>
                    <div>
                      <label htmlFor="siteId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site concerné *
                      </label>
                      <select
                        id="siteId"
                        name="siteId"
                        value={formData.siteId}
                        onChange={handleChange}
                        required
                        disabled={loadingSites}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
                      >
                        <option value="">
                          {loadingSites ? 'Chargement des sites...' : 'Sélectionner un site'}
                        </option>
                        {sites.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.nom} - {site.commune}, {site.village}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {sites.length} site(s) qui vous sont attribué(s)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="regionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Région *
                      </label>
                      <select
                        id="regionId"
                        name="regionId"
                        value={formData.regionId}
                        onChange={handleChange}
                        required
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
                      >
                        <option value="">Sélectionnez d'abord un site</option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.nom}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Région automatiquement remplie selon le site
                      </p>
                    </div>
                  </>
                ) : (
                  // For other users, show region first, then site
                  <>
                    <div>
                      <label htmlFor="regionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Région *
                      </label>
                      <select
                        id="regionId"
                        name="regionId"
                        value={formData.regionId}
                        onChange={handleChange}
                        required
                        disabled={loadingRegions}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
                      >
                        <option value="">
                          {loadingRegions ? 'Chargement des régions...' : 'Sélectionner une région'}
                        </option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="siteId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site concerné *
                      </label>
                      <select
                        id="siteId"
                        name="siteId"
                        value={formData.siteId}
                        onChange={handleChange}
                        required
                        disabled={loadingSites || !formData.regionId}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
                      >
                        <option value="">
                          {loadingSites ? 'Chargement des sites...' : 'Sélectionner un site'}
                        </option>
                        {sites.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.nom}
                          </option>
                        ))}
                      </select>
                      {formData.regionId && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {sites.length} site(s) disponible(s)
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durée (heures) *
                  </label>
                  <input
                    type="number"
                    id="duree"
                    name="duree"
                    value={formData.duree}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Ex: 2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Géolocalisation *
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleGeolocation}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200 ease-in-out flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Détecter ma position</span>
                    </button>
                  </div>
                  {(formData.geolocation.latitude && formData.geolocation.longitude) && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Position: {formData.geolocation.latitude}, {formData.geolocation.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bénéficiaires */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Bénéficiaires
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="beneficiaires.hommes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre d'hommes
                </label>
                <input
                  type="number"
                  id="beneficiaires.hommes"
                  name="beneficiaires.hommes"
                  value={formData.beneficiaires.hommes}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label htmlFor="beneficiaires.femmes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de femmes
                </label>
                <input
                  type="number"
                  id="beneficiaires.femmes"
                  name="beneficiaires.femmes"
                  value={formData.beneficiaires.femmes}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label htmlFor="beneficiaires.jeunes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de jeunes
                </label>
                <input
                  type="number"
                  id="beneficiaires.jeunes"
                  name="beneficiaires.jeunes"
                  value={formData.beneficiaires.jeunes}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre total de bénéficiaires: {totalBeneficiaires}
              </p>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Photos
            </h3>
            <Photos
              data={formData.photos}
              onChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
              title="Photos de l'activité"
            />
          </div>

          {/* Commentaires */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Commentaires / Détails
            </h3>
            
            <div>
              <textarea
                id="commentaires"
                name="commentaires"
                value={formData.commentaires}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Ajoutez des détails supplémentaires sur l'activité..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
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
