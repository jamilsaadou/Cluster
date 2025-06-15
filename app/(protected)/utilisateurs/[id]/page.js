'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDetail() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    dateCreation: '2024-01-15T10:30:00Z',
    derniereConnexion: '2024-01-20T14:45:00Z',
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
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${params.id}`);
      
      if (!response.ok) {
        throw new Error('API not available');
      }
      
      const userData = await response.json();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.log('Using mock data - API not available');
      setUser(mockUser);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = user.statut === 'actif' ? 'inactif' : 'actif';
    const action = newStatus === 'actif' ? 'activer' : 'désactiver';
    
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) return;

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Update local state
      setUser(prev => ({ ...prev, statut: newStatus }));
      alert(`Utilisateur ${action === 'activer' ? 'activé' : 'désactivé'} avec succès`);
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      alert('Utilisateur supprimé avec succès');
      router.push('/utilisateurs');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'conseiller':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
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
    const roles = {
      'superadmin': 'Super Administrateur',
      'admin': 'Administrateur',
      'conseiller': 'Conseiller Agricole',
      'superviseur': 'Superviseur'
    };
    return roles[role] || role;
  };

  const getStatutLabel = (statut) => {
    const statuts = {
      'actif': 'Actif',
      'inactif': 'Inactif',
      'suspendu': 'Suspendu'
    };
    return statuts[statut] || statut;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des détails de l'utilisateur...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Erreur</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Utilisateur non trouvé</h3>
          <p className="text-gray-600 dark:text-gray-400">L'utilisateur demandé n'existe pas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/utilisateurs"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {user.prenom} {user.nom}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Détails de l'utilisateur
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link
              href={`/utilisateurs/edit/${user.id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </Link>
            
            <button
              onClick={handleToggleStatus}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm ${
                user.statut === 'actif'
                  ? 'text-orange-700 bg-orange-100 border border-orange-300 hover:bg-orange-200 focus:ring-orange-500'
                  : 'text-green-700 bg-green-100 border border-green-300 hover:bg-green-200 focus:ring-green-500'
              }`}
            >
              {user.statut === 'actif' ? 'Désactiver' : 'Activer'}
            </button>
            
            <button
              onClick={handleDeleteUser}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Informations générales */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-bold text-xl">
                {user.prenom.charAt(0)}{user.nom.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user.prenom} {user.nom}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <div className="flex space-x-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(user.statut)}`}>
                  {getStatutLabel(user.statut)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Téléphone</h3>
              <p className="text-gray-900 dark:text-gray-100">{user.telephone}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date de création</h3>
              <p className="text-gray-900 dark:text-gray-100">
                {new Date(user.dateCreation).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dernière connexion</h3>
              <p className="text-gray-900 dark:text-gray-100">
                {user.derniereConnexion 
                  ? new Date(user.derniereConnexion).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Jamais'
                }
              </p>
            </div>

            {user.role === 'conseiller' && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Spécialité</h3>
                  <p className="text-gray-900 dark:text-gray-100">{user.specialite || 'Non définie'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Expérience</h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {user.experience ? `${user.experience} année${user.experience > 1 ? 's' : ''}` : 'Non définie'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Régions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Régions assignées
          </h3>
          {user.regions && user.regions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.regions.map((region) => (
                <span
                  key={region.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {region.nom}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucune région assignée</p>
          )}
        </div>

        {/* Permissions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Permissions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(user.permissions || {}).map(([permission, hasPermission]) => (
              <div key={permission} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  hasPermission ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {hasPermission ? (
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                  {permission === 'sites' && 'Gestion des sites'}
                  {permission === 'activites' && 'Gestion des activités'}
                  {permission === 'rapports' && 'Accès aux rapports'}
                  {permission === 'utilisateurs' && 'Gestion des utilisateurs'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
