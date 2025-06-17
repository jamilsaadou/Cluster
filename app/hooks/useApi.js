'use client';

import { useState, useCallback, useEffect } from 'react';

// Hook personnalisé pour les appels API avec gestion d'erreur améliorée
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Configuration par défaut
      const defaultOptions = {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Si on ne peut pas parser la réponse JSON, utiliser le message par défaut
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err.message || 'Une erreur est survenue';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Méthodes spécialisées
  const get = useCallback((url) => apiCall(url), [apiCall]);
  
  const post = useCallback((url, data) => apiCall(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }), [apiCall]);
  
  const put = useCallback((url, data) => apiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }), [apiCall]);
  
  const patch = useCallback((url, data) => apiCall(url, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }), [apiCall]);
  
  const del = useCallback((url) => apiCall(url, {
    method: 'DELETE'
  }), [apiCall]);

  return {
    loading,
    error,
    apiCall,
    get,
    post,
    put,
    patch,
    delete: del,
    clearError: () => setError(null)
  };
}

// Hook spécialisé pour les données avec cache simple
export function useApiData(url, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { get } = useApi();

  const fetchData = useCallback(async () => {
    if (!url) return;
    
    setLoading(true);
    const result = await get(url);
    
    if (result.error) {
      setError(result.error);
      setData(null);
    } else {
      setData(result.data);
      setError(null);
    }
    
    setLoading(false);
  }, [url, get]);

  // Refetch automatique quand les dépendances changent
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  };
}

// Hook pour les mutations (POST, PUT, DELETE) avec état de chargement
export function useMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiCall } = useApi();

  const mutate = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    const result = await apiCall(url, options);
    
    if (result.error) {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, [apiCall]);

  return {
    mutate,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Utilitaires pour les notifications d'erreur
export const handleApiError = (error, notification) => {
  console.error('API Error:', error);
  
  if (notification) {
    if (error.includes('401') || error.includes('Unauthorized')) {
      notification.error('Session expirée. Veuillez vous reconnecter.');
    } else if (error.includes('403') || error.includes('Forbidden')) {
      notification.error('Vous n\'avez pas les permissions nécessaires.');
    } else if (error.includes('404') || error.includes('Not Found')) {
      notification.error('Ressource non trouvée.');
    } else if (error.includes('500') || error.includes('Internal Server Error')) {
      notification.error('Erreur serveur. Veuillez réessayer plus tard.');
    } else {
      notification.error(error);
    }
  }
};

export default useApi;
