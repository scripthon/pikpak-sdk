import { describe, expect, it } from 'bun:test';
import { generateCaptchaSign, RCLONE_SALTS, ANDROID_SALTS } from '../src/utils/sign';
import { PIKPAK_CONSTANTS } from '../src/constants/pikpak';

describe('Captcha Sign Generator', () => {
  it('generates valid captcha sign starting with "1."', () => {
    const sign = generateCaptchaSign(
      'testuser@example.com',
      PIKPAK_CONSTANTS.CLIENT_ID_RCLONE,
      'device1234567890',
      1700000000000
    );

    expect(sign).toStartWith('1.');
    expect(sign.length).toBe(34); // "1." + 32-char MD5 hex
  });

  it('produces deterministic output for identical inputs', () => {
    const sign1 = generateCaptchaSign('user1', 'cid1', 'dev1', 123456);
    const sign2 = generateCaptchaSign('user1', 'cid1', 'dev1', 123456);
    expect(sign1).toBe(sign2);
  });

  it('exports valid salt arrays', () => {
    expect(RCLONE_SALTS.length).toBeGreaterThan(10);
    expect(ANDROID_SALTS.length).toBeGreaterThan(10);
  });
});
