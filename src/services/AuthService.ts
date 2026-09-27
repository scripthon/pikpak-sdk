// pikpak-sdk/src/services/AuthService.ts
import type { PikPakClient } from '../client/PikPakClient';
import { PIKPAK_CONSTANTS } from '../constants/pikpak';
import type {
  LoginResponse,
  CaptchaResponse,
  PikPakProfile,
  PikPakDevice,
} from '../types/pikpak';
import { generateCaptchaSign } from '../utils/sign';
import { PikPakAuthError } from '../errors';

export class AuthService {
  constructor(private client: PikPakClient) {}

  /**
   * Initializes a captcha challenge session.
   */
  public async initCaptcha(
    action: string = "POST:/v1/auth/signin",
    username: string = ""
  ): Promise<CaptchaResponse> {
    const targetUsername = username || this.client.username || "";
    const meta: Record<string, any> = {};

    if (action === "POST:/v1/auth/signin") {
      meta.username = targetUsername;
    } else {
      const timestamp = Date.now();
      meta.captcha_sign = generateCaptchaSign(
        targetUsername,
        this.client.clientId,
        this.client.deviceId,
        timestamp,
        "2.0.0",
        "mypikpak.com"
      );
      meta.client_version = "2.0.0";
      meta.package_name = "mypikpak.com";
      meta.timestamp = timestamp.toString();
      if (targetUsername) {
        if (targetUsername.includes("@")) {
          meta.email = targetUsername;
        } else {
          meta.phone_number = targetUsername;
        }
      }
    }

    return await this.client.request('/v1/shield/captcha/init', {
      method: 'POST',
      body: {
        client_id: this.client.clientId,
        action,
        device_id: this.client.deviceId,
        meta,
      },
      skipAutoRefresh: true,
      skipCaptcha: true,
    });
  }

  /**
   * Authenticates using username and password.
   * If credentials are not provided, uses credentials configured in client options.
   */
  public async login(username?: string, password?: string): Promise<LoginResponse> {
    const user = username || this.client.username;
    const pass = password || this.client.password;

    if (!user || !pass) {
      throw new PikPakAuthError("Username and password are required for login");
    }

    const captchaRes = await this.initCaptcha("POST:/v1/auth/signin", user);
    const body: Record<string, any> = {
      client_id: this.client.clientId,
      username: user,
      password: pass,
      captcha_token: captchaRes.captcha_token,
    };

    let response = await this.client.request('/v1/auth/signin', {
      method: 'POST',
      body,
      skipAutoRefresh: true,
      skipCaptcha: true,
    });

    // Handle retry for captcha_invalid error code
    if (response.error === "captcha_invalid" || response.error_code === 4002) {
      const newCaptcha = await this.initCaptcha("POST:/v1/auth/signin", user);
      body.captcha_token = newCaptcha.captcha_token;
      response = await this.client.request('/v1/auth/signin', {
        method: 'POST',
        body,
        skipAutoRefresh: true,
        skipCaptcha: true,
      });
    }

    if (response.access_token) {
      this.client.accessToken = response.access_token;
      if (response.refresh_token) {
        this.client.refreshToken = response.refresh_token;
      }
      if (this.client.onTokenRefresh) {
        this.client.onTokenRefresh(this.client.accessToken, this.client.refreshToken);
      }
    }

    return response;
  }

  /**
   * Refreshes the session access token.
   */
  public async refreshToken(refreshToken?: string): Promise<LoginResponse> {
    if (refreshToken) {
      this.client.refreshToken = refreshToken;
    }
    return this.client.refreshAccessToken();
  }

  /**
   * Revokes the current session and clears client tokens.
   */
  public async logout(): Promise<void> {
    if (this.client.accessToken) {
      try {
        await this.client.request('/v1/auth/revoke', {
          method: 'POST',
          body: {
            token: this.client.accessToken,
            token_type_hint: "access_token",
          },
          skipAutoRefresh: true,
          skipCaptcha: true,
        });
      } catch {
        // Ignore revoke errors on logout
      }
    }
    this.client.accessToken = '';
    this.client.refreshToken = '';
  }

  /**
   * Gets the current authenticated user's profile information.
   */
  public async me(): Promise<PikPakProfile> {
    return await this.client.request('/v1/user/me');
  }

  /**
   * Lists all authorized devices for the user account.
   */
  public async listDevices(): Promise<PikPakDevice[]> {
    const res = await this.client.request('/v1/user/authorized/devices');
    return res.devices || [];
  }

  /**
   * Revokes authorization for a specific device.
   */
  public async revokeDevice(deviceId: string): Promise<void> {
    await this.client.request(`/v1/user/authorized/devices/${deviceId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Gets a sudo token for Safe Box access.
   */
  public async getSudoToken(password: string): Promise<{ sudo_token: string; [key: string]: any }> {
    return await this.client.request('/v1/user/sudo', {
      method: 'POST',
      body: { password },
    });
  }
}
