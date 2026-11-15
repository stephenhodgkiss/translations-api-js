/**
 * Basic usage examples for Translations API Client
 */

import { TranslationClient, RateLimitException, ClientException } from '../src/index.js';

// Initialize the client with your API key
const client = new TranslationClient('your_api_key_here');

// Example 1: Simple translation
async function simpleTranslation() {
  try {
    const translation = await client.translate('Welcome', 'es');
    console.log('Translation:', translation); // "Bienvenido"
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 2: Translation with DeepL auto-translation
async function translateWithDeepL() {
  try {
    const translation = await client.translate('Hello World', 'de', true);
    console.log('Translation:', translation); // "Hallo Welt"
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 3: Check if a string exists
async function checkStringExists() {
  try {
    const exists = await client.exists('Dashboard');
    console.log('String exists:', exists); // true or false
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 4: Batch translation
async function batchTranslation() {
  try {
    const texts = ['Welcome', 'Settings', 'Dashboard', 'Logout'];
    const languages = ['es', 'fr', 'de'];
    
    const result = await client.batch(texts, languages);
    console.log('Batch translations:', result);
    // Output: {
    //   translations: {
    //     "0": { "es": "Bienvenido", "fr": "Bienvenue", "de": "Willkommen" },
    //     "1": { "es": "Configuración", "fr": "Paramètres", "de": "Einstellungen" },
    //     ...
    //   }
    // }
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 5: Get usage statistics
async function getUsageStats() {
  try {
    const stats = await client.usage();
    console.log('Usage stats:', stats);
    // Output: {
    //   subscription: { id: 1, status: 'active', ... },
    //   plan: { name: 'professional', ... },
    //   usage: { api_calls: 1234, ... },
    //   limits: { api_calls_remaining: 8766, ... }
    // }
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 6: Get full dictionary for a language
async function getDictionary() {
  try {
    const dict = await client.dictionary('es', 'common');
    console.log('Dictionary:', dict);
    // Output: {
    //   language: 'es',
    //   module: 'common',
    //   count: 981,
    //   last_updated: '2024-01-01T00:00:00Z',
    //   etag: 'abc123',
    //   translations: { 'Welcome': 'Bienvenido', 'Settings': 'Configuración', ... }
    // }
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 7: Upload custom strings (JSON array)
async function uploadCustomStrings() {
  try {
    const result = await client.uploadStrings(
      ['My Dashboard', 'Custom Feature', 'User Profile'],
      false // Don't auto-translate
    );
    console.log('Upload result:', result);
    // Output: {
    //   strings_added: 3,
    //   strings_skipped_common: 0,
    //   total_custom_strings: 3
    // }
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 8: Upload custom strings with auto-translation
async function uploadAndAutoTranslate() {
  try {
    const result = await client.uploadStrings(
      ['My Dashboard', 'Custom Feature'],
      true // Auto-translate with DeepL
    );
    console.log('Upload result:', result);
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 9: List custom strings
async function listCustomStrings() {
  try {
    const result = await client.getMyStrings(1, 50);
    console.log('Custom strings:', result);
    // Output: {
    //   strings: [
    //     { id: 1, text: 'My Dashboard', translations_count: 5, ... },
    //     { id: 2, text: 'Custom Feature', translations_count: 3, ... }
    //   ],
    //   total: 2,
    //   page: 1,
    //   per_page: 50,
    //   total_pages: 1
    // }
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 10: Get user statistics
async function getUserStats() {
  try {
    const stats = await client.getMyStats();
    console.log('User stats:', stats);
    // Output: {
    //   custom_strings: 150,
    //   custom_strings_limit: 5000,
    //   translations_stored: 450,
    //   common_library_hits: 2340,
    //   deepl_calls_saved: 2340,
    //   uploads_this_month: 3,
    //   uploads_limit: 25
    // }
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 11: Delete a custom string
async function deleteCustomString() {
  try {
    await client.deleteString(42);
    console.log('String deleted successfully');
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 12: Handle rate limit errors
async function handleRateLimit() {
  try {
    const translation = await client.translate('Test', 'es');
    console.log('Translation:', translation);
  } catch (error) {
    if (error instanceof RateLimitException) {
      console.error('Rate limit exceeded!');
      console.error('Limit:', error.getLimit());
      console.error('Remaining:', error.getRemaining());
      console.error('Reset in:', error.getResetInSeconds(), 'seconds');
      console.error('Reset at:', error.getReset());
    } else if (error instanceof ClientException) {
      console.error('Error:', error.message);
    }
  }
}

// Example 13: Configure custom base URL
async function customBaseUrl() {
  const customClient = new TranslationClient(
    'your_api_key_here',
    'http://localhost:8000/api/v1'
  );
  
  const translation = await customClient.translate('Welcome', 'es');
  console.log('Translation:', translation);
}

// Example 14: Configure custom timeout
async function customTimeout() {
  const clientWithTimeout = new TranslationClient('your_api_key_here');
  clientWithTimeout.setTimeout(60000); // 60 seconds
  
  const translation = await clientWithTimeout.translate('Welcome', 'es');
  console.log('Translation:', translation);
}

// Example 15: Get last response for debugging
async function debugLastResponse() {
  try {
    await client.translate('Test', 'es');
    console.log('Last response:', client.getLastResponse());
    console.log('Last status code:', client.getLastStatusCode());
  } catch (error) {
    if (error instanceof ClientException) {
      console.error('Error:', error.message);
      console.error('Last response:', client.getLastResponse());
    }
  }
}

// Run examples
// simpleTranslation();
// translateWithDeepL();
// checkStringExists();
// batchTranslation();
// getUsageStats();
// getDictionary();
// uploadCustomStrings();
// uploadAndAutoTranslate();
// listCustomStrings();
// getUserStats();
// deleteCustomString();
// handleRateLimit();
// customBaseUrl();
// customTimeout();
// debugLastResponse();