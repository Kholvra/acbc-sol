/**
 * Mapping of province name variations to standardized names
 * Handles historical names, abbreviations, and alternative spellings
 */
export const NAME_MAPPING: Record<string, string> = {
  "IRIAN JAYA TENGAH": "Papua Tengah",
  "IRIAN JAYA BARAT": "Papua Barat",
  "IRIAN JAYA": "Papua",
  "IRIAN JAYA TIMUR": "Papua",
  "DI ACEH": "Aceh",
  "DI. ACEH": "Aceh",
  "NANGGROE ACEH DARUSSALAM": "Aceh",
  "ACEH": "Aceh",
  "DKI JAKARTA": "DKI Jakarta",
  "JAKARTA RAYA": "DKI Jakarta",
  "DAERAH ISTIMEWA YOGYAKARTA": "DI Yogyakarta",
  "YOGYAKARTA": "DI Yogyakarta",
  "PROBANTEN": "Banten",
  "NUSATENGGARA BARAT": "Nusa Tenggara Barat",
  "NUSATENGGARA TIMUR": "Nusa Tenggara Timur",
  "BANGKA BELITUNG": "Kepulauan Bangka Belitung",
  "GORONTALO": "Gorontalo",
  "MALUKU UTARA": "Maluku Utara",
  "SULAWESI TENGAH": "Sulawesi Tengah",
  "SULAWESI UTARA": "Sulawesi Utara",
  "SULAWESI SELATAN": "Sulawesi Selatan",
  "SULAWESI TENGGARA": "Sulawesi Tenggara",
  "SULAWESI BARAT": "Sulawesi Selatan", // Note: Verify this mapping
  "KALIMANTAN TENGAH": "Kalimantan Tengah",
  "KALIMANTAN TIMUR": "Kalimantan Timur",
  "KALIMANTAN BARAT": "Kalimantan Barat",
  "KALIMANTAN SELATAN": "Kalimantan Selatan",
  "KALIMANTAN UTARA": "Kalimantan Timur", // Note: Verify this mapping
  "PAPUA SELATAN": "Papua", // Note: Verify this mapping
  "PAPUA PEGUNUNGAN": "Papua", // Note: Verify this mapping
  "PAPUA BARAT DAYA": "Papua Barat", // Note: Verify this mapping
  "JAWA BARAT": "Jawa Barat",
  "JAWA TENGAH": "Jawa Tengah",
  "JAWA TIMUR": "Jawa Timur",
  "BALI": "Bali",
  "MALUKU": "Maluku",
  "PAPUA": "Papua",
  "PAPUA BARAT": "Papua Barat",
  "RIAU": "Riau",
  "BANTEN": "Banten",
  "BENGKULU": "Bengkulu",
  "JAMBI": "Jambi",
  "LAMPUNG": "Lampung",
  "SUMATERA BARAT": "Sumatera Barat",
  "SUMATERA SELATAN": "Sumatera Selatan",
  "SUMATERA UTARA": "Sumatera Utara",
  "KEPULAUAN RIAU": "Kepulauan Riau"
};

/**
 * Convert string to title case
 * Example: "jawa barat" → "Jawa Barat"
 */
export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
}

/**
 * Normalize raw province name to standard format
 * Handles variations and applies title case
 */
export function getStandardProvinceName(rawName: string): string {
  if (!rawName) return "Unknown";
  const upperName = rawName.toUpperCase().trim();
  if (NAME_MAPPING[upperName]) return NAME_MAPPING[upperName];
  return toTitleCase(rawName);
}

/**
 * Validate if a province name is valid (exists in mapping or can be normalized)
 */
export function isValidProvinceName(province: string): boolean {
  if (!province) return false;
  const standard = getStandardProvinceName(province);
  return standard !== "Unknown";
}
