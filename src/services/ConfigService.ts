// pikpak-sdk/src/services/ConfigService.ts
import type { PikPakClient } from '../client/PikPakClient';
import { PIKPAK_CONSTANTS } from '../constants/pikpak';

export class ConfigService {
  constructor(private client: PikPakClient) {}

  /**
   * Gets global client configuration options from the PikPak config service.
   */
  public async getGlobalConfig(): Promise<any> {
    const body = {
      client: "android",
      data: {
        version: PIKPAK_CONSTANTS.APP_VERSION,
        versioncode: 10274,
        device_id: this.client.deviceId,
      },
    };
    return await this.client.request('/config/v1/globalConfig', { method: 'POST', body });
  }

  /**
   * Checks for application client version updates and upgrade availability.
   */
  public async checkVersion(): Promise<any> {
    const body = {
      client: "android",
      data: {
        versionName: PIKPAK_CONSTANTS.APP_VERSION,
        versionCode: "10274",
        device_id: this.client.deviceId,
        country: "ID",
        language: "en",
      },
    };
    return await this.client.request('/config/v1/checkClientVersion', { method: 'POST', body });
  }
}
