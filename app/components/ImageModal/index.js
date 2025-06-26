'use client';

import { useState, useEffect } from 'react';

export default function ImageModal({ isOpen, onClose, imageUrl, imageAlt, imageIndex, totalImages, onPrevious, onNext }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (onPrevious) onPrevious();
          break;
        case 'ArrowRight':
          if (onNext) onNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrevious, onNext]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && imageUrl) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      {/* Header avec contrôles */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-lg">
          {totalImages > 1 && imageIndex !== undefined ? (
            `${imageIndex + 1} / ${totalImages}`
          ) : (
            'Image'
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Bouton télécharger */}
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = imageUrl;
              link.download = imageAlt || 'image';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="text-white hover:text-gray-300 bg-black bg-opacity-50 p-2 rounded-lg transition-colors duration-200"
            title="Télécharger l'image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 bg-black bg-opacity-50 p-2 rounded-lg transition-colors duration-200"
            title="Fermer (Échap)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation précédent/suivant */}
      {totalImages > 1 && (
        <>
          {/* Bouton précédent */}
          <button
            onClick={onPrevious}
            disabled={!onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 p-3 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            title="Image précédente (←)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Bouton suivant */}
          <button
            onClick={onNext}
            disabled={!onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 p-3 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            title="Image suivante (→)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Contenu principal */}
      <div className="relative max-w-full max-h-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {hasError ? (
          <div className="text-center text-white bg-black bg-opacity-50 p-8 rounded-lg">
            <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
            <p className="text-gray-300">Impossible de charger l'image</p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={imageAlt || 'Image'}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          />
        )}
      </div>

      {/* Instructions en bas */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        <div className="flex items-center space-x-4 text-center">
          <span>Échap: Fermer</span>
          {totalImages > 1 && (
            <>
              <span>•</span>
              <span>← →: Navigation</span>
            </>
          )}
          <span>•</span>
          <span>Clic extérieur: Fermer</span>
        </div>
      </div>
    </div>
  );
}
