// pikpak-sdk/src/client/PikPakClient.ts
import { PIKPAK_CONSTANTS } from '../constants/pikpak';
import type {
  PikPakClientOptions,
  RequestOptions,
  LoginResponse,
  CaptchaResponse,
  PikPakLogger,
} from '../types/pikpak';
import { generateCaptchaSign } from '../utils/sign';
import { PikPakApiError, PikPakNetworkError } from '../errors';
import { AuthService } from '../services/AuthService';
import { DriveService } from '../services/DriveService';
import { ShareService } from '../services/ShareService';
import { VipService } from '../services/VipService';
import { ConfigService } from '../services/ConfigService';

/**
 * Main PikPak SDK Client.
 * Orchestrates session authentication, captcha generation, domain rotation,
 * and exposes organized sub-services for all PikPak operations.
 */
export class PikPakClient {
  public accessToken: string;
  public refreshToken: string;
  public deviceId: string;
  public clientId: string;
  public clientSecret?: string;
  public username?: string;
  public password?: string;

  public readonly baseUrlApi: string;
  public readonly baseUrlUser: string;
  public readonly baseUrlAccess: string;
  public readonly baseUrlConfig: string;
  public readonly timeoutMs: number;
  public readonly retries: number;
  public readonly logger?: PikPakLogger | false;

  public onTokenRefresh?: (accessToken: string, refreshToken: string) => void;

  // Sub-services
  public readonly auth: AuthService;
  public readonly drive: DriveService;
  public readonly share: ShareService;
  public readonly shares: ShareService;
  public readonly vip: VipService;
  public readonly config: ConfigService;

  // Concurrency locks
  private refreshPromise: Promise<LoginResponse> | null = null;
  private captchaPromise: Map<string, Promise<string>> = new Map();

  constructor(options: PikPakClientOptions = {}) {
    this.accessToken = options.accessToken || '';
    this.refreshToken = options.refreshToken || '';
    this.deviceId = options.deviceId || this.genDeviceID();
    this.clientId = options.clientId || PIKPAK_CONSTANTS.CLIENT_ID_RCLONE;
    this.clientSecret = options.clientSecret;
    this.username = options.username;
    this.password = options.password;

    this.baseUrlApi = options.baseUrlApi || PIKPAK_CONSTANTS.BASE_URL_API;
    this.baseUrlUser = options.baseUrlUser || PIKPAK_CONSTANTS.BASE_URL_USER;
    this.baseUrlAccess = options.baseUrlAccess || PIKPAK_CONSTANTS.BASE_URL_ACCESS;
    this.baseUrlConfig = options.baseUrlConfig || PIKPAK_CONSTANTS.BASE_URL_CONFIG;
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.retries = options.retries ?? 3;
    this.logger = options.logger;
    this.onTokenRefresh = options.onTokenRefresh;

    // Instantiate sub-services
    this.auth = new AuthService(this);
    this.drive = new DriveService(this);
    this.share = new ShareService(this);
    this.shares = this.share;
    this.vip = new VipService(this);
    this.config = new ConfigService(this);
  }

  /**
   * Creates a PikPak instance pre-configured from environment variables.
   * Checks PIKPAK_USERNAME, PIKPAK_PASSWORD, PIKPAK_ACCESS_TOKEN,
   * PIKPAK_REFRESH_TOKEN, PIKPAK_DEVICE_ID, PIKPAK_CLIENT_ID.
   */
  public static fromEnv(overrides: Partial<PikPakClientOptions> = {}): PikPakClient {
    const env = typeof process !== 'undefined' ? process.env || {} : {};
    return new PikPakClient({
      username: overrides.username || env.PIKPAK_USERNAME,
      password: overrides.password || env.PIKPAK_PASSWORD,
      accessToken: overrides.accessToken || env.PIKPAK_ACCESS_TOKEN,
      refreshToken: overrides.refreshToken || env.PIKPAK_REFRESH_TOKEN,
      deviceId: overrides.deviceId || env.PIKPAK_DEVICE_ID,
      clientId: overrides.clientId || env.PIKPAK_CLIENT_ID,
      ...overrides,
    });
  }

  /**
   * Whether the client currently holds an access token.
   */
  public get isAuthenticated(): boolean {
    return Boolean(this.accessToken);
  }

  /**
   * Sets new access and refresh tokens.
   */
  public setTokens(tokens: { accessToken: string; refreshToken?: string }): void {
    this.accessToken = tokens.accessToken;
    if (tokens.refreshToken !== undefined) {
      this.refreshToken = tokens.refreshToken;
    }
  }

  /**
   * Gets the current tokens.
   */
  public getTokens(): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }

  /**
   * Convenience login helper delegating to AuthService.
   */
  public async login(username?: string, password?: string): Promise<LoginResponse> {
    const user = username || this.username;
    const pass = password || this.password;
    if (!user || !pass) {
      throw new Error('Username and password are required to login');
    }
    return this.auth.login(user, pass);
  }

  /**
   * Convenience logout helper delegating to AuthService.
   */
  public async logout(): Promise<void> {
    return this.auth.logout();
  }

  /**
   * Generates a random device ID in the format expected by PikPak.
   */
  public genDeviceID(): string {
    const base = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".split("");
    for (let i = 0; i < base.length; i++) {
      const char = base[i];
      const r = (Math.random() * 16) | 0;
      if (char === "x") {
        base[i] = r.toString(16);
      } else if (char === "y") {
        base[i] = ((r & 3) | 8).toString(16);
      }
    }
    return base.join("");
  }

  /**
   * Obtains a captcha token for a specific action with concurrency deduplication.
   */
  public async getCaptchaToken(action: string, usernameOverride?: string): Promise<string> {
    const cacheKey = `${action}:${usernameOverride || this.username || ''}`;
    const existingPromise = this.captchaPromise.get(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }

    const promise = (async () => {
      try {
        const url = `${this.baseUrlUser}/v1/shield/captcha/init`;
        const appVersion = "2.0.0";
        const packageName = "mypikpak.com";
        const effectiveUsername = usernameOverride || this.username;

        const meta: Record<string, any> = {};

        if (action === "POST:/v1/auth/signin" && effectiveUsername) {
          meta.username = effectiveUsername;
        } else {
          const timestamp = Date.now();
          let userId = "";
          if (this.accessToken) {
            try {
              const payload = JSON.parse(
                Buffer.from(this.accessToken.split('.')[1] || '', 'base64').toString()
              );
              userId = payload.sub || "";
            } catch {
              // Ignore JWT decode error
            }
          }

          meta.captcha_sign = generateCaptchaSign(
            effectiveUsername || "",
            this.clientId,
            this.deviceId,
            timestamp,
            appVersion,
            packageName
          );
          meta.client_version = appVersion;
          meta.package_name = packageName;
          meta.timestamp = timestamp.toString();
          if (userId) meta.user_id = userId;
        }

        const body = {
          client_id: this.clientId,
          action,
          device_id: this.deviceId,
          meta,
        };

        const headers = {
          'X-Client-Id': this.clientId,
          'User-Agent': PIKPAK_CONSTANTS.USER_AGENT_RCLONE,
        };

        const res = (await this.request(url, {
          method: 'POST',
          headers,
          body,
          skipAutoRefresh: true,
          skipCaptcha: true,
        })) as CaptchaResponse;

        return res.captcha_token;
      } finally {
        this.captchaPromise.delete(cacheKey);
      }
    })();

    this.captchaPromise.set(cacheKey, promise);
    return promise;
  }

  /**
   * Refreshes the access token with concurrency lock to avoid duplicate refreshes.
   */
  public async refreshAccessToken(): Promise<LoginResponse> {
    if (!this.refreshToken) {
      throw new Error("Cannot refresh token: refreshToken is empty");
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const url = `${this.baseUrlUser}/v1/auth/token`;
        const body = {
          client_id: this.clientId,
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
        };
        const headers = {
          'X-Client-Id': this.clientId,
          'User-Agent': PIKPAK_CONSTANTS.USER_AGENT_RCLONE,
        };

        const res = (await this.request(url, {
          method: 'POST',
          headers,
          body,
          skipAutoRefresh: true,
          skipCaptcha: true,
        })) as LoginResponse;

        if (res.access_token) {
          this.accessToken = res.access_token;
          if (res.refresh_token) {
            this.refreshToken = res.refresh_token;
          }
          if (this.onTokenRefresh) {
            this.onTokenRefresh(this.accessToken, this.refreshToken);
          }
        }

        return res;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Generic request method with automatic retry, rate limiting, domain rotation,
   * and automatic token & captcha refresh.
   */
  public async request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      query,
      retries = this.retries,
      timeoutMs = this.timeoutMs,
      skipAutoRefresh = false,
      skipCaptcha = false,
      signal,
    } = options;

    let attempt = 0;
    let currentUrl = url;

    // Resolve base URL if path is relative
    if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
      if (currentUrl.startsWith('/v1/shield') || currentUrl.startsWith('/v1/auth') || currentUrl.startsWith('/v1/user')) {
        currentUrl = `${this.baseUrlUser}${currentUrl}`;
      } else if (currentUrl.startsWith('/config/')) {
        currentUrl = `${this.baseUrlConfig}${currentUrl}`;
      } else if (currentUrl.startsWith('/access_controller/')) {
        currentUrl = `${this.baseUrlAccess}${currentUrl}`;
      } else {
        currentUrl = `${this.baseUrlApi}${currentUrl}`;
      }
    }

    // Attach query params if provided
    if (query && Object.keys(query).length > 0) {
      const urlObj = new URL(currentUrl);
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          urlObj.searchParams.set(key, String(value));
        }
      }
      currentUrl = urlObj.toString();
    }

    // Auto-attach Captcha Token for Drive API requests if not skipped
    if (!skipCaptcha && currentUrl.includes('/drive/v1/')) {
      try {
        const urlObj = new URL(currentUrl);
        const action = `${method}:${urlObj.pathname}`;
        const captchaToken = await this.getCaptchaToken(action);
        if (captchaToken) {
          headers['X-Captcha-Token'] = captchaToken;
        }
      } catch (err: any) {
        if (this.logger && this.logger.warn) {
          this.logger.warn(`Auto-Captcha Warning: ${err?.message}`);
        }
      }
    }

    while (attempt <= retries) {
      try {
        const abortController = new AbortController();
        const timeoutTimer = setTimeout(() => abortController.abort(), timeoutMs);

        // Chain with user signal if provided
        if (signal) {
          signal.addEventListener('abort', () => abortController.abort());
        }

        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Id': this.clientId,
            'X-Device-Id': this.deviceId,
            'X-Client-Version': PIKPAK_CONSTANTS.APP_VERSION,
            'User-Agent': PIKPAK_CONSTANTS.USER_AGENT_RCLONE,
            ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
            ...headers,
          },
          signal: abortController.signal,
        };

        if (body !== undefined) {
          if (typeof body === 'string' || body instanceof FormData || body instanceof Blob || body instanceof Uint8Array) {
            fetchOptions.body = body as any;
            if (body instanceof FormData) {
              delete (fetchOptions.headers as any)['Content-Type'];
            }
          } else {
            fetchOptions.body = JSON.stringify(body);
          }
        }

        let response: Response;
        try {
          response = await fetch(currentUrl, fetchOptions);
        } finally {
          clearTimeout(timeoutTimer);
        }

        // Handle Rate Limiting (429)
        if (response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000;
          if (this.logger && this.logger.warn) {
            this.logger.warn(`Rate limited (429). Retrying in ${waitTime}ms...`);
          }
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }

        // Handle Token Expiration (401)
        if (response.status === 401 && !skipAutoRefresh && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            attempt++;
            continue;
          } catch {
            // Refresh failed; proceed to throw 401 error below
          }
        }

        // Parse response body
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const rawText = await response.text();
        let parsedData: any = null;

        if (isJson) {
          try {
            parsedData = JSON.parse(rawText);
          } catch {
            parsedData = rawText;
          }
        } else {
          parsedData = rawText;
        }

        // Handle Captcha Expiration / Error Code 9 (captcha error)
        if (
          parsedData &&
          typeof parsedData === 'object' &&
          (parsedData.error_code === 9 || parsedData.error === 'captcha_invalid') &&
          !skipCaptcha
        ) {
          const urlObj = new URL(currentUrl);
          const action = `${method}:${urlObj.pathname}`;
          // Invalidate cached captcha and re-fetch
          const freshCaptcha = await this.getCaptchaToken(action);
          if (freshCaptcha) {
            headers['X-Captcha-Token'] = freshCaptcha;
            attempt++;
            continue;
          }
        }

        if (!response.ok) {
          // Handle Domain Rotation for Server Errors (5xx)
          if (response.status >= 500 && attempt < PIKPAK_CONSTANTS.API_DOMAINS.length) {
            const currentHost = new URL(currentUrl).host;
            const nextHost = PIKPAK_CONSTANTS.API_DOMAINS[attempt % PIKPAK_CONSTANTS.API_DOMAINS.length];
            if (nextHost && currentHost !== nextHost) {
              currentUrl = currentUrl.replace(currentHost, nextHost);
              attempt++;
              continue;
            }
          }

          const errorCode = parsedData?.error_code || parsedData?.error;
          const errorDesc = parsedData?.error_description || parsedData?.message || response.statusText;
          throw new PikPakApiError(
            `PikPak API Error: ${response.status} ${errorDesc}`,
            response.status,
            errorCode,
            errorDesc,
            parsedData
          );
        }

        return parsedData as T;
      } catch (error: any) {
        attempt++;
        if (attempt > retries) {
          if (error instanceof PikPakApiError) {
            throw error;
          }
          throw new PikPakNetworkError(`Request failed after ${retries} retries: ${error?.message}`, error);
        }
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }

    throw new PikPakNetworkError(`Request failed after ${retries} attempts`);
  }
}

/**
 * Backward compatibility alias.
 */
export const PikPak = PikPakClient;
