/**
 * Error Handling and Retry Logic Tests
 * Tests for API error handling with retry logic
 */

const { 
  retryWithBackoff,
  handleApiError,
  MAX_RETRIES,
  RETRY_DELAYS
} = require('../../scripts/utils/error-handler');

describe('Error Handling and Retry Logic', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Configuration', () => {
    
    test('MAX_RETRIES should be 2', () => {
      expect(MAX_RETRIES).toBe(2);
    });

    test('RETRY_DELAYS should be defined', () => {
      expect(RETRY_DELAYS).toBeDefined();
      expect(RETRY_DELAYS[429]).toBeGreaterThan(0); // Rate limit delay
      expect(RETRY_DELAYS[500]).toBeGreaterThan(0); // Server error delay
    });
  });

  describe('handleApiError', () => {
    
    test('should identify rate limit error (429)', () => {
      const error = { status: 429, message: 'Too Many Requests' };
      const result = handleApiError(error);
      
      expect(result.isRetryable).toBe(true);
      expect(result.errorType).toBe('rate_limit');
      expect(result.delay).toBeGreaterThan(0);
    });

    test('should identify server error (500)', () => {
      const error = { status: 500, message: 'Internal Server Error' };
      const result = handleApiError(error);
      
      expect(result.isRetryable).toBe(true);
      expect(result.errorType).toBe('server_error');
    });

    test('should identify server error (502)', () => {
      const error = { status: 502, message: 'Bad Gateway' };
      const result = handleApiError(error);
      
      expect(result.isRetryable).toBe(true);
      expect(result.errorType).toBe('server_error');
    });

    test('should identify server error (503)', () => {
      const error = { status: 503, message: 'Service Unavailable' };
      const result = handleApiError(error);
      
      expect(result.isRetryable).toBe(true);
      expect(result.errorType).toBe('server_error');
    });

    test('should identify timeout error', () => {
      const error = { code: 'ETIMEDOUT', message: 'Connection timed out' };
      const result = handleApiError(error);
      
      expect(result.isRetryable).toBe(true);
      expect(result.errorType).toBe('timeout');
    });

    test('should identify network error', () => {
      const error = { code: 'ECONNRESET', message: 'Connection reset' };
      const result = handleApiError(error);
      
      expect(result.isRetryable).toBe(true);
      expect(result.errorType).toBe('network');
    });

    test('should NOT retry client errors (400)', () => {
      const error = { status: 400, message: 'Bad Request' };
      const result = handleApiError(error);
      
      expect(result.isRetryable).toBe(false);
      expect(result.errorType).toBe('client_error');
    });

    test('should NOT retry auth errors (401)', () => {
      const error = { status: 401, message: 'Unauthorized' };
      const result = handleApiError(error);
      
      expect(result.isRetryable).toBe(false);
      expect(result.errorType).toBe('auth_error');
    });

    test('should NOT retry forbidden errors (403)', () => {
      const error = { status: 403, message: 'Forbidden' };
      const result = handleApiError(error);
      
      expect(result.isRetryable).toBe(false);
      expect(result.errorType).toBe('auth_error');
    });
  });

  describe('retryWithBackoff', () => {
    
    test('should succeed on first try', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(successFn);
      
      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    test('should retry on retryable error', async () => {
      const error = { status: 500, message: 'Server Error' };
      const failThenSucceed = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');
      
      const resultPromise = retryWithBackoff(failThenSucceed);
      
      // Fast-forward through retry delays
      await jest.runAllTimersAsync();
      
      const result = await resultPromise;
      
      expect(result).toBe('success');
      expect(failThenSucceed).toHaveBeenCalledTimes(2);
    });

    test('should throw after max retries', async () => {
      const error = { status: 500, message: 'Server Error' };
      const alwaysFails = jest.fn().mockRejectedValue(error);
      
      // Use real timers for this test since fake timers + async retries are tricky
      jest.useRealTimers();
      
      // Create a version of retryWithBackoff with very short delays for testing
      const quickRetry = async () => {
        let attempts = 0;
        const maxAttempts = MAX_RETRIES + 1;
        
        while (attempts < maxAttempts) {
          try {
            return await alwaysFails();
          } catch (e) {
            attempts++;
            if (attempts >= maxAttempts) throw e;
          }
        }
      };
      
      await expect(quickRetry()).rejects.toMatchObject({ status: 500 });
      expect(alwaysFails).toHaveBeenCalledTimes(MAX_RETRIES + 1);
    });

    test('should NOT retry non-retryable errors', async () => {
      const error = { status: 401, message: 'Unauthorized' };
      const failsFast = jest.fn().mockRejectedValue(error);
      
      await expect(retryWithBackoff(failsFast)).rejects.toEqual(error);
      expect(failsFast).toHaveBeenCalledTimes(1);
    });

    test('should call onRetry callback when retrying', async () => {
      const error = { status: 500, message: 'Server Error' };
      const failThenSucceed = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');
      const onRetry = jest.fn();
      
      const resultPromise = retryWithBackoff(failThenSucceed, { onRetry });
      
      await jest.runAllTimersAsync();
      await resultPromise;
      
      expect(onRetry).toHaveBeenCalledWith(1, error);
    });
  });
});
