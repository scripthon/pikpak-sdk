// pikpak-sdk/src/index.ts

// Client
export {
  PikPakClient,
  PikPakClient as PikPak,
} from './client/PikPakClient';

// Services
export { AuthService } from './services/AuthService';
export { DriveService } from './services/DriveService';
export { ShareService } from './services/ShareService';
export { VipService, type VipInfoResponse } from './services/VipService';
export { ConfigService } from './services/ConfigService';

// Errors
export {
  PikPakError,
  PikPakApiError,
  PikPakAuthError,
  PikPakCaptchaError,
  PikPakNetworkError,
} from './errors';

// Types & Constants
export * from './types/pikpak';
export * from './constants/pikpak';

// Utils
export { calculateGcid, calculateGcidFromBuffer, getGcidBlockSize } from './utils/gcid';
export { extractDownloadUrl, getDownloadUrl } from './utils/download';
export { generateM3u8, formatM3u8, type M3u8Entry } from './utils/m3u8';
export { generateCaptchaSign, ANDROID_SALTS, RCLONE_SALTS } from './utils/sign';
export { parseShareUrl } from './utils/url';

import { PikPakClient } from './client/PikPakClient';
export default PikPakClient;
