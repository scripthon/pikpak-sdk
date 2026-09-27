// pikpak-sdk/src/services/DriveService.ts
import type { PikPakClient } from '../client/PikPakClient';
import { PIKPAK_CONSTANTS } from '../constants/pikpak';
import type {
  FileListResponse,
  PikPakFile,
  CreateFileData,
  TaskListResponse,
  ShareListResponse,
  PikPakTask,
  FileListOptions,
  UploadFileOptions,
  AboutResponse,
} from '../types/pikpak';
import { calculateGcid, calculateGcidFromBuffer } from '../utils/gcid';
import { extractDownloadUrl } from '../utils/download';
import fs from 'fs';
import path from 'path';

export class DriveService {
  constructor(private client: PikPakClient) {}

  /**
   * Lists files and folders.
   */
  public async listFiles(options: FileListOptions = {}): Promise<FileListResponse> {
    const {
      parentId = "",
      limit = 100,
      pageToken = "",
      space = "",
      filters = { trashed: { eq: false } },
      withAudit = true,
      thumbnailSize = PIKPAK_CONSTANTS.ThumbnailSize.LARGE,
    } = options;

    const query: Record<string, string> = {
      parent_id: parentId,
      limit: limit.toString(),
      filters: JSON.stringify(filters),
      with_audit: withAudit ? "true" : "false",
      thumbnail_size: thumbnailSize,
    };

    if (pageToken) query.page_token = pageToken;
    if (space) query.space = space;

    return await this.client.request('/drive/v1/files', { query });
  }

  /**
   * Gets detailed information about a file or folder.
   */
  public async getFileDetail(id: string, usage: string = 'FETCH'): Promise<PikPakFile> {
    return await this.client.request(`/drive/v1/files/${id}`, {
      query: { usage },
    });
  }

  /**
   * Shortcut to get file details.
   */
  public async getFile(id: string): Promise<PikPakFile> {
    return this.getFileDetail(id);
  }

  /**
   * Resolves direct download URL for a file.
   */
  public async getDownloadUrl(id: string): Promise<string | null> {
    const file = await this.getFileDetail(id);
    return extractDownloadUrl(file);
  }

  /**
   * Creates a new folder.
   */
  public async createFolder(name: string, parentId: string = "", space: string = ""): Promise<CreateFileData> {
    const body: Record<string, any> = {
      kind: PIKPAK_CONSTANTS.Kind.FOLDER,
      parent_id: parentId,
      name,
    };
    if (space) body.space = space;
    return await this.client.request('/drive/v1/files', { method: 'POST', body });
  }

  /**
   * Initiates a file upload session.
   * Can be used to check if a file can be instantly uploaded via hash matching.
   */
  public async initUpload(
    name: string,
    size: number,
    hash: string,
    parentId: string = "",
    space: string = ""
  ): Promise<CreateFileData> {
    const body: Record<string, any> = {
      kind: PIKPAK_CONSTANTS.Kind.FILE,
      parent_id: parentId,
      name,
      size: size.toString(),
      hash,
      upload_type: PIKPAK_CONSTANTS.UploadType.RESUMABLE,
      objProvider: { provider: PIKPAK_CONSTANTS.Provider.UNKNOWN },
    };
    if (space) body.space = space;
    return await this.client.request('/drive/v1/files', { method: 'POST', body });
  }

  /**
   * Uploads a file to PikPak.
   * Accepts:
   * - Local file path (string)
   * - Buffer or Uint8Array
   * - Web Blob or File
   * Handles Instant upload (hash match), Form upload, and Resumable OSS upload transparently.
   */
  public async uploadFile(
    input: string | Buffer | Uint8Array | Blob,
    options: UploadFileOptions = {}
  ): Promise<PikPakFile | PikPakTask | any> {
    let name = options.fileName;
    let size = options.fileSize;
    let hash = options.hash;
    let dataBuffer: Buffer | Uint8Array | null = null;
    let isPath = false;

    if (typeof input === 'string') {
      isPath = true;
      name = name || path.basename(input);
      const stats = await fs.promises.stat(input);
      size = size ?? stats.size;
      if (!hash) {
        hash = await calculateGcid(input);
      }
    } else if (input instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(input))) {
      dataBuffer = input;
      name = name || 'file.bin';
      size = size ?? dataBuffer.length;
      if (!hash) {
        hash = calculateGcidFromBuffer(dataBuffer);
      }
    } else if (input instanceof Blob) {
      name = name || (input as any).name || 'file.bin';
      size = size ?? input.size;
      const arrayBuffer = await input.arrayBuffer();
      dataBuffer = new Uint8Array(arrayBuffer);
      if (!hash) {
        hash = calculateGcidFromBuffer(dataBuffer);
      }
    } else {
      throw new Error('Unsupported input type for uploadFile. Expected file path string, Buffer, Uint8Array, or Blob');
    }

    if (!name || size === undefined || !hash) {
      throw new Error('Could not determine name, size, or GCID hash for upload');
    }

    const initRes = await this.initUpload(name, size, hash, options.parentId || '', options.space || '');

    // 1. Instant upload (file exists on PikPak server)
    if (initRes.file) {
      return initRes.file;
    }

    // Prepare bytes to upload
    const payload = isPath ? await fs.promises.readFile(input as string) : dataBuffer!;

    // 2. Form upload
    if (initRes.upload_type === PIKPAK_CONSTANTS.UploadType.FORM && initRes.form) {
      const formData = new FormData();
      for (const [key, value] of Object.entries(initRes.form.multi_parts || {})) {
        formData.append(key, value);
      }
      formData.append("file", new Blob([payload]), name);

      const res = await fetch(initRes.form.url, {
        method: initRes.form.method || 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Form upload failed with status ${res.status}: ${res.statusText}`);
      }
      return initRes.task || initRes.file;
    }

    // 3. Resumable OSS upload
    if (initRes.upload_type === PIKPAK_CONSTANTS.UploadType.RESUMABLE && initRes.resumable) {
      const { params } = initRes.resumable;
      const endpoint = params.endpoint.startsWith('http') ? params.endpoint : `https://${params.endpoint}`;
      const uploadUrl = `${endpoint}/${params.key}`;

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-oss-security-token': params.security_token,
          'Content-Type': options.mimeType || 'application/octet-stream',
        },
        body: payload,
      });

      if (!res.ok) {
        throw new Error(`Resumable upload failed with status ${res.status}: ${res.statusText}`);
      }
      return initRes.task || initRes.file;
    }

    throw new Error(`Unsupported upload type: ${initRes.upload_type}`);
  }

  /**
   * Creates an offline cloud download task (e.g. from magnet, torrent, or HTTP URL).
   */
  public async createTask(url: string, parentId: string = ""): Promise<CreateFileData> {
    const body = {
      kind: PIKPAK_CONSTANTS.Kind.FILE,
      upload_type: PIKPAK_CONSTANTS.UploadType.URL,
      url: { url },
      parent_id: parentId,
      folder_type: parentId ? "" : PIKPAK_CONSTANTS.FolderType.DOWNLOAD,
    };
    return await this.client.request('/drive/v1/files', { method: 'POST', body });
  }

  /**
   * Lists offline download tasks.
   */
  public async listTasks(pageToken: string = "", filter: Record<string, any> = {}): Promise<TaskListResponse> {
    const query: Record<string, string> = {
      page_token: pageToken,
      thumbnail_size: PIKPAK_CONSTANTS.ThumbnailSize.LARGE,
      with: "reference_resource",
    };
    if (Object.keys(filter).length > 0) {
      query.filters = JSON.stringify(filter);
    }
    return await this.client.request('/drive/v1/tasks', { query });
  }

  /**
   * Gets a specific task by ID.
   */
  public async getTask(taskId: string): Promise<PikPakTask> {
    return await this.client.request(`/drive/v1/tasks/${taskId}`);
  }

  /**
   * Deletes tasks by their IDs.
   */
  public async deleteTasks(ids: string[]): Promise<void> {
    const query: Record<string, any> = {};
    const params = new URLSearchParams();
    ids.forEach((id) => params.append("task_ids", id));
    await this.client.request(`/drive/v1/tasks?${params.toString()}`, { method: 'DELETE' });
  }

  /**
   * Moves files or folders to trash.
   */
  public async trashFiles(ids: string[], space: string = ""): Promise<void> {
    const body: Record<string, any> = { ids };
    if (space) body.space = space;
    await this.client.request('/drive/v1/files:batchTrash', { method: 'POST', body });
  }

  /**
   * Permanently deletes items.
   */
  public async deleteFilesPermanent(ids: string[], space: string = ""): Promise<void> {
    const body: Record<string, any> = { ids };
    if (space) body.space = space;
    await this.client.request('/drive/v1/files:batchDelete', { method: 'POST', body });
  }

  /**
   * Moves or copies items to a target folder.
   */
  public async moveCopy(
    ids: string[],
    toParentId: string,
    operation: 'move' | 'copy' = 'move',
    space: string = ""
  ): Promise<void> {
    const action = operation === 'move' ? 'batchMove' : 'batchCopy';
    const body: Record<string, any> = {
      ids,
      to: { parent_id: toParentId },
    };
    if (space) body.space = space;
    await this.client.request(`/drive/v1/files:${action}`, { method: 'POST', body });
  }

  /**
   * Shortcut to move items.
   */
  public async move(ids: string[], toParentId: string, space: string = ""): Promise<void> {
    return this.moveCopy(ids, toParentId, 'move', space);
  }

  /**
   * Shortcut to copy items.
   */
  public async copy(ids: string[], toParentId: string, space: string = ""): Promise<void> {
    return this.moveCopy(ids, toParentId, 'copy', space);
  }

  /**
   * Renames a file or folder.
   */
  public async renameFile(id: string, name: string): Promise<void> {
    await this.client.request(`/drive/v1/files/${id}`, { method: 'PATCH', body: { name } });
  }

  /**
   * Stars or unstars items.
   */
  public async starFiles(ids: string[], star: boolean = true): Promise<void> {
    const action = star ? 'star' : 'unstar';
    await this.client.request(`/drive/v1/files:${action}`, { method: 'POST', body: { ids } });
  }

  /**
   * Searches for files by name.
   */
  public async searchFiles(
    keyword: string,
    options: { space?: string; limit?: number } = {}
  ): Promise<FileListResponse> {
    const query: Record<string, string> = {
      parent_id: "*",
      limit: (options.limit || 1000).toString(),
      with_audit: "true",
    };
    if (options.space) query.space = options.space;

    const res = (await this.client.request('/drive/v1/files', { query })) as FileListResponse;

    if (res.files) {
      const lowerKeyword = keyword.toLowerCase();
      res.files = res.files.filter(
        (f) => f.name.toLowerCase().includes(lowerKeyword) && f.trashed === false
      );
    }

    return res;
  }

  /**
   * Gets storage quota information.
   */
  public async getQuota(): Promise<AboutResponse> {
    return await this.client.request('/drive/v1/about');
  }

  /**
   * Creates a public share link for files.
   */
  public async shareFiles(
    ids: string[],
    options: { expirationDays?: number; passCodeOption?: string } = {}
  ): Promise<any> {
    const body = {
      file_ids: ids,
      share_to: "publiclink",
      expiration_days: options.expirationDays ?? -1,
      pass_code_option: options.passCodeOption || "NOT_REQUIRED",
    };
    return await this.client.request('/drive/v1/share', { method: 'POST', body });
  }

  /**
   * Lists public share links created by the user.
   */
  public async listShares(options: { limit?: number; pageToken?: string } = {}): Promise<ShareListResponse> {
    const { limit = 100, pageToken = "" } = options;
    const query: Record<string, string> = {
      limit: limit.toString(),
      thumbnail_size: PIKPAK_CONSTANTS.ThumbnailSize.LARGE,
    };
    if (pageToken) query.page_token = pageToken;
    return await this.client.request('/drive/v1/share/list', { query });
  }

  /**
   * Deletes public share links.
   */
  public async unshareFiles(shareIds: string[]): Promise<void> {
    await this.client.request('/drive/v1/share:batchDelete', {
      method: 'POST',
      body: { ids: shareIds },
    });
  }

  /**
   * Restores items from trash.
   */
  public async untrashFiles(ids: string[]): Promise<void> {
    await this.client.request('/drive/v1/files:batchUntrash', { method: 'POST', body: { ids } });
  }

  /**
   * Permanently empties all files in the trash.
   */
  public async emptyTrash(): Promise<any> {
    return await this.client.request('/drive/v1/files/trash:empty', { method: 'PATCH', body: {} });
  }

  /**
   * Lists items currently in trash.
   */
  public async listTrash(options: { limit?: number; pageToken?: string } = {}): Promise<FileListResponse> {
    const { limit = 100, pageToken = "" } = options;
    const filter = { trashed: { eq: true } };
    const query: Record<string, string> = {
      parent_id: "*",
      limit: limit.toString(),
      filters: JSON.stringify(filter),
      with_audit: "true",
      thumbnail_size: PIKPAK_CONSTANTS.ThumbnailSize.LARGE,
    };
    if (pageToken) query.page_token = pageToken;
    return await this.client.request('/drive/v1/files', { query });
  }

  /**
   * Requests cloud archive decompression (ZIP/RAR).
   */
  public async decompress(fileId: string, gcid: string, fileName: string): Promise<any> {
    return await this.client.request('/decompress/v1/url', {
      query: { file_id: fileId, gcid, file_name: fileName },
    });
  }
}
