'use client';

import { useState } from 'react';

export default function Crops({ data, onChange }) {
  const cropTypes = [
    'Maïs',
    'Riz',
    'Mil',
    'Sorgho',
    'Niébé',
    'Arachide',
    'Manioc',
    'Patate douce',
    'Oignon',
    'Tomate',
    'Piment',
    'Pomme de terre',
    'Chou',
    'Laitue',
    'Carotte',
    'Aubergine',
    'Gombo',
    'Moringa',
    'Mangue',
    'Agrumes'
  ];

  const handleCropChange = (crop) => {
    const currentCrops = data.types || [];
    const updatedCrops = currentCrops.includes(crop)
      ? currentCrops.filter(c => c !== crop)
      : [...currentCrops, crop];
    
    onChange({ types: updatedCrops });
  };

  const [newCrop, setNewCrop] = useState('');

  const handleAddCustomCrop = (e) => {
    e.preventDefault();
    if (newCrop.trim()) {
      const currentCrops = data.types || [];
      if (!currentCrops.includes(newCrop.trim())) {
        onChange({ types: [...currentCrops, newCrop.trim()] });
      }
      setNewCrop('');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Types de spéculation
      </h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Sélectionnez les types de culture *
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choisissez une ou plusieurs spéculations pratiquées sur le site
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cropTypes.map((crop) => (
              <label
                key={crop}
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(data.types || []).includes(crop)}
                  onChange={() => handleCropChange(crop)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200 ease-in-out"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {crop}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Add Custom Crop */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Ajouter une autre spéculation
          </h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCrop}
              onChange={(e) => setNewCrop(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out"
              placeholder="Entrez le nom de la spéculation"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomCrop(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomCrop}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ease-in-out shadow-sm"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Selected Crops */}
        {(data.types || []).length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
              Spéculations sélectionnées
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.types.map((crop) => (
                <span
                  key={crop}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                >
                  {crop}
                  <button
                    type="button"
                    onClick={() => handleCropChange(crop)}
                    className="ml-2 inline-flex items-center p-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 focus:outline-none transition-colors duration-200 ease-in-out"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {(data.types || []).length === 0 && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Veuillez sélectionner au moins un type de spéculation
          </p>
        )}
      </div>
    </div>
  );
}
