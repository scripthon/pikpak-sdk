// pikpak-sdk/src/services/VipService.ts
import type { PikPakClient } from '../client/PikPakClient';

export interface VipInfoResponse {
  data?: {
    status?: string;
    expire?: string;
    vip_item?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

export class VipService {
  constructor(private client: PikPakClient) {}

  /**
   * Gets current user VIP status, subscription details, and expiration.
   */
  public async getVipInfo(): Promise<VipInfoResponse> {
    return await this.client.request('/vip/v1/vip/info');
  }

  /**
   * Redeems a VIP activation code or gift card.
   */
  public async redeemCode(code: string): Promise<any> {
    return await this.client.request('/vip/v1/order/activation-code', {
      method: 'POST',
      body: { activation_code: code },
    });
  }

  /**
   * Gets LBS (Location Based Service) region and IP routing info.
   */
  public async getLbsInfo(): Promise<any> {
    return await this.client.request('/access_controller/v1/lbsInfo');
  }
}
