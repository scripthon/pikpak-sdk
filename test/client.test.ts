import { describe, expect, it } from 'bun:test';
import { PikPak, PikPakClient } from '../src/index';

describe('PikPak Unified Client', () => {
  it('instantiates PikPak client with defaults and alias', () => {
    const client = new PikPak();
    expect(client).toBeInstanceOf(PikPakClient);
    expect(client.deviceId).toBeString();
    expect(client.deviceId.length).toBe(32);
    expect(client.clientId).toBeString();
    expect(client.isAuthenticated).toBe(false);
  });

  it('exposes all sub-services directly on client instance', () => {
    const client = new PikPak();
    expect(client.auth).toBeDefined();
    expect(client.drive).toBeDefined();
    expect(client.share).toBeDefined();
    expect(client.shares).toBe(client.share);
    expect(client.vip).toBeDefined();
    expect(client.config).toBeDefined();
  });

  it('manages tokens and authentication state', () => {
    const client = new PikPak();
    expect(client.isAuthenticated).toBe(false);

    client.setTokens({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' });
    expect(client.isAuthenticated).toBe(true);
    expect(client.accessToken).toBe('test-access-token');
    expect(client.refreshToken).toBe('test-refresh-token');

    const tokens = client.getTokens();
    expect(tokens.accessToken).toBe('test-access-token');
    expect(tokens.refreshToken).toBe('test-refresh-token');
  });

  it('supports fromEnv factory', () => {
    const originalToken = process.env.PIKPAK_ACCESS_TOKEN;
    process.env.PIKPAK_ACCESS_TOKEN = 'env-mock-token';

    try {
      const client = PikPak.fromEnv();
      expect(client.accessToken).toBe('env-mock-token');
      expect(client.isAuthenticated).toBe(true);
    } finally {
      if (originalToken !== undefined) {
        process.env.PIKPAK_ACCESS_TOKEN = originalToken;
      } else {
        delete process.env.PIKPAK_ACCESS_TOKEN;
      }
    }
  });
});
