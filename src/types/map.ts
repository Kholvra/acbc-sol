import type { GeoJsonObject, Feature, Polygon, MultiPolygon } from 'geojson';

/**
 * Properties for Indonesia province GeoJSON features
 */
export interface IndonesiaProvinceProperties {
  ID: number;
  kode: number;
  Propinsi: string;
  SUMBER: string;
}

/**
 * GeoJSON Feature type for Indonesia provinces
 */
export type IndonesiaProvinceFeature = Feature<
  Polygon | MultiPolygon,
  IndonesiaProvinceProperties
>;

/**
 * GeoJSON FeatureCollection for Indonesia provinces
 */
export interface IndonesiaGeoJson extends GeoJsonObject {
  type: 'FeatureCollection';
  features: IndonesiaProvinceFeature[];
}

/**
 * Props for MapView component
 */
export interface MapViewProps {
  geoJsonData: IndonesiaGeoJson | null;
  provinceCampaignCounts: Record<string, number>;
  getStandardProvinceName: (name: string) => string;
}

/**
 * Campaign metadata from IPFS
 */
export interface CampaignIPFSMetadata {
  name: string;
  description: string;
  category: string;
  animation_url: string;
  external_url: string;
  properties: {
    targetAmount: string;
    endDate: string;
    campaignType: 'video' | 'live';
    province: string;
    location?: {
      latitude: number;
      longitude: number;
      kecamatan: string;
      city: string;
      formatted: string;
    };
  };
}
