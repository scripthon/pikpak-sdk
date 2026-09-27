import type { ParsedShareUrl } from '../types/pikpak';

/**
 * Extracts and parses a PikPak share URL or share ID.
 * Supports:
 * - `https://mypikpak.com/s/xxxx4xxxyxxxxxxxxxxxxxxx`
 * - `https://mypikpak.com/s/xxxx4xxxyxxxxxxxxxxxxxxx/folderId123`
 * - `xxxx4xxxyxxxxxxxxxxxxxxx`
 */
export function parseShareUrl(rawUrlOrId: string): ParsedShareUrl {
  if (!rawUrlOrId) {
    return { shareId: '', parentId: '' };
  }

  const trimmed = rawUrlOrId.trim();
  const match = /^https?:\/\/[^/]+\/s\/([^/?#]+)(?:\/([^/?#]+))?/i.exec(trimmed);
  if (match) {
    return {
      shareId: match[1] || '',
      parentId: match[2] || '',
    };
  }

  // Also check if someone passed a path like /s/<id>
  const pathMatch = /\/s\/([^/?#]+)(?:\/([^/?#]+))?/.exec(trimmed);
  if (pathMatch) {
    return {
      shareId: pathMatch[1] || '',
      parentId: pathMatch[2] || '',
    };
  }

  // Assume raw ID
  return {
    shareId: trimmed,
    parentId: '',
  };
}
