'use client';

import { useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Feature, Geometry } from 'geojson';
import type { MapViewProps } from '~/types/map';

export default function MapView ({
  geoJsonData,
  provinceCampaignCounts,
  getStandardProvinceName,
}: MapViewProps) {
  const center: [number, number] = [-2.5489, 118.0149];

  const geoJsonKey = useMemo(
    () => JSON.stringify(provinceCampaignCounts),
    [provinceCampaignCounts]
  );

  const renderProvinceContent = useCallback((provinceName: string, activeCount: number) => {
    const isActive = activeCount > 0;

    return `
      <div class="px-3 py-2 text-center font-sans">
        <div class="font-bold text-base text-gray-900 mb-2">${provinceName}</div>
        ${isActive
          ? `<span class="inline-block bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
              ${activeCount} Active Needs
             </span>`
          : `<span class="text-xs text-green-700 font-medium">All Clear</span>`
        }
      </div>
    `;
  }, []);

  const getProvinceStyle = useCallback(
    (feature?: Feature<Geometry, Record<string, unknown>>) => {
      if (!feature) return {};

      const properties = feature.properties;
      const rawFeatureName = (properties?.Propinsi as string) ?? (properties?.PROVINSI as string) ?? '';
      const provinceName = getStandardProvinceName(rawFeatureName);
      const activeCount = provinceCampaignCounts[provinceName] ?? 0;
      const isActive = activeCount > 0;

      return {
        fillColor: isActive ? '#EF4444' : '#10B981',
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: isActive ? '' : '3',
        fillOpacity: isActive ? 0.8 : 0.4,
      };
    },
    [provinceCampaignCounts, getStandardProvinceName]
  );

  const onEachProvince = useCallback(
    (feature: Feature<Geometry, Record<string, unknown>>, layer: L.Layer) => {
      const properties = feature.properties;
      const rawFeatureName = (properties?.Propinsi as string) ?? (properties?.PROVINSI as string) ?? '';
      const provinceName = getStandardProvinceName(rawFeatureName);
      const activeCount = provinceCampaignCounts[provinceName] ?? 0;
      const isActive = activeCount > 0;

      const content = renderProvinceContent(provinceName, activeCount);

      layer.bindPopup(content, { minWidth: 150 });
      layer.bindTooltip(content, {
        permanent: false,
        direction: 'top',
        sticky: true,
        className: 'bg-white border border-gray-200 rounded-lg shadow-lg p-0 overflow-hidden',
      });

      if (layer instanceof L.Path) {
        layer.on({
          mouseover: (e: L.LeafletMouseEvent) => {
            const target = e.target as L.Path;
            target.setStyle({ weight: 2, color: '#333', fillOpacity: 0.9 });
          },
          mouseout: (e: L.LeafletMouseEvent) => {
            const target = e.target as L.Path;
            target.setStyle({ weight: 1, color: 'white', fillOpacity: isActive ? 0.8 : 0.4 });
          },
        });
      }
    },
    [provinceCampaignCounts, getStandardProvinceName, renderProvinceContent]
  );

  if (!geoJsonData) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-slate-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-aid-green border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={5}
      scrollWheelZoom
      zoomControl
      style={{ height: '100%', width: '100%' }}
      attributionControl={false}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON
        key={geoJsonKey}
        data={geoJsonData}
        style={getProvinceStyle}
        onEachFeature={onEachProvince}
      />
    </MapContainer>
  );
}

