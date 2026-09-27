// pikpak-sdk/src/utils/download.ts
import type { DriveService } from '../services/DriveService';
import type { PikPakFile } from '../types/pikpak';

/**
 * Pure function to extract direct download/streaming URL from a PikPakFile object.
 * Checks web_content_link, application/octet-stream link, and media streams in priority order.
 */
export function extractDownloadUrl(file: PikPakFile | Record<string, any>): string | null {
  if (!file) return null;

  // 1. Direct web_content_link
  if (typeof file.web_content_link === 'string' && file.web_content_link) {
    return file.web_content_link;
  }

  // 2. Links object (Android / API style)
  const links = file.links;
  if (links && typeof links === 'object') {
    if (links['application/octet-stream']?.url) {
      return links['application/octet-stream'].url;
    }
    // Any other available link in links
    for (const key of Object.keys(links)) {
      if (links[key]?.url) return links[key].url;
    }
  }

  // 3. Medias array (Video transcode / stream style)
  const medias = file.medias;
  if (Array.isArray(medias) && medias.length > 0) {
    const mediaWithLink = medias.find((m) => m?.link?.url);
    if (mediaWithLink?.link?.url) {
      return mediaWithLink.link.url;
    }
  }

  return null;
}

/**
 * Fetches file details and extracts its direct download URL.
 * Maintained for backward compatibility.
 */
export async function getDownloadUrl(drive: DriveService, id: string): Promise<string | null> {
  const file = await drive.getFileDetail(id);
  return extractDownloadUrl(file);
}
