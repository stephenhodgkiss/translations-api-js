/**
 * Next.js middleware for automatic page translation
 * 
 * This middleware intercepts requests and automatically translates
 * page content based on the user's language preference.
 */

import { NextRequest, NextResponse } from 'next/server';
import { TranslationClient } from '../src/index.js';

// Module-level cache for dictionary translations
const dictionaryCache = new Map<string, { data: Record<string, string>; timestamp: number }>();

/**
 * Translate page content to a target language
 * 
 * This function takes a record of key-value pairs (e.g., page headings,
 * descriptions, button text) and translates all values to the target language.
 * 
 * @param content Object containing translatable strings
 * @param language Target language code (e.g., 'es', 'de', 'fr')
 * @param apiKey Your API key
 * @returns Object with translated values
 * 
 * @example
 * ```ts
 * // In a Next.js API route
 * import { translatePage } from '@translations-api/client/examples/nextjs-middleware';
 * 
 * export async function GET(request: NextRequest) {
 *   const content = {
 *     title: 'Welcome to MyApp',
 *     description: 'The best app for managing your tasks',
 *     buttonText: 'Get Started'
 *   };
 *   
 *   const lang = request.nextUrl.searchParams.get('lang') || 'en';
 *   
 *   if (lang !== 'en') {
 *     const translated = await translatePage(content, lang, process.env.TRANSLATIONS_API_KEY!);
 *     return NextResponse.json(translated);
 *   }
 *   
 *   return NextResponse.json(content);
 * }
 * ```
 */
export async function translatePage(
  content: Record<string, string>,
  language: string,
  apiKey: string
): Promise<Record<string, string>> {
  const client = new TranslationClient(apiKey);
  const result: Record<string, string> = {};

  // Translate each value in the content object
  for (const [key, value] of Object.entries(content)) {
    try {
      result[key] = await client.translate(value, language);
    } catch (error) {
      // Fall back to original value if translation fails
      console.warn(`Failed to translate "${key}":`, error);
      result[key] = value;
    }
  }

  return result;
}

/**
 * Batch translate page content to multiple languages
 * 
 * @param content Object containing translatable strings
 * @param languages Array of target language codes
 * @param apiKey Your API key
 * @returns Object with translations for each language
 * 
 * @example
 * const content = {
 *   title: 'Welcome',
 *   description: 'Description'
 * };
 * 
 * const translations = await translatePageBatch(content, ['es', 'fr', 'de'], apiKey);
 * // Returns: { es: { title: 'Bienvenido', ... }, fr: { title: 'Bienvenue', ... }, ... }
 * ```
 */
export async function translatePageBatch(
  content: Record<string, string>,
  languages: string[],
  apiKey: string
): Promise<Record<string, Record<string, string>>> {
  const client = new TranslationClient(apiKey);
  const texts = Object.values(content);
  const keys = Object.keys(content);

  try {
    const result = await client.batch(texts, languages);
    
    // Reconstruct the object structure for each language
    const translations: Record<string, Record<string, string>> = {};
    
    languages.forEach((lang, langIndex) => {
      translations[lang] = {};
      keys.forEach((key, keyIndex) => {
        translations[lang][key] = result.translations[keyIndex.toString()][lang];
      });
    });

    return translations;
  } catch (error) {
    console.error('Batch translation failed:', error);
    throw error;
  }
}

/**
 * Middleware function for Next.js App Router
 * 
 * This middleware can be used in Next.js App Router to automatically
 * translate page content based on the Accept-Language header or a
 * query parameter.
 * 
 * @example
 * ```ts
 * // middleware.ts
 * import { createTranslationMiddleware } from '@translations-api/client/examples/nextjs-middleware';
 * 
 * export const config = {
 *   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
 * };
 * 
 * export default createTranslationMiddleware({
 *   apiKey: process.env.TRANSLATIONS_API_KEY!,
 *   defaultLanguage: 'en',
 *   supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'],
 *   cacheDuration: 3600 // 1 hour cache
 * });
 * ```
 */
export function createTranslationMiddleware(options: {
  apiKey: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  cacheDuration?: number;
}) {
  const { apiKey, defaultLanguage, supportedLanguages, cacheDuration = 3600 } = options;
  const cache = new Map<string, { data: any; timestamp: number }>();

  return async function middleware(request: NextRequest) {
    // Get language from query parameter or Accept-Language header
    const queryLang = request.nextUrl.searchParams.get('lang');
    const acceptLang = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0];
    const language = queryLang || acceptLang || defaultLanguage;

    // Skip if language is not supported or is default
    if (!supportedLanguages.includes(language) || language === defaultLanguage) {
      return NextResponse.next();
    }

    // Check if response is HTML
    const response = NextResponse.next();
    const url = request.nextUrl.clone();

    // For GET requests to pages, we can intercept and translate
    if (request.method === 'GET' && !url.pathname.startsWith('/api')) {
      // This is a simplified example - in production, you'd want to:
      // 1. Fetch the page content
      // 2. Parse and extract translatable strings
      // 3. Translate them
      // 4. Return modified response
      
      // For now, we'll just add a header indicating the language
      response.headers.set('X-Content-Language', language);
    }

    return response;
  };
}

/**
 * Server-side translation helper for getServerSideProps
 * 
 * @example
 * ```ts
 * export async function getServerSideProps({ query }) {
 *   const { lang = 'en' } = query;
 *   
 *   if (lang !== 'en') {
 *     const content = {
 *       title: 'Welcome',
 *       description: 'Description'
 *     };
 *     
 *     const translated = await translatePage(content, lang, process.env.TRANSLATIONS_API_KEY!);
 *     return { props: { content: translated, lang } };
 *   }
 *   
 *   return { props: { content, lang: 'en' } };
 * }
 * ```
 */
export async function getTranslatedProps(
  content: Record<string, string>,
  query: { lang?: string },
  apiKey: string
) {
  const language = query.lang || 'en';

  if (language !== 'en') {
    const translated = await translatePage(content, language, apiKey);
    return { props: { content: translated, language } };
  }

  return { props: { content, language: 'en' } };
}

/**
 * Dictionary-based translation for static content
 * 
 * This function loads a full dictionary for a language and caches it
 * for the specified duration. This is more efficient than individual
 * translate calls for static content.
 * 
 * @param language Target language code
 * @param module Optional module filter
 * @param apiKey Your API key
 * @param cacheDuration Cache duration in seconds (default: 86400 = 24 hours)
 * @returns Dictionary of translations
 * 
 * @example
 * ```ts
 * // Cache dictionary for 24 hours
 * const dictionary = await getDictionary('es', 'common', apiKey, 86400);
 * 
 * // Use the dictionary
 * const title = dictionary['Welcome'] || 'Welcome';
 * const description = dictionary['Description'] || 'Description';
 * ```
 */
export async function getDictionary(
  language: string,
  module: string | undefined,
  apiKey: string,
  cacheDuration: number = 86400
): Promise<Record<string, string>> {
  const cacheKey = `dictionary_${language}_${module || 'all'}`;
  const cached = dictionaryCache.get(cacheKey);

  // Check if cache exists and is valid
  if (cached && Date.now() - cached.timestamp < cacheDuration * 1000) {
    return cached.data;
  }

  // Fetch from API
  const client = new TranslationClient(apiKey);
  const result = await client.dictionary(language, module);

  // Cache the result
  dictionaryCache.set(cacheKey, {
    data: result.translations,
    timestamp: Date.now()
  });

  return result.translations;
}

/**
 * Clear dictionary cache
 * 
 * @param language Target language code
 * @param module Optional module filter
 */
export function clearDictionaryCache(language: string, module?: string) {
  const cacheKey = `dictionary_${language}_${module || 'all'}`;
  dictionaryCache.delete(cacheKey);
}

/**
 * Get all dictionaries for a set of languages
 * 
 * @param languages Array of language codes
 * @param module Optional module filter
 * @param apiKey Your API key
 * @returns Object with dictionaries for each language
 * 
 * @example
 * ```ts
 * const dictionaries = await getAllDictionaries(['es', 'fr', 'de'], 'common', apiKey);
 * // Returns: { es: { Welcome: 'Bienvenido', ... }, fr: { ... }, de: { ... } }
 * ```
 */
export async function getAllDictionaries(
  languages: string[],
  module: string | undefined,
  apiKey: string
): Promise<Record<string, Record<string, string>>> {
  const dictionaries: Record<string, Record<string, string>> = {};

  await Promise.all(
    languages.map(async (lang) => {
      dictionaries[lang] = await getDictionary(lang, module, apiKey);
    })
  );

  return dictionaries;
}
