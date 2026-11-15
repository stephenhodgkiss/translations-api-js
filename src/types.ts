/**
 * Type definitions for Translations API client
 */

/**
 * Translation result from translate endpoint
 */
export interface TranslationResult {
  translation: string;
  source?: string;
  language?: string;
}

/**
 * Batch translation result
 */
export interface BatchResult {
  translations: Record<string, Record<string, string>>;
}

/**
 * String existence check result
 */
export interface ExistsResult {
  exists: boolean;
}

/**
 * Usage statistics
 */
export interface UsageStats {
  subscription: {
    id: number;
    status: string;
    current_period_start: string;
    current_period_end: string;
  };
  plan: {
    name: string;
    display_name: string;
    api_calls_limit: number;
    module_limit: number;
    deepl_calls_limit: number;
    custom_strings_limit: number | null;
    uploads_per_month: number | null;
  };
  usage: {
    api_calls: number;
    deepl_calls: number;
    custom_strings: number;
    uploads_this_month: number;
  };
  limits: {
    api_calls_remaining: number;
    deepl_calls_remaining: number;
    custom_strings_remaining: number;
    uploads_remaining: number;
  };
}

/**
 * Dictionary result
 */
export interface DictionaryResult {
  language: string;
  module: string | null;
  count: number;
  last_updated: string;
  etag: string;
  translations: Record<string, string>;
}

/**
 * Upload result
 */
export interface UploadResult {
  upload_id: number;
  filename: string;
  format: 'txt' | 'csv' | 'json';
  strings_added: number;
  translations_added: number;
  strings_skipped_common: number;
  strings_skipped_duplicate: number;
  errors: string[];
  status: 'processing' | 'completed' | 'failed';
}

/**
 * User string entry
 */
export interface UserString {
  id: number;
  text: string;
  translations_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Paginated strings result
 */
export interface PaginatedStrings {
  strings: UserString[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * User statistics
 */
export interface UserStats {
  custom_strings: number;
  custom_strings_limit: number | null;
  translations_stored: number;
  common_library_hits: number;
  deepl_calls_saved: number;
  uploads_this_month: number;
  uploads_limit: number | null;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Upload text request
 */
export interface UploadTextRequest {
  strings: string[];
  auto_translate?: boolean;
}

/**
 * Upload text result
 */
export interface UploadTextResult {
  strings_added: number;
  strings_skipped_common: number;
  total_custom_strings: number;
}