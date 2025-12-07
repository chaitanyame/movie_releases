/**
 * Caching Mechanism Tests
 * Tests for file-based caching with 24-hour TTL
 */

const fs = require('fs');
const path = require('path');

// Mock fs module
jest.mock('fs');

const { 
  loadCache, 
  saveCache, 
  isCacheValid,
  getCachePath,
  CACHE_TTL_MS
} = require('../../scripts/utils/cache');

describe('Caching Mechanism', () => {
  
  const mockWeekId = '2024-49';
  const mockCachePath = 'data/.cache/2024-49.json';
  const mockData = {
    week_id: '2024-49',
    week_number: 49,
    year: 2024,
    platforms: [
      { id: 'netflix', name: 'Netflix', releases: [] }
    ]
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Date to a known time
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-12-04T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCachePath', () => {
    
    test('should return correct cache file path', () => {
      const result = getCachePath('2024-49');
      expect(result).toContain('data');
      expect(result).toContain('.cache');
      expect(result).toContain('2024-49.json');
    });
  });

  describe('CACHE_TTL_MS', () => {
    
    test('should be 24 hours in milliseconds', () => {
      expect(CACHE_TTL_MS).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('loadCache', () => {
    
    test('should return null when cache file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      
      const result = loadCache(mockWeekId);
      
      expect(result).toBeNull();
    });

    test('should return cached data when file exists and is valid', () => {
      const cachedData = {
        ...mockData,
        _cache: {
          timestamp: new Date('2024-12-04T10:00:00Z').toISOString(),
          expires: new Date('2024-12-05T10:00:00Z').toISOString()
        }
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(cachedData));
      
      const result = loadCache(mockWeekId);
      
      expect(result).toEqual(cachedData);
    });

    test('should return null when cache file is corrupted', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');
      
      const result = loadCache(mockWeekId);
      
      expect(result).toBeNull();
    });
  });

  describe('saveCache', () => {
    
    test('should create cache directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockReturnValue(undefined);
      fs.writeFileSync.mockReturnValue(undefined);
      
      saveCache(mockWeekId, mockData);
      
      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    test('should write data with timestamp to cache file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockReturnValue(undefined);
      
      saveCache(mockWeekId, mockData);
      
      expect(fs.writeFileSync).toHaveBeenCalled();
      
      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenData = JSON.parse(writeCall[1]);
      
      expect(writtenData._cache).toBeDefined();
      expect(writtenData._cache.timestamp).toBeDefined();
      expect(writtenData._cache.expires).toBeDefined();
    });

    test('should include all original data', () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockReturnValue(undefined);
      
      saveCache(mockWeekId, mockData);
      
      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenData = JSON.parse(writeCall[1]);
      
      expect(writtenData.week_id).toBe(mockData.week_id);
      expect(writtenData.platforms).toEqual(mockData.platforms);
    });
  });

  describe('isCacheValid', () => {
    
    test('should return false when cache data is null', () => {
      const result = isCacheValid(null);
      
      expect(result).toBe(false);
    });

    test('should return false when cache has no timestamp', () => {
      const result = isCacheValid(mockData);
      
      expect(result).toBe(false);
    });

    test('should return true when cache is within TTL', () => {
      const cachedData = {
        ...mockData,
        _cache: {
          timestamp: new Date('2024-12-04T10:00:00Z').toISOString(),
          expires: new Date('2024-12-05T10:00:00Z').toISOString()
        }
      };
      
      // Current time is 2024-12-04T12:00:00Z, cache expires at 2024-12-05T10:00:00Z
      const result = isCacheValid(cachedData);
      
      expect(result).toBe(true);
    });

    test('should return false when cache has expired', () => {
      const cachedData = {
        ...mockData,
        _cache: {
          timestamp: new Date('2024-12-03T08:00:00Z').toISOString(),
          expires: new Date('2024-12-04T08:00:00Z').toISOString()
        }
      };
      
      // Current time is 2024-12-04T12:00:00Z, cache expired at 2024-12-04T08:00:00Z
      const result = isCacheValid(cachedData);
      
      expect(result).toBe(false);
    });
  });
});
