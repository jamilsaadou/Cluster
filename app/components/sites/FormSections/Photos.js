'use client';

import { useState, useRef, useEffect } from 'react';

export default function Photos({ data = [], onChange, title = "Photos" }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Upload files to server
  const uploadFiles = async (files) => {
    const formData = new FormData();
    
    // Add all files to FormData
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      return result.files;
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    }
  };

  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validation côté client
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (file.size > maxSize) {
        alert(`Le fichier ${file.name} est trop volumineux (max 5MB)`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`Type de fichier non autorisé: ${file.type}`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simuler le progrès d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload des fichiers
      const uploadedFiles = await uploadFiles(files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Ensure data is an array before spreading
      const currentPhotos = Array.isArray(data) ? data : [];
      
      // Add new image URLs to existing ones
      const newPhotoUrls = uploadedFiles.map(file => file.url);
      const updatedPhotos = [...currentPhotos, ...newPhotoUrls];
      onChange(updatedPhotos);

      // Success message
      console.log(`${uploadedFiles.length} fichier(s) uploadé(s) avec succès`);
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert(error.message || 'Erreur lors de l\'upload des images');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async (index) => {
    const currentPhotos = Array.isArray(data) ? data : [];
    const photoUrl = currentPhotos[index];
    
    // Extract filename from URL for deletion
    if (photoUrl && photoUrl.startsWith('/api/images/')) {
      const fileName = photoUrl.split('/').pop();
      
      try {
        // Delete file from server
        await fetch(`/api/upload/images?fileName=${fileName}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        // Continue with removal from UI even if server deletion fails
      }
    }
    
    // Remove from UI
    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  const handleViewPhoto = (photo) => {
    // Open image in new window for full view
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head><title>Photo</title></head>
        <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh;">
          <img src="${photo}" style="max-width:100%; max-height:100%; object-fit:contain;" />
        </body>
      </html>
    `);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title} {Array.isArray(data) && data.length > 0 && `(${data.length})`}
        </h3>
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesChange}
        ref={fileInputRef}
        className="hidden"
        disabled={isUploading}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="mb-4 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200 ease-in-out shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Upload en cours... {uploadProgress}%</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Ajouter des photos</span>
          </>
        )}
      </button>

      {/* Progress bar */}
      {isUploading && (
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {Array.isArray(data) && data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-75 transition-opacity duration-200"
                onClick={() => handleViewPhoto(photo)}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K';
                  e.target.alt = 'Image non disponible';
                }}
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  {/* View button */}
                  <button
                    type="button"
                    onClick={() => handleViewPhoto(photo)}
                    className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                    title="Voir en grand"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(!Array.isArray(data) || data.length === 0) && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Aucune photo ajoutée
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Cliquez sur "Ajouter des photos" pour commencer
          </p>
        </div>
      )}
    </div>
  );
}
