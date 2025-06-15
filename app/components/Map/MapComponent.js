'use client';

import { useEffect, useRef, useState } from 'react';

const MapComponent = ({ sites = [], activites = [], showSites = true, showActivites = true }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const clustersRef = useRef(null);
  const heatmapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapControls, setMapControls] = useState({
    showClusters: true,
    showHeatmap: false,
    selectedLayer: 'osm'
  });

  const mapLayers = {
    osm: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© <a href="https://www.esri.com/">Esri</a>'
    },
    terrain: {
      name: 'Terrain',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© <a href="https://opentopomap.org/">OpenTopoMap</a>'
    }
  };

  useEffect(() => {
    const loadMap = async () => {
      if (typeof window === 'undefined') return;

      try {
        setIsLoading(true);
        setError(null);

        // Importer Leaflet et ses plugins
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Importer le plugin de clustering
        let MarkerClusterGroup;
        try {
          const clusterModule = await import('leaflet.markercluster');
          MarkerClusterGroup = clusterModule.default;
          await import('leaflet.markercluster/dist/MarkerCluster.css');
          await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
        } catch (clusterError) {
          console.warn('Clustering plugin not available:', clusterError);
        }

        // Corriger les icônes par défaut de Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialiser la carte si elle n'existe pas
        if (!mapInstanceRef.current && mapRef.current) {
          const defaultCenter = [17.6078, 8.0817]; // Niger
          const defaultZoom = 6;

          const map = L.map(mapRef.current, {
            center: defaultCenter,
            zoom: defaultZoom,
            zoomControl: false, // On va ajouter nos propres contrôles
            attributionControl: true
          });

          mapInstanceRef.current = map;

          // Ajouter le contrôle de zoom personnalisé
          L.control.zoom({
            position: 'topright'
          }).addTo(map);

          // Ajouter la couche de base par défaut
          const baseLayer = L.tileLayer(mapLayers[mapControls.selectedLayer].url, {
            attribution: mapLayers[mapControls.selectedLayer].attribution,
            maxZoom: 18,
          });
          baseLayer.addTo(map);

          // Ajouter un contrôle d'échelle
          L.control.scale({
            position: 'bottomleft',
            metric: true,
            imperial: false
          }).addTo(map);

          map.whenReady(() => {
            console.log('Map is ready');
          });
        }

        if (!mapInstanceRef.current) {
          setIsLoading(false);
          return;
        }

        // Nettoyer les marqueurs existants
        markersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        if (clustersRef.current) {
          mapInstanceRef.current.removeLayer(clustersRef.current);
          clustersRef.current = null;
        }

        // Créer des icônes personnalisées améliorées
        const createCustomIcon = (color, iconPath, size = 32) => {
          return L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                cursor: pointer;
              " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                <svg width="${size * 0.5}" height="${size * 0.5}" fill="white" viewBox="0 0 24 24">
                  <path d="${iconPath}"/>
                </svg>
              </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
          });
        };

        const siteIcon = createCustomIcon(
          '#10b981',
          'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
        );

        const activityIcon = createCustomIcon(
          '#3b82f6',
          'M13 10V3L4 14h7v7l9-11h-7z'
        );

        // Préparer les marqueurs
        const allMarkers = [];

        // Ajouter les marqueurs des sites
        if (showSites) {
          sites.forEach(site => {
            if (site.coordonnees && site.coordonnees.lat && site.coordonnees.lng) {
              const marker = L.marker([site.coordonnees.lat, site.coordonnees.lng], {
                icon: siteIcon
              });

              const popupContent = `
                <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
                  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px; margin: -9px -9px 12px -9px; border-radius: 8px 8px 0 0;">
                    <h3 style="margin: 0; font-weight: 600; font-size: 16px;">
                      🏢 ${site.nom}
                    </h3>
                  </div>
                  
                  <div style="space-y: 8px;">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="color: #6b7280; font-weight: 500; min-width: 80px;">📍 Lieu:</span>
                      <span style="color: #374151;">${site.commune}, ${site.village}</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="color: #6b7280; font-weight: 500; min-width: 80px;">🗺️ Région:</span>
                      <span style="color: #374151;">${site.region?.nom || 'Non spécifiée'}</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="color: #6b7280; font-weight: 500; min-width: 80px;">📏 Surface:</span>
                      <span style="color: #374151; font-weight: 600;">${site.superficie} ha</span>
                    </div>
                    
                    ${site.operateurs ? `
                      <div style="background: #f9fafb; padding: 8px; border-radius: 6px; margin: 8px 0;">
                        <div style="color: #6b7280; font-weight: 500; margin-bottom: 4px;">👥 Opérateurs:</div>
                        <div style="display: flex; gap: 12px; font-size: 14px;">
                          <span>👨 ${site.operateurs.hommes || 0}</span>
                          <span>👩 ${site.operateurs.femmes || 0}</span>
                          <span>🧑 ${site.operateurs.jeunes || 0}</span>
                        </div>
                      </div>
                    ` : ''}
                    
                    ${site.cultures?.types?.length > 0 ? `
                      <div style="margin: 8px 0;">
                        <span style="color: #6b7280; font-weight: 500;">🌾 Cultures:</span>
                        <div style="margin-top: 4px;">
                          ${site.cultures.types.map(culture => `<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 12px; font-size: 12px; margin-right: 4px; display: inline-block; margin-bottom: 2px;">${culture}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                  
                  <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                    <a href="/sites/${site.id}" 
                       style="background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block; transition: all 0.2s;"
                       target="_blank"
                       onmouseover="this.style.background='#059669'"
                       onmouseout="this.style.background='#10b981'">
                      Voir les détails →
                    </a>
                  </div>
                </div>
              `;

              marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
              });

              allMarkers.push(marker);
              markersRef.current.push(marker);
            }
          });
        }

        // Ajouter les marqueurs des activités
        if (showActivites) {
          activites.forEach(activite => {
            if (activite.geolocalisation && activite.geolocalisation.lat && activite.geolocalisation.lng) {
              const marker = L.marker([activite.geolocalisation.lat, activite.geolocalisation.lng], {
                icon: activityIcon
              });

              const getStatusColor = (statut) => {
                switch (statut) {
                  case 'approuve': return { bg: '#dcfce7', color: '#166534', emoji: '✅' };
                  case 'rejete': return { bg: '#fef2f2', color: '#991b1b', emoji: '❌' };
                  default: return { bg: '#fef3c7', color: '#92400e', emoji: '⏳' };
                }
              };

              const statusStyle = getStatusColor(activite.statut);

              const popupContent = `
                <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
                  <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px; margin: -9px -9px 12px -9px; border-radius: 8px 8px 0 0;">
                    <h3 style="margin: 0; font-weight: 600; font-size: 16px;">
                      ⚡ ${activite.type}
                    </h3>
                  </div>
                  
                  <div style="space-y: 8px;">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="color: #6b7280; font-weight: 500; min-width: 80px;">🎯 Thème:</span>
                      <span style="color: #374151;">${activite.thematique}</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="color: #6b7280; font-weight: 500; min-width: 80px;">⏱️ Durée:</span>
                      <span style="color: #374151; font-weight: 600;">${activite.duree}h</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="color: #6b7280; font-weight: 500; min-width: 80px;">📅 Date:</span>
                      <span style="color: #374151;">${new Date(activite.dateCreation).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="color: #6b7280; font-weight: 500; min-width: 80px;">📊 Statut:</span>
                      <span style="background: ${statusStyle.bg}; color: ${statusStyle.color}; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                        ${statusStyle.emoji} ${activite.statut === 'approuve' ? 'Approuvé' : activite.statut === 'rejete' ? 'Rejeté' : 'En attente'}
                      </span>
                    </div>
                    
                    ${activite.beneficiaires ? `
                      <div style="background: #f0f9ff; padding: 8px; border-radius: 6px; margin: 8px 0;">
                        <div style="color: #6b7280; font-weight: 500; margin-bottom: 4px;">👥 Bénéficiaires:</div>
                        <div style="display: flex; gap: 12px; font-size: 14px;">
                          <span>👨 ${activite.beneficiaires.hommes || 0}</span>
                          <span>👩 ${activite.beneficiaires.femmes || 0}</span>
                          <span>🧑 ${activite.beneficiaires.jeunes || 0}</span>
                        </div>
                        <div style="margin-top: 4px; font-weight: 600; color: #1e40af;">
                          Total: ${(activite.beneficiaires.hommes || 0) + (activite.beneficiaires.femmes || 0)} personnes
                        </div>
                      </div>
                    ` : ''}
                  </div>
                  
                  <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                    <a href="/activites" 
                       style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block; transition: all 0.2s;"
                       target="_blank"
                       onmouseover="this.style.background='#2563eb'"
                       onmouseout="this.style.background='#3b82f6'">
                      Voir les détails →
                    </a>
                  </div>
                </div>
              `;

              marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
              });

              allMarkers.push(marker);
              markersRef.current.push(marker);
            }
          });
        }

        // Ajouter les marqueurs à la carte avec ou sans clustering
        if (mapControls.showClusters && MarkerClusterGroup && allMarkers.length > 10) {
          clustersRef.current = new MarkerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 50,
            iconCreateFunction: function(cluster) {
              const count = cluster.getChildCount();
              let size = 'small';
              let color = '#3b82f6';
              
              if (count > 100) {
                size = 'large';
                color = '#dc2626';
              } else if (count > 50) {
                size = 'medium';
                color = '#f59e0b';
              }
              
              return L.divIcon({
                html: `<div style="
                  background: ${color};
                  color: white;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: ${size === 'large' ? '14px' : size === 'medium' ? '12px' : '10px'};
                  width: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'};
                  height: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'};
                ">${count}</div>`,
                className: 'marker-cluster',
                iconSize: L.point(size === 'large' ? 50 : size === 'medium' ? 40 : 30, size === 'large' ? 50 : size === 'medium' ? 40 : 30)
              });
            }
          });
          
          allMarkers.forEach(marker => clustersRef.current.addLayer(marker));
          mapInstanceRef.current.addLayer(clustersRef.current);
        } else {
          allMarkers.forEach(marker => marker.addTo(mapInstanceRef.current));
        }

        // Ajuster la vue pour inclure tous les marqueurs
        if (allMarkers.length > 0) {
          const group = L.featureGroup(allMarkers);
          mapInstanceRef.current.fitBounds(group.getBounds(), { 
            padding: [20, 20],
            maxZoom: 15
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement de la carte:', error);
        setError('Erreur lors du chargement de la carte');
        setIsLoading(false);
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];
        
        if (clustersRef.current) {
          mapInstanceRef.current.removeLayer(clustersRef.current);
          clustersRef.current = null;
        }
      }
    };
  }, [sites, activites, showSites, showActivites, mapControls]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Erreur de chargement</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
        <div className="text-center p-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Chargement de la carte</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Préparation de la visualisation géographique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '400px',
          borderRadius: '8px'
        }}
      />
      
      {/* Contrôles personnalisés */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Affichage</div>
          <div className="space-y-1">
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={mapControls.showClusters}
                onChange={(e) => setMapControls(prev => ({ ...prev, showClusters: e.target.checked }))}
                className="mr-2 h-3 w-3"
              />
              <span className="text-gray-600 dark:text-gray-400">Grouper les marqueurs</span>
            </label>
          </div>
        </div>
      </div>

      {/* Informations en bas */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">{sites.filter(s => s.coordonnees).length} Sites</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">{activites.filter(a => a.geolocalisation).length} Activités</span>
            </div>
          </div>
        </div>
      </div>

      {/* Styles CSS pour les popups personnalisés */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: none;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .marker-cluster {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
