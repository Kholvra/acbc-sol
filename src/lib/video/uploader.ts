import { pinataVideo } from './client';

export interface VideoUploadResult {
  ipfsHash: string;
  fileName: string;
  fileSize: number;
  timestamp: string;
}

export interface VideoUploadOptions {
  onProgress?: (progress: number) => void;
  maxRetries?: number;
}

export interface VideoValidationResult {
  isValid: boolean;
  error?: string;
}

// Video validation constants
export const VIDEO_CONSTANTS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'] as const,
  ALLOWED_EXTENSIONS: ['.mp4', '.webm', '.mov'] as const,
} as const;

export function validateVideoFile(file: File): VideoValidationResult {
  // check file type - convert readonly to mutable array for includes() check
  const allowedTypes: readonly string[] = VIDEO_CONSTANTS.ALLOWED_TYPES;
  const hasValidType = allowedTypes.includes(file.type);
  if (!hasValidType) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: ${VIDEO_CONSTANTS.ALLOWED_TYPES.join(', ')}`,
    };
  }

  // check file size
  if (file.size > VIDEO_CONSTANTS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${VIDEO_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { isValid: true };
}

function getFileExtension(filename: string): string {
  const ext = filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  return ext ? `.${ext.toLowerCase()}` : '';
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100);
}

export async function uploadVideoFile(
  file: File,
  options?: VideoUploadOptions,
): Promise<VideoUploadResult> {
  const { onProgress, maxRetries = 3 } = options ?? {};

  // validate file first
  const validation = validateVideoFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxRetries) {
    try {
      onProgress?.(0); // start progress

      // create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // add metadata for better file management
      const metadata = JSON.stringify({
        name: sanitizeFileName(file.name),
        originalName: file.name,
        type: 'video',
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      });
      formData.append('pinataMetadata', metadata);

      // set CID version to 1 for better compatibility
      const uploadOptions = JSON.stringify({ cidVersion: 1 });
      formData.append('pinataOptions', uploadOptions);

      // upload to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as {
        IpfsHash: string;
        PinSize: number;
        Timestamp: string;
      };

      onProgress?.(1); // complete progress

      return {
        ipfsHash: data.IpfsHash,
        fileName: file.name,
        fileSize: data.PinSize,
        timestamp: data.Timestamp,
      };
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt === maxRetries) {
        break;
      }

      // exponential backoff: 1s, 2s, 4s...
      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      await wait(backoffMs);
    }
  }

  // all retries failed
  const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown upload error';
  throw new Error(`Video upload failed after ${maxRetries} attempts: ${errorMessage}`);
}

export function getVideoUrl(ipfsHash: string): string {
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'https://gateway.pinata.cloud';
  return `${gateway}/ipfs/${ipfsHash}`;
}
