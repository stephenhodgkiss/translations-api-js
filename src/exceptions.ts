/**
 * Custom exception classes for Translations API client
 */

/**
 * Base client exception
 */
export class ClientException extends Error {
  public readonly statusCode: number;
  public readonly response?: any;

  constructor(message: string, statusCode: number = 0, response?: any) {
    super(message);
    this.name = 'ClientException';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, ClientException.prototype);
  }
}

/**
 * Rate limit exception
 */
export class RateLimitException extends ClientException {
  public readonly limit: number | null;
  public readonly remaining: number;
  public readonly reset: string | null;

  constructor(
    message: string = 'Rate limit exceeded',
    limit: number | null = null,
    remaining: number = 0,
    reset: string | null = null
  ) {
    super(message, 429);
    this.name = 'RateLimitException';
    this.limit = limit;
    this.remaining = remaining;
    this.reset = reset;
    Object.setPrototypeOf(this, RateLimitException.prototype);
  }

  /**
   * Get the rate limit
   */
  getLimit(): number | null {
    return this.limit;
  }

  /**
   * Get remaining calls
   */
  getRemaining(): number {
    return this.remaining;
  }

  /**
   * Get the reset time
   */
  getReset(): string | null {
    return this.reset;
  }

  /**
   * Get the number of seconds until the rate limit resets
   */
  getResetInSeconds(): number | null {
    if (!this.reset) return null;
    const resetTime = new Date(this.reset).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((resetTime - now) / 1000));
  }
}

/**
 * Network exception
 */
export class NetworkException extends ClientException {
  constructor(message: string, originalError?: Error) {
    super(message, 0);
    this.name = 'NetworkException';
    this.cause = originalError;
    Object.setPrototypeOf(this, NetworkException.prototype);
  }
}

/**
 * Validation exception
 */
export class ValidationException extends ClientException {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationException';
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}

/**
 * Authentication exception
 */
export class AuthenticationException extends ClientException {
  constructor(message: string = 'Invalid API key') {
    super(message, 401);
    this.name = 'AuthenticationException';
    Object.setPrototypeOf(this, AuthenticationException.prototype);
  }
}

/**
 * Quota exceeded exception
 */
export class QuotaExceededException extends ClientException {
  constructor(message: string = 'Upload quota exceeded') {
    super(message, 429);
    this.name = 'QuotaExceededException';
    Object.setPrototypeOf(this, QuotaExceededException.prototype);
  }
}