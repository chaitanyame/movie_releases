/**
 * Cache Utility Functions
 * 
 * Provides file-based caching with 24-hour TTL for API responses.
 * Used to reduce API calls and provide fallback when API fails.
 * 
 * @module scripts/utils/cache
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Cache TTL in milliseconds (24 hours)
 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Base directory for cache files
 */
const CACHE_DIR = path.join(process.cwd(), 'data', '.cache');

/**
 * Get the cache file path for a given week ID.
 * 
 * @param {string} weekId - Week identifier (e.g., "2024-49")
 * @returns {string} Full path to cache file
 */
function getCachePath(weekId) {
  return path.join(CACHE_DIR, `${weekId}.json`);
}

/**
 * Ensure the cache directory exists.
 */
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Load cached data for a given week.
 * 
 * @param {string} weekId - Week identifier (e.g., "2024-49")
 * @returns {Object|null} Cached data or null if not found/invalid
 */
function loadCache(weekId) {
  const cachePath = getCachePath(weekId);
  
  if (!fs.existsSync(cachePath)) {
    console.log(`Cache miss: ${weekId} (file not found)`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(cachePath, 'utf8');
    const data = JSON.parse(content);
    console.log(`Cache loaded: ${weekId}`);
    return data;
  } catch (error) {
    console.error(`Cache read error for ${weekId}:`, error.message);
    return null;
  }
}

/**
 * Save data to cache with timestamp and expiry.
 * 
 * @param {string} weekId - Week identifier (e.g., "2024-49")
 * @param {Object} data - Data to cache
 */
function saveCache(weekId, data) {
  ensureCacheDir();
  
  const cachePath = getCachePath(weekId);
  const now = new Date();
  const expires = new Date(now.getTime() + CACHE_TTL_MS);
  
  const cacheData = {
    ...data,
    _cache: {
      timestamp: now.toISOString(),
      expires: expires.toISOString()
    }
  };
  
  try {
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    console.log(`Cache saved: ${weekId} (expires ${expires.toISOString()})`);
  } catch (error) {
    console.error(`Cache write error for ${weekId}:`, error.message);
  }
}

/**
 * Check if cached data is still valid (not expired).
 * 
 * @param {Object|null} cachedData - Cached data with _cache metadata
 * @returns {boolean} True if cache is valid, false otherwise
 */
function isCacheValid(cachedData) {
  if (!cachedData) {
    return false;
  }
  
  if (!cachedData._cache || !cachedData._cache.expires) {
    return false;
  }
  
  const expiresAt = new Date(cachedData._cache.expires);
  const now = new Date();
  
  return now < expiresAt;
}

/**
 * Clear cache for a specific week or all cache files.
 * 
 * @param {string} [weekId] - Week identifier, or undefined to clear all
 */
function clearCache(weekId) {
  if (weekId) {
    const cachePath = getCachePath(weekId);
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
      console.log(`Cache cleared: ${weekId}`);
    }
  } else {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      });
      console.log(`Cache cleared: all files (${files.length})`);
    }
  }
}

/**
 * Get cached data if valid, otherwise return null.
 * This is a convenience function combining loadCache and isCacheValid.
 * 
 * @param {string} weekId - Week identifier
 * @returns {Object|null} Valid cached data or null
 */
function getValidCache(weekId) {
  const cached = loadCache(weekId);
  
  if (cached && isCacheValid(cached)) {
    console.log(`Cache hit: ${weekId}`);
    return cached;
  }
  
  if (cached) {
    console.log(`Cache expired: ${weekId}`);
  }
  
  return null;
}

module.exports = {
  CACHE_TTL_MS,
  CACHE_DIR,
  getCachePath,
  loadCache,
  saveCache,
  isCacheValid,
  clearCache,
  getValidCache
};
