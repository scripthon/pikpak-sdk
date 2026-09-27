// pikpak-sdk/src/constants/pikpak.ts

/**
 * Port of XConstants.java from PikPak Android source code,
 * combined with project-specific technical constants.
 */
export const PIKPAK_CONSTANTS = {
  // --- Technical/Project Constants ---
  CLIENT_ID_ANDROID: "YNxT9w7GMdWvEOKa",
  CLIENT_ID_RCLONE: "YUMx5nI8ZU8Ap8pm",
  CLIENT_SECRET_ANDROID: "dbw2OtmVEeuUvIptb1Coyg",
  BASE_URL_USER: "https://user.mypikpak.com",
  BASE_URL_API: "https://api-drive.mypikpak.com",
  BASE_URL_ACCESS: "https://access.mypikpak.com",
  BASE_URL_CONFIG: "https://config.mypikpak.com",

  // Backup Domains for Rotation
  API_DOMAINS: [
    "api-drive.mypikpak.com",
    "api-drive.mypikpak.net",
    "api-drive.pikpakdrive.com",
    "api-drive.pikpak.me",
    "api-drive.filepax.com"
  ],
  APP_VERSION: "2.2.6",
  PACKAGE_NAME: "com.pikcloud.pikpak",
  USER_AGENT_RCLONE: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0",
  USER_AGENT_ANDROID: "PikPak/2.2.6 (android; 10274)",

  // --- From XConstants.java ---

  AddScene: {
    ADD_PANEL_PLAY_NOW: "add_play",
    NONE: "",
  },

  AppId: {
    DECOMPRESS: "decompress",
  },

  Attribute: {
    HIDDEN: 1,
    NONE: -1,
    NORMAL: 0,
    SHARED: 2,
  },

  Audit: {
    OK: "STATUS_OK",
    SENSETIVE_RESOURCE: "STATUS_SENSITIVE_RESOURCE",
    SENSETIVE_WORD: "STATUS_SENSITIVE_WORD",
    UNKNOWN: "STATUS_UNKNOWN",
  },

  CommonSelectType: {
    DISPLAY_FILE: 2,
    LANGUAGE: 0,
    PLAY_WAYS: 1,
    SUBTITLE_FONT: 6,
    TV_PHONE_CODE: 3,
    TV_PLAY_WAY: 4,
    TV_RESOLUTION: 5,
  },

  CommonVipType: {
    GLOBAL: "global",
    ORIGINAL: "regional",
  },

  DeviceTaskType: {
    DOWNLOAD: "user#download",
    DOWNLOAD_URL: "user#download-url",
    PLAY: "user#play",
  },

  DeviceType: {
    RUNNER: "user#runner",
  },

  ErrorCode: {
    ERROR_ACCESS: -3,
    ERROR_CAPTION_TOKEN: -10,
    ERROR_IN_RECYCLE_BIN: -8,
    ERROR_LIMIT_CACHE: -7,
    ERROR_LIMIT_PLAY: -6,
    ERROR_MOVED_TO_SAFE: -12,
    ERROR_NETWORK: -2,
    ERROR_NOT_ENOUGH: -5,
    ERROR_NOT_FOUND: -4,
    ERROR_SAFE_BOX_PASSWORD: -9,
    ERROR_UNKNOWN: -1,
    ERROR_UN_INIT: -11,
  },

  EventType: {
    CREATE: "TYPE_CREATE",
    DELETE: "TYPE_DELETE",
    DOWNLOAD: "TYPE_DOWNLOAD",
    PLAY: "TYPE_PLAY",
    RESTORE: "TYPE_RESTORE",
    UPDATE: "TYPE_UPDATE",
    UPLOAD: "TYPE_UPLOAD",
    VIEW: "TYPE_VIEW",
  },

  FallbackLocalCollect: {
    FallbackLocalCollect: 1,
    NotLocalCollect: 0,
    NotTryCloudDownloadTask: -1,
  },

  FileType: {
    APK: 6,
    AUDIO: 3,
    BOOK: 7,
    IMAGE: 2,
    OTHER: 0,
    RAR: 5,
    TORRENT: 4,
    URL_ORIGINAL: 9,
    URL_SNAPSHOT: 8,
    VIDEO: 1,
  },

  FolderType: {
    DECOMPRESS: "DECOMPRESS",
    DISPLAY_ON_TV_FILES: "DISPLAY_ON_TV_FILES",
    DOWNLOAD: "DOWNLOAD",
    NORMAL: "NORMAL",
    PHOTO_LIST: "PHOTO_LIST",
    RESTORE: "RESTORE",
    ROOT: "",
    SAFE_BOX: "SAFE",
    SEARCH_FILES: "SEARCH_FILES",
    SHARE_FILES: "SHARE_FILES",
    STAR_FILES: "STAR_FILES",
  },

  Kind: {
    FILE: "drive#file",
    FOLDER: "drive#folder",
    TASK: "drive#task",
  },

  LocalChooseType: {
    FILE: 1,
    FOLDER: 2,
  },

  PasswordScene: {
    SAFE_BOX: "box",
  },

  Phase: {
    COMPLETE: "PHASE_TYPE_COMPLETE",
    ERROR: "PHASE_TYPE_ERROR",
    PENDING: "PHASE_TYPE_PENDING",
    RUNNING: "PHASE_TYPE_RUNNING",
    UNKNOWN: "PHASE_TYPE_UNKNOWN",
  },

  PhaseDetail: {
    TASK_DAILY_CREATE_LIMIT: "task_daily_create_limit",
    TASK_FILE_DELETED: "task_file_deleted",
    TASK_FILE_MAYBE_ADS: "file_maybe_ads",
    TASK_SPACE_NOT_ENOUGH: "file_space_not_enough",
  },

  PredictType: {
    ALL: 3,
    INIT: -1,
    NONE: 1,
    PART: 2,
    UNKNOWN: 0,
  },

  Privilege: {
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
    REVIEWING: "REVIEWING",
    UNSUBMITTED: "UNSUBMITTED",
  },

  Provider: {
    ALIYUN: "PROVIDER_ALIYUN",
    UNKNOWN: "PROVIDER_UNKNOWN",
  },

  RedPointGroup: {
    DEFAULT: "default",
  },

  RedPointKey: {
    SAFE_BOX_BOTTOM_MORE: "safe_box_bottom_more",
    SAFE_BOX_COMMON: "safe_box_common",
  },

  RestoreStatus: {
    COMPLETE: "RESTORE_COMPLETE",
    ERROR: "RESTORE_ERROR",
    START: "RESTORE_START",
    UNKNOWN: "RESTORE_UNKNOWN",
  },

  SaveAs: {
    SNAPSHOT: "snapshot",
    URL: "url",
  },

  ShareStatus: {
    AUDITING: "AUDITING",
    DELETED: "DELETED",
    EXPIRED: "EXPIRED",
    MAX_RESTORE_COUNT: "MAX_RESTORE_COUNT",
    OK: "OK",
    PASS_CODE_EMPTY: "PASS_CODE_EMPTY",
    PASS_CODE_ERROR: "PASS_CODE_ERROR",
    SENSITIVE_RESOURCE: "SENSITIVE_RESOURCE",
    SENSITIVE_WORD: "SENSITIVE_WORD",
  },

  Space: {
    DEFAULT: "",
    ROOT: "SPACE_ROOT",
    SAFE_BOX: "SPACE_SAFE",
  },

  SpaceProperty: {
    PASSWORD: "password",
  },

  TaskExtraType: {
    DOWNLOAD: "download",
    NONE: "",
  },

  TaskType: {
    COPY: "copy",
    DECOMPRESS: "decompress",
    EMPTY_TRASH: "emptytrash",
    MOVE: "move",
    OFFLINE: "offline",
    RESTORE: "restore",
  },

  ThumbnailSize: {
    LARGE: "SIZE_LARGE",
    MEDIUM: "SIZE_MEDIUM",
    NONE: "",
    SMALL: "SIZE_SMALL",
  },

  Trashed: {
    FAKE: 1,
    NONE: 0,
    REAL: 2,
  },

  UploadType: {
    FORM: "UPLOAD_TYPE_FORM",
    RESUMABLE: "UPLOAD_TYPE_RESUMABLE",
    UNKNOWN: "UPLOAD_TYPE_UNKNOWN",
    URL: "UPLOAD_TYPE_URL",
  },

  Usage: {
    ALL: "ALL",
    CACHE: "CACHE",
    CACHE_ALL: "CACHE_ALL",
    FETCH: "FETCH",
    NONE: "",
    OPEN: "PLAY",
  },

  VipLimit: {
    NONE: "none",
    VIP: "vip.ordinary",
  },

  VipLimitIcon: {
    LIMITED_OFFER: "limited_offer",
    NONE: "none",
    PREMIUM: "premium",
  },

  VipTrailScene: {
    CLOUD_PLAY: "CLOUD_PLAY",
    PAN_PACK_DOWNLOAD_BAIJIN: "PAN_PACK_DOWNLOAD_BAIJIN",
    PAN_PACK_DOWNLOAD_SUPER: "PAN_PACK_DOWNLOAD_SUPER",
  },

  XMediaCategory: {
    CATEGORY_ORIGIN: "category_origin",
    CATEGORY_TRANSCODE: "category_transcode",
  },

  XPanChooseOption: {
    OPTION_CAN_CHOOSE_FILE: 1,
    OPTION_CAN_CHOOSE_FOLDER: 2,
    OPTION_CAN_MULTI_CHOICE: 4,
    OPTION_INIT_DIR_ROOT: 16,
    OPTION_SHOW_SAFE_BOX: 8,
    OPTION_SHOW_TOP_BACK: 32,
  },
} as const;
