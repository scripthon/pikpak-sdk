/**
 * Base class for all PikPak SDK errors.
 */
export class PikPakError extends Error {
  public readonly code: string;

  constructor(message: string, code = 'ERR_PIKPAK') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when the PikPak API returns an HTTP or business error response.
 */
export class PikPakApiError extends PikPakError {
  public readonly status: number;
  public readonly errorCode?: number | string;
  public readonly errorDescription?: string;
  public readonly responseBody?: unknown;

  constructor(
    message: string,
    status: number,
    errorCode?: number | string,
    errorDescription?: string,
    responseBody?: unknown
  ) {
    super(message, 'ERR_PIKPAK_API');
    this.status = status;
    this.errorCode = errorCode;
    this.errorDescription = errorDescription;
    this.responseBody = responseBody;
  }
}

/**
 * Thrown when an authentication or authorization failure occurs.
 */
export class PikPakAuthError extends PikPakError {
  constructor(message: string) {
    super(message, 'ERR_PIKPAK_AUTH');
  }
}

/**
 * Thrown when captcha initialization or validation fails.
 */
export class PikPakCaptchaError extends PikPakError {
  constructor(message: string) {
    super(message, 'ERR_PIKPAK_CAPTCHA');
  }
}

/**
 * Thrown when network request fails, times out, or reaches maximum retries.
 */
export class PikPakNetworkError extends PikPakError {
  public override readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message, 'ERR_PIKPAK_NETWORK');
    this.cause = cause;
  }
}
