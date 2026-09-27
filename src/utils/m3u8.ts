// pikpak-sdk/src/utils/m3u8.ts
import type { DriveService } from '../services/DriveService';
import { extractDownloadUrl } from './download';
import fs from 'fs';

export interface M3u8Entry {
  name: string;
  url: string;
  duration?: number;
}

/**
 * Formats a list of entries into an M3U8 playlist string.
 */
export function formatM3u8(entries: M3u8Entry[]): string {
  let content = "#EXTM3U\n";
  for (const entry of entries) {
    const duration = entry.duration !== undefined ? entry.duration : -1;
    content += `#EXTINF:${duration},${entry.name}\n${entry.url}\n`;
  }
  return content;
}

/**
 * Generates an M3U8 playlist string for all video files in a folder.
 * Optionally writes the content to `outputPath` if specified.
 */
export async function generateM3u8(
  drive: DriveService,
  folderId: string = "",
  outputPath?: string
): Promise<string> {
  const response = await drive.listFiles({ parentId: folderId, limit: 500 });
  const videoFiles = (response.files || []).filter(
    (f) => f.mime_type && f.mime_type.startsWith('video/')
  );

  const entries: M3u8Entry[] = [];

  for (const file of videoFiles) {
    let downloadUrl = extractDownloadUrl(file);
    if (!downloadUrl) {
      downloadUrl = await drive.getDownloadUrl(file.id);
    }
    if (downloadUrl) {
      entries.push({
        name: file.name,
        url: downloadUrl,
      });
    }
  }

  const playlist = formatM3u8(entries);

  if (outputPath) {
    await fs.promises.writeFile(outputPath, playlist, 'utf8');
  }

  return playlist;
}
