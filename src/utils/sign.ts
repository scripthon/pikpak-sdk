// pikpak-sdk/src/utils/sign.ts
import crypto from 'crypto';
import { PIKPAK_CONSTANTS } from '../constants/pikpak';

/**
 * Extracted salts from PikPak Android assets/alg files.
 */
export const ANDROID_SALTS: readonly string[] = [
  "46nLAUNS/iWEPhVt1ot", "nHSb4izxMSdv5ct8EHppI", "7XXqHskjwo0OZ+4qOX6tOP",
  "PK66pKEYTQsB2/Qez", "ZAclkmbHRXOJxZ", "3FaVAQZgqZJyqwtClxg1I",
  "18beNlVTZNLQ0vrA3iCi", "Ej31QFmJIN3Iqdt", "fRrZyEbc", "BGKJ54NhxfDrMy3WtJm1n4FWHF",
  "HB", "F2c3EXs", "8CkDeB0NXBRAKa3N", "qeS2xnDIuDLr7CMJlxcrHuL1Ze0jC5+EfXDyNYHR3"
];

/**
 * Salts used by rclone (found in rclone source code).
 */
export const RCLONE_SALTS: readonly string[] = [
  "C9qPpZLN8ucRTaTiUMWYS9cQvWOE",
  "+r6CQVxjzJV6LCV",
  "F",
  "pFJRC",
  "9WXYIDGrwTCz2OiVlgZa90qpECPD6olt",
  "/750aCr4lm/Sly/c",
  "RB+DT/gZCrbV",
  "",
  "CyLsf7hdkIRxRm215hl",
  "7xHvLi2tOYP0Y92b",
  "ZGTXXxu8E/MIWaEDB+Sm/",
  "1UI3",
  "E7fP5Pfijd+7K+t6Tg/NhuLq0eEUVChpJSkrKxpO",
  "ihtqpG6FMt65+Xk+tWUH2",
  "NhXXU9rg4XXdzo7u5o"
];

/**
 * Real captcha_sign logic extracted from PikPak.
 * Involves multiple rounds of salted MD5 hashes.
 */
export function generateCaptchaSign(
  username: string,
  clientId: string,
  deviceId: string,
  timestamp: number | string,
  appVersion = "2.0.0",
  packageName = "mypikpak.com",
  userId = "",
  customSalts?: readonly string[]
): string {
  let base = `${clientId}${appVersion}${packageName}${deviceId}${timestamp}`;

  const salts = customSalts ?? (clientId === PIKPAK_CONSTANTS.CLIENT_ID_RCLONE ? RCLONE_SALTS : ANDROID_SALTS);

  for (const salt of salts) {
    base = crypto.createHash('md5').update(base + salt).digest('hex');
  }

  return "1." + base;
}
