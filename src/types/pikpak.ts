// pikpak-sdk/src/types/pikpak.ts

export interface PikPakLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface PikPakClientOptions {
  /** PikPak account username/email/phone (optional for login/fromEnv) */
  username?: string;
  /** PikPak account password (optional for login/fromEnv) */
  password?: string;
  /** Existing access token (JWT) */
  accessToken?: string;
  /** Existing refresh token */
  refreshToken?: string;
  /** Custom device ID (auto-generated if omitted) */
  deviceId?: string;
  /** Client ID (defaults to RClone client ID for highest compatibility) */
  clientId?: string;
  /** Client secret (if needed for specific client types) */
  clientSecret?: string;
  /** Custom base API endpoint */
  baseUrlApi?: string;
  /** Custom base User endpoint */
  baseUrlUser?: string;
  /** Custom base Access endpoint */
  baseUrlAccess?: string;
  /** Custom base Config endpoint */
  baseUrlConfig?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Request retry attempts (default: 3) */
  retries?: number;
  /** Custom logger instance or false to suppress all logs */
  logger?: PikPakLogger | false;
  /** Callback fired whenever access/refresh tokens are refreshed */
  onTokenRefresh?: (accessToken: string, refreshToken: string) => void;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  retries?: number;
  timeoutMs?: number;
  skipAutoRefresh?: boolean;
  skipCaptcha?: boolean;
  signal?: AbortSignal;
}

export interface PikPakMediaLink {
  url?: string;
  expires?: string;
  priority?: number;
}

export interface PikPakMedia {
  media_id?: string;
  media_name?: string;
  link?: PikPakMediaLink;
  need_more_quota?: boolean;
  vip_limit?: string;
  [key: string]: any;
}

export interface PikPakFile {
  kind: string;
  id: string;
  name: string;
  parent_id: string;
  size: string;
  mime_type: string;
  hash: string;
  phase: string;
  created_time: string;
  modified_time: string;
  thumbnail_link?: string;
  web_content_link?: string;
  trashed?: boolean;
  folder_type?: string;
  links?: Record<string, { url?: string; [key: string]: any }>;
  medias?: PikPakMedia[];
  starred?: boolean;
  [key: string]: any;
}

export interface FileListOptions {
  parentId?: string;
  limit?: number;
  pageToken?: string;
  space?: string;
  filters?: Record<string, any>;
  withAudit?: boolean;
  thumbnailSize?: string;
}

export interface FileListResponse {
  kind: string;
  next_page_token: string;
  files: PikPakFile[];
}

export interface XForm {
  url: string;
  method: string;
  multi_parts: Record<string, string>;
}

export interface XResumable {
  kind: string;
  provider: string;
  params: {
    access_key_id: string;
    access_key_secret: string;
    security_token: string;
    endpoint: string;
    bucket: string;
    key: string;
  };
}

export interface CreateFileData {
  upload_type: string;
  form?: XForm;
  resumable?: XResumable;
  file?: PikPakFile;
  task?: {
    id: string;
    kind: string;
    name: string;
    phase: string;
  };
}

export interface UploadFileOptions {
  parentId?: string;
  space?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  hash?: string;
}

export interface PikPakTask {
  kind: string;
  id: string;
  name: string;
  type: string;
  phase: string;
  progress: number;
  created_time: string;
  modified_time: string;
  file_id: string;
  file_name: string;
  file_size: string;
  message: string;
  icon_link?: string;
  [key: string]: any;
}

export interface TaskListResponse {
  kind: string;
  next_page_token: string;
  tasks: PikPakTask[];
}

export interface AboutResponse {
  kind: string;
  quota: {
    kind: string;
    limit: string;
    usage: string;
    usage_in_trash: string;
    is_unlimited: boolean;
  };
  expires_at: string;
  [key: string]: any;
}

export interface CaptchaResponse {
  captcha_token: string;
  expires_in: number;
  url?: string;
}

export interface PikPakProfile {
  sub: string;
  name: string;
  email: string;
  phone_number: string;
  avatar_url: string;
  gender: string;
  birthday: string;
  created_at: string;
  status: string;
  [key: string]: any;
}

export interface PikPakDevice {
  device_id: string;
  device_name: string;
  device_model: string;
  last_login_time: string;
  is_current: boolean;
  [key: string]: any;
}

export interface PikPakShare {
  id: string;
  kind: string;
  name: string;
  share_url: string;
  pass_code: string;
  view_count: string;
  download_count: string;
  save_count: string;
  created_time: string;
  expiration_time: string;
  status: string;
  [key: string]: any;
}

export interface ShareListResponse {
  kind: string;
  next_page_token: string;
  shares: PikPakShare[];
}

export interface LoginResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  sub: string;
  [key: string]: any;
}

export interface ShareInfoResponse {
  share_status: string;
  share_status_text?: string;
  file_num?: string;
  files?: PikPakFile[];
  next_page_token?: string;
  pass_code_token?: string;
  [key: string]: any;
}

export interface ShareDetailResponse {
  share_status: string;
  share_status_text?: string;
  files?: PikPakFile[];
  next_page_token?: string;
  pass_code_token?: string;
  [key: string]: any;
}

export interface ShareRestoreResponse {
  share_status: string;
  share_status_text?: string;
  file_id: string;
  restore_status: string;
  restore_task_id: string;
  params?: Record<string, any>;
  [key: string]: any;
}

export interface RestoreOptions {
  shareId: string;
  fileIds: string[];
  ancestorIds?: string[];
  passCodeToken?: string;
  traceFileIds?: string[];
}

export interface ParsedShareUrl {
  shareId: string;
  parentId: string;
}
