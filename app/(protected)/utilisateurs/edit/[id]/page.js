'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditUser() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    role: '',
    regionIds: [],
    statut: 'actif',
    specialite: '',
    experience: '',
    permissions: {
      sites: false,
      activites: false,
      rapports: false,
      utilisateurs: false
    }
  });

  const roles = [
    { value: 'superadmin', label: 'Super Administrateur' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'conseiller', label: 'Conseiller Agricole' },
    { value: 'superviseur', label: 'Superviseur' }
  ];

  const statuts = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'suspendu', label: 'Suspendu' }
  ];

  // Mock data fallback
  const mockUser = {
    id: parseInt(params.id),
    prenom: 'Ahmed',
    nom: 'Moussa',
    email: 'ahmed.moussa@example.com',
    telephone: '+227 90 12 34 56',
    role: 'admin',
    statut: 'actif',
    specialite: 'Irrigation',
    experience: 5,
    permissions: {
      sites: true,
      activites: true,
      rapports: true,
      utilisateurs: true
    },
    regions: [
      { id: 1, nom: 'Agadez' },
      { id: 2, nom: 'Tahoua' }
    ]
  };

  useEffect(() => {
    fetchRegions();
    fetchUser();
  }, [params.id]);

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
    } finally {
      setRegionsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${params.id}`);
      
      if (!response.ok) {
        throw new Error('API not available');
      }
      
      const userData = await response.json();
      setFormData({
        prenom: userData.prenom || '',
        nom: userData.nom || '',
        email: userData.email || '',
        telephone: userData.telephone || '',
        role: userData.role || '',
        regionIds: userData.regions ? userData.regions.map(r => r.id) : [],
        statut: userData.statut || 'actif',
        specialite: userData.specialite || '',
        experience: userData.experience || '',
        permissions: userData.permissions || {
          sites: false,
          activites: false,
          rapports: false,
          utilisateurs: false
        }
      });
    } catch (err) {
      console.log('Using mock data - API not available');
      setFormData({
        prenom: mockUser.prenom,
        nom: mockUser.nom,
        email: mockUser.email,
        telephone: mockUser.telephone,
        role: mockUser.role,
        regionIds: mockUser.regions.map(r => r.id),
        statut: mockUser.statut,
        specialite: mockUser.specialite,
        experience: mockUser.experience,
        permissions: mockUser.permissions
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permission = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.prenom.trim()) return false;
    if (!formData.nom.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.telephone.trim()) return false;
    if (!formData.role) return false;
    
    // Region validation - superadmins don't need specific regions
    if (formData.role !== 'superadmin' && formData.regionIds.length === 0) return false;
    
    // Additional validation for conseiller role
    if (formData.role === 'conseiller') {
      if (!formData.specialite?.trim()) return false;
      if (!formData.experience || formData.experience < 0) return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return false;
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        // For superadmins, assign all regions
        regionIds: formData.role === 'superadmin' ? regions.map(r => r.id) : formData.regionIds,
      };

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      alert('Utilisateur mis à jour avec succès !');
      router.push(`/utilisateurs/${params.id}`);
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des données de l'utilisateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href={`/utilisateurs/${params.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Modifier l'utilisateur
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Modifiez les informations et permissions de l'utilisateur
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8">
          {/* Informations personnelles */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Entrez le prénom"
                />
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Entrez le nom"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="exemple@email.com"
                />
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="+227 90 12 34 56"
                />
              </div>
            </div>
          </div>

          {/* Rôle et région */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Rôle et affectation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôle *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Sélectionner un rôle</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.role === 'superadmin' ? 'Régions (Toutes)' : 'Région *'}
                </label>
                {formData.role === 'superadmin' ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    Accès à toutes les régions
                  </div>
                ) : (
                  <select
                    id="regionId"
                    name="regionId"
                    value={formData.regionIds[0] || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        regionIds: e.target.value ? [parseInt(e.target.value)] : []
                      }));
                    }}
                    required
                    disabled={regionsLoading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
                  >
                    <option value="">Sélectionner une région</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.nom}
                      </option>
                    ))}
                  </select>
                )}
                {regionsLoading && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Chargement des régions...
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="statut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut *
                </label>
                <select
                  id="statut"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  {statuts.map((statut) => (
                    <option key={statut.value} value={statut.value}>
                      {statut.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conseiller-specific fields */}
            {formData.role === 'conseiller' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="specialite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Spécialité *
                  </label>
                  <input
                    type="text"
                    id="specialite"
                    name="specialite"
                    value={formData.specialite}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Ex: Irrigation, Cultures maraîchères, etc."
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expérience (années) *
                  </label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Nombre d'années d'expérience"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Permissions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Permissions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="permissions.sites"
                  name="permissions.sites"
                  checked={formData.permissions.sites}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="permissions.sites" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Gestion des sites
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="permissions.activites"
                  name="permissions.activites"
                  checked={formData.permissions.activites}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="permissions.activites" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Gestion des activités
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="permissions.rapports"
                  name="permissions.rapports"
                  checked={formData.permissions.rapports}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="permissions.rapports" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Accès aux rapports
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="permissions.utilisateurs"
                  name="permissions.utilisateurs"
                  checked={formData.permissions.utilisateurs}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="permissions.utilisateurs" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Gestion des utilisateurs
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href={`/utilisateurs/${params.id}`}
            className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </div>
      </form>
    </div>
  );
}
