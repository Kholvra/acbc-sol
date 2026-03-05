export interface LocationDetails {
    latitude: number;
    longitude: number;
    kecamatan: string;
    city: string;
    formatted: string;
}

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }
    });
};

export const fetchLocationDetails = async (latitude: number, longitude: number): Promise<LocationDetails> => {
    try {
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`
        );
        
        if (!response.ok) {
            throw new Error("Failed to fetch location data");
        }

        const data = await response.json() as {
            city?: string;
            locality?: string;
            localityInfo?: {
                administrative?: Array<{
                    adminLevel?: number;
                    name?: string;
                    description?: string;
                }>;
            };
        };

        let kecamatan = '';
        let city = '';

        if (data.localityInfo?.administrative) {
             const admin = data.localityInfo.administrative;
             city = data.city ?? data.locality ?? '';
             kecamatan = data.locality ?? '';

             const cityLevel = admin.find((a) => a.adminLevel === 6 || a.name?.includes("Kota") ?? false || a.name?.includes("Kabupaten") ?? false);
             if (cityLevel?.name) city = cityLevel.name;

             const districtLevel = admin.find((a) => a.adminLevel === 7 || a.description === "district");
             if (districtLevel?.name) kecamatan = districtLevel.name;
        } else {
             city = data.city ?? '';
             kecamatan = data.locality ?? '';
        }

        return {
            latitude,
            longitude,
            kecamatan,
            city,
            formatted: `📍 ${kecamatan}, ${city}`
        };

    } catch (error) {
        console.error("Location Service Error:", error);
        throw error;
    }
};
