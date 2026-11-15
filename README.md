# @translations-api/client

TypeScript/JavaScript client for Translations API - Multi-language translation management with DeepL integration.

## Features

- 🌍 **Multi-language Support** - Translate text to 30+ languages
- 🚀 **Batch Operations** - Translate multiple texts and languages in one request
- 📚 **Dictionary Loading** - Load full language dictionaries with a single API call
- 📊 **Usage Tracking** - Monitor API usage and limits
- 🎯 **Custom Translations** - Upload and manage your own translation strings
- 💾 **Cost Savings** - Leverage 37,000+ pre-translated strings in the common library
- 🔑 **API Key Authentication** - Secure Bearer token authentication
- ⚡ **Rate Limit Handling** - Built-in rate limit detection and retry logic
- 🎨 **TypeScript Support** - Full TypeScript definitions included
- 🪝 **React Hook** - Convenient React hook for component integration
- 🔄 **Next.js Integration** - Middleware and helpers for Next.js apps

## Installation

```bash
npm install @translations-api/client
```

```bash
yarn add @translations-api/client
```

```bash
pnpm add @translations-api/client
```

## Quick Start

```typescript
import { TranslationClient } from '@translations-api/client';

// Initialize the client
const client = new TranslationClient('your_api_key_here');

// Translate text
const translation = await client.translate('Welcome', 'es');
console.log(translation); // "Bienvenido"

// Check if string exists
const exists = await client.exists('Dashboard');
console.log(exists); // true

// Batch translate
const result = await client.batch(
  ['Welcome', 'Settings', 'Dashboard'],
  ['es', 'fr', 'de']
);
console.log(result.translations);
```

## API Reference

### Constructor

```typescript
new TranslationClient(apiKey, apiBaseUrl?, timeout?)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `apiKey` | `string` | required | Your API key from the customer portal |
| `apiBaseUrl` | `string | `https://translationsapi.com/api/v1` | API base URL |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |

### Methods

#### `translate(text, language, useDeepl?)`

Translate text to a target language.

```typescript
const translation = await client.translate('Welcome', 'es', false);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | required | The text to translate |
| `language` | `string` | required | Target language code (e.g., 'es', 'de', 'fr') |
| `useDeepl` | `boolean` | `false` | Whether to use DeepL for auto-translation |

**Returns:** `Promise<string>` - The translated text

**Throws:** `ClientException`, `RateLimitException`

#### `translateOrAdd(text, language, useDeepl?)`

Translate text or add it as a new source string. This method will:
1. Return existing translation if available
2. Use DeepL to auto-translate if enabled and string is new
3. Add the source string and translation to the database

```typescript
const translation = await client.translateOrAdd('Welcome', 'es', true);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | required | The text to translate |
| `language` | `string` | required | Target language code |
| `useDeepl` | `boolean` | `true` | Whether to use DeepL for auto-translation |

**Returns:** `Promise<string>` - The translated text

**Throws:** `ClientException`, `RateLimitException`

#### `exists(text)`

Check if a source string exists in the database.

```typescript
const exists = await client.exists('Dashboard');
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | required | The text to check |

**Returns:** `Promise<boolean>` - True if the string exists, false otherwise

**Throws:** `ClientException`

#### `batch(texts, languages, useDeepl?)`

Batch translate multiple texts to multiple languages.

```typescript
const result = await client.batch(
  ['Welcome', 'Settings', 'Dashboard'],
  ['es', 'fr', 'de']
);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `texts` | `string[]` | required | Array of texts to translate (max 100) |
| `languages` | `string[]` | required | Array of language codes (max 10) |
| `useDeepl` | `boolean` | `false` | Whether to use DeepL for auto-translation |

**Returns:** `Promise<BatchResult>` - Nested array with translations

**Throws:** `ClientException`, `RateLimitException`, `ValidationException`

#### `usage()`

Get current usage statistics.

```typescript
const stats = await client.usage();
```

**Returns:** `Promise<UsageStats>` - Usage data including subscription, plan, usage, and limits

**Throws:** `ClientException`

#### `dictionary(language, module?)`

Load all translations for a language as a dictionary. This method returns all translations for a given language as a key-value map. Ideal for caching on your server and using throughout page rendering. Counts as 1 API call regardless of translation count.

```typescript
const dict = await client.dictionary('es', 'common');
console.log(dict.translations); // { 'Welcome': 'Bienvenido', 'Settings': 'Configuración', ... }
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `language` | `string` | required | Target language code (e.g., 'es', 'de', 'fr') |
| `module` | `string` | `undefined` | Optional module filter (e.g., 'common', 'yempay') |

**Returns:** `Promise<DictionaryResult>` - Dictionary with language, module, count, last_updated, etag, and translations

**Throws:** `ClientException`, `RateLimitException`

#### `uploadFile(file, format?)`

Upload a file of source strings or translations.

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const result = await client.uploadFile(file);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file` | `File | Buffer` | required | File object or Buffer to upload |
| `format` | `'txt' | 'csv' | 'json'` | Auto-detected from extension if not provided | File format |

**Returns:** `Promise<UploadResult>` - Upload result with statistics

**Throws:** `ClientException`, `QuotaExceededException`

#### `uploadStrings(strings, autoTranslate?)`

Upload source strings as a JSON array.

```typescript
const result = await client.uploadStrings(
  ['My Dashboard', 'Custom Feature'],
  false // Don't auto-translate
);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `strings` | `string[]` | required | Array of strings to upload |
| `autoTranslate` | `boolean` | `false` | Whether to auto-translate new strings |

**Returns:** `Promise<UploadTextResult>` - Upload result with statistics

**Throws:** `ClientException`, `QuotaExceededException`

#### `getMyStrings(page?, perPage?)`

List the subscriber's custom source strings.

```typescript
const result = await client.getMyStrings(1, 50);
console.log(result.strings); // Array of custom strings
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | 1 | Page number |
| `perPage` | `number` | 100 | Number of items per page |

**Returns:** `Promise<PaginatedStrings>` - Paginated list of custom strings

**Throws:** `ClientException`

#### `deleteString(id)`

Delete a custom source string and all its translations.

```typescript
await client.deleteString(42);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | `number` | required | The string ID to delete |

**Returns:** `Promise<void>`

**Throws:** `ClientException`

#### `getMyStats()`

Get subscriber translation statistics.

```typescript
const stats = await client.getMyStats();
console.log(stats.common_library_hits); // Number of times common library was used
console.log(stats.deepl_calls_saved); // Number of DeepL calls saved
```

**Returns:** `Promise<UserStats>` - User statistics including custom strings, common library hits, and DeepL savings

**Throws:** `ClientException`

### Utility Methods

#### `getLastResponse()`

Get the last response from the API for debugging.

```typescript
const response = client.getLastResponse();
console.log(response);
```

#### `getLastStatusCode()`

Get the last HTTP status code.

```typescript
const statusCode = client.getLastStatusCode();
console.log(statusCode); // 200, 404, etc.
```

#### `setApiBaseUrl(apiBaseUrl)`

Set the API base URL. Returns the client instance for method chaining.

```typescript
client.setApiBaseUrl('http://localhost:8000/api/v1');
```

#### `setTimeout(timeout)`

Set the request timeout in milliseconds. Returns the client instance for method chaining.

```typescript
client.setTimeout(60000); // 60 seconds
```

## Error Handling

The SDK provides custom exception classes for different error scenarios:

```typescript
import {
  ClientException,
  RateLimitException,
  NetworkException,
  ValidationException,
  AuthenticationException,
  QuotaExceededException
} from '@translations-api/client';

try {
  const translation = await client.translate('Welcome', 'es');
} catch (error) {
  if (error instanceof RateLimitException) {
    console.error('Rate limit exceeded!');
    console.error('Limit:', error.getLimit());
    console.error('Remaining:', error.getRemaining());
    console.error('Reset in:', error.getResetInSeconds(), 'seconds');
    console.error('Reset at:', error.getReset());
  } else if (error instanceof AuthenticationException) {
    console.error('Invalid API key');
  } else if (error instanceof QuotaExceededException) {
    console.error('Upload quota exceeded');
  } else if (error instanceof ClientException) {
    console.error('Error:', error.message);
    console.error('Status code:', error.statusCode);
  }
}
```

## React Integration

The SDK includes a React hook for easy integration with React components:

```tsx
import { useTranslation } from '@translations-api/client/examples/react-hook';

function MyComponent() {
  const { translate, isLoading, error } = useTranslation({
    apiKey: 'your_api_key_here'
  });

  const handleClick = async () => {
    try {
      const translation = await translate('Welcome', 'es');
      console.log(translation);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Translating...' : 'Translate'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

For managing custom translations in React:

```tsx
import { useCustomTranslations } from '@translations-api/client/examples/react-hook';

function MyTranslations() {
  const { 
    strings, 
    loadStrings, 
    deleteString, 
    uploadStrings,
    getStats 
  } = useCustomTranslations({
    apiKey: 'your_api_key_here'
  });

  useEffect(() => {
    loadStrings();
  }, [loadStrings]);

  return (
    <div>
      <h2>My Custom Strings</h2>
      <ul>
        {strings.map(s => (
          <li key={s.id}>
            {s.text} ({s.translations_count} translations)
            <button onClick={() => deleteString(s.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Next.js Integration

The SDK provides helpers for Next.js App Router:

### Server-Side Translation

```typescript
import { getTranslatedProps } from '@translations-api/client/examples/nextjs-middleware';

export async function getServerSideProps({ query }) {
  const { lang = 'en' } = query;

  const content = {
    title: 'Welcome to MyApp',
    description: 'The best app for managing your tasks',
    buttonText: 'Get Started'
  };

  if (lang !== 'en') {
    const translated = await getTranslatedProps(
      content,
      query,
      process.env.TRANSLATIONS_API_KEY!
    );
    return translated;
  }

  return { props: { content, language: 'en' } };
}
```

### Dictionary-Based Translation

```typescript
import { getDictionary, getAllDictionaries } from '@translations-api/client/examples/nextjs-middleware';

// Load dictionary for a language (cached for 24 hours)
const dictionary = await getDictionary('es', 'common', apiKey, 86400);

// Load dictionaries for multiple languages
const dictionaries = await getAllDictionaries(['es', 'fr', 'de'], 'common', apiKey);
// Returns: { es: { Welcome: 'Bienvenido', ... }, fr: { ... }, de: { ... } }
```

### Middleware

```typescript
import { createTranslationMiddleware } from '@translations-api/client/examples/nextjs-middleware';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

export default createTranslationMiddleware({
  apiKey: process.env TRANSLATIONS_API_KEY!,
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'],
  cacheDuration: 3600 // 1 hour cache
});
```

## Supported Languages

The API supports the following language codes:

| Code | Language |
|------|----------|
| `ar` | Arabic |
| `bg` | Bulgarian |
| `cs` | Czech |
| `da` | Danish |
| `de` | German |
| `el` | Greek |
| `en` | English |
| `es` | Spanish |
| `et` | Estonian |
| `fi` | Finnish |
| `fr` | French |
| `hu` | Hungarian |
| `id` | Indonesian |
| `it` | Italian |
| `ja` | Japanese |
| `ko` | Korean |
| `lt` | Lithuanian |
| `lv` | Latvian |
| `nb` | Norwegian Bokmål |
| `nl` | Dutch |
| `pl` | Polish |
| `pt` | Portuguese |
| `ro` | Romanian |
| `ru` | Russian |
| `sk` | Slovak |
| `sl` | Slovenian |
| `sv` | Swedish |
| `tr` | Turkish |
| `uk` | Ukrainian |
| `zh` | Chinese |

## File Upload Formats

### TXT Format (Source Strings Only)

One English string per line. The system will check the common library first, only add truly unique strings to user pool.

```
Welcome to MyApp
Dashboard
Settings
My Account
Profile
Logout
```

### CSV Format (Source + Pre-Translated)

First column is the English source, subsequent columns are language codes.

```csv
source,en,es,fr,de
Welcome,Welcome,Bienvenido,Bienvenue,Willkommen
Settings,Settings,Configuración,Paramètres,Einstellungen
Dashboard,Dashboard,Panel,Tableau de bord,Dashboard
```

### JSON Format (Most Flexible)

```json
{
  "strings": {
    "Welcome": {
      "es": "Bienvenido",
      "fr": "Bienvenue"
    },
    "Settings": {
      "es": "Configuración",
      "fr": "Paramètres"
    },
    "My Custom Button": {}
  }
}
```

## Cost Savings

The SDK automatically leverages the common library of 37,000+ pre-translated strings to save on DeepL costs:

1. **Level 1**: Check user's custom translations
2. **Level 2**: Check common library (37,000+ strings)
3. **Level 3**: Use DeepL API (only if needed)

This means if the common library already has a translation for "Welcome" in Spanish, the subscriber never pays a DeepL call for that string.

## Rate Limiting

The SDK handles rate limits automatically and provides detailed information when limits are exceeded:

```typescript
try {
  await client.translate('Test', 'es');
} catch (error) {
  if (error instanceof RateLimitException) {
    console.error('Rate limit exceeded!');
    console.error('Limit:', error.getLimit());
    console.error('Remaining:', error.getRemaining());
    console.error('Reset in:', error.getResetInSeconds(), 'seconds');
  }
}
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Test

```bash
npm test
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import type {
  TranslationResult,
  BatchResult,
  UsageStats,
  DictionaryResult,
  UploadResult,
  PaginatedStrings,
  UserStats
} from '@translations-api/client';
```

## Browser Support

The SDK uses the native `fetch` API and supports all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For older browsers, you may need to polyfill `fetch`.

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: [https://translationsapi.com/docs](https://translationsapi.com/docs)
- API Status: [https://translationsapi.com/status](https://translationsapi.com/status)
- GitHub Issues: [https://github.com/stephenhodgkiss/translations-api-js/issues](https://github.com/stephenhodgkiss/translations-api-js/issues)
- Email: support@translationsapi.com

## Changelog

### 1.0.0 (2024-01-01)

- Initial release
- Core translation methods: translate, translateOrAdd, exists, batch
- Usage statistics and dictionary loading
- Custom translation management: upload, list, delete, stats
- React and Next.js integration helpers
- TypeScript support with full type definitions
- Rate limit handling and custom exceptions