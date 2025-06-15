'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterRegion, setFilterRegion] = useState('');

  const roles = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'conseiller', label: 'Conseiller Agricole' },
    { value: 'operateur', label: 'Opérateur' },
    { value: 'superviseur', label: 'Superviseur' }
  ];

  const statuts = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'suspendu', label: 'Suspendu' }
  ];

  // Mock data fallback when API is not available
  const mockUsers = [
    {
      id: 1,
      prenom: 'Ahmed',
      nom: 'Moussa',
      email: 'ahmed.moussa@example.com',
      telephone: '+227 90 12 34 56',
      role: 'admin',
      region: { id: 2, nom: 'Tahoua' },
      statut: 'actif',
      dateCreation: '2024-01-15',
      derniereConnexion: '2024-01-20'
    },
    {
      id: 2,
      prenom: 'Fatima',
      nom: 'Ibrahim',
      email: 'fatima.ibrahim@example.com',
      telephone: '+227 91 23 45 67',
      role: 'conseiller',
      region: { id: 3, nom: 'Tillaberi' },
      statut: 'actif',
      dateCreation: '2024-01-10',
      derniereConnexion: '2024-01-19'
    },
    {
      id: 3,
      prenom: 'Ousmane',
      nom: 'Garba',
      email: 'ousmane.garba@example.com',
      telephone: '+227 92 34 56 78',
      role: 'operateur',
      region: { id: 1, nom: 'Agadez' },
      statut: 'inactif',
      dateCreation: '2024-01-05',
      derniereConnexion: '2024-01-15'
    }
  ];

  useEffect(() => {
    fetchRegions();
    fetchUsers();
  }, [searchTerm, filterRole, filterStatut, filterRegion]);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole) params.append('role', filterRole);
      if (filterStatut) params.append('statut', filterStatut);
      if (filterRegion) params.append('regionId', filterRegion);

      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) throw new Error('API not available');
      
      const data = await response.json();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      console.log('Using mock data - API not available');
      // Filter mock data based on current filters
      let filteredMockUsers = mockUsers.filter(user => {
        const matchesSearch = !searchTerm || 
          user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = !filterRole || user.role === filterRole;
        const matchesStatut = !filterStatut || user.statut === filterStatut;
        const matchesRegion = !filterRegion || user.region.id.toString() === filterRegion;
        
        return matchesSearch && matchesRole && matchesStatut && matchesRegion;
      });
      
      setUsers(filteredMockUsers);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'conseiller':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'operateur':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'superviseur':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactif':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspendu':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getStatutLabel = (statut) => {
    const statutObj = statuts.find(s => s.value === statut);
    return statutObj ? statutObj.label : statut;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Gestion des utilisateurs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les comptes utilisateurs et leurs permissions
            </p>
          </div>
          <Link
            href="/utilisateurs/add"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un utilisateur
          </Link>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Nom, prénom, email..."
              />
            </div>
            <div>
              <label htmlFor="filterRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle
              </label>
              <select
                id="filterRole"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Tous les rôles</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Tous les statuts</option>
                {statuts.map((statut) => (
                  <option key={statut.value} value={statut.value}>
                    {statut.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterRegion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Région
              </label>
              <select
                id="filterRegion"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                disabled={regionsLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
              >
                <option value="">Toutes les régions</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('');
                  setFilterStatut('');
                  setFilterRegion('');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {users.length} utilisateur{users.length !== 1 ? 's' : ''} trouvé{users.length !== 1 ? 's' : ''}
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{error}</h3>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ease-in-out">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                            {user.prenom.charAt(0)}{user.nom.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {user.prenom} {user.nom}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(user.statut)}`}>
                        {getStatutLabel(user.statut)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Téléphone:</span> {user.telephone}
                      </div>
                      <div>
                        <span className="font-medium">Région:</span> {user.region?.nom || 'Non définie'}
                      </div>
                      <div>
                        <span className="font-medium">Créé le:</span> {new Date(user.dateCreation).toLocaleDateString('fr-FR')}
                      </div>
                      <div>
                        <span className="font-medium">Dernière connexion:</span> {user.derniereConnexion ? new Date(user.derniereConnexion).toLocaleDateString('fr-FR') : 'Jamais'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Link
                      href={`/utilisateurs/${user.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out"
                      title="Voir les détails"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/utilisateurs/edit/${user.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out"
                      title="Modifier"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 ease-in-out"
                      title="Supprimer"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && !loading && !error && (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucun utilisateur trouvé</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Aucun utilisateur ne correspond à vos critères de recherche.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
