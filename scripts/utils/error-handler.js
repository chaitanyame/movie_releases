/**
 * Error Handler Utility Functions
 * 
 * Provides error handling and retry logic for API calls.
 * Implements exponential backoff and intelligent retry decisions.
 * 
 * @module scripts/utils/error-handler
 */

'use strict';

/**
 * Maximum number of retry attempts
 */
const MAX_RETRIES = 2;

/**
 * Retry delays in milliseconds by error type/status
 */
const RETRY_DELAYS = {
  429: 60000,    // Rate limit: 60 seconds
  500: 5000,     // Server error: 5 seconds
  502: 5000,     // Bad gateway: 5 seconds
  503: 10000,    // Service unavailable: 10 seconds
  504: 5000,     // Gateway timeout: 5 seconds
  timeout: 3000, // Timeout: 3 seconds
  network: 3000, // Network error: 3 seconds
  default: 5000  // Default: 5 seconds
};

/**
 * Network error codes that are retryable
 */
const RETRYABLE_NETWORK_ERRORS = [
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
  'EHOSTUNREACH'
];

/**
 * Analyze an API error and determine how to handle it.
 * 
 * @param {Error|Object} error - The error to analyze
 * @returns {{isRetryable: boolean, errorType: string, delay: number, message: string}}
 */
function handleApiError(error) {
  const status = error.status || error.statusCode;
  const code = error.code;
  const message = error.message || 'Unknown error';
  
  // Rate limit (429)
  if (status === 429) {
    return {
      isRetryable: true,
      errorType: 'rate_limit',
      delay: RETRY_DELAYS[429],
      message: `Rate limited: ${message}`
    };
  }
  
  // Server errors (500, 502, 503, 504)
  if (status >= 500 && status < 600) {
    return {
      isRetryable: true,
      errorType: 'server_error',
      delay: RETRY_DELAYS[status] || RETRY_DELAYS.default,
      message: `Server error (${status}): ${message}`
    };
  }
  
  // Auth errors (401, 403)
  if (status === 401 || status === 403) {
    return {
      isRetryable: false,
      errorType: 'auth_error',
      delay: 0,
      message: `Authentication error (${status}): ${message}`
    };
  }
  
  // Client errors (4xx)
  if (status >= 400 && status < 500) {
    return {
      isRetryable: false,
      errorType: 'client_error',
      delay: 0,
      message: `Client error (${status}): ${message}`
    };
  }
  
  // Timeout errors
  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') {
    return {
      isRetryable: true,
      errorType: 'timeout',
      delay: RETRY_DELAYS.timeout,
      message: `Timeout: ${message}`
    };
  }
  
  // Network errors
  if (RETRYABLE_NETWORK_ERRORS.includes(code)) {
    return {
      isRetryable: true,
      errorType: 'network',
      delay: RETRY_DELAYS.network,
      message: `Network error (${code}): ${message}`
    };
  }
  
  // Unknown errors - don't retry by default
  return {
    isRetryable: false,
    errorType: 'unknown',
    delay: 0,
    message: `Unknown error: ${message}`
  };
}

/**
 * Sleep for a specified duration.
 * 
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic and exponential backoff.
 * 
 * @param {Function} fn - Async function to execute
 * @param {Object} [options] - Options
 * @param {number} [options.maxRetries] - Maximum retry attempts (default: MAX_RETRIES)
 * @param {Function} [options.onRetry] - Callback when retrying (attempt, error)
 * @param {Function} [options.onFail] - Callback when all retries exhausted
 * @returns {Promise<*>} Result of the function
 * @throws {Error} If all retries fail
 */
async function retryWithBackoff(fn, options = {}) {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const onRetry = options.onRetry || (() => {});
  const onFail = options.onFail || (() => {});
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      const errorInfo = handleApiError(error);
      
      console.error(`Attempt ${attempt + 1} failed: ${errorInfo.message}`);
      
      // Don't retry if error is not retryable
      if (!errorInfo.isRetryable) {
        console.error(`Error is not retryable, giving up`);
        throw error;
      }
      
      // Don't retry if we've exhausted retries
      if (attempt >= maxRetries) {
        console.error(`Max retries (${maxRetries}) exhausted, giving up`);
        onFail(error);
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const baseDelay = errorInfo.delay;
      const backoffMultiplier = Math.pow(2, attempt);
      const delay = Math.min(baseDelay * backoffMultiplier, 120000); // Max 2 minutes
      
      console.log(`Retrying in ${delay}ms (attempt ${attempt + 2}/${maxRetries + 1})...`);
      onRetry(attempt + 1, error);
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Create a fetch wrapper with retry logic.
 * 
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} [retryOptions] - Retry options
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, options, retryOptions = {}) {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }
    
    return response;
  }, retryOptions);
}

module.exports = {
  MAX_RETRIES,
  RETRY_DELAYS,
  handleApiError,
  retryWithBackoff,
  fetchWithRetry,
  sleep
};
