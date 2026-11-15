/**
 * Translations API Client
 * 
 * Client library for the Translations API.
 * Provides methods for translating text, checking string existence,
 * batch operations, usage statistics, and custom translation management.
 * 
 * @package @translations-api/client
 * @version 1.0.0
 */

import type {
  TranslationResult,
  BatchResult,
  ExistsResult,
  UsageStats,
  DictionaryResult,
  UploadResult,
  PaginatedStrings,
  UserStats,
  UploadTextRequest,
  UploadTextResult,
  ApiResponse
} from './types.js';
import {
  ClientException,
  RateLimitException,
  NetworkException,
  ValidationException,
  AuthenticationException,
  QuotaExceededException
} from './exceptions.js';

/**
 * TranslationClient class
 */
export class TranslationClient {
  private apiKey: string;
  private apiBaseUrl: string;
  private timeout: number;
  private lastResponse: any = null;
  private lastStatusCode: number | null = null;

  /**
   * Constructor
   * 
   * @param apiKey Your API key from the customer portal
   * @param apiBaseUrl API base URL (default: https://translationsapi.com/api/v1)
   * @param timeout Request timeout in milliseconds (default: 30000)
   */
  constructor(
    apiKey: string,
    apiBaseUrl: string = 'https://translationsapi.com/api/v1',
    timeout: number = 30000
  ) {
    if (!apiKey) {
      throw new ValidationException('API key is required');
    }

    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    this.timeout = timeout;
  }

  /**
   * Translate text to a target language
   * 
   * @param text The text to translate
   * @param language Target language code (e.g., 'es', 'de', 'fr')
   * @param useDeepl Whether to use DeepL for auto-translation (default: false)
   * @returns The translated text
   * @throws ClientException On API errors
   * @throws RateLimitException When rate limit is exceeded
   */
  async translate(text: string, language: string, useDeepl: boolean = false): Promise<string> {
    const response = await this.request<any>('POST', '/translate', {
      text,
      language,
      auto_translate: useDeepl
    });

    return response.data?.translated ?? null;
  }

  /**
   * Translate text or add it as a new source string
   * 
   * This method will:
   * 1. Return existing translation if available
   * 2. Use DeepL to auto-translate if enabled and string is new
   * 3. Add the source string and translation to the database
   * 
   * @param text The text to translate
   * @param language Target language code
   * @param useDeepl Whether to use DeepL for auto-translation (default: true)
   * @returns The translated text
   * @throws ClientException On API errors
   * @throws RateLimitException When rate limit is exceeded
   */
  async translateOrAdd(text: string, language: string, useDeepl: boolean = true): Promise<string> {
    const response = await this.request<any>('POST', '/translate', {
      text,
      language,
      auto_translate: useDeepl
    });

    return response.data?.translated ?? null;
  }

  /**
   * Check if a source string exists in the database
   * 
   * @param text The text to check
   * @returns True if the string exists, false otherwise
   * @throws ClientException On API errors
   */
  async exists(text: string): Promise<boolean> {
    const response = await this.request<any>('POST', '/exists', {
      text
    });

    return response.data?.exists ?? false;
  }

  /**
   * Batch translate multiple texts to multiple languages
   * 
   * @param texts Array of texts to translate (max 100)
   * @param languages Array of language codes (max 10)
   * @param useDeepl Whether to use DeepL for auto-translation (default: false)
   * @returns Nested array with translations: [text_index][language_code] => translation
   * @throws ClientException On API errors
   * @throws RateLimitException When rate limit is exceeded
   */
  async batch(texts: string[], languages: string[], useDeepl: boolean = false): Promise<any[]> {
    if (texts.length > 100) {
      throw new ValidationException('Maximum 100 texts per batch request');
    }

    if (languages.length > 10) {
      throw new ValidationException('Maximum 10 languages per batch request');
    }

    const response = await this.request<any>('POST', '/batch', {
      texts,
      languages,
      auto_translate: useDeepl
    });

    return response.data?.results ?? [];
  }

  /**
   * Get current usage statistics
   * 
   * @returns Usage data including subscription, plan, usage, and limits
   * @throws ClientException On API errors
   */
  async usage(): Promise<UsageStats> {
    const response = await this.request<any>('GET', '/usage');
    return response.data as UsageStats;
  }

  /**
   * Load all translations for a language as a dictionary
   * 
   * This method returns all translations for a given language as a key-value map.
   * Ideal for caching on your server and using throughout page rendering.
   * Counts as 1 API call regardless of translation count.
   * 
   * @param language Target language code (e.g., 'es', 'de', 'fr')
   * @param module Optional module filter (e.g., 'common', 'yempay')
   * @returns Dictionary with language, module, count, last_updated, etag, and translations
   * @throws ClientException On API errors
   * @throws RateLimitException When rate limit is exceeded
   */
  async dictionary(language: string, module?: string): Promise<DictionaryResult> {
    const response = await this.request<any>('POST', '/dictionary', {
      language,
      module: module || null
    });

    return response.data as DictionaryResult;
  }

  /**
   * Upload a file of source strings or translations
   * 
   * @param file File object or Buffer to upload
   * @param format File format ('txt', 'csv', or 'json') - auto-detected from extension if not provided
   * @returns Upload result with statistics
   * @throws ClientException On API errors
   * @throws QuotaExceededException When upload quota is exceeded
   */
  async uploadFile(file: File | Buffer, format?: 'txt' | 'csv' | 'json'): Promise<UploadResult> {
    const formData = new FormData();
    
    if (Buffer.isBuffer(file)) {
      const uint8Array = new Uint8Array(file.buffer as ArrayBuffer, file.byteOffset, file.length);
      const blob = new Blob([uint8Array]);
      formData.append('file', blob, 'upload.txt');
    } else {
      formData.append('file', file as File);
    }

    if (format) {
      formData.append('format', format);
    }

    const response = await this.request<any>('POST', '/upload', formData, true);
    return response.data as UploadResult;
  }

  /**
   * Upload source strings as a JSON array
   * 
   * @param strings Array of strings to upload
   * @param autoTranslate Whether to auto-translate new strings (default: false)
   * @returns Upload result with statistics
   * @throws ClientException On API errors
   * @throws QuotaExceededException When upload quota is exceeded
   */
  async uploadStrings(strings: string[], autoTranslate: boolean = false): Promise<UploadTextResult> {
    const response = await this.request<any>('POST', '/upload-text', {
      strings,
      auto_translate: autoTranslate
    });

    return response.data as UploadTextResult;
  }

  /**
   * List the subscriber's custom source strings
   * 
   * @param page Page number (default: 1)
   * @param perPage Number of items per page (default: 100)
   * @returns Paginated list of custom strings
   * @throws ClientException On API errors
   */
  async getMyStrings(page: number = 1, perPage: number = 100): Promise<PaginatedStrings> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });

    const response = await this.request<any>('GET', `/my-strings?${params.toString()}`);
    return response.data as PaginatedStrings;
  }

  /**
   * Delete a custom source string and all its translations
   * 
   * @param id The string ID to delete
   * @throws ClientException On API errors
   */
  async deleteString(id: number): Promise<void> {
    await this.request('DELETE', `/my-strings/${id}`);
  }

  /**
   * Get subscriber translation statistics
   * 
   * @returns User statistics including custom strings, common library hits, and DeepL savings
   * @throws ClientException On API errors
   */
  async getMyStats(): Promise<UserStats> {
    const response = await this.request<any>('GET', '/my-stats');
    return response.data as UserStats;
  }

  /**
   * Get the last response from the API
   * 
   * @returns The last response data
   */
  getLastResponse(): any {
    return this.lastResponse;
  }

  /**
   * Get the last HTTP status code
   * 
   * @returns The last status code
   */
  getLastStatusCode(): number | null {
    return this.lastStatusCode;
  }

  /**
   * Set the API base URL
   * 
   * @param apiBaseUrl New API base URL
   * @returns The client instance for method chaining
   */
  setApiBaseUrl(apiBaseUrl: string): this {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    return this;
  }

  /**
   * Set the request timeout
   * 
   * @param timeout Timeout in milliseconds
   * @returns The client instance for method chaining
   */
  setTimeout(timeout: number): this {
    this.timeout = timeout;
    return this;
  }

  /**
   * Make an HTTP request to the API
   * 
   * @param method HTTP method (GET, POST, DELETE)
   * @param endpoint API endpoint
   * @param data Request data (for POST requests)
   * @param isFormData Whether data is FormData (for file uploads)
   * @returns Decoded JSON response
   * @throws ClientException On HTTP or API errors
   * @throws RateLimitException When rate limit is exceeded
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    data?: any,
    isFormData: boolean = false
  ): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json'
    };

    let body: string | FormData | undefined;

    if (method === 'POST' || method === 'DELETE') {
      if (isFormData) {
        body = data;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      this.lastStatusCode = response.status;
      const responseText = await response.text();

      try {
        this.lastResponse = JSON.parse(responseText);
      } catch {
        this.lastResponse = responseText;
      }

      // Check for rate limit
      if (response.status === 429) {
        const limit = this.lastResponse?.limit ?? null;
        const remaining = this.lastResponse?.remaining ?? 0;
        const reset = this.lastResponse?.reset ?? null;
        throw new RateLimitException('Rate limit exceeded', limit, remaining, reset);
      }

      // Check for authentication errors
      if (response.status === 401) {
        throw new AuthenticationException(this.lastResponse?.error ?? 'Invalid API key');
      }

      // Check for quota exceeded
      if (response.status === 429 && this.lastResponse?.error?.includes('quota')) {
        throw new QuotaExceededException(this.lastResponse?.error ?? 'Upload quota exceeded');
      }

      // Check for other errors
      if (response.status >= 400) {
        const message = this.lastResponse?.error || this.lastResponse?.message || 'Unknown error';
        throw new ClientException(message, response.status, this.lastResponse);
      }

      return this.lastResponse as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ClientException) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkException(`Request timeout after ${this.timeout}ms`, error);
        }
        throw new NetworkException(error.message, error);
      }

      throw new NetworkException('Unknown network error');
    }
  }
}

// Export all types for convenience
export type {
  TranslationResult,
  BatchResult,
  ExistsResult,
  UsageStats,
  DictionaryResult,
  UploadResult,
  UserString,
  PaginatedStrings,
  UserStats,
  ApiResponse,
  UploadTextRequest,
  UploadTextResult
} from './types.js';

// Export all exceptions for convenience
export {
  ClientException,
  RateLimitException,
  NetworkException,
  ValidationException,
  AuthenticationException,
  QuotaExceededException
} from './exceptions.js';