'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageModal from '../../../components/ImageModal';

export default function ViewSite() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id;
  
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: '',
    imageAlt: '',
    imageIndex: 0,
    images: []
  });

  useEffect(() => {
    fetchSite();
  }, [siteId]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sites/${siteId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSite(data);
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

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      try {
        const response = await fetch(`/api/sites/${siteId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Site supprimé avec succès');
          router.push('/sites');
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Impossible de supprimer le site'}`);
        }
      } catch (error) {
        console.error('Error deleting site:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Fonctions pour gérer le modal d'image
  const openImageModal = (photos, index) => {
    setImageModal({
      isOpen: true,
      imageUrl: photos[index] || '',
      imageAlt: `Photo ${index + 1} du site`,
      imageIndex: index,
      images: photos
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: '',
      imageAlt: '',
      imageIndex: 0,
      images: []
    });
  };

  const goToPreviousImage = () => {
    if (imageModal.imageIndex > 0) {
      const newIndex = imageModal.imageIndex - 1;
      setImageModal(prev => ({
        ...prev,
        imageIndex: newIndex,
        imageUrl: prev.images[newIndex],
        imageAlt: `Photo ${newIndex + 1} du site`
      }));
    }
  };

  const goToNextImage = () => {
    if (imageModal.imageIndex < imageModal.images.length - 1) {
      const newIndex = imageModal.imageIndex + 1;
      setImageModal(prev => ({
        ...prev,
        imageIndex: newIndex,
        imageUrl: prev.images[newIndex],
        imageAlt: `Photo ${newIndex + 1} du site`
      }));
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
            Détails du site
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

  if (!site) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Site non trouvé</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {site.nom}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Détails du site agricole
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/sites"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              ← Retour
            </Link>
            <Link
              href={`/sites/edit/${site.id}`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Informations générales */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b pb-2">
            Informations générales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Nom du site
              </label>
              <p className="text-gray-900 dark:text-gray-100 text-lg">{site.nom}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Superficie
              </label>
              <p className="text-gray-900 dark:text-gray-100 text-lg">{site.superficie} hectares</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Date de création
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {new Date(site.dateCreation).toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Créé par
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {site.createdBy ? `${site.createdBy.prenom} ${site.createdBy.nom}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b pb-2">
            Localisation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Région
              </label>
              <p className="text-gray-900 dark:text-gray-100 text-lg">{site.region?.nom}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Commune
              </label>
              <p className="text-gray-900 dark:text-gray-100">{site.commune}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Village
              </label>
              <p className="text-gray-900 dark:text-gray-100">{site.village}</p>
            </div>
            
            {site.coordonnees && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Coordonnées GPS
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {site.coordonnees.lat}, {site.coordonnees.lng}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Opérateurs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b pb-2">
            Opérateurs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {site.operateurs?.hommes || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Hommes</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {site.operateurs?.femmes || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Femmes</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {site.operateurs?.jeunes || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Jeunes</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {(site.operateurs?.hommes || 0) + (site.operateurs?.femmes || 0) + (site.operateurs?.jeunes || 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total des opérateurs</div>
            </div>
          </div>
        </div>

        {/* Systèmes */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b pb-2">
            Systèmes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Systèmes d'irrigation
              </label>
              <div className="space-y-2">
                {site.systemes?.irrigationSystems?.length > 0 ? (
                  site.systemes.irrigationSystems.map((system, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                    >
                      {system}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Aucun système d'irrigation</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Systèmes de captage
              </label>
              <div className="space-y-2">
                {site.systemes?.captureSystems?.length > 0 ? (
                  site.systemes.captureSystems.map((system, index) => (
                    <span
                      key={index}
                      className="inline-block bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                    >
                      {system}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Aucun système de captage</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cultures */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b pb-2">
            Cultures
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Types de cultures
            </label>
            <div className="space-y-2">
              {site.cultures?.types?.length > 0 ? (
                site.cultures.types.map((culture, index) => (
                  <span
                    key={index}
                    className="inline-block bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                  >
                    {culture}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucune culture renseignée</p>
              )}
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b pb-2">
            Photos {site.photos?.length > 0 ? `(${site.photos.length})` : '(0)'}
          </h3>
          
          {site.photos && site.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {site.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1} du site`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-75 transition-opacity duration-200"
                    onClick={() => openImageModal(site.photos, index)}
                  />
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Aucune photo disponible pour ce site
              </p>
            </div>
          )}
        </div>

        {/* Activités liées */}
        {site.activites && site.activites.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b pb-2">
              Activités liées ({site.activites.length})
            </h3>
            
            <div className="space-y-3">
              {site.activites.map((activite) => (
                <div key={activite.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{activite.type}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activite.thematique} • {new Date(activite.dateCreation).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Par {activite.createdBy ? `${activite.createdBy.prenom} ${activite.createdBy.nom}` : 'N/A'}
                    </p>
                  </div>
                  <Link
                    href={`/activites`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Voir →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal d'image */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        imageAlt={imageModal.imageAlt}
        imageIndex={imageModal.imageIndex}
        totalImages={imageModal.images.length}
        onPrevious={imageModal.imageIndex > 0 ? goToPreviousImage : null}
        onNext={imageModal.imageIndex < imageModal.images.length - 1 ? goToNextImage : null}
      />
    </div>
  );
}
