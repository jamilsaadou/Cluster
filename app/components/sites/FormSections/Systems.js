'use client';

export default function Systems({ data, onChange }) {
  const captureSystems = [
    'Puits traditionnel',
    'Forage',
    'Puits à motricité humaine',
    'Pompe solaire',
    'Pompe thermique',
    'Captage de source',
    'Barrage',
    'Retenue d\'eau'
  ];

  const irrigationSystems = [
    'Irrigation gravitaire',
    'Aspersion',
    'Goutte à goutte',
    'Micro-aspersion',
    'Irrigation par submersion',
    'Irrigation par sillons',
    'Irrigation par bassins',
    'Système mixte'
  ];

  const handleCaptureSystemChange = (system) => {
    const currentSystems = data.captureSystems || [];
    const updatedSystems = currentSystems.includes(system)
      ? currentSystems.filter(s => s !== system)
      : [...currentSystems, system];
    
    onChange({ captureSystems: updatedSystems });
  };

  const handleIrrigationSystemChange = (system) => {
    const currentSystems = data.irrigationSystems || [];
    const updatedSystems = currentSystems.includes(system)
      ? currentSystems.filter(s => s !== system)
      : [...currentSystems, system];
    
    onChange({ irrigationSystems: updatedSystems });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Systèmes
      </h3>
      
      <div className="grid gap-8">
        {/* Capture Systems */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Type de système de captage *
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Sélectionnez un ou plusieurs types de système de captage
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {captureSystems.map((system) => (
              <label
                key={system}
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(data.captureSystems || []).includes(system)}
                  onChange={() => handleCaptureSystemChange(system)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200 ease-in-out"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {system}
                </span>
              </label>
            ))}
          </div>
          {(data.captureSystems || []).length === 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Veuillez sélectionner au moins un système de captage
            </p>
          )}
        </div>

        {/* Irrigation Systems */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Type de système d&apos;irrigation *
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Sélectionnez un ou plusieurs types de système d&apos;irrigation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {irrigationSystems.map((system) => (
              <label
                key={system}
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(data.irrigationSystems || []).includes(system)}
                  onChange={() => handleIrrigationSystemChange(system)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200 ease-in-out"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {system}
                </span>
              </label>
            ))}
          </div>
          {(data.irrigationSystems || []).length === 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Veuillez sélectionner au moins un système d&apos;irrigation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
