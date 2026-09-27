// pikpak-sdk/src/services/ShareService.ts
import type { PikPakClient } from '../client/PikPakClient';
import { PIKPAK_CONSTANTS } from '../constants/pikpak';
import type {
  ShareInfoResponse,
  ShareDetailResponse,
  ShareRestoreResponse,
  RestoreOptions,
} from '../types/pikpak';
import { parseShareUrl } from '../utils/url';
import { extractDownloadUrl } from '../utils/download';

/**
 * Service for browsing and consuming public/private share links,
 * resolving media content URLs, and restoring items into an authenticated account.
 */
export class ShareService {
  constructor(private client: PikPakClient) {}

  /**
   * Helper to extract share ID from a raw ID or full URL.
   */
  public parseUrl(urlOrId: string) {
    return parseShareUrl(urlOrId);
  }

  /**
   * Fetches share meta information and returns the initial file list and pass_code_token.
   */
  public async getShareInfo(shareIdOrUrl: string, passCode: string = ''): Promise<ShareInfoResponse> {
    const { shareId } = parseShareUrl(shareIdOrUrl);
    const query: Record<string, string> = {
      share_id: shareId,
      limit: '100',
      thumbnail_size: PIKPAK_CONSTANTS.ThumbnailSize.LARGE,
    };
    if (passCode) query.pass_code = passCode;
    return await this.client.request('/drive/v1/share', { query });
  }

  /**
   * Resolves the pass_code_token required for accessing private or restricted shares.
   */
  public async getPassCodeToken(shareIdOrUrl: string, passCode: string = ''): Promise<string> {
    const info = await this.getShareInfo(shareIdOrUrl, passCode);
    return info.pass_code_token || '';
  }

  /**
   * Lists files and folders inside a share.
   */
  public async listShareFiles(
    shareIdOrUrl: string,
    options: {
      parentId?: string;
      passCodeToken?: string;
      pageToken?: string;
      limit?: number;
      filters?: Record<string, any>;
    } = {}
  ): Promise<ShareDetailResponse> {
    const { shareId } = parseShareUrl(shareIdOrUrl);
    const {
      parentId = '',
      passCodeToken = '',
      pageToken = '',
      limit = 100,
      filters = { phase: { eq: 'PHASE_TYPE_COMPLETE' }, trashed: { eq: false } },
    } = options;

    const query: Record<string, string> = {
      share_id: shareId,
      parent_id: parentId,
      pass_code_token: passCodeToken,
      thumbnail_size: PIKPAK_CONSTANTS.ThumbnailSize.LARGE,
      with_audit: 'true',
      limit: limit.toString(),
      filters: JSON.stringify(filters),
    };

    if (pageToken) query.page_token = pageToken;
    return await this.client.request('/drive/v1/share/detail', { query });
  }

  /**
   * Alias for listShareFiles (matching pikpak.ts convenience method).
   */
  public async shareDetail(
    shareIdOrUrl: string,
    parentId: string = '',
    pageToken: string = '',
    passCodeToken: string = ''
  ): Promise<ShareDetailResponse> {
    return this.listShareFiles(shareIdOrUrl, { parentId, pageToken, passCodeToken });
  }

  /**
   * Gets details (including stream and download links) for a single shared file.
   */
  public async getShareFileInfo(
    shareIdOrUrl: string,
    fileId: string,
    passCodeToken: string = ''
  ): Promise<any> {
    const { shareId } = parseShareUrl(shareIdOrUrl);
    const query: Record<string, string> = {
      share_id: shareId,
      file_id: fileId,
      pass_code_token: passCodeToken,
    };
    return await this.client.request('/drive/v1/share/file_info', { query });
  }

  /**
   * Alias for getShareFileInfo (matching pikpak.ts convenience method).
   */
  public async fileInfo(
    shareIdOrUrl: string,
    fileId: string,
    passCodeToken: string = ''
  ): Promise<any> {
    return this.getShareFileInfo(shareIdOrUrl, fileId, passCodeToken);
  }

  /**
   * Resolves the direct streaming/download URL for a shared file.
   */
  public async resolveContentUrl(
    shareIdOrUrl: string,
    fileId: string,
    passCodeToken: string = ''
  ): Promise<string | null> {
    const info = await this.getShareFileInfo(shareIdOrUrl, fileId, passCodeToken);
    const fileData = info?.file_info ?? info;
    return extractDownloadUrl(fileData);
  }

  /**
   * Builds the ancestor id chain (share root -> immediate parent) for a target file.
   * Required by the restore endpoint.
   */
  public async resolveAncestorIds(
    shareIdOrUrl: string,
    fileId: string,
    passCodeToken: string = ''
  ): Promise<string[]> {
    const { shareId } = parseShareUrl(shareIdOrUrl);
    const queue: { parentId: string; path: string[] }[] = [{ parentId: '', path: [] }];

    while (queue.length > 0) {
      const { parentId, path } = queue.shift()!;
      let pageToken = '';
      do {
        const res = await this.listShareFiles(shareId, { parentId, passCodeToken, pageToken });
        for (const f of res.files ?? []) {
          if (f.id === fileId) return path;
          if (f.kind === PIKPAK_CONSTANTS.Kind.FOLDER) {
            queue.push({ parentId: f.id, path: [...path, f.id] });
          }
        }
        pageToken = res.next_page_token ?? '';
      } while (pageToken);
    }

    return [];
  }

  /**
   * Restores (saves) items from a public or private share directly into the authenticated account.
   */
  public async restore(options: RestoreOptions): Promise<ShareRestoreResponse> {
    const { shareId: rawShareId, fileIds, ancestorIds = [], passCodeToken = '', traceFileIds } = options;
    const { shareId } = parseShareUrl(rawShareId);

    const body = {
      share_id: shareId,
      pass_code_token: passCodeToken,
      file_ids: fileIds,
      params: { trace_file_ids: (traceFileIds ?? fileIds).join(',') },
      ancestor_ids: ancestorIds,
    };

    return await this.client.request('/drive/v1/share/restore', { method: 'POST', body });
  }
}
