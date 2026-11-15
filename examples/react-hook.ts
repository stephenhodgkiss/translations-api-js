/**
 * React hook for using Translations API
 * 
 * This hook provides a convenient way to use the TranslationClient
 * in React components with proper caching and error handling.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TranslationClient, ClientException, RateLimitException } from '../src/index.js';

interface UseTranslationOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheTranslations?: boolean;
}

interface UseTranslationResult {
  translate: (text: string, language: string, autoTranslate?: boolean) => Promise<string>;
  translateOrAdd: (text: string, language: string, autoTranslate?: boolean) => Promise<string>;
  batch: (texts: string[], languages: string[], autoTranslate?: boolean) => Promise<Record<string, Record<string, string>>>;
  exists: (text: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  getCache: () => Record<string, Record<string, string>>;
  clearCache: () => void;
}

/**
 * React hook for translation functionality
 * 
 * @param options Configuration options
 * @returns Translation functions and state
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { translate, isLoading, error } = useTranslation({
 *     apiKey: 'your_api_key_here'
 *   });
 * 
 *   const handleClick = async () => {
 *     try {
 *       const translation = await translate('Welcome', 'es');
 *       console.log(translation);
 *     } catch (err) {
 *       console.error(err);
 *     }
 *   };
 * 
 *   return <button onClick={handleClick}>Translate</button>;
 * }
 * ```
 */
export function useTranslation(options: UseTranslationOptions): UseTranslationResult {
  const { apiKey, baseUrl, timeout, cacheTranslations = true } = options;
  
  const clientRef = useRef<TranslationClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Record<string, Record<string, string>>>({}); // text -> language -> translation

  // Initialize client
  useEffect(() => {
    clientRef.current = new TranslationClient(
      apiKey,
      baseUrl,
      timeout
    );
  }, [apiKey, baseUrl, timeout]);

  const translate = useCallback(async (
    text: string,
    language: string,
    autoTranslate: boolean = false
  ): Promise<string> => {
    if (!clientRef.current) {
      throw new Error('Client not initialized');
    }

    // Check cache first
    if (cacheTranslations && cacheRef.current[text]?.[language]) {
      return cacheRef.current[text][language];
    }

    setIsLoading(true);
    setError(null);

    try {
      const translation = await clientRef.current.translate(text, language, autoTranslate);
      
      // Cache the result
      if (cacheTranslations) {
        if (!cacheRef.current[text]) {
          cacheRef.current[text] = {};
        }
        cacheRef.current[text][language] = translation;
      }

      return translation;
    } catch (err) {
      if (err instanceof RateLimitException) {
        setError(`Rate limit exceeded. Reset in ${err.getResetInSeconds()}s`);
      } else if (err instanceof ClientException) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cacheTranslations]);

  const translateOrAdd = useCallback(async (
    text: string,
    language: string,
    autoTranslate: boolean = true
  ): Promise<string> => {
    if (!clientRef.current) {
      throw new Error('Client not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const translation = await clientRef.current.translateOrAdd(text, language, autoTranslate);
      
      // Cache the result
      if (cacheTranslations) {
        if (!cacheRef.current[text]) {
          cacheRef.current[text] = {};
        }
        cacheRef.current[text][language] = translation;
      }

      return translation;
    } catch (err) {
      if (err instanceof RateLimitException) {
        setError(`Rate limit exceeded. Reset in ${err.getResetInSeconds()}s`);
      } else if (err instanceof ClientException) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cacheTranslations]);

  const batch = useCallback(async (
    texts: string[],
    languages: string[],
    autoTranslate: boolean = false
  ): Promise<Record<string, Record<string, string>>> => {
    if (!clientRef.current) {
      throw new Error('Client not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await clientRef.current.batch(texts, languages, autoTranslate);
      
      // Cache all results
      if (cacheTranslations) {
        texts.forEach((text, textIndex) => {
          if (!cacheRef.current[text]) {
            cacheRef.current[text] = {};
          }
          languages.forEach(lang => {
            cacheRef.current[text][lang] = result.translations[textIndex.toString()][lang];
          });
        });
      }

      return result.translations;
    } catch (err) {
      if (err instanceof RateLimitException) {
        setError(`Rate limit exceeded. Reset in ${err.getResetInSeconds()}s`);
      } else if (err instanceof ClientException) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cacheTranslations]);

  const exists = useCallback(async (text: string): Promise<boolean> => {
    if (!clientRef.current) {
      throw new Error('Client not initialized');
    }

    return clientRef.current.exists(text);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCache = useCallback(() => {
    return cacheRef.current;
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  return {
    translate,
    translateOrAdd,
    batch,
    exists,
    isLoading,
    error,
    clearError,
    getCache,
    clearCache
  };
}

/**
 * Hook for managing custom translations
 */
export function useCustomTranslations(options: UseTranslationOptions) {
  const { translate, isLoading, error } = useTranslation(options);
  const [strings, setStrings] = useState<Array<{ id: number; text: string; translations_count: number }>>([]);
  const [page, setPage] = useState(1);

  const loadStrings = useCallback(async () => {
    if (!options.apiKey) return;

    try {
      const client = new TranslationClient(options.apiKey, options.baseUrl, options.timeout);
      const result = await client.getMyStrings(page);
      setStrings(result.strings);
    } catch (err) {
      console.error('Failed to load strings:', err);
    }
  }, [options.apiKey, options.baseUrl, options.timeout, page]);

  const deleteString = useCallback(async (id: number) => {
    if (!options.apiKey) return;

    try {
      const client = new TranslationClient(options.apiKey, options.baseUrl, options.timeout);
      await client.deleteString(id);
      // Reload strings after deletion
      await loadStrings();
    } catch (err) {
      console.error('Failed to delete string:', err);
      throw err;
    }
  }, [options.apiKey, options.baseUrl, options.timeout, loadStrings]);

  const uploadStrings = useCallback(async (strings: string[], autoTranslate = false) => {
    if (!options.apiKey) return;

    try {
      const client = new TranslationClient(options.apiKey, options.baseUrl, options.timeout);
      const result = await client.uploadStrings(strings, autoTranslate);
      // Reload strings after upload
      await loadStrings();
      return result;
    } catch (err) {
      console.error('Failed to upload strings:', err);
      throw err;
    }
  }, [options.apiKey, options.baseUrl, options.timeout, loadStrings]);

  const getStats = useCallback(async () => {
    if (!options.apiKey) return;

    try {
      const client = new TranslationClient(options.apiKey, options.baseUrl, options.timeout);
      return client.getMyStats();
    } catch (err) {
      console.error('Failed to get stats:', err);
      throw err;
    }
  }, [options.apiKey, options.baseUrl, options.timeout]);

  return {
    translate,
    isLoading,
    error,
    strings,
    page,
    setPage,
    loadStrings,
    deleteString,
    uploadStrings,
    getStats
  };
}
