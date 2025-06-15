'use client';

export default function Operators({ data, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ensure value is non-negative
    const numValue = Math.max(0, parseInt(value) || 0);
    onChange({ [name]: numValue });
  };

  const calculateTotal = () => {
    return (parseInt(data.men) || 0) + (parseInt(data.women) || 0) + (parseInt(data.youth) || 0);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Nombre d&apos;exploitants
      </h3>
      
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Men */}
          <div>
            <label htmlFor="men" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre d&apos;hommes *
            </label>
            <input
              type="number"
              min="0"
              id="men"
              name="men"
              value={data.men}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out"
              placeholder="0"
            />
          </div>

          {/* Women */}
          <div>
            <label htmlFor="women" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de femmes *
            </label>
            <input
              type="number"
              min="0"
              id="women"
              name="women"
              value={data.women}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out"
              placeholder="0"
            />
          </div>

          {/* Youth */}
          <div>
            <label htmlFor="youth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de jeunes *
            </label>
            <input
              type="number"
              min="0"
              id="youth"
              name="youth"
              value={data.youth}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200 ease-in-out"
              placeholder="0"
            />
          </div>
        </div>

        {/* Total */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre total d&apos;exploitants:
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {calculateTotal()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
