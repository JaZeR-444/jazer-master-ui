/**
 * Array Utilities Module
 * Comprehensive array manipulation and utility functions
 * Compatible with jazer-brand.css styling for array-related utilities
 */

class ArrayUtils {
  /**
   * Creates a new array utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultChunkSize: 10,
      defaultPageSize: 20,
      ...options
    };
  }

  /**
   * Creates a deep clone of an array
   * @param {Array} arr - Array to clone
   * @returns {Array} Deep clone of the array
   */
  static deepClone(arr) {
    if (!Array.isArray(arr)) return arr;
    
    return arr.map(item => {
      if (item instanceof Date) return new Date(item);
      if (item instanceof RegExp) return new RegExp(item);
      if (item instanceof Set) return new Set([...item]);
      if (item instanceof Map) return new Map([...item]);
      if (typeof item === 'object' && item !== null) {
        // Handle plain objects recursively
        if (Array.isArray(item)) {
          return ArrayUtils.deepClone(item);
        } else if (item.constructor === Object) {
          const clonedObj = {};
          for (const key in item) {
            if (item.hasOwnProperty(key)) {
              clonedObj[key] = ArrayUtils.deepClone(item[key]);
            }
          }
          return clonedObj;
        }
        // For other objects, return as is
        return item;
      }
      return item;
    });
  }

  /**
   * Filters an array with multiple conditions
   * @param {Array} arr - Array to filter
   * @param {Object} conditions - Object with field names as keys and matching values/patterns
   * @returns {Array} Filtered array
   */
  static filterMultiple(arr, conditions) {
    if (!Array.isArray(arr)) return [];
    if (typeof conditions !== 'object' || !conditions) return [...arr];
    
    return arr.filter(item => {
      return Object.entries(conditions).every(([key, value]) => {
        if (typeof value === 'function') {
          // Value is a function to test the item
          return value(item[key], item);
        } else if (value instanceof RegExp) {
          // Value is a regex pattern
          return value.test(item[key]);
        } else if (Array.isArray(value)) {
          // Value is an array of acceptable values
          return value.includes(item[key]);
        } else {
          // Direct comparison
          return item[key] === value;
        }
      });
    });
  }

  /**
   * Groups an array by a specified key or function
   * @param {Array} arr - Array to group
   * @param {string|Function} key - Key to group by or function to extract group key
   * @returns {Object} Object with groups as keys
   */
  static groupBy(arr, key) {
    if (!Array.isArray(arr)) return {};
    
    return arr.reduce((groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  /**
   * Partitions an array into two arrays based on a predicate function
   * @param {Array} arr - Array to partition
   * @param {Function} predicate - Function to test each element
   * @returns {Array} Array with two elements: [matching elements, non-matching elements]
   */
  static partition(arr, predicate) {
    if (!Array.isArray(arr) || typeof predicate !== 'function') return [[], []];
    
    return arr.reduce(
      (result, item) => {
        const [matching, nonMatching] = result;
        predicate(item) ? matching.push(item) : nonMatching.push(item);
        return [matching, nonMatching];
      },
      [[], []]
    );
  }

  /**
   * Removes duplicates from an array based on a key or function
   * @param {Array} arr - Array to remove duplicates from
   * @param {string|Function} key - Key to compare by or function to extract comparison value
   * @returns {Array} Array with duplicates removed
   */
  static uniqueBy(arr, key) {
    if (!Array.isArray(arr)) return arr;
    
    const seen = new Set();
    return arr.filter(item => {
      const comparisonValue = typeof key === 'function' ? key(item) : item[key];
      
      if (seen.has(comparisonValue)) {
        return false;
      }
      
      seen.add(comparisonValue);
      return true;
    });
  }

  /**
   * Flattens a nested array to a specified depth
   * @param {Array} arr - Array to flatten
   * @param {number} depth - Depth to flatten to (default: Infinity)
   * @returns {Array} Flattened array
   */
  static flatten(arr, depth = Infinity) {
    if (!Array.isArray(arr)) return arr;
    
    return arr.reduce((acc, val) => {
      if (Array.isArray(val) && depth > 0) {
        return acc.concat(ArrayUtils.flatten(val, depth - 1));
      } else {
        return acc.concat(val);
      }
    }, []);
  }

  /**
   * Shuffles an array in place using Fisher-Yates algorithm
   * @param {Array} arr - Array to shuffle
   * @returns {Array} Shuffled array
   */
  static shuffle(arr) {
    if (!Array.isArray(arr)) return arr;
    
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Gets a random element from an array
   * @param {Array} arr - Array to get random element from
   * @returns {*} Random element or undefined if array is empty
   */
  static randomElement(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Samples n random elements from an array
   * @param {Array} arr - Array to sample from
   * @param {number} n - Number of elements to sample
   * @returns {Array} Array of n random elements
   */
  static sample(arr, n) {
    if (!Array.isArray(arr)) return [];
    if (n >= arr.length) return [...arr];
    if (n <= 0) return [];
    
    const shuffled = ArrayUtils.shuffle(arr);
    return shuffled.slice(0, n);
  }

  /**
   * Chunks an array into smaller arrays of specified size
   * @param {Array} arr - Array to chunk
   * @param {number} size - Size of each chunk
   * @returns {Array} Array of chunked arrays
   */
  static chunk(arr, size = this.options.defaultChunkSize) {
    if (!Array.isArray(arr) || typeof size !== 'number' || size <= 0) {
      return arr ? [arr] : [];
    }
    
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Creates an array with n elements repeated
   * @param {*} element - Element to repeat
   * @param {number} n - Number of times to repeat
   * @returns {Array} Array with repeated elements
   */
  static repeat(element, n) {
    if (typeof n !== 'number' || n <= 0) return [];
    
    return Array.from({ length: n }, () => element);
  }

  /**
   * Creates an array of numbers from start to end with specified step
   * @param {number} start - Start number
   * @param {number} end - End number
   * @param {number} step - Step between numbers (default: 1)
   * @returns {Array} Array of numbers
   */
  static range(start, end, step = 1) {
    if (typeof start !== 'number' || typeof end !== 'number') {
      throw new TypeError('Start and end must be numbers');
    }
    
    if (step === 0) {
      throw new Error('Step cannot be zero');
    }
    
    if (start > end && step > 0) {
      step = -step;
    }
    
    const result = [];
    if (step > 0) {
      for (let i = start; i <= end; i += step) {
        result.push(i);
      }
    } else {
      for (let i = start; i >= end; i += step) {
        result.push(i);
      }
    }
    
    return result;
  }

  /**
   * Fills an array with a specified value
   * @param {number} length - Length of the array
   * @param {*} value - Value to fill the array with
   * @returns {Array} Array filled with the specified value
   */
  static fill(length, value) {
    if (typeof length !== 'number' || length < 0) {
      throw new TypeError('Length must be a non-negative number');
    }
    
    return Array.from({ length }, () => value);
  }

  /**
   * Creates an array filled with values returned by a function
   * @param {number} length - Length of the array
   * @param {Function} fn - Function to generate values
   * @returns {Array} Array with generated values
   */
  static fillWith(length, fn) {
    if (typeof length !== 'number' || length < 0 || typeof fn !== 'function') {
      throw new TypeError('Length must be a non-negative number and fn must be a function');
    }
    
    return Array.from({ length }, (_, i) => fn(i));
  }

  /**
   * Creates a sliding window of the array
   * @param {Array} arr - Array to create windows from
   * @param {number} size - Size of each window
   * @param {number} step - Step between windows (default: 1)
   * @returns {Array} Array of windows
   */
  static window(arr, size, step = 1) {
    if (!Array.isArray(arr) || typeof size !== 'number' || size <= 0) return [];
    
    const result = [];
    
    for (let i = 0; i <= arr.length - size; i += step) {
      result.push(arr.slice(i, i + size));
    }
    
    return result;
  }

  /**
   * Removes elements from an array that match a predicate
   * @param {Array} arr - Array to remove elements from
   * @param {Function} predicate - Function to test each element
   * @returns {Array} New array without matching elements
   */
  static remove(arr, predicate) {
    if (!Array.isArray(arr) || typeof predicate !== 'function') return arr;
    
    return arr.filter(item => !predicate(item));
  }

  /**
   * Removes elements from an array by value
   * @param {Array} arr - Array to remove elements from
   * @param {*} value - Value to remove
   * @param {boolean} allOccurrences - Whether to remove all occurrences (default: false)
   * @returns {Array} New array without specified value
   */
  static removeByValue(arr, value, allOccurrences = false) {
    if (!Array.isArray(arr)) return arr;
    
    if (allOccurrences) {
      return arr.filter(item => item !== value);
    } else {
      const index = arr.indexOf(value);
      if (index !== -1) {
        return [...arr.slice(0, index), ...arr.slice(index + 1)];
      }
      return arr;
    }
  }

  /**
   * Removes elements from an array by index
   * @param {Array} arr - Array to remove elements from
   * @param {...number} indices - Indices to remove
   * @returns {Array} New array without elements at specified indices
   */
  static removeAtIndex(arr, ...indices) {
    if (!Array.isArray(arr)) return arr;
    
    const set = new Set(indices);
    return arr.filter((_, index) => !set.has(index));
  }

  /**
   * Zips multiple arrays together
   * @param {...Array} arrays - Arrays to zip
   * @returns {Array} Array of arrays with elements from each input array at the same index
   */
  static zip(...arrays) {
    if (!arrays.every(arr => Array.isArray(arr))) {
      throw new TypeError('All arguments must be arrays');
    }
    
    const minLength = Math.min(...arrays.map(arr => arr.length));
    const result = [];
    
    for (let i = 0; i < minLength; i++) {
      result.push(arrays.map(arr => arr[i]));
    }
    
    return result;
  }

  /**
   * Unzips an array of arrays back to separate arrays
   * @param {Array} arr - Array to unzip
   * @returns {Array} Array of unzipped arrays
   */
  static unzip(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    
    if (!Array.isArray(arr[0])) {
      // If first element is not an array, we just return an array of single-element arrays
      return arr.map(item => [item]);
    }
    
    const maxLength = Math.max(...arr.map(subArr => subArr.length));
    const result = Array(maxLength).fill().map(() => []);
    
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        result[j][i] = arr[i][j];
      }
    }
    
    return result;
  }

  /**
   * Transposes a 2D array
   * @param {Array} arr - 2D array to transpose
   * @returns {Array} Transposed array
   */
  static transpose(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return arr;
    
    const result = [];
    const numCols = Math.max(...arr.map(row => Array.isArray(row) ? row.length : 0));
    
    for (let i = 0; i < numCols; i++) {
      result[i] = arr.map(row => Array.isArray(row) && i < row.length ? row[i] : undefined);
    }
    
    return result;
  }

  /**
   * Finds the difference between two arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {Function} compareFunction - Function to compare elements (optional)
   * @returns {Array} Elements in arr1 that are not in arr2
   */
  static difference(arr1, arr2, compareFunction) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return arr1 || [];
    
    if (compareFunction && typeof compareFunction === 'function') {
      return arr1.filter(a => !arr2.some(b => compareFunction(a, b)));
    } else {
      return arr1.filter(item => !arr2.includes(item));
    }
  }

  /**
   * Finds the intersection of two arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {Function} compareFunction - Function to compare elements (optional)
   * @returns {Array} Elements common to both arrays
   */
  static intersection(arr1, arr2, compareFunction) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
    
    if (compareFunction && typeof compareFunction === 'function') {
      return arr1.filter(a => arr2.some(b => compareFunction(a, b)));
    } else {
      return arr1.filter(item => arr2.includes(item));
    }
  }

  /**
   * Finds the union of two arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {Function} compareFunction - Function to compare elements (optional)
   * @returns {Array} Elements from both arrays with duplicates removed
   */
  static union(arr1, arr2, compareFunction) {
    if (!Array.isArray(arr1) && !Array.isArray(arr2)) return [];
    if (!Array.isArray(arr1)) return ArrayUtils.unique(arr2, compareFunction);
    if (!Array.isArray(arr2)) return ArrayUtils.unique(arr1, compareFunction);
    
    const combined = [...arr1, ...arr2];
    
    if (compareFunction && typeof compareFunction === 'function') {
      return combined.filter((item, index) => {
        return !combined.slice(0, index).some(otherItem => compareFunction(item, otherItem));
      });
    } else {
      return ArrayUtils.unique(combined);
    }
  }

  /**
   * Calculates the symmetric difference of two arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {Function} compareFunction - Function to compare elements (optional)
   * @returns {Array} Elements in either arr1 or arr2 but not in both
   */
  static symmetricDifference(arr1, arr2, compareFunction) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return arr1 || arr2 || [];
    
    const diff1 = ArrayUtils.difference(arr1, arr2, compareFunction);
    const diff2 = ArrayUtils.difference(arr2, arr1, compareFunction);
    
    return [...diff1, ...diff2];
  }

  /**
   * Removes duplicates from an array
   * @param {Array} arr - Array to remove duplicates from
   * @param {Function} compareFunction - Function to compare elements (optional)
   * @returns {Array} Array with duplicates removed
   */
  static unique(arr, compareFunction) {
    if (!Array.isArray(arr)) return arr;
    
    if (compareFunction && typeof compareFunction === 'function') {
      return arr.filter((item, index) => {
        return !arr.slice(0, index).some(otherItem => compareFunction(item, otherItem));
      });
    } else {
      // Use Set for primitive values
      return [...new Set(arr)];
    }
  }

  /**
   * Calculates the Cartesian product of multiple arrays
   * @param {...Array} arrays - Arrays to calculate product for
   * @returns {Array} Cartesian product as array of arrays
   */
  static cartesianProduct(...arrays) {
    if (arrays.length === 0) return [[]];
    if (!arrays.every(arr => Array.isArray(arr))) {
      throw new TypeError('All arguments must be arrays');
    }
    
    return arrays.reduce((acc, arr) => {
      const result = [];
      for (const a of acc) {
        for (const b of arr) {
          result.push([...a, b]);
        }
      }
      return result;
    }, [[]]);
  }

  /**
   * Creates an array of unique values that is the union of multiple arrays
   * @param {...Array} arrays - Arrays to union
   * @returns {Array} Array with unique values from all arrays
   */
  static unionMultiple(...arrays) {
    if (arrays.length === 0) return [];
    if (!arrays.every(arr => Array.isArray(arr))) {
      throw new TypeError('All arguments must be arrays');
    }
    
    // Flatten the arrays and get unique values
    const flattened = arrays.flat();
    return ArrayUtils.unique(flattened);
  }

  /**
   * Creates an array of unique values that are in all provided arrays
   * @param {...Array} arrays - Arrays to find common elements in
   * @returns {Array} Array of common elements
   */
  static intersectionMultiple(...arrays) {
    if (arrays.length === 0 || !arrays.every(arr => Array.isArray(arr))) {
      throw new TypeError('All arguments must be arrays');
    }
    
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return [...arrays[0]];
    
    return arrays.reduce((acc, arr) => ArrayUtils.intersection(acc, arr));
  }

  /**
   * Finds elements that exist in the first array but not in any of the others
   * @param {...Array} arrays - Arrays to compare
   * @returns {Array} Elements in first array that are not in any other array
   */
  static differenceMultiple(...arrays) {
    if (arrays.length === 0 || !arrays.every(arr => Array.isArray(arr))) {
      throw new TypeError('All arguments must be arrays');
    }
    
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return [...arrays[0]];
    
    const firstArray = arrays[0];
    const otherArrays = arrays.slice(1);
    
    return firstArray.filter(item => {
      return !otherArrays.some(arr => arr.includes(item));
    });
  }

  /**
   * Creates a frequency map of array elements
   * @param {Array} arr - Array to create frequency map for
   * @param {Function} keyFunction - Function to extract key from elements (optional)
   * @returns {Object} Object with element keys and frequency counts
   */
  static frequencyMap(arr, keyFunction) {
    if (!Array.isArray(arr)) return {};
    
    return arr.reduce((freq, item) => {
      const key = keyFunction ? keyFunction(item) : item;
      freq[key] = (freq[key] || 0) + 1;
      return freq;
    }, {});
  }

  /**
   * Gets the most frequent element(s) in an array
   * @param {Array} arr - Array to analyze
   * @param {Function} keyFunction - Function to extract key from elements (optional)
   * @returns {Array} Array of most frequent elements
   */
  static mostFrequent(arr, keyFunction) {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    
    const frequencyMap = ArrayUtils.frequencyMap(arr, keyFunction);
    const maxCount = Math.max(...Object.values(frequencyMap));
    
    return Object.entries(frequencyMap)
      .filter(([, count]) => count === maxCount)
      .map(([value]) => value);
  }

  /**
   * Gets the least frequent element(s) in an array
   * @param {Array} arr - Array to analyze
   * @param {Function} keyFunction - Function to extract key from elements (optional)
   * @returns {Array} Array of least frequent elements
   */
  static leastFrequent(arr, keyFunction) {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    
    const frequencyMap = ArrayUtils.frequencyMap(arr, keyFunction);
    const minCount = Math.min(...Object.values(frequencyMap));
    
    return Object.entries(frequencyMap)
      .filter(([, count]) => count === minCount)
      .map(([value]) => value);
  }

  /**
   * Creates an array with elements sorted by their frequency
   * @param {Array} arr - Array to sort by frequency
   * @param {string} direction - Direction to sort ('asc', 'desc', default: 'desc')
   * @returns {Array} Array sorted by frequency
   */
  static sortByFrequency(arr, direction = 'desc') {
    if (!Array.isArray(arr)) return [];
    
    const frequencyMap = ArrayUtils.frequencyMap(arr);
    
    return [...new Set(arr)].sort((a, b) => {
      const freqA = frequencyMap[a];
      const freqB = frequencyMap[b];
      
      return direction === 'asc' ? freqA - freqB : freqB - freqA;
    });
  }

  /**
   * Creates an array that alternates elements from two arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {Array} Alternating array
   */
  static interleave(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
      return arr1 ? [...arr1] : arr2 ? [...arr2] : [];
    }
    
    const result = [];
    const maxLength = Math.max(arr1.length, arr2.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < arr1.length) result.push(arr1[i]);
      if (i < arr2.length) result.push(arr2[i]);
    }
    
    return result;
  }

  /**
   * Rotates an array by n positions
   * @param {Array} arr - Array to rotate
   * @param {number} n - Number of positions to rotate (positive = right, negative = left)
   * @returns {Array} Rotated array
   */
  static rotate(arr, n = 0) {
    if (!Array.isArray(arr)) return arr;
    
    if (arr.length === 0) return arr;
    
    // Normalize n to be within array length
    n = ((n % arr.length) + arr.length) % arr.length;
    
    return arr.slice(-n).concat(arr.slice(0, -n));
  }

  /**
   * Moves an element from one index to another
   * @param {Array} arr - Array to move element in
   * @param {number} fromIndex - Index to move from
   * @param {number} toIndex - Index to move to
   * @returns {Array} New array with element moved
   */
  static moveElement(arr, fromIndex, toIndex) {
    if (!Array.isArray(arr)) return arr;
    
    const result = [...arr];
    const element = result.splice(fromIndex, 1)[0];
    result.splice(toIndex, 0, element);
    
    return result;
  }

  /**
   * Swaps two elements in an array
   * @param {Array} arr - Array to swap elements in
   * @param {number} index1 - First index
   * @param {number} index2 - Second index
   * @returns {Array} New array with elements swapped
   */
  static swapElements(arr, index1, index2) {
    if (!Array.isArray(arr)) return arr;
    
    if (index1 < 0 || index1 >= arr.length || index2 < 0 || index2 >= arr.length) {
      throw new Error('Index out of bounds');
    }
    
    const result = [...arr];
    [result[index1], result[index2]] = [result[index2], result[index1]];
    
    return result;
  }

  /**
   * Creates an array with elements in random order (shuffle)
   * @param {Array} arr - Array to shuffle
   * @returns {Array} Shuffled array
   */
  static shuffleArray(arr) {
    if (!Array.isArray(arr)) return arr;
    
    return ArrayUtils.shuffle(arr);
  }

  /**
   * Creates a deep comparison function for complex objects
   * @param {*} a - First value to compare
   * @param {*} b - Second value to compare
   * @returns {boolean} Whether the values are deeply equal
   */
  static deepEqual(a, b) {
    if (a === b) return true;
    
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    
    if (a instanceof RegExp && b instanceof RegExp) {
      return a.toString() === b.toString();
    }
    
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      return false;
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!ArrayUtils.deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }

  /**
   * Filters an array by deep matching an object structure
   * @param {Array} arr - Array to filter
   * @param {Object} template - Template object to match against
   * @returns {Array} Filtered array
   */
  static filterByTemplate(arr, template) {
    if (!Array.isArray(arr) || typeof template !== 'object' || template === null) return arr;
    
    return arr.filter(item => {
      if (typeof item !== 'object' || item === null) return false;
      
      for (const [key, value] of Object.entries(template)) {
        if (typeof value === 'object' && value !== null) {
          // Recursive check for nested objects
          if (!ArrayUtils.deepEqual(item[key], value)) return false;
        } else if (Array.isArray(value)) {
          // Check if arrays are equal
          if (!Array.isArray(item[key]) || !ArrayUtils.deepEqual(item[key], value)) return false;
        } else if (item[key] !== value) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Finds the index of an element using a predicate function
   * @param {Array} arr - Array to search
   * @param {Function} predicate - Function to test each element
   * @returns {number} Index of the first element that matches the predicate, or -1 if not found
   */
  static findIndex(arr, predicate) {
    if (!Array.isArray(arr) || typeof predicate !== 'function') {
      throw new TypeError('Expected an array and a function');
    }
    
    for (let i = 0; i < arr.length; i++) {
      if (predicate(arr[i], i, arr)) {
        return i;
      }
    }
    
    return -1;
  }

  /**
   * Finds the last index of an element using a predicate function
   * @param {Array} arr - Array to search
   * @param {Function} predicate - Function to test each element
   * @returns {number} Index of the last element that matches the predicate, or -1 if not found
   */
  static findLastIndex(arr, predicate) {
    if (!Array.isArray(arr) || typeof predicate !== 'function') {
      throw new TypeError('Expected an array and a function');
    }
    
    for (let i = arr.length - 1; i >= 0; i--) {
      if (predicate(arr[i], i, arr)) {
        return i;
      }
    }
    
    return -1;
  }

  /**
   * Gets all indices of elements that match a predicate
   * @param {Array} arr - Array to search
   * @param {Function} predicate - Function to test each element
   * @returns {Array} Array of indices that match the predicate
   */
  static findAllIndices(arr, predicate) {
    if (!Array.isArray(arr) || typeof predicate !== 'function') {
      throw new TypeError('Expected an array and a function');
    }
    
    const indices = [];
    
    for (let i = 0; i < arr.length; i++) {
      if (predicate(arr[i], i, arr)) {
        indices.push(i);
      }
    }
    
    return indices;
  }

  /**
   * Creates an array with elements that have a specific property value
   * @param {Array} arr - Array of objects to search
   * @param {string} property - Property name
   * @param {*} value - Value to match
   * @returns {Array} Array of elements with matching property value
   */
  static findByProperty(arr, property, value) {
    if (!Array.isArray(arr) || typeof property !== 'string') return [];
    
    return arr.filter(item => 
      typeof item === 'object' && 
      item !== null && 
      item[property] === value
    );
  }

  /**
   * Plucks a specific property from each element in an array
   * @param {Array} arr - Array of objects
   * @param {string} property - Property name to pluck
   * @returns {Array} Array with the specified property values
   */
  static pluck(arr, property) {
    if (!Array.isArray(arr) || typeof property !== 'string') return arr;
    
    return arr.map(item => 
      typeof item === 'object' && item !== null ? item[property] : undefined
    );
  }

  /**
   * Creates an object from an array based on key and value extractors
   * @param {Array} arr - Array to transform
   * @param {Function|string} keyExtractor - Function to extract key or property name
   * @param {Function|string} valueExtractor - Function to extract value or property name
   * @returns {Object} Object with key-value pairs from the array
   */
  static toObject(arr, keyExtractor, valueExtractor = null) {
    if (!Array.isArray(arr)) return {};
    
    const isKeyString = typeof keyExtractor === 'string';
    const isValueString = typeof valueExtractor === 'string';
    
    return arr.reduce((obj, item) => {
      const key = isKeyString ? item[keyExtractor] : keyExtractor(item);
      
      if (valueExtractor) {
        obj[key] = isValueString ? item[valueExtractor] : valueExtractor(item);
      } else {
        obj[key] = item;
      }
      
      return obj;
    }, {});
  }

  /**
   * Creates an array of cumulative sums
   * @param {Array} arr - Array of numbers
   * @returns {Array} Array of cumulative sums
   */
  static cumulativeSum(arr) {
    if (!Array.isArray(arr) || !arr.every(item => typeof item === 'number')) {
      throw new TypeError('Expected an array of numbers');
    }
    
    const result = [];
    let sum = 0;
    
    for (const num of arr) {
      sum += num;
      result.push(sum);
    }
    
    return result;
  }

  /**
   * Calculates the average of an array of numbers
   * @param {Array} arr - Array of numbers
   * @returns {number} Average value
   */
  static average(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    
    const validNumbers = arr.filter(item => typeof item === 'number');
    if (validNumbers.length === 0) return 0;
    
    const sum = validNumbers.reduce((acc, num) => acc + num, 0);
    return sum / validNumbers.length;
  }

  /**
   * Calculates the median of an array of numbers
   * @param {Array} arr - Array of numbers
   * @returns {number} Median value
   */
  static median(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    
    const validNumbers = arr.filter(item => typeof item === 'number');
    if (validNumbers.length === 0) return 0;
    
    const sorted = [...validNumbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0 ?
      (sorted[mid - 1] + sorted[mid]) / 2 :
      sorted[mid];
  }

  /**
   * Calculates the mode(s) of an array of numbers
   * @param {Array} arr - Array of numbers
   * @returns {Array} Array of mode values
   */
  static mode(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    
    const frequencyMap = {};
    let maxFreq = 0;
    
    // Count frequencies
    for (const num of arr) {
      if (typeof num === 'number') {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
        maxFreq = Math.max(maxFreq, frequencyMap[num]);
      }
    }
    
    // Find values with max frequency
    return Object.entries(frequencyMap)
      .filter(([, freq]) => freq === maxFreq)
      .map(([value]) => Number(value));
  }

  /**
   * Calculates the standard deviation of an array of numbers
   * @param {Array} arr - Array of numbers
   * @returns {number} Standard deviation
   */
  static standardDeviation(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    
    const validNumbers = arr.filter(item => typeof item === 'number');
    if (validNumbers.length === 0) return 0;
    
    const mean = ArrayUtils.average(validNumbers);
    const squares = validNumbers.map(num => Math.pow(num - mean, 2));
    const avgSquares = ArrayUtils.average(squares);
    
    return Math.sqrt(avgSquares);
  }

  /**
   * Finds the maximum value in an array of numbers
   * @param {Array} arr - Array of numbers
   * @returns {number} Maximum value
   */
  static max(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    
    const validNumbers = arr.filter(item => typeof item === 'number');
    return validNumbers.length > 0 ? Math.max(...validNumbers) : undefined;
  }

  /**
   * Finds the minimum value in an array of numbers
   * @param {Array} arr - Array of numbers
   * @returns {number} Minimum value
   */
  static min(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    
    const validNumbers = arr.filter(item => typeof item === 'number');
    return validNumbers.length > 0 ? Math.min(...validNumbers) : undefined;
  }

  /**
   * Creates a histogram of values in an array
   * @param {Array} arr - Array of values
   * @param {number} bins - Number of bins (default: 10)
   * @returns {Object} Histogram object with bins and counts
   */
  static histogram(arr, bins = 10) {
    if (!Array.isArray(arr) || arr.length === 0) return {};
    
    const validNumbers = arr.filter(item => typeof item === 'number');
    if (validNumbers.length === 0) return {};
    
    if (validNumbers.length === 1) {
      return { [validNumbers[0]]: 1 };
    }
    
    const min = Math.min(...validNumbers);
    const max = Math.max(...validNumbers);
    const binSize = (max - min) / bins;
    
    const histogram = {};
    
    for (let i = 0; i < bins; i++) {
      const binMin = min + i * binSize;
      const binMax = min + (i + 1) * binSize;
      const binName = `${binMin.toFixed(2)}-${binMax.toFixed(2)}`;
      histogram[binName] = 0;
    }
    
    for (const num of validNumbers) {
      const binIndex = Math.min(bins - 1, Math.floor((num - min) / binSize));
      const binKeys = Object.keys(histogram);
      const binName = binKeys[binIndex];
      histogram[binName]++;
    }
    
    return histogram;
  }

  /**
   * Creates a pagination utility for an array
   * @param {Array} arr - Array to paginate
   * @param {number} pageSize - Size of each page
   * @returns {Object} Pagination utility with methods for navigating pages
   */
  static createPager(arr, pageSize = this.options.defaultPageSize) {
    if (!Array.isArray(arr)) return null;
    
    const totalItems = arr.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    let currentPage = 1;
    
    return {
      getTotalItems: () => totalItems,
      getTotalPages: () => totalPages,
      getCurrentPage: () => currentPage,
      
      setPage: (pageNum) => {
        if (pageNum < 1 || pageNum > totalPages) {
          throw new Error(`Page number must be between 1 and ${totalPages}`);
        }
        currentPage = pageNum;
        return this.getPage();
      },
      
      getPage: (pageNum = currentPage) => {
        if (pageNum < 1 || pageNum > totalPages) return [];
        
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        
        return arr.slice(startIndex, endIndex);
      },
      
      getNextPage: () => {
        if (currentPage < totalPages) {
          currentPage++;
          return this.getPage();
        }
        return null;
      },
      
      getPrevPage: () => {
        if (currentPage > 1) {
          currentPage--;
          return this.getPage();
        }
        return null;
      },
      
      isFirstPage: () => currentPage === 1,
      isLastPage: () => currentPage === totalPages,
      
      getRange: (startPage, endPage) => {
        if (startPage < 1) startPage = 1;
        if (endPage > totalPages) endPage = totalPages;
        
        const range = [];
        for (let i = startPage; i <= endPage; i++) {
          range.push(...this.getPage(i));
        }
        return range;
      }
    };
  }

  /**
   * Creates an observable array that emits events when changed
   * @param {Array} arr - Initial array
   * @param {Object} options - Observer options
   * @returns {Object} Observable array with event methods
   */
  static createObservableArray(arr = [], options = {}) {
    if (!Array.isArray(arr)) arr = [];
    
    const listeners = [];
    const observable = {
      _data: [...arr],
      
      push: function(...items) {
        const newLength = this._data.push(...items);
        this._emit('push', items);
        return newLength;
      },
      
      pop: function() {
        const item = this._data.pop();
        this._emit('pop', item);
        return item;
      },
      
      shift: function() {
        const item = this._data.shift();
        this._emit('shift', item);
        return item;
      },
      
      unshift: function(...items) {
        const newLength = this._data.unshift(...items);
        this._emit('unshift', items);
        return newLength;
      },
      
      splice: function(start, deleteCount, ...items) {
        const removed = this._data.splice(start, deleteCount, ...items);
        this._emit('splice', { start, deleteCount, items, removed });
        return removed;
      },
      
      update: function(index, value) {
        if (index >= 0 && index < this._data.length) {
          const oldVal = this._data[index];
          this._data[index] = value;
          this._emit('update', { index, value, oldValue: oldVal });
        }
        return this;
      },
      
      clear: function() {
        const oldData = [...this._data];
        this._data = [];
        this._emit('clear', oldData);
        return this;
      },
      
      addEventListener: function(type, callback) {
        if (typeof callback !== 'function') return;
        listeners.push({ type, callback });
      },
      
      removeEventListener: function(type, callback) {
        const index = listeners.findIndex(
          listener => listener.type === type && listener.callback === callback
        );
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      },
      
      _emit: function(type, payload) {
        listeners
          .filter(listener => listener.type === type || listener.type === '*')
          .forEach(listener => {
            try {
              listener.callback(type, payload, [...this._data]);
            } catch (error) {
              console.error('Error in observable array listener:', error);
            }
          });
      },
      
      get length() {
        return this._data.length;
      },
      
      set length(value) {
        this._data.length = value;
        this._emit('resize', value);
      },
      
      // Standard array methods
      map: function(callback) {
        return this._data.map(callback);
      },
      
      filter: function(callback) {
        return this._data.filter(callback);
      },
      
      reduce: function(callback, initialValue) {
        return this._data.reduce(callback, initialValue);
      },
      
      forEach: function(callback) {
        this._data.forEach(callback);
      },
      
      find: function(callback) {
        return this._data.find(callback);
      },
      
      some: function(callback) {
        return this._data.some(callback);
      },
      
      every: function(callback) {
        return this._data.every(callback);
      },
      
      toReversed: function() {
        return [...this._data].reverse();
      },
      
      toSorted: function(compareFunction) {
        return [...this._data].sort(compareFunction);
      },
      
      toSpliced: function(start, deleteCount, ...items) {
        const newArr = [...this._data];
        newArr.splice(start, deleteCount, ...items);
        return newArr;
      },
      
      with: function(index, value) {
        const newArr = [...this._data];
        newArr[index] = value;
        return newArr;
      }
    };
    
    return observable;
  }

  /**
   * Creates a sorted array utility that maintains sorted order
   * @param {Array} arr - Initial array
   * @param {Function} compareFunction - Function to compare elements
   * @returns {Object} Sorted array utility
   */
  static createSortedArray(arr = [], compareFunction) {
    if (!Array.isArray(arr)) arr = [];
    
    const sortedArray = {
      _data: compareFunction ? 
        [...arr].sort(compareFunction) : 
        [...arr].sort((a, b) => a < b ? -1 : a > b ? 1 : 0),
      
      compareFn: compareFunction || ((a, b) => a < b ? -1 : a > b ? 1 : 0),
      
      add: function(item) {
        // Find insertion point using binary search
        let left = 0;
        let right = this._data.length;
        
        while (left < right) {
          const mid = Math.floor((left + right) / 2);
          if (this.compareFn(this._data[mid], item) < 0) {
            left = mid + 1;
          } else {
            right = mid;
          }
        }
        
        this._data.splice(left, 0, item);
        return this;
      },
      
      remove: function(item) {
        const index = this._data.indexOf(item);
        if (index !== -1) {
          this._data.splice(index, 1);
        }
        return this;
      },
      
      has: function(item) {
        // Use binary search for efficiency
        let left = 0;
        let right = this._data.length;
        
        while (left < right) {
          const mid = Math.floor((left + right) / 2);
          const comparison = this.compareFn(this._data[mid], item);
          
          if (comparison === 0) {
            return true;
          } else if (comparison < 0) {
            left = mid + 1;
          } else {
            right = mid;
          }
        }
        
        return false;
      },
      
      get length() {
        return this._data.length;
      },
      
      get data() {
        return [...this._data];
      },
      
      // Additional utility methods
      first: function() {
        return this._data[0];
      },
      
      last: function() {
        return this._data[this._data.length - 1];
      },
      
      findRange: function(min, max) {
        const result = [];
        
        for (const item of this._data) {
          if (this.compareFn(item, min) >= 0 && this.compareFn(item, max) <= 0) {
            result.push(item);
          } else if (this.compareFn(item, min) > 0) {
            // Since array is sorted, we can stop searching early
            break;
          }
        }
        
        return result;
      }
    };
    
    return sortedArray;
  }

  /**
   * Creates a circular array (ring buffer) with a fixed size
   * @param {number} size - Size of the circular array
   * @returns {Object} Circular array utility
   */
  static createCircularArray(size) {
    if (typeof size !== 'number' || size <= 0) {
      throw new TypeError('Size must be a positive number');
    }
    
    const buffer = new Array(size);
    let head = 0;
    let tail = 0;
    let count = 0;
    
    return {
      get capacity() {
        return size;
      },
      
      get length() {
        return count;
      },
      
      push: function(item) {
        if (count === size) {
          // Buffer is full, overwrite oldest item
          head = (head + 1) % size;
        } else {
          count++;
        }
        
        buffer[tail] = item;
        tail = (tail + 1) % size;
      },
      
      pop: function() {
        if (count === 0) return undefined;
        
        tail = (tail - 1 + size) % size;
        const item = buffer[tail];
        buffer[tail] = undefined;
        count--;
        return item;
      },
      
      shift: function() {
        if (count === 0) return undefined;
        
        const item = buffer[head];
        buffer[head] = undefined;
        head = (head + 1) % size;
        count--;
        return item;
      },
      
      peek: function(index = 0) {
        if (index < 0 || index >= count) return undefined;
        
        const actualIndex = (head + index) % size;
        return buffer[actualIndex];
      },
      
      toArray: function() {
        const result = [];
        for (let i = 0; i < count; i++) {
          const idx = (head + i) % size;
          result.push(buffer[idx]);
        }
        return result;
      },
      
      clear: function() {
        buffer.fill(undefined);
        head = 0;
        tail = 0;
        count = 0;
      },
      
      isFull: function() {
        return count === size;
      },
      
      isEmpty: function() {
        return count === 0;
      }
    };
  }

  /**
   * Creates a priority queue using an array
   * @param {Function} compareFunction - Function to compare elements (min-heap by default)
   * @returns {Object} Priority queue utility
   */
  static createPriorityQueue(compareFunction = (a, b) => a < b ? -1 : a > b ? 1 : 0) {
    const heap = [];
    
    const parentIndex = (i) => Math.floor((i - 1) / 2);
    const leftChildIndex = (i) => 2 * i + 1;
    const rightChildIndex = (i) => 2 * i + 2;
    
    const swap = (i, j) => {
      [heap[i], heap[j]] = [heap[j], heap[i]];
    };
    
    const heapifyUp = (index) => {
      while (index > 0) {
        const parentIdx = parentIndex(index);
        if (compareFunction(heap[parentIdx], heap[index]) <= 0) break;
        
        swap(index, parentIdx);
        index = parentIdx;
      }
    };
    
    const heapifyDown = (index) => {
      while (true) {
        const leftIdx = leftChildIndex(index);
        const rightIdx = rightChildIndex(index);
        let minIdx = index;
        
        if (leftIdx < heap.length && compareFunction(heap[leftIdx], heap[minIdx]) < 0) {
          minIdx = leftIdx;
        }
        
        if (rightIdx < heap.length && compareFunction(heap[rightIdx], heap[minIdx]) < 0) {
          minIdx = rightIdx;
        }
        
        if (minIdx === index) break;
        
        swap(index, minIdx);
        index = minIdx;
      }
    };
    
    return {
      push: function(item) {
        heap.push(item);
        heapifyUp(heap.length - 1);
      },
      
      pop: function() {
        if (heap.length === 0) return undefined;
        
        const min = heap[0];
        heap[0] = heap[heap.length - 1];
        heap.pop();
        
        if (heap.length > 0) {
          heapifyDown(0);
        }
        
        return min;
      },
      
      peek: function() {
        return heap.length > 0 ? heap[0] : undefined;
      },
      
      get length() {
        return heap.length;
      },
      
      clear: function() {
        heap.length = 0;
      },
      
      isEmpty: function() {
        return heap.length === 0;
      },
      
      toArray: function() {
        return [...heap];
      }
    };
  }

  /**
   * Adds utility CSS for array animations
   */
  static addUtilityStyles() {
    if (document.getElementById('array-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'array-utilities-styles';
    style.textContent = `
      /* Array utility related styles */
      .array-item-animating {
        transition: all 0.3s ease;
      }
      
      .array-item-adding {
        animation: arraySlideIn 0.3s ease-out;
      }
      
      .array-item-removing {
        animation: arraySlideOut 0.3s ease-in;
      }
      
      @keyframes arraySlideIn {
        from {
          opacity: 0;
          transform: translateY(-10px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes arraySlideOut {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(10px) scale(0.9);
        }
      }
      
      .array-visualization {
        display: flex;
        align-items: flex-end;
        height: 200px;
        gap: 2px;
        padding: 10px;
        border: 1px solid var(--border-default, #4facfe);
        background: var(--bg-darker, #111);
      }
      
      .array-visualizer-bar {
        flex: 1;
        background: var(--jazer-cyan, #00f2ea);
        min-width: 10px;
        transition: height 0.3s ease;
      }
      
      .array-visualizer-label {
        position: absolute;
        font-size: 0.7rem;
        color: var(--text-lighter, #aaa);
        text-align: center;
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * Creates a new array utilities instance
 * @param {Object} options - Configuration options
 * @returns {ArrayUtils} New array utilities instance
 */
function createArrayUtils(options = {}) {
  return new ArrayUtils(options);
}

// Create default instance
const arrayUtils = new ArrayUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ArrayUtils,
    createArrayUtils,
    arrayUtils
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ArrayUtils = ArrayUtils;
  window.createArrayUtils = createArrayUtils;
  window.arrayUtils = arrayUtils;
}