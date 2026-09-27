import { describe, expect, it } from 'bun:test';
import {
  PikPakError,
  PikPakApiError,
  PikPakAuthError,
  PikPakCaptchaError,
  PikPakNetworkError,
} from '../src/errors';

describe('SDK Error Hierarchy', () => {
  it('instantiates PikPakError with code', () => {
    const err = new PikPakError('Something went wrong');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(PikPakError);
    expect(err.message).toBe('Something went wrong');
    expect(err.code).toBe('ERR_PIKPAK');
  });

  it('instantiates PikPakApiError with HTTP details', () => {
    const err = new PikPakApiError('File not found', 404, 16, 'file_not_found', { id: '123' });
    expect(err).toBeInstanceOf(PikPakError);
    expect(err.status).toBe(404);
    expect(err.errorCode).toBe(16);
    expect(err.errorDescription).toBe('file_not_found');
    expect(err.responseBody).toEqual({ id: '123' });
  });

  it('instantiates PikPakAuthError and PikPakCaptchaError', () => {
    expect(new PikPakAuthError('Invalid credentials')).toBeInstanceOf(PikPakError);
    expect(new PikPakCaptchaError('Captcha init failed')).toBeInstanceOf(PikPakError);
    expect(new PikPakNetworkError('Timeout')).toBeInstanceOf(PikPakError);
  });
});
