/**
 * String Utilities Module
 * Comprehensive string manipulation and utility functions
 * Compatible with jazer-brand.css styling for string-related utilities
 */

class StringUtils {
  /**
   * Creates a new string utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultLocale: 'en-US',
      ...options
    };
  }

  /**
   * Capitalizes the first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalize(str) {
    if (typeof str !== 'string') return '';
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitalizes the first letter of each word in a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalizeWords(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/\b\w/g, (match) => match.toUpperCase());
  }

  /**
   * Converts a string to camelCase
   * @param {string} str - String to convert
   * @returns {string} camelCase string
   */
  static toCamelCase(str) {
    if (typeof str !== 'string' || str.length === 0) return '';
    
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Converts a string to PascalCase
   * @param {string} str - String to convert
   * @returns {string} PascalCase string
   */
  static toPascalCase(str) {
    if (typeof str !== 'string' || str.length === 0) return '';
    
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Converts a string to kebab-case
   * @param {string} str - String to convert
   * @returns {string} kebab-case string
   */
  static toKebabCase(str) {
    if (typeof str !== 'string' || str.length === 0) return '';
    
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Converts a string to snake_case
   * @param {string} str - String to convert
   * @returns {string} snake_case string
   */
  static toSnakeCase(str) {
    if (typeof str !== 'string' || str.length === 0) return '';
    
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .toLowerCase()
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
  }

  /**
   * Trims whitespace from both ends of a string and normalizes internal whitespace
   * @param {string} str - String to trim and normalize
   * @returns {string} Trimmed and normalized string
   */
  static normalizeWhitespace(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Truncates a string to a specified length
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length of the string
   * @param {string} suffix - Suffix to add if truncated (default: '...')
   * @returns {string} Truncated string
   */
  static truncate(str, length, suffix = '...') {
    if (typeof str !== 'string' || str.length <= length) return str;
    
    // Find the last space within the limit to avoid cutting words
    const truncated = str.substring(0, length - suffix.length);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + suffix;
    }
    
    return truncated + suffix;
  }

  /**
   * Converts a string to title case following specific rules
   * @param {string} str - String to convert to title case
   * @param {Array} minorWords - Array of words to keep lowercase (except first and last)
   * @returns {string} Title-cased string
   */
  static toTitleCase(str, minorWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet']) {
    if (typeof str !== 'string' || str.length === 0) return '';
    
    const words = str.toLowerCase().split(' ');
    const result = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Always capitalize first and last words, and major words
      if (i === 0 || i === words.length - 1 || !minorWords.includes(word)) {
        result.push(this.capitalize(word));
      } else {
        result.push(word);
      }
    }
    
    return result.join(' ');
  }

  /**
   * Removes extra whitespace from a string
   * @param {string} str - String to clean
   * @returns {string} String with extra whitespace removed
   */
  static removeExtraWhitespace(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Removes all non-alphanumeric characters from a string (except spaces)
   * @param {string} str - String to clean
   * @param {Object} options - Cleaning options
   * @returns {string} Cleaned string
   */
  static removeNonAlphanumeric(str, options = {}) {
    if (typeof str !== 'string') return str;
    
    const {
      includeSpaces = true,
      includeHyphens = false,
      includeUnderscores = false,
      customPattern = null
    } = options;
    
    if (customPattern) {
      return str.replace(new RegExp(customPattern, 'g'), '');
    }
    
    let pattern = '[^a-zA-Z0-9';
    if (includeSpaces) pattern += '\\s';
    if (includeHyphens) pattern += '-';
    if (includeUnderscores) pattern += '_';
    pattern += ']';
    
    return str.replace(new RegExp(pattern, 'g'), '');
  }

  /**
   * Counts the number of words in a string
   * @param {string} str - String to count words in
   * @returns {number} Number of words
   */
  static wordCount(str) {
    if (typeof str !== 'string') return 0;
    const words = str.trim().match(/\b\w+\b/g);
    return words ? words.length : 0;
  }

  /**
   * Counts the number of characters in a string (excluding whitespace)
   * @param {string} str - String to count characters in
   * @returns {number} Number of characters
   */
  static charCount(str) {
    if (typeof str !== 'string') return 0;
    return str.replace(/\s/g, '').length;
  }

  /**
   * Counts the number of sentences in a string
   * @param {string} str - String to count sentences in
   * @returns {number} Number of sentences
   */
  static sentenceCount(str) {
    if (typeof str !== 'string') return 0;
    const sentences = str.match(/[.!?]+/g);
    return sentences ? sentences.length : 0;
  }

  /**
   * Checks if a string contains another string (case-insensitive)
   * @param {string} str - String to search in
   * @param {string} searchStr - String to search for
   * @param {boolean} caseSensitive - Whether to perform case-sensitive search (default: false)
   * @returns {boolean} Whether the string contains the search string
   */
  static contains(str, searchStr, caseSensitive = false) {
    if (typeof str !== 'string' || typeof searchStr !== 'string') return false;
    
    return caseSensitive ? 
      str.includes(searchStr) : 
      str.toLowerCase().includes(searchStr.toLowerCase());
  }

  /**
   * Checks if a string starts with another string
   * @param {string} str - String to check
   * @param {string} prefix - Prefix to check for
   * @param {boolean} caseSensitive - Whether to perform case-sensitive check (default: false)
   * @returns {boolean} Whether the string starts with the prefix
   */
  static startsWith(str, prefix, caseSensitive = false) {
    if (typeof str !== 'string' || typeof prefix !== 'string') return false;
    
    return caseSensitive ? 
      str.startsWith(prefix) : 
      str.toLowerCase().startsWith(prefix.toLowerCase());
  }

  /**
   * Checks if a string ends with another string
   * @param {string} str - String to check
   * @param {string} suffix - Suffix to check for
   * @param {boolean} caseSensitive - Whether to perform case-sensitive check (default: false)
   * @returns {boolean} Whether the string ends with the suffix
   */
  static endsWith(str, suffix, caseSensitive = false) {
    if (typeof str !== 'string' || typeof suffix !== 'string') return false;
    
    return caseSensitive ? 
      str.endsWith(suffix) : 
      str.toLowerCase().endsWith(suffix.toLowerCase());
  }

  /**
   * Replaces all occurrences of a substring with another substring
   * @param {string} str - String to perform replacement in
   * @param {string|RegExp} searchValue - Value or pattern to search for
   * @param {string|Function} replaceValue - Value or function to replace with
   * @returns {string} String with replacements made
   */
  static replaceAll(str, searchValue, replaceValue) {
    if (typeof str !== 'string') return str;
    
    if (searchValue instanceof RegExp) {
      // If it's a regex, we need to ensure it has the global flag
      const flags = searchValue.flags.includes('g') ? searchValue.flags : searchValue.flags + 'g';
      const globalRegex = new RegExp(searchValue.source, flags);
      return str.replace(globalRegex, replaceValue);
    } else {
      // For string, we need to escape special characters and use global regex
      const escapedSearch = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const globalRegex = new RegExp(escapedSearch, 'g');
      return str.replace(globalRegex, replaceValue);
    }
  }

  /**
   * Removes HTML tags from a string
   * @param {string} str - String to remove HTML tags from
   * @returns {string} String without HTML tags
   */
  static stripHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '');
  }

  /**
   * Escapes HTML entities in a string
   * @param {string} str - String to escape
   * @returns {string} String with HTML entities escaped
   */
  static escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Unescapes HTML entities in a string
   * @param {string} str - String to unescape
   * @returns {string} String with HTML entities unescaped
   */
  static unescapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
  }

  /**
   * Generates a random string of specified length
   * @param {number} length - Length of the random string
   * @param {string} characters - Characters to use (default: alphanumeric)
   * @returns {string} Random string
   */
  static randomString(length, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    if (typeof length !== 'number' || length <= 0) return '';
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Generates a random UUID (Version 4)
   * @returns {string} Random UUID
   */
  static generateUUID() {
    // Check if crypto is available for better randomness
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      
      // Set version and variant bits
      array[6] = (array[6] & 0x0f) | 0x40; // Version 4
      array[8] = (array[8] & 0x3f) | 0x80; // Variant 10xx
      
      // Format as UUID string
      const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
      return [
        hex.slice(0, 8),
        hex.slice(8, 12), 
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
      ].join('-');
    }
    
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Creates a slug from a string (URL-friendly)
   * @param {string} str - String to convert to slug
   * @param {Object} options - Slug options
   * @returns {string} Slug string
   */
  static createSlug(str, options = {}) {
    if (typeof str !== 'string') return '';
    
    const {
      separator = '-',
      lowercase = true,
      strict = true
    } = options;
    
    let slug = str;
    
    // Replace spaces with separator
    slug = slug.replace(/\s+/g, separator);
    
    // Replace special characters with separator
    if (strict) {
      slug = slug.replace(/[^\w\s-]/g, separator);
    }
    
    // Remove multiple consecutive separators
    const separatorRegex = new RegExp(`${separator}+`, 'g');
    slug = slug.replace(separatorRegex, separator);
    
    // Remove leading/trailing separators
    slug = slug.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
    
    // Convert to lowercase if requested
    if (lowercase) {
      slug = slug.toLowerCase();
    }
    
    return slug;
  }

  /**
   * Inserts a substring into a string at a specified position
   * @param {string} str - Original string
   * @param {string} insertStr - String to insert
   * @param {number} position - Position to insert at
   * @returns {string} String with inserted substring
   */
  static insert(str, insertStr, position) {
    if (typeof str !== 'string') return str;
    if (typeof insertStr !== 'string') return str;
    if (typeof position !== 'number' || position < 0) position = 0;
    if (position > str.length) position = str.length;
    
    return str.slice(0, position) + insertStr + str.slice(position);
  }

  /**
   * Reverses a string
   * @param {string} str - String to reverse
   * @returns {string} Reversed string
   */
  static reverse(str) {
    if (typeof str !== 'string') return str;
    return str.split('').reverse().join('');
  }

  /**
   * Pads a string on both sides to a specified length with a padding character
   * @param {string} str - String to pad
   * @param {number} length - Target length
   * @param {string} padChar - Character to pad with (default: ' ')
   * @returns {string} Padded string
   */
  static pad(str, length, padChar = ' ') {
    if (typeof str !== 'string') return str;
    if (typeof length !== 'number' || length <= str.length) return str;
    
    const padLength = length - str.length;
    const padStart = Math.floor(padLength / 2);
    const padEnd = padLength - padStart;
    
    return padChar.repeat(padStart) + str + padChar.repeat(padEnd);
  }

  /**
   * Pads a string on the left to a specified length with a padding character
   * @param {string} str - String to pad
   * @param {number} length - Target length
   * @param {string} padChar - Character to pad with (default: ' ')
   * @returns {string} Left-padded string
   */
  static padStart(str, length, padChar = ' ') {
    if (typeof str !== 'string') return str;
    if (typeof length !== 'number' || length <= str.length) return str;
    
    const padLength = length - str.length;
    return padChar.repeat(padLength) + str;
  }

  /**
   * Pads a string on the right to a specified length with a padding character
   * @param {string} str - String to pad
   * @param {number} length - Target length
   * @param {string} padChar - Character to pad with (default: ' ')
   * @returns {string} Right-padded string
   */
  static padEnd(str, length, padChar = ' ') {
    if (typeof str !== 'string') return str;
    if (typeof length !== 'number' || length <= str.length) return str;
    
    const padLength = length - str.length;
    return str + padChar.repeat(padLength);
  }

  /**
   * Counts occurrences of a substring within a string
   * @param {string} str - String to search in
   * @param {string|RegExp} searchStr - String or regex to count
   * @param {boolean} caseSensitive - Whether to perform case-sensitive search (default: true)
   * @returns {number} Number of occurrences
   */
  static countOccurrences(str, searchStr, caseSensitive = true) {
    if (typeof str !== 'string') return 0;
    if (typeof searchStr === 'string') {
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const matches = str.match(regex);
      return matches ? matches.length : 0;
    } else if (searchStr instanceof RegExp) {
      const matches = str.match(searchStr);
      return matches ? matches.length : 0;
    }
    return 0;
  }

  /**
   * Checks if a string is a valid email address
   * @param {string} str - String to validate
   * @returns {boolean} Whether the string is a valid email
   */
  static isEmail(str) {
    if (typeof str !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Checks if a string is a valid URL
   * @param {string} str - String to validate
   * @returns {boolean} Whether the string is a valid URL
   */
  static isUrl(str) {
    if (typeof str !== 'string') return false;
    
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if a string is a valid phone number
   * @param {string} str - String to validate
   * @param {string} region - Region code (default: 'INTERNATIONAL')
   * @returns {boolean} Whether the string is a valid phone number
   */
  static isPhone(str, region = 'INTERNATIONAL') {
    if (typeof str !== 'string') return false;
    
    // Basic phone number pattern
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
    return phoneRegex.test(str);
  }

  /**
   * Checks if a string is a valid credit card number using the Luhn algorithm
   * @param {string} str - String to validate
   * @returns {boolean} Whether the string is a valid credit card number
   */
  static isCreditCard(str) {
    if (typeof str !== 'string') return false;
    
    // Remove non-digits
    const digits = str.replace(/\D/g, '');
    
    // Basic length check
    if (digits.length < 13 || digits.length > 19) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Checks if a string is a valid UUID
   * @param {string} str - String to validate
   * @returns {boolean} Whether the string is a valid UUID
   */
  static isUUID(str) {
    if (typeof str !== 'string') return false;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Checks if a string is a valid hexadecimal color
   * @param {string} str - String to validate
   * @returns {boolean} Whether the string is a valid hex color
   */
  static isHexColor(str) {
    if (typeof str !== 'string') return false;
    
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(str);
  }

  /**
   * Checks if a string is a palindrome
   * @param {string} str - String to validate
   * @param {boolean} caseSensitive - Whether to consider case (default: false)
   * @returns {boolean} Whether the string is a palindrome
   */
  static isPalindrome(str, caseSensitive = false) {
    if (typeof str !== 'string') return false;
    
    const processedStr = caseSensitive ? str : str.toLowerCase();
    const cleanedStr = processedStr.replace(/[^a-zA-Z0-9]/g, '');
    
    return cleanedStr === cleanedStr.split('').reverse().join('');
  }

  /**
   * Replaces multiple substrings in a string
   * @param {string} str - String to perform replacements in
   * @param {Object} replacements - Object with search strings as keys and replacements as values
   * @returns {string} String with replacements made
   */
  static replaceMultiple(str, replacements) {
    if (typeof str !== 'string' || typeof replacements !== 'object' || !replacements) return str;
    
    let result = str;
    
    // Sort keys by length (descending) to handle longer matches first
    const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);
    
    for (const search of sortedKeys) {
      const replacement = replacements[search];
      if (search && typeof replacement !== 'undefined') {
        // Escape special characters in search string for regex
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSearch, 'g');
        result = result.replace(regex, replacement);
      }
    }
    
    return result;
  }

  /**
   * Wraps a string in a specified wrapper
   * @param {string} str - String to wrap
   * @param {string} start - Start wrapper
   * @param {string} end - End wrapper (optional, defaults to start)
   * @returns {string} Wrapped string
   */
  static wrap(str, start, end) {
    if (typeof str !== 'string') return str;
    if (typeof start !== 'string') return str;
    
    const endWrapper = end || start;
    
    return start + str + endWrapper;
  }

  /**
   * Unwraps a string from its wrapper
   * @param {string} str - String to unwrap
   * @param {string} start - Start wrapper
   * @param {string} end - End wrapper (optional, defaults to start)
   * @returns {string} Unwrapped string
   */
  static unwrap(str, start, end) {
    if (typeof str !== 'string' || typeof start !== 'string') return str;
    
    const endWrapper = end || start;
    
    if (str.startsWith(start) && str.endsWith(endWrapper)) {
      return str.substring(start.length, str.length - endWrapper.length);
    }
    
    return str;
  }

  /**
   * Checks if a string is empty or contains only whitespace
   * @param {string} str - String to check
   * @returns {boolean} Whether the string is empty or whitespace only
   */
  static isEmpty(str) {
    return typeof str !== 'string' || str.trim().length === 0;
  }

  /**
   * Checks if a string is not empty and contains more than just whitespace
   * @param {string} str - String to check
   * @returns {boolean} Whether the string has content
   */
  static hasContent(str) {
    return !this.isEmpty(str);
  }

  /**
   * Splits a string into an array of words
   * @param {string} str - String to split
   * @param {string|RegExp} separator - Separator to split on (default: /\s+/)
   * @returns {Array} Array of words
   */
  static splitWords(str, separator = /\s+/) {
    if (typeof str !== 'string') return [];
    return str.split(separator).filter(word => word.length > 0);
  }

  /**
   * Finds the longest common prefix among an array of strings
   * @param {Array} strs - Array of strings
   * @returns {string} Longest common prefix
   */
  static longestCommonPrefix(strs) {
    if (!Array.isArray(strs) || strs.length === 0) return '';
    if (strs.length === 1) return strs[0];
    
    let prefix = '';
    const minLength = Math.min(...strs.map(str => str.length));
    
    for (let i = 0; i < minLength; i++) {
      const char = strs[0][i];
      
      if (strs.every(str => str[i] === char)) {
        prefix += char;
      } else {
        break;
      }
    }
    
    return prefix;
  }

  /**
   * Finds the longest common suffix among an array of strings
   * @param {Array} strs - Array of strings
   * @returns {string} Longest common suffix
   */
  static longestCommonSuffix(strs) {
    if (!Array.isArray(strs) || strs.length === 0) return '';
    if (strs.length === 1) return strs[0];
    
    let suffix = '';
    const minLength = Math.min(...strs.map(str => str.length));
    
    for (let i = 1; i <= minLength; i++) {
      const char = strs[0][strs[0].length - i];
      
      if (strs.every(str => str[str.length - i] === char)) {
        suffix = char + suffix;
      } else {
        break;
      }
    }
    
    return suffix;
  }

  /**
   * Generates all permutations of a string
   * @param {string} str - String to permute
   * @returns {Array} Array of string permutations
   */
  static generatePermutations(str) {
    if (typeof str !== 'string') return [];
    
    if (str.length <= 1) return [str];
    
    const perms = [];
    const chars = str.split('');
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const remainingChars = chars.slice(0, i).concat(chars.slice(i + 1));
      const remainingPerms = this.generatePermutations(remainingChars.join(''));
      
      for (const perm of remainingPerms) {
        perms.push(char + perm);
      }
    }
    
    return perms;
  }

  /**
   * Calculates the Levenshtein distance (edit distance) between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance between the strings
   */
  static levenshteinDistance(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
      return Math.max(str1?.length || 0, str2?.length || 0);
    }
    
    const matrix = [];
    
    // Initialize first row
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    // Initialize first column
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill the matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,  // substitution
            matrix[i][j - 1] + 1,      // insertion
            matrix[i - 1][j] + 1       // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Finds similar strings from an array using edit distance
   * @param {string} target - Target string
   * @param {Array} candidates - Array of candidate strings
   * @param {Object} options - Similarity options
   * @returns {Array} Array of similar strings ranked by similarity
   */
  static findSimilar(target, candidates, options = {}) {
    if (typeof target !== 'string' || !Array.isArray(candidates)) return [];
    
    const {
      threshold = 0.3, // Maximum allowed distance (0-1)
      limit = 5
    } = options;
    
    return candidates
      .map(candidate => {
        if (typeof candidate !== 'string') return null;
        
        const distance = this.levenshteinDistance(target, candidate);
        const maxLength = Math.max(target.length, candidate.length);
        const similarity = maxLength === 0 ? 1 : 1 - (distance / maxLength);
        
        return {
          string: candidate,
          similarity,
          distance
        };
      })
      .filter(item => item && item.similarity >= (1 - threshold))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.string);
  }

  /**
   * Converts a string to its ASCII equivalent (removing accents/diacritics)
   * @param {string} str - String to convert
   * @returns {string} ASCII equivalent string
   */
  static toASCII(str) {
    if (typeof str !== 'string') return str;
    
    // Mapping for common characters with accents
    const charMap = {
      'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a', 'å': 'a', 'ā': 'a', 'ă': 'a', 'ą': 'a',
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e', 'ē': 'e', 'ĕ': 'e', 'ė': 'e', 'ę': 'e', 'ě': 'e',
      'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i', 'ī': 'i', 'ĭ': 'i', 'į': 'i', 'ı': 'i',
      'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o', 'ø': 'o', 'ō': 'o', 'ŏ': 'o', 'ő': 'o',
      'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u', 'ū': 'u', 'ŭ': 'u', 'ů': 'u', 'ű': 'u', 'ų': 'u',
      'ý': 'y', 'ỳ': 'y', 'ŷ': 'y', 'ÿ': 'y', 'ȳ': 'y',
      'ć': 'c', 'ĉ': 'c', 'ċ': 'c', 'č': 'c',
      'ď': 'd', 'đ': 'd',
      'ģ': 'g', 'ğ': 'g', 'ĝ': 'g', 'ġ': 'g',
      'ĥ': 'h', 'ħ': 'h',
      'ĵ': 'j',
      'ķ': 'k',
      'ĺ': 'l', 'ļ': 'l', 'ľ': 'l', 'ŀ': 'l', 'ł': 'l',
      'ń': 'n', 'ņ': 'n', 'ň': 'n', 'ŋ': 'n',
      'ŕ': 'r', 'ŗ': 'r', 'ř': 'r',
      'ś': 's', 'ŝ': 's', 'ş': 's', 'š': 's',
      'ť': 't', 'ţ': 't', 'ŧ': 't',
      'ź': 'z', 'ż': 'z', 'ž': 'z',
      'Á': 'A', 'À': 'A', 'Â': 'A', 'Ä': 'A', 'Ã': 'A', 'Å': 'A', 'Ā': 'A', 'Ă': 'A', 'Ą': 'A',
      'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E', 'Ē': 'E', 'Ĕ': 'E', 'Ė': 'E', 'Ę': 'E', 'Ě': 'E',
      'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I', 'Ī': 'I', 'Ĭ': 'I', 'Į': 'I', 'İ': 'I',
      'Ó': 'O', 'Ò': 'O', 'Ô': 'O', 'Ö': 'O', 'Õ': 'O', 'Ø': 'O', 'Ō': 'O', 'Ŏ': 'O', 'Ő': 'O',
      'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U', 'Ū': 'U', 'Ŭ': 'U', 'Ů': 'U', 'Ű': 'U', 'Ų': 'U',
      'Ý': 'Y', 'Ỳ': 'Y', 'Ŷ': 'Y', 'Ÿ': 'Y', 'Ȳ': 'Y',
      'Ć': 'C', 'Ĉ': 'C', 'Ċ': 'C', 'Č': 'C',
      'Ď': 'D', 'Đ': 'D',
      'Ģ': 'G', 'Ğ': 'G', 'Ĝ': 'G', 'Ġ': 'G',
      'Ĥ': 'H', 'Ħ': 'H',
      'Ĵ': 'J',
      'Ķ': 'K',
      'Ĺ': 'L', 'Ļ': 'L', 'Ľ': 'L', 'Ŀ': 'L', 'Ł': 'L',
      'Ń': 'N', 'Ņ': 'N', 'Ň': 'N', 'Ŋ': 'N',
      'Ŕ': 'R', 'Ŗ': 'R', 'Ř': 'R',
      'Ś': 'S', 'Ŝ': 'S', 'Ş': 'S', 'Š': 'S',
      'Ť': 'T', 'Ţ': 'T', 'Ŧ': 'T',
      'Ź': 'Z', 'Ż': 'Z', 'Ž': 'Z'
    };
    
    return str.replace(/[áàâäãåāăąéèêëēĕėęěíìîïīĭįıóòôöõøōŏőúùûüūŭůűųýỳŷÿȳćĉċčďđģğĝġĥħĵķĺļľŀłńņňŉŋŕŗřśŝşšťţŧźżžÁÀÂÄÃÅĀĂĄÉÈÊËĒĔĖĘĚÍÌÎÏĪĬĮİÓÒÔÖÕØŌŎŐÚÙÛÜŪŬŮŰŲÝỲŶŸȲĆĈĊČĎĐĢĞĜĠĤĦĴĶĹĻĽĿŁŃŅŇŊŔŖŘŚŜŞŠŤŢŦŹŻŽ]/g, (match) => charMap[match] || match);
  }

  /**
   * Formats a string with placeholders
   * @param {string} template - Template string with placeholders like {name}
   * @param {Object} data - Object with data to substitute
   * @returns {string} Formatted string
   */
  static format(template, data) {
    if (typeof template !== 'string' || typeof data !== 'object' || !data) return template;
    
    let result = template;
    
    for (const [key, value] of Object.entries(data)) {
      // Create different regex patterns to handle different placeholder formats
      const patterns = [
        new RegExp(`{${key}}`, 'g'),
        new RegExp(`{{${key}}}`, 'g'),
        new RegExp(`\\$${key}`, 'g'),
        new RegExp(`\\$\\{${key}\\}`, 'g')
      ];
      
      for (const pattern of patterns) {
        result = result.replace(pattern, value !== null && value !== undefined ? value.toString() : '');
      }
    }
    
    return result;
  }

  /**
   * Masks part of a string (useful for sensitive data)
   * @param {string} str - String to mask
   * @param {Object} options - Masking options
   * @returns {string} Masked string
   */
  static mask(str, options = {}) {
    if (typeof str !== 'string') return str;
    
    const {
      maskChar = '*',
      start = 0,
      end = str.length,
      maskLength = -1  // If provided, masks this length starting from start
    } = options;
    
    // Validate positions
    const validatedStart = Math.max(0, Math.min(start, str.length));
    const maskEnd = maskLength >= 0 
      ? Math.min(validatedStart + maskLength, str.length)
      : Math.min(end, str.length);
    
    if (validatedStart >= maskEnd) return str;
    
    const beforeMask = str.substring(0, validatedStart);
    const maskedPart = maskChar.repeat(maskEnd - validatedStart);
    const afterMask = str.substring(maskEnd);
    
    return beforeMask + maskedPart + afterMask;
  }

  /**
   * Extracts domains from a string containing URLs or email addresses
   * @param {string} str - String to extract domains from
   * @returns {Array} Array of unique domains found
   */
  static extractDomains(str) {
    if (typeof str !== 'string') return [];
    
    // Regex to match URLs and email addresses and extract domains
    const domainRegex = /(https?:\/\/)?([a-zA-Z0-9][\-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}(\/[^\s]*)?|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const matches = str.match(domainRegex) || [];
    
    // Extract just the domain parts
    const domains = matches.map(match => {
      if (match.includes('@')) {
        // Email address
        return match.split('@')[1];
      } else {
        // URL
        try {
          const url = match.startsWith('http') ? match : `http://${match}`;
          return new URL(url).hostname;
        } catch {
          return match;
        }
      }
    });
    
    // Remove duplicates and return
    return [...new Set(domains)];
  }

  /**
   * Extracts email addresses from a string
   * @param {string} str - String to extract emails from
   * @returns {Array} Array of unique email addresses found
   */
  static extractEmails(str) {
    if (typeof str !== 'string') return [];
    
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = str.match(emailRegex) || [];
    
    // Remove duplicates
    return [...new Set(matches)];
  }

  /**
   * Extracts URLs from a string
   * @param {string} str - String to extract URLs from
   * @returns {Array} Array of unique URLs found
   */
  static extractUrls(str) {
    if (typeof str !== 'string') return [];
    
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const matches = str.match(urlRegex) || [];
    
    // Remove duplicates
    return [...new Set(matches)];
  }

  /**
   * Converts a string to a slug and validates it's URL-friendly
   * @param {string} str - String to convert to URL-friendly format
   * @returns {string} URL-friendly string
   */
  static toUrlFriendly(str) {
    if (typeof str !== 'string') return '';
    
    return this.createSlug(str, { separator: '-' });
  }

  /**
   * Generates a random password with specified characteristics
   * @param {number} length - Password length
   * @param {Object} options - Password options
   * @returns {string} Generated password
   */
  static generatePassword(length = 12, options = {}) {
    const {
      includeLowercase = true,
      includeUppercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilarCharacters = false,
      excludeAmbiguousCharacters = false
    } = options;
    
    let chars = '';
    
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (excludeSimilarCharacters) {
      chars = chars.replace(/[0O1lI]/g, '');
    }
    
    if (excludeAmbiguousCharacters) {
      chars = chars.replace(/[{}[\]()\/\\'"`,;:.~!@#$%^&*+=<>?]/g, '');
    }
    
    if (chars.length === 0) {
      throw new Error('At least one character set must be included');
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  }

  /**
   * Sanitizes a string for safe usage
   * @param {string} str - String to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized string
   */
  static sanitize(str, options = {}) {
    if (typeof str !== 'string') return str;
    
    const {
      stripTags = true,
      escapeHtml = true,
      stripWhitespace = true,
      stripSpecialChars = false,
      customReplacements = {},
      ...extraOptions
    } = options;
    
    let result = str;
    
    // Apply custom replacements first
    if (typeof customReplacements === 'object') {
      for (const [search, replace] of Object.entries(customReplacements)) {
        result = result.replace(new RegExp(search, 'g'), replace);
      }
    }
    
    // Strip HTML tags if requested
    if (stripTags) {
      result = result.replace(/<[^>]*>/g, '');
    }
    
    // Escape HTML entities if requested
    if (escapeHtml) {
      result = this.escapeHtml(result);
    }
    
    // Strip whitespace if requested
    if (stripWhitespace) {
      result = result.trim().replace(/\s+/g, ' ');
    }
    
    // Strip special characters if requested
    if (stripSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    return result;
  }

  /**
   * Converts a string to proper case (first letter of each sentence uppercase)
   * @param {string} str - String to convert
   * @returns {string} Proper case string
   */
  static toProperCase(str) {
    if (typeof str !== 'string') return str;
    
    return str.replace(/\b\w/g, (match, index, string) => {
      // Check if it's the start of the string or follows punctuation that ends a sentence
      const prevChar = index > 0 ? string[index - 1] : '';
      const sentenceEnders = ['.', '!', '?', ':'];
      
      // Capitalize if it's the first character or follows a sentence ender
      if (index === 0 || sentenceEnders.some(ender => prevChar.includes(ender))) {
        return match.toUpperCase();
      }
      return match.toLowerCase();
    });
  }

  /**
   * Creates a string template with interpolation
   * @param {string} template - Template string
   * @returns {Function} Function that accepts data and returns interpolated string
   */
  static createTemplate(template) {
    if (typeof template !== 'string') {
      throw new TypeError('Template must be a string');
    }
    
    return (data) => {
      if (typeof data !== 'object' || !data) return template;
      
      let result = template;
      
      // Replace ${property} and {property} patterns
      result = result.replace(/\$\{(\w+)\}|{(\w+)}/g, (match, prop1, prop2) => {
        const prop = prop1 || prop2;
        return data[prop] !== undefined ? data[prop] : match;
      });
      
      return result;
    };
  }

  /**
   * Generates a hash code from a string
   * @param {string} str - String to hash
   * @returns {number} Hash code
   */
  static hashCode(str) {
    if (typeof str !== 'string') return 0;
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
  }

  /**
   * Creates a string diff between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {Array} Array of diff objects with type and value
   */
  static stringDiff(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
      return [];
    }
    
    // Simple diff algorithm comparing character by character
    const result = [];
    const maxLength = Math.max(str1.length, str2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const char1 = str1[i];
      const char2 = str2[i];
      
      if (char1 === char2) {
        result.push({ type: 'common', value: char1 || char2 });
      } else {
        if (char1 !== undefined) {
          result.push({ type: 'removed', value: char1 });
        }
        if (char2 !== undefined) {
          result.push({ type: 'added', value: char2 });
        }
      }
    }
    
    return result;
  }

  /**
   * Compares two strings and returns similarity percentage
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity percentage (0-100)
   */
  static similarity(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') return 0;
    
    if (str1 === str2) return 100;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 100;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (1 - editDistance / longer.length) * 100;
  }

  /**
   * Finds the longest common subsequence between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {string} Longest common subsequence
   */
  static longestCommonSubsequence(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') return '';
    
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    // Fill the dp table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtrack to find the subsequence
    let i = m;
    let j = n;
    const result = [];
    
    while (i > 0 && j > 0) {
      if (str1[i - 1] === str2[j - 1]) {
        result.unshift(str1[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return result.join('');
  }

  /**
   * Creates an obfuscated email string for display
   * @param {string} email - Email to obfuscate
   * @param {Object} options - Obfuscation options
   * @returns {string} Obfuscated email
   */
  static obfuscateEmail(email, options = {}) {
    if (!this.isEmail(email)) return email;
    
    const { 
      visibleChars = 1, 
      maskChar = '*' 
    } = options;
    
    const [local, domain] = email.split('@');
    
    if (local.length <= visibleChars) {
      return `${local[0]}...@${domain}`;
    }
    
    const visiblePart = local.substring(0, visibleChars);
    const maskedPart = maskChar.repeat(local.length - visibleChars);
    
    return `${visiblePart}${maskedPart}@${domain}`;
  }

  /**
   * Formats bytes to a human-readable format
   * @param {number} bytes - Number of bytes
   * @returns {string} Readable byte string
   */
  static formatBytes(bytes) {
    if (typeof bytes !== 'number' || bytes < 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Checks if two strings are anagrams of each other
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @param {Object} options - Comparison options
   * @returns {boolean} Whether the strings are anagrams
   */
  static areAnagrams(str1, str2, options = {}) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') return false;
    
    const { 
      caseSensitive = false,
      ignoreSpaces = true,
      ignoreSpecialChars = true 
    } = options;
    
    let s1 = str1;
    let s2 = str2;
    
    if (!caseSensitive) {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();
    }
    
    if (ignoreSpaces) {
      s1 = s1.replace(/\s/g, '');
      s2 = s2.replace(/\s/g, '');
    }
    
    if (ignoreSpecialChars) {
      s1 = s1.replace(/[^a-zA-Z0-9\s]/g, '');
      s2 = s2.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    if (s1.length !== s2.length) return false;
    
    // Sort characters and compare
    return s1.split('').sort().join('') === s2.split('').sort().join('');
  }

  /**
   * Adds dynamic styles for string utilities
   */
  addDynamicStyles() {
    if (document.getElementById('string-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'string-utilities-styles';
    style.textContent = `
      /* String utility related styles */
      .masked-text {
        color: transparent;
        text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
      }
      
      .highlighted-text {
        background-color: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        padding: 2px 4px;
        border-radius: 3px;
      }
      
      .truncate-ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .text-upper {
        text-transform: uppercase;
      }
      
      .text-lower {
        text-transform: lowercase;
      }
      
      .text-capitalize {
        text-transform: capitalize;
      }
      
      .text-center {
        text-align: center;
      }
      
      .text-left {
        text-align: left;
      }
      
      .text-right {
        text-align: right;
      }
      
      .text-justify {
        text-align: justify;
      }
      
      /* Diff highlighting */
      .diff-added {
        background-color: rgba(0, 255, 136, 0.2);
        text-decoration: underline;
      }
      
      .diff-removed {
        background-color: rgba(255, 68, 68, 0.2);
        text-decoration: line-through;
      }
      
      .diff-common {
        background-color: transparent;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the string utilities instance and cleans up
   */
  destroy() {
    // No cleanup needed for string utilities since they're stateless
  }
}

/**
 * Creates a new string utilities instance
 * @param {Object} options - Configuration options
 * @returns {StringUtils} New string utilities instance
 */
function createStringUtils(options = {}) {
  return new StringUtils(options);
}

// Create a default instance for global use
const stringUtils = new StringUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StringUtils,
    createStringUtils,
    stringUtils
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.StringUtils = StringUtils;
  window.createStringUtils = createStringUtils;
  window.stringUtils = stringUtils;
}