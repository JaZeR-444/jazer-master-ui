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
      defaultEncoding: 'UTF-8',
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
   * @returns {string} Title-cased string
   */
  static capitalizeWords(str) {
    if (typeof str !== 'string') return '';
    
    return str.replace(/\b\w/g, match => match.toUpperCase());
  }

  /**
   * Converts a string to camelCase
   * @param {string} str - String to convert
   * @returns {string} camelCase string
   */
  static toCamelCase(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[A-Z]/, match => match.toLowerCase());
  }

  /**
   * Converts a string to PascalCase
   * @param {string} str - String to convert
   * @returns {string} PascalCase string
   */
  static toPascalCase(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[a-z]/, match => match.toUpperCase());
  }

  /**
   * Converts a string to kebab-case
   * @param {string} str - String to convert
   * @returns {string} kebab-case string
   */
  static toKebabCase(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Converts a string to snake_case
   * @param {string} str - String to convert
   * @returns {string} snake_case string
   */
  static toSnakeCase(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toLowerCase()
      .replace(/^_+|_+$/g, '');
  }

  /**
   * Truncates a string to a specified length
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to append (default: '...')
   * @returns {string} Truncated string
   */
  static truncate(str, length, suffix = '...') {
    if (typeof str !== 'string' || length < 0) return str;
    if (str.length <= length) return str;
    
    return str.substring(0, length) + suffix;
  }

  /**
   * Removes extra whitespace from a string
   * @param {string} str - String to trim whitespace from
   * @returns {string} String with normalized whitespace
   */
  static normalizeWhitespace(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Removes all non-alphanumeric characters from a string
   * @param {string} str - String to clean
   * @param {Object} options - Cleaning options
   * @returns {string} Cleaned string
   */
  static removeNonAlphanumeric(str, options = {}) {
    if (typeof str !== 'string') return str;
    
    const {
      includeSpaces = false,
      includeUnderscore = false,
      includeDash = false,
      customCharacters = ''
    } = options;
    
    let pattern = '[^a-zA-Z0-9';
    if (includeSpaces) pattern += '\\s';
    if (includeUnderscore) pattern += '_';
    if (includeDash) pattern += '-';
    if (customCharacters) pattern += customCharacters.replace(/[^\w\s]/g, '\\$&');
    pattern += ']';
    
    const regex = new RegExp(pattern, 'g');
    return str.replace(regex, '');
  }

  /**
   * Counts the number of words in a string
   * @param {string} str - String to count words in
   * @returns {number} Number of words
   */
  static wordCount(str) {
    if (typeof str !== 'string') return 0;
    
    const words = str.trim().match(/\S+/g);
    return words ? words.length : 0;
  }

  /**
   * Counts the number of characters in a string (excluding whitespace)
   * @param {string} str - String to measure
   * @returns {number} Number of non-whitespace characters
   */
  static characterCount(str) {
    if (typeof str !== 'string') return 0;
    return str.replace(/\s/g, '').length;
  }

  /**
   * Checks if a string contains another string (case-insensitive)
   * @param {string} str - String to search in
   * @param {string} searchStr - String to search for
   * @param {boolean} caseSensitive - Whether search should be case-sensitive (default: false)
   * @returns {boolean} Whether the string contains the search string
   */
  static contains(str, searchStr, caseSensitive = false) {
    if (typeof str !== 'string' || typeof searchStr !== 'string') return false;
    
    return caseSensitive ? 
      str.indexOf(searchStr) !== -1 :
      str.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1;
  }

  /**
   * Checks if a string starts with another string
   * @param {string} str - String to check
   * @param {string} startStr - String to check for at start
   * @param {boolean} caseSensitive - Whether to perform case-sensitive check
   * @returns {boolean} Whether the string starts with the specified string
   */
  static startsWith(str, startStr, caseSensitive = false) {
    if (typeof str !== 'string' || typeof startStr !== 'string') return false;
    
    const stringToCheck = caseSensitive ? str : str.toLowerCase();
    const searchString = caseSensitive ? startStr : startStr.toLowerCase();
    
    return stringToCheck.indexOf(searchString) === 0;
  }

  /**
   * Checks if a string ends with another string
   * @param {string} str - String to check
   * @param {string} endStr - String to check for at end
   * @param {boolean} caseSensitive - Whether to perform case-sensitive check
   * @returns {boolean} Whether the string ends with the specified string
   */
  static endsWith(str, endStr, caseSensitive = false) {
    if (typeof str !== 'string' || typeof endStr !== 'string') return false;
    
    const stringToCheck = caseSensitive ? str : str.toLowerCase();
    const searchString = caseSensitive ? endStr : endStr.toLowerCase();
    
    return stringToCheck.slice(-searchString.length) === searchString;
  }

  /**
   * Replaces all occurrences of a substring with another substring
   * @param {string} str - String to perform replacement in
   * @param {string|RegExp} searchValue - Value to search for
   * @param {string|Function} replaceValue - Value to replace with
   * @returns {string} String with replacements made
   */
  static replaceAll(str, searchValue, replaceValue) {
    if (typeof str !== 'string') return str;
    
    // If searchValue is a string, convert to global regex
    if (typeof searchValue === 'string') {
      // Escape special regex characters in string
      const escapedSearch = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      searchValue = new RegExp(escapedSearch, 'g');
    }
    
    return str.replace(searchValue, replaceValue);
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
    
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return str.replace(/[&<>"'\/]/g, match => escapeMap[match]);
  }

  /**
   * Unescapes HTML entities in a string
   * @param {string} str - String to unescape
   * @returns {string} String with HTML entities unescaped
   */
  static unescapeHtml(str) {
    if (typeof str !== 'string') return str;
    
    const unescapeMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/'
    };
    
    // Create a regex from the keys of the map
    const regex = new RegExp(Object.keys(unescapeMap).join('|'), 'g');
    
    return str.replace(regex, match => unescapeMap[match]);
  }

  /**
   * Generates a random string of specified length
   * @param {number} length - Length of the random string
   * @param {string} characters - Characters to use for generation (default: alphanumeric)
   * @returns {string} Randomly generated string
   */
  static randomString(length, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    if (typeof length !== 'number' || length <= 0) return '';
    
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }

  /**
   * Generates a random UUID
   * @returns {string} Randomly generated UUID
   */
  static generateUUID() {
    // Modern browsers support crypto.randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Creates a slug from a string (URL-friendly)
   * @param {string} str - String to convert to slug
   * @param {Object} options - Slug options
   * @returns {string} URL-friendly slug string
   */
  static createSlug(str, options = {}) {
    if (typeof str !== 'string') return '';
    
    const {
      separator = '-',
      lowercase = true,
      trim = true
    } = options;
    
    let slug = str;
    
    // Remove special characters and replace with separator
    slug = slug.replace(/[^a-zA-Z0-9\s-_]/g, separator);
    
    // Replace whitespace and multiple separators with single separator
    slug = slug.replace(/[\s_]+/g, separator);
    slug = slug.replace(new RegExp(`${separator}+`, 'g'), separator);
    
    // Trim leading/trailing separators
    if (trim) {
      slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
    }
    
    // Convert to lowercase if requested
    if (lowercase) {
      slug = slug.toLowerCase();
    }
    
    return slug;
  }

  /**
   * Inserts a substring into a string at a specified position
   * @param {string} str - Original string
   * @param {string} insert - String to insert
   * @param {number} position - Position to insert at
   * @returns {string} String with inserted substring
   */
  static insert(str, insert, position) {
    if (typeof str !== 'string' || typeof insert !== 'string') return str;
    if (typeof position !== 'number' || position < 0) position = 0;
    if (position > str.length) position = str.length;
    
    return str.slice(0, position) + insert + str.slice(position);
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
   * Pads a string with a specified character to a target length
   * @param {string} str - String to pad
   * @param {number} length - Target length
   * @param {string} padString - String to pad with (default: ' ')
   * @param {string} padType - Type of padding ('start', 'end', 'both', default: 'end')
   * @returns {string} Padded string
   */
  static pad(str, length, padString = ' ', padType = 'end') {
    if (typeof str !== 'string') return str;
    if (typeof length !== 'number' || str.length >= length) return str;
    
    const padStringLength = padString.length;
    const neededPadding = length - str.length;
    
    switch (padType) {
      case 'start':
        return padString.repeat(Math.ceil(neededPadding / padStringLength)).slice(0, neededPadding) + str;
      case 'both':
        const startPadding = Math.floor(neededPadding / 2);
        const endPadding = Math.ceil(neededPadding / 2);
        return padString.repeat(Math.ceil(startPadding / padStringLength)).slice(0, startPadding) + 
               str + 
               padString.repeat(Math.ceil(endPadding / padStringLength)).slice(0, endPadding);
      case 'end':
      default:
        return str + padString.repeat(Math.ceil(neededPadding / padStringLength)).slice(0, neededPadding);
    }
  }

  /**
   * Pads start of string (alias for pad with type=start)
   * @param {string} str - String to pad
   * @param {number} length - Target length
   * @param {string} padString - String to pad with
   * @returns {string} Padded string
   */
  static padStart(str, length, padString = ' ') {
    return this.pad(str, length, padString, 'start');
  }

  /**
   * Pads end of string (alias for pad with type=end)
   * @param {string} str - String to pad
   * @param {number} length - Target length
   * @param {string} padString - String to pad with
   * @returns {string} Padded string
   */
  static padEnd(str, length, padString = ' ') {
    return this.pad(str, length, padString, 'end');
  }

  /**
   * Counts occurrences of a substring within a string
   * @param {string} str - String to search in
   * @param {string|RegExp} searchStr - Substring or regex to count
   * @param {boolean} caseSensitive - Whether search should be case-sensitive (default: true)
   * @returns {number} Number of occurrences
   */
  static countOccurrences(str, searchStr, caseSensitive = true) {
    if (typeof str !== 'string') return 0;
    if (typeof searchStr !== 'string' && !(searchStr instanceof RegExp)) return 0;
    
    if (searchStr instanceof RegExp) {
      // Use regex directly
      const matches = str.match(searchStr);
      return matches ? matches.length : 0;
    }
    
    // For string searches
    if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
    }
    
    // Use regex with global flag to count occurrences
    const regex = new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = str.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Checks if a string is an email address
   * @param {string} str - String to check
   * @returns {boolean} Whether the string is a valid email address
   */
  static isEmail(str) {
    if (typeof str !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Checks if a string is a valid URL
   * @param {string} str - String to check
   * @param {boolean} allowLocalhost - Whether to allow localhost URLs
   * @returns {boolean} Whether the string is a valid URL
   */
  static isUrl(str, allowLocalhost = true) {
    if (typeof str !== 'string') return false;
    
    try {
      const url = new URL(str);
      return allowLocalhost || url.hostname !== 'localhost';
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if a string is a valid phone number
   * @param {string} str - String to check
   * @param {string} region - Region code (default: 'INTERNATIONAL')
   * @returns {boolean} Whether the string is a valid phone number
   */
  static isPhone(str, region = 'INTERNATIONAL') {
    if (typeof str !== 'string') return false;
    
    // Remove non-digit characters for validation
    const digits = str.replace(/\D/g, '');
    
    // Basic validation - length between 7 and 15 digits
    if (digits.length < 7 || digits.length > 15) return false;
    
    // More specific validation could be added based on region
    // For now, just do basic validation
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
    return phoneRegex.test(str);
  }

  /**
   * Checks if a string is a valid credit card number using Luhn algorithm
   * @param {string} str - String to check
   * @returns {boolean} Whether the string is a valid credit card number
   */
  static isCreditCard(str) {
    if (typeof str !== 'string') return false;
    
    // Remove spaces and dashes
    const digits = str.replace(/[\s-]/g, '');
    
    // Basic validation - length between 13 and 19 digits
    if (!/^\d{13,19}$/.test(digits)) return false;
    
    // Luhn algorithm implementation
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
   * @param {string} str - String to check
   * @returns {boolean} Whether the string is a valid UUID
   */
  static isUUID(str) {
    if (typeof str !== 'string') return false;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Checks if a string is a valid hexadecimal color
   * @param {string} str - String to check
   * @returns {boolean} Whether the string is a valid hex color
   */
  static isHexColor(str) {
    if (typeof str !== 'string') return false;
    
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(str);
  }

  /**
   * Checks if a string is a palindrome (ignoring case and non-alphanumeric characters)
   * @param {string} str - String to check
   * @param {boolean} caseSensitive - Whether comparison should be case-sensitive (default: false)
   * @returns {boolean} Whether the string is a palindrome
   */
  static isPalindrome(str, caseSensitive = false) {
    if (typeof str !== 'string') return false;
    
    // Remove non-alphanumeric characters
    let cleanStr = str.replace(/[^a-zA-Z0-9]/g, '');
    
    if (!caseSensitive) {
      cleanStr = cleanStr.toLowerCase();
    }
    
    // Compare string with its reverse
    return cleanStr === cleanStr.split('').reverse().join('');
  }

  /**
   * Replaces multiple substrings in a string
   * @param {string} str - String to perform replacements in
   * @param {Object} replacements - Object mapping strings to replace with their replacements
   * @returns {string} String with replacements made
   */
  static replaceMultiple(str, replacements) {
    if (typeof str !== 'string' || typeof replacements !== 'object' || !replacements) {
      return str;
    }
    
    let result = str;
    
    for (const [search, replacement] of Object.entries(replacements)) {
      if (typeof search === 'string' && typeof replacement === 'string') {
        result = result.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      }
    }
    
    return result;
  }

  /**
   * Wraps a string in a prefix and suffix
   * @param {string} str - String to wrap
   * @param {string} prefix - Prefix to add
   * @param {string} suffix - Suffix to add (defaults to prefix if not provided)
   * @returns {string} Wrapped string
   */
  static wrap(str, prefix, suffix) {
    if (typeof str !== 'string') return str;
    if (typeof prefix !== 'string') return str;
    
    const suffixVal = suffix || prefix;
    
    return prefix + str + suffixVal;
  }

  /**
   * Unwraps a string from a prefix and suffix
   * @param {string} str - String to unwrap
   * @param {string} prefix - Prefix to remove
   * @param {string} suffix - Suffix to remove (defaults to prefix if not provided)
   * @returns {string} Unwrapped string
   */
  static unwrap(str, prefix, suffix) {
    if (typeof str !== 'string') return str;
    if (typeof prefix !== 'string') return str;
    
    const suffixVal = suffix || prefix;
    
    if (str.startsWith(prefix) && str.endsWith(suffixVal)) {
      return str.substring(prefix.length, str.length - suffixVal.length);
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
   * Checks if a string is not empty and contains content
   * @param {string} str - String to check
   * @returns {boolean} Whether the string has content
   */
  static hasContent(str) {
    return !this.isEmpty(str);
  }

  /**
   * Splits a string by capital letters
   * @param {string} str - String to split
   * @returns {Array} Array of string segments
   */
  static splitByCapital(str) {
    if (typeof str !== 'string') return [];
    
    return str.split(/(?=[A-Z])/);
  }

  /**
   * Converts a string to title case following English title case rules
   * @param {string} str - String to convert to title case
   * @param {Array} minorWords - Array of minor words that shouldn't be capitalized (default: common English minor words)
   * @returns {string} Title-cased string
   */
  static toTitleCase(str, minorWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet']) {
    if (typeof str !== 'string') return str;
    
    const words = str.toLowerCase().split(' ');
    const result = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Always capitalize the first and last words, and major words
      if (i === 0 || i === words.length - 1 || !minorWords.includes(word)) {
        result.push(this.capitalize(word));
      } else {
        result.push(word);
      }
    }
    
    return result.join(' ');
  }

  /**
   * Extracts file extension from a filename string
   * @param {string} filename - Filename to extract extension from
   * @returns {string} File extension or empty string if none
   */
  static extractExtension(filename) {
    if (typeof filename !== 'string') return '';
    
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex + 1);
  }

  /**
   * Removes file extension from a filename string
   * @param {string} filename - Filename to remove extension from
   * @returns {string} Filename without extension
   */
  static removeExtension(filename) {
    if (typeof filename !== 'string') return filename;
    
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
  }

  /**
   * Formats a string using placeholders (e.g., "Hello {name}!" with {name: "World"})
   * @param {string} template - Template string with placeholders
   * @param {Object} data - Object with placeholder values
   * @returns {string} Formatted string
   */
  static format(template, data) {
    if (typeof template !== 'string' || typeof data !== 'object' || !data) {
      return template;
    }
    
    let result = template;
    
    for (const [key, value] of Object.entries(data)) {
      // Replace placeholders in the format {key} or {{key}}
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}|\\{${key}\\}`, 'g'), 
                              String(value));
    }
    
    return result;
  }

  /**
   * Creates a masked string (e.g., for sensitive data)
   * @param {string} str - String to mask
   * @param {Object} options - Masking options
   * @returns {string} Masked string
   */
  static mask(str, options = {}) {
    if (typeof str !== 'string') return str;
    
    const {
      maskChar = '*',
      start = 0,
      end = Math.floor(str.length / 2), // Mask the middle half by default
      showStart = 1,  // Show this many characters at start
      showEnd = 1     // Show this many characters at end
    } = options;
    
    if (str.length <= showStart + showEnd) {
      return str; // Too short to mask effectively
    }
    
    const maskedStart = showStart > 0 ? str.substring(0, showStart) : '';
    const maskedEnd = showEnd > 0 ? str.substring(str.length - showEnd) : '';
    const maskedPart = maskChar.repeat(Math.max(0, str.length - showStart - showEnd));
    
    return maskedStart + maskedPart + maskedEnd;
  }

  /**
   * Gets the byte size of a string (in UTF-8 encoding)
   * @param {string} str - String to measure
   * @returns {number} Size in bytes
   */
  static getByteSize(str) {
    if (typeof str !== 'string') return 0;
    
    // Use the TextEncoder API if available (more accurate)
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str).length;
    }
    
    // Fallback implementation: count bytes manually
    let size = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      
      if (code < 0x80) {
        size += 1; // 1-byte character
      } else if (code < 0x800) {
        size += 2; // 2-byte character
      } else if (code < 0xd800 || code >= 0xe000) {
        size += 3; // 3-byte character
      } else {
        i++; // Surrogate pair (4 bytes total)
        size += 4;
      }
    }
    
    return size;
  }

  /**
   * Truncates a string to a specified byte length
   * @param {string} str - String to truncate
   * @param {number} byteLength - Maximum byte length
   * @param {string} suffix - Suffix to append (default: '...')
   * @returns {string} Truncated string
   */
  static truncateByBytes(str, byteLength, suffix = '...') {
    if (typeof str !== 'string' || byteLength <= 0) return '';
    
    // Use TextEncoder if available
    if (typeof TextEncoder !== 'undefined') {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // Try to encode the string with the suffix already added to see if we need to truncate
      const encoded = encoder.encode(str);
      if (encoded.length <= byteLength) return str;
      
      // Truncate gradually until we're within the byte limit
      let truncated = encoded.slice(0, byteLength - encoder.encode(suffix).length);
      let decoded = decoder.decode(truncated);
      
      // If the decoded string is shorter, we might have cut in the middle of a character
      // so we need to carefully truncate to not break multibyte characters
      while (encoder.encode(decoded + suffix).length > byteLength && decoded.length > 0) {
        decoded = decoded.slice(0, -1);
      }
      
      return decoded + suffix;
    }
    
    // Fallback implementation
    if (this.getByteSize(str) <= byteLength) return str;
    
    // This is a simple approach - in practice, you'd need a more complex algorithm
    // to handle multibyte characters properly
    return this.truncate(str, byteLength, suffix);
  }

  /**
   * Checks if two strings are approximately equal (within a threshold)
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @param {number} threshold - Similarity threshold (0-1), where 1 is exact match (default: 0.8)
   * @returns {boolean} Whether the strings are similar
   */
  static isApproximatelyEqual(str1, str2, threshold = 0.8) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') return false;
    
    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(str1, str2);
    const maxLen = Math.max(str1.length, str2.length);
    
    if (maxLen === 0) return true;
    
    const similarity = 1 - (distance / maxLen);
    return similarity >= threshold;
  }

  /**
   * Calculates the Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Levenshtein distance
   */
  static levenshteinDistance(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') return Infinity;
    
    const matrix = [];
    
    // Initialize the matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
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
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Finds the closest match to a string from an array of options
   * @param {string} target - Target string to match
   * @param {Array} options - Array of string options to match against
   * @param {number} threshold - Similarity threshold (0-1) (default: 0.5)
   * @returns {string|null} Closest matching option or null if no match exceeds threshold
   */
  static findClosestMatch(target, options, threshold = 0.5) {
    if (typeof target !== 'string' || !Array.isArray(options)) return null;
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const option of options) {
      if (typeof option !== 'string') continue;
      
      const score = this.getStringSimilarity(target, option);
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = option;
      }
    }
    
    return bestMatch;
  }

  /**
   * Calculates similarity between two strings (0-1)
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity ratio from 0 to 1
   */
  static getStringSimilarity(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') return 0;
    
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    const distance = this.levenshteinDistance(str1, str2);
    const maxLen = Math.max(str1.length, str2.length);
    
    return 1 - (distance / maxLen);
  }

  /**
   * Converts a string to its ASCII equivalent (transforms accented characters)
   * @param {string} str - String to transform
   * @returns {string} ASCII-equivalent string
   */
  static toASCII(str) {
    if (typeof str !== 'string') return str;
    
    // Mapping for common accented characters
    const charMap = {
      'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a', 'å': 'a', 'æ': 'ae',
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
      'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o', 'ø': 'o',
      'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
      'ý': 'y', 'ÿ': 'y', 'ñ': 'n', 'ç': 'c',
      'Á': 'A', 'À': 'A', 'Â': 'A', 'Ä': 'A', 'Ã': 'A', 'Å': 'A', 'Æ': 'AE',
      'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
      'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
      'Ó': 'O', 'Ò': 'O', 'Ô': 'O', 'Ö': 'O', 'Õ': 'O', 'Ø': 'O',
      'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
      'Ý': 'Y', 'Ÿ': 'Y', 'Ñ': 'N', 'Ç': 'C'
    };
    
    return str.replace(/[áàâäãåæéèêëíìîïóòôöõøúùûüýÿñçÁÀÂÄÃÅÆÉÈÊËÍÌÎÏÓÒÔÖÕØÚÙÛÜÝŸÑÇ]/g, 
                        match => charMap[match] || match);
  }

  /**
   * Creates a string template engine
   * @param {string} template - Template string
   * @returns {Function} Function to render template with data
   */
  static createTemplate(template) {
    if (typeof template !== 'string') {
      throw new TypeError('Template must be a string');
    }
    
    // Extract variables from template ({{variable}})
    const regex = /{{\s*([^{}]+)\s*}}/g;
    const variables = [];
    let match;
    
    while ((match = regex.exec(template)) !== null) {
      variables.push(match[1]);
    }
    
    return function(data) {
      if (typeof data !== 'object' || !data) {
        data = {};
      }
      
      let result = template;
      
      for (const variable of variables) {
        // Handle nested properties (e.g., user.name)
        const keys = variable.split('.');
        let value = data;
        
        for (const key of keys) {
          value = (value && value[key] !== undefined) ? value[key] : '';
        }
        
        result = result.replace(new RegExp(`{{\\s*${variable}\\s*}}`, 'g'), value);
      }
      
      return result;
    };
  }

  /**
   * Encodes a string to Base64
   * @param {string} str - String to encode
   * @returns {string} Base64 encoded string
   */
  static encodeBase64(str) {
    if (typeof str !== 'string') return str;
    
    // For browser environments
    if (typeof window !== 'undefined' && window.btoa) {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function(match, p1) {
          return String.fromCharCode('0x' + p1);
        }));
    }
    
    // For Node.js environments
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf8').toString('base64');
    }
    
    // Fallback implementation
    throw new Error('Base64 encoding not supported in this environment');
  }

  /**
   * Decodes a Base64 string
   * @param {string} encodedStr - Base64 encoded string
   * @returns {string} Decoded string
   */
  static decodeBase64(encodedStr) {
    if (typeof encodedStr !== 'string') return encodedStr;
    
    // For browser environments
    if (typeof window !== 'undefined' && window.atob) {
      try {
        return decodeURIComponent(atob(encodedStr).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      } catch (e) {
        return encodedStr;
      }
    }
    
    // For Node.js environments
    if (typeof Buffer !== 'undefined') {
      try {
        return Buffer.from(encodedStr, 'base64').toString('utf8');
      } catch (e) {
        return encodedStr;
      }
    }
    
    // Fallback implementation
    throw new Error('Base64 decoding not supported in this environment');
  }

  /**
   * Encrypts a string using a simple XOR cipher
   * @param {string} str - String to encrypt
   * @param {string} key - Key for encryption
   * @returns {string} Encrypted string
   */
  static simpleXorEncrypt(str, key) {
    if (typeof str !== 'string' || typeof key !== 'string') return str;
    
    let result = '';
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const encryptedChar = charCode ^ keyChar;
      result += String.fromCharCode(encryptedChar);
    }
    
    return btoa(encodeURIComponent(result));
  }

  /**
   * Decrypts a string using a simple XOR cipher
   * @param {string} encryptedStr - Encrypted string to decrypt
   * @param {string} key - Key for decryption
   * @returns {string} Decrypted string
   */
  static simpleXorDecrypt(encryptedStr, key) {
    if (typeof encryptedStr !== 'string' || typeof key !== 'string') return encryptedStr;
    
    try {
      const decoded = atob(encryptedStr);
      const decodedURI = decodeURIComponent(Array.prototype.map.call(decoded, function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      let result = '';
      for (let i = 0; i < decodedURI.length; i++) {
        const charCode = decodedURI.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        const decryptedChar = charCode ^ keyChar;
        result += String.fromCharCode(decryptedChar);
      }
      
      return result;
    } catch (e) {
      return encryptedStr;
    }
  }

  /**
   * Creates a string hash (non-cryptographic)
   * @param {string} str - String to hash
   * @returns {number} Hash value
   */
  static hash(str) {
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
   * Finds occurrences of a pattern in a string with context
   * @param {string} str - String to search in
   * @param {string|RegExp} pattern - Pattern to search for
   * @param {Object} options - Search options
   * @returns {Array} Array of matches with context
   */
  static findWithContext(str, pattern, options = {}) {
    if (typeof str !== 'string' || (!pattern && typeof pattern !== 'string' && !(pattern instanceof RegExp))) {
      return [];
    }
    
    const {
      contextSize = 20,
      caseSensitive = true
    } = options;
    
    const regex = typeof pattern === 'string' 
      ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
                  caseSensitive ? 'g' : 'gi') 
      : pattern;
    
    const matches = [];
    let match;
    
    while ((match = regex.exec(str)) !== null) {
      const start = Math.max(0, match.index - contextSize);
      const end = Math.min(str.length, match.index + match[0].length + contextSize);
      
      matches.push({
        match: match[0],
        index: match.index,
        context: str.substring(start, end),
        before: str.substring(start, match.index),
        after: str.substring(match.index + match[0].length, end)
      });
    }
    
    return matches;
  }

  /**
   * Wraps words in a string that match a pattern with HTML tags
   * @param {string} str - String to highlight
   * @param {string|RegExp} pattern - Pattern to match
   * @param {string} tag - HTML tag to wrap matches with (default: 'mark')
   * @param {Object} attrs - Attributes to add to the wrapping tag
   * @returns {string} String with highlighted matches
   */
  static highlightMatches(str, pattern, tag = 'mark', attrs = {}) {
    if (typeof str !== 'string') return str;
    
    const regex = typeof pattern === 'string' 
      ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') 
      : pattern;
    
    const attrStr = Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    return str.replace(regex, (match) => 
      `<${tag}${attrStr ? ' ' + attrStr : ''}>${match}</${tag}>`);
  }

  /**
   * Sanitizes a string by removing potentially dangerous characters/sequences
   * @param {string} str - String to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized string
   */
  static sanitize(str, options = {}) {
    if (typeof str !== 'string') return str;
    
    const {
      stripHtml = true,
      stripScripts = true,
      allowList = [],
      ...extraOptions
    } = options;
    
    let result = str;
    
    if (stripHtml) {
      result = result.replace(/<[^>]*>/g, '');
    }
    
    if (stripScripts) {
      // Remove script tags and javascript: URLs
      result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      result = result.replace(/javascript:/gi, '');
      result = result.replace(/on\w+\s*=/gi, '');
    }
    
    // Additional sanitization based on allowList if needed
    // (For now, just return the stripped result)
    
    return result;
  }

  /**
   * Formats bytes to human-readable string
   * @param {number} bytes - Number of bytes
   * @param {Object} options - Formatting options
   * @returns {string} Human-readable byte string
   */
  static formatBytes(bytes, options = {}) {
    if (typeof bytes !== 'number') return bytes;
    
    const { 
      decimals = 2, 
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    } = options;
    
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Extracts and validates URLs from a string
   * @param {string} str - String to extract URLs from
   * @returns {Array} Array of valid URLs found
   */
  static extractUrls(str) {
    if (typeof str !== 'string') return [];
    
    // URL regex pattern
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    
    const matches = str.match(urlRegex) || [];
    
    // Validate URLs
    return matches.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Extracts and validates email addresses from a string
   * @param {string} str - String to extract emails from
   * @returns {Array} Array of valid email addresses found
   */
  static extractEmails(str) {
    if (typeof str !== 'string') return [];
    
    // Email regex pattern
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    const matches = str.match(emailRegex) || [];
    
    // Validate emails
    return matches.filter(email => {
      return this.isEmail(email);
    });
  }

  /**
   * Creates a string diff between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {Array} Array of diff parts with type and value
   */
  static diff(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
      return [{ type: 'common', value: str1 || str2 || '' }];
    }
    
    // This is a simplified diff - a full implementation would be more complex
    const result = [];
    
    // For a real implementation, this would use algorithms like Myers diff or similar
    // For now, we'll do a basic character-based comparison
    
    const longest = str1.length > str2.length ? str1 : str2;
    const shortest = str1.length > str2.length ? str2 : str1;
    
    let commonPrefix = '';
    let commonSuffix = '';
    
    // Find common prefix
    for (let i = 0; i < shortest.length; i++) {
      if (str1[i] === str2[i]) {
        commonPrefix += str1[i];
      } else {
        break;
      }
    }
    
    // Find common suffix
    for (let i = 0; i < shortest.length - commonPrefix.length; i++) {
      if (str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
        commonSuffix = str1[str1.length - 1 - i] + commonSuffix;
      } else {
        break;
      }
    }
    
    const prefixEnd = commonPrefix.length;
    const suffixStart1 = str1.length - commonSuffix.length;
    const suffixStart2 = str2.length - commonSuffix.length;
    
    // Add common prefix
    if (commonPrefix) {
      result.push({ type: 'common', value: commonPrefix });
    }
    
    // Add differences
    if (prefixEnd < suffixStart1 || prefixEnd < suffixStart2) {
      result.push({ type: 'removed', value: str1.substring(prefixEnd, suffixStart1) });
      result.push({ type: 'added', value: str2.substring(prefixEnd, suffixStart2) });
    }
    
    // Add common suffix
    if (commonSuffix) {
      result.push({ type: 'common', value: commonSuffix });
    }
    
    return result;
  }

  /**
   * Gets the reading time estimation for a string
   * @param {string} str - Text to estimate reading time for
   * @param {number} wpm - Words per minute (default: 200)
   * @returns {Object} Object containing minutes and words
   */
  static readingTime(str, wpm = 200) {
    if (typeof str !== 'string') return { minutes: 0, words: 0 };
    
    const words = str.trim().split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(words / wpm);
    
    return { minutes, words };
  }

  /**
   * Creates a typewriter effect in an element
   * @param {HTMLElement} element - Element to apply typewriter effect to
   * @param {string} text - Text to type out
   * @param {Object} options - Typing options
   * @returns {Promise} Promise that resolves when typing completes
   */
  static async typewriter(element, text, options = {}) {
    if (!element || typeof text !== 'string') return;
    
    const {
      delay = 100,
      startDelay = 0,
      onComplete = null
    } = options;
    
    // Delay start if needed
    if (startDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, startDelay));
    }
    
    element.textContent = '';
    
    for (const char of text) {
      element.textContent += char;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    if (onComplete && typeof onComplete === 'function') {
      onComplete();
    }
  }

  /**
   * Creates a string with alternating case
   * @param {string} str - String to convert
   * @returns {string} String with alternating upper/lowercase letters
   */
  static toAlternatingCase(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .split('')
      .map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
      .join('');
  }

  /**
   * Creates a string with random case
   * @param {string} str - String to convert
   * @returns {string} String with randomly upper/lowercase letters
   */
  static toRandomCase(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .split('')
      .map(char => Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase())
      .join('');
  }

  /**
   * Adds dynamic styles for string utilities
   */
  static addDynamicStyles() {
    if (document.getElementById('string-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'string-utilities-styles';
    style.textContent = `
      /* String utility related styles */
      .string-highlight {
        background-color: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        padding: 2px 4px;
        border-radius: 3px;
      }
      
      .string-truncated {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .string-monospace {
        font-family: monospace;
      }
      
      .string-uppercase {
        text-transform: uppercase;
      }
      
      .string-lowercase {
        text-transform: lowercase;
      }
      
      .string-capitalize {
        text-transform: capitalize;
      }
      
      .string-title-case {
        text-transform: capitalize;
      }
      
      .string-masked {
        opacity: 0.7;
        filter: blur(0.5px);
      }
      
      .typing-effect {
        border-right: 2px solid var(--jazer-cyan, #00f2ea);
        white-space: nowrap;
        overflow: hidden;
      }
      
      .typing-complete {
        border-right: none;
      }
      
      .string-diff-added {
        background-color: rgba(0, 255, 136, 0.2);
        text-decoration: underline;
      }
      
      .string-diff-removed {
        background-color: rgba(255, 68, 68, 0.2);
        text-decoration: line-through;
      }
      
      .string-diff-common {
        background-color: transparent;
      }
      
      /* Focus styles for accessibility */
      .string-focused {
        outline: 2px solid var(--jazer-cyan, #00f2ea);
        outline-offset: 2px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the string utilities instance and cleans up
   */
  destroy() {
    // String utilities don't have DOM-dependent resources to clean up
    // This method exists for consistency with other utility classes
    this.options = {};
  }
}

/**
 * Creates a new string utilities instance
 * @param {Object} options - Configuration options
 * @returns {StringUtils} New instance
 */
function createStringUtils(options = {}) {
  return new StringUtils(options);
}

// Create default instance
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