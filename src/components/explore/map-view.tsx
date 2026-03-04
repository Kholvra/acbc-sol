'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  geoJsonData: any;
  provinceCampaignCounts: Record<string, number>;
  getStandardProvinceName: (name: string) => string;
}

const MapView: React.FC<MapViewProps> = ({ geoJsonData, provinceCampaignCounts, getStandardProvinceName }) => {
  const center: [number, number] = [-2.5489, 118.0149];

  const onEachProvince = (feature: any, layer: any) => {
    const rawFeatureName = feature?.properties?.Propinsi || feature?.properties?.PROVINSI || "Province";
    const provinceName = getStandardProvinceName(rawFeatureName);
    const activeCount = provinceCampaignCounts[provinceName] || 0;
    const isActive = activeCount > 0;

    const popupContent = `
      <div class="px-2 py-1 text-center font-sans">
        <div class="font-bold text-base text-gray-900 mb-1">${provinceName}</div>
        ${isActive ? `
            <span class="inline-block bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                🔴 ${activeCount} ACTIVE NEEDS
            </span>
        ` : `<span class="text-xs text-gray-400">All Clear</span>`}
      </div>
    `;

    layer.bindPopup(popupContent);
    
    if (isActive) {
         layer.bindTooltip(`🔥 ${provinceName} (${activeCount})`, { 
            permanent: true, 
            direction: 'center',
            className: 'bg-white/90 border border-red-500 text-red-600 px-3 py-1 rounded-full shadow-lg text-xs font-black'
        });
    } else {
        layer.bindTooltip(provinceName, { 
            permanent: false, 
            direction: 'center',
            className: 'bg-white px-2 py-1 rounded shadow-md text-xs font-bold opacity-80'
        });
    }
    
    layer.on({
        mouseover: (e: any) => {
            const l = e.target;
            l.setStyle({
                weight: 2,
                color: '#333',
                fillOpacity: 0.9
            });
        },
        mouseout: (e: any) => {
            const l = e.target;
            l.setStyle({
                weight: 1,
                color: 'white',
                fillOpacity: isActive ? 0.8 : 0.4
            });
        }
    });
  };

  return (
    <MapContainer 
      center={center} 
      zoom={5} 
      style={{ height: '100%', width: '100%' }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoJsonData && (
        <GeoJSON 
            data={geoJsonData} 
            style={(feature) => {
                const rawFeatureName = feature?.properties?.Propinsi || feature?.properties?.PROVINSI || "Province";
                const pName = getStandardProvinceName(rawFeatureName);
                const activeCount = provinceCampaignCounts[pName] || 0;
                const isActive = activeCount > 0;
                return {
                    fillColor: isActive ? '#EF4444' : '#10B981', 
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    dashArray: isActive ? '' : '3',
                    fillOpacity: isActive ? 0.8 : 0.4
                };
            }}
            onEachFeature={onEachProvince}
        />
      )}
    </MapContainer>
  );
};

export default MapView;
