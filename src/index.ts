/**
 * Translations API Client
 * 
 * Main entry point for the SDK
 */

export { TranslationClient } from './Client.js';
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
export {
  ClientException,
  RateLimitException,
  NetworkException,
  ValidationException,
  AuthenticationException,
  QuotaExceededException
} from './exceptions.js';