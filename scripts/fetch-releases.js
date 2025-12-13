/**
 * Fetch OTT Releases Script
 * 
 * This script calls the Perplexity API to fetch current week's OTT releases
 * for multiple countries and generates JSON data files for the static site.
 * 
 * Supports: US and India with country-specific platforms
 * 
 * Usage:
 *   PERPLEXITY_API_KEY=your_key node scripts/fetch-releases.js
 * 
 * Or create a .env file with PERPLEXITY_API_KEY=your_key
 * 
 * @module scripts/fetch-releases
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Load .env file if it exists (for local development)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([^#=]+)\s*=\s*(.+)\s*$/);
        if (match && !process.env[match[1]]) {
            process.env[match[1].trim()] = match[2].trim();
        }
    });
}

// Configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const MODEL = 'sonar-pro'; // Use pro model for better search results

// ============================================================================
// MOVIE RELEASES CONFIGURATION - Theatrical Distribution Categories
// ============================================================================

/**
 * US Distribution Categories
 * Wide Release: 1000+ theaters nationwide
 * Limited Release: <1000 theaters, major cities
 */
const US_CATEGORIES = [
  {
    category_id: 'wide-release',
    category_name: 'Wide Release',
    description: '1000+ theaters nationwide'
  },
  {
    category_id: 'limited-release',
    category_name: 'Limited Release',
    description: 'Select cities, <1000 theaters'
  }
];

/**
 * India Distribution Categories
 * Organized by film industry/language
 */
const INDIA_CATEGORIES = [
  {
    category_id: 'bollywood-hindi',
    category_name: 'Bollywood (Hindi)',
    description: 'Hindi-language films from Mumbai'
  },
  {
    category_id: 'regional-telugu',
    category_name: 'Regional (Telugu)',
    description: 'Tollywood - Telugu cinema'
  },
  {
    category_id: 'regional-tamil',
    category_name: 'Regional (Tamil)',
    description: 'Kollywood - Tamil cinema'
  },
  {
    category_id: 'regional-other',
    category_name: 'Regional (Other)',
    description: 'Malayalam, Kannada, Bengali, Marathi, etc.'
  }
];

/**
 * Country Configuration with Theatrical Distribution
 */
const COUNTRY_CONFIG = {
  us: {
    id: 'us',
    name: 'United States',
    flag: '🇺🇸',
    categories: US_CATEGORIES,
    timezone: 'America/New_York',
    rating_system: 'MPAA' // G, PG, PG-13, R, NC-17
  },
  india: {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    categories: INDIA_CATEGORIES,
    timezone: 'Asia/Kolkata',
    rating_system: 'CBFC' // U, U/A, A, S
  }
};

// Legacy COUNTRIES object for backward compatibility (OTT platforms)
// TODO: Remove after full migration to theatrical releases
const COUNTRIES = {
    us: {
        id: 'us',
        name: 'United States',
        flag: '🇺🇸',
        platforms: [
            // Major/Tier 1
            'Netflix',
            'Prime Video',
            'Disney+',
            'Hulu',
            'Apple TV+',
            'Max',
            'Paramount+',
            // Tier 2/Emerging
            'Peacock',
            'Discovery+',
            'Starz',
            'Mubi',
            'Criterion Channel',
            'Tubi',
            'Pluto TV'
        ]
    },
    india: {
        id: 'india',
        name: 'India',
        flag: '🇮🇳',
        platforms: [
            // Major platforms
            'Netflix',
            'Prime Video',
            'Disney+ Hotstar',
            'SonyLIV',
            'ZEE5',
            'JioCinema',
            // Regional/Niche platforms
            'Aha',
            'Hoichoi',
            'SunNXT',
            'ManoramaMAX',
            'ETV Win',
            'Planet Marathi',
            'Chaupal'
        ]
    }
};

/**
 * Get the API key from environment variable
 * @returns {string} The API key
 * @throws {Error} If API key is not set
 */
function getApiKey() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error('PERPLEXITY_API_KEY environment variable is not set');
    }
    return apiKey;
}

/**
 * Calculate ISO week number for a date
 * @param {Date} date - The date to calculate week number for
 * @returns {number} ISO week number (1-53)
 */
function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get the date range for the current week (Monday to Sunday)
 * @param {Date} date - Any date within the week
 * @returns {{start: Date, end: Date}} Week start (Monday) and end (Sunday)
 */
function getWeekDateRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { start: monday, end: sunday };
}

/**
 * Format a date range as a human-readable string
 * @param {Date} start - Start date
 * @param {Date} end - End date  
 * @returns {string} Formatted date range (e.g., "December 2-8, 2024")
 */
function formatDateRange(start, end) {
    const options = { month: 'long', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    const endDay = end.getDate();
    const year = end.getFullYear();
    
    if (start.getMonth() === end.getMonth()) {
        return `${startStr}-${endDay}, ${year}`;
    }
    
    const endStr = end.toLocaleDateString('en-US', options);
    return `${startStr} - ${endStr}, ${year}`;
}

// ============================================================================
// Prompt Generation - Theatrical Movie Releases
// ============================================================================

/**
 * Build prompt for theatrical movie releases (not OTT/streaming)
 * Feature 17: Perplexity API prompt for current week theatrical releases
 * 
 * @param {string} weekRange - Date range string (e.g., "January 13-19, 2025")
 * @param {object} country - Country config object with id, categories, etc.
 * @returns {string} - Formatted prompt for Perplexity API
 */
function updatePromptForMovies(weekRange, country) {
    if (country.id === 'india') {
        return `You are a senior film industry analyst tracking theatrical movie releases in India. You have comprehensive knowledge of Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood, and all regional film industries.

CRITICAL: Search exhaustively across ALL Indian film industry sources, trade publications, and movie databases. This is a comprehensive theatrical release tracking system - missing releases is NOT acceptable.

Task: Generate a COMPLETE and COMPREHENSIVE report of ALL verified theatrical movie releases for ${weekRange}.

Search Strategy - Check ALL of these sources:
- BoxOfficeIndia.com and trade reports
- Sacnilk.com theatrical calendar
- IMDb India theatrical releases
- BookMyShow and PVR release schedules
- Regional film industry news portals
- Official studio announcements
- Film trade magazines (FilmFare, BoxOffice, etc.)

Scope & Coverage:
1. Languages - Search for theatrical releases in:
   - Bollywood: Hindi films from Mumbai
   - Tollywood: Telugu films from Hyderabad  
   - Kollywood: Tamil films from Chennai
   - Mollywood: Malayalam films from Kerala
   - Sandalwood: Kannada films from Bangalore
   - Regional: Bengali, Marathi, Punjabi, Gujarati, Bhojpuri, Assamese, Odia

2. Include ONLY theatrical releases (cinema hall releases)
   - Do NOT include OTT/streaming releases
   - Do NOT include direct-to-digital releases

3. For EACH release, provide:
   - Title (original name)
   - Release date (format: YYYY-MM-DD) 
   - Industry/Language (e.g., "Bollywood", "Tollywood", "Kollywood")
   - Genre (Action, Drama, Comedy, Thriller, Romance, etc.)
   - Cast (top 3-4 lead actors)
   - Director
   - Production house/studio
   - Multi-language info (if releasing in multiple languages simultaneously, list all)
   - Brief description (1-2 sentences including plot summary or notable info)

Requirements:
- Search EXHAUSTIVELY - include ALL confirmed releases (big and small)
- Only list CONFIRMED theatrical releases with specific dates in this week
- Mark tentative dates as "TBA"
- For Pan-Indian films, list ALL release languages
- Include big-budget blockbusters AND small/regional releases
- Include both wide releases and limited releases
- Note if film is a sequel, remake, or franchise film

Return ONLY valid JSON with this exact structure:
{
  "week_number": "YYYY-WW",
  "week_start": "YYYY-MM-DD",
  "week_end": "YYYY-MM-DD",
  "country": "india",
  "categories": [
    {
      "category_id": "bollywood-hindi",
      "category_name": "Bollywood (Hindi)",
      "movies": [
        {
          "title": "Movie Title",
          "release_date": "YYYY-MM-DD",
          "genre": "Genre",
          "language": "Hindi",
          "additional_languages": ["Telugu", "Tamil"],
          "cast": ["Actor 1", "Actor 2", "Actor 3"],
          "director": "Director Name",
          "production": "Production House",
          "description": "Brief description."
        }
      ]
    },
    {
      "category_id": "regional-telugu",
      "category_name": "Regional (Telugu)",
      "movies": []
    },
    {
      "category_id": "regional-tamil",
      "category_name": "Regional (Tamil)",
      "movies": []
    },
    {
      "category_id": "regional-other",
      "category_name": "Regional (Other)",
      "movies": []
    }
  ]
}

If a category has no releases, return empty movies array. Do not omit categories.`;
    }

    // Prompt for US theatrical releases
    return `You are a senior box office analyst tracking theatrical movie releases in the United States. You have comprehensive knowledge of Hollywood studio releases, independent films, and limited releases.

Task: Generate a comprehensive report of verified theatrical movie releases for **${weekRange}**.

Scope & Coverage:
1. Distribution Types:
   - **Wide Release:** Opening in 1,000+ theaters nationwide
   - **Limited Release:** Opening in fewer than 1,000 theaters (NY/LA platform releases, specialty releases)
   - **Platform Release:** Opening in select cities (typically 10-50 theaters)

2. Include ONLY theatrical releases (cinema releases)
   - Do NOT include streaming/VOD releases
   - Do NOT include direct-to-video releases

3. For EACH release, provide:
   - Title
   - Release date (format: YYYY-MM-DD)
   - Distribution type (Wide, Limited, or Platform)
   - Studio/Distributor
   - Genre (Action, Drama, Comedy, Thriller, Horror, Sci-Fi, etc.)
   - MPAA Rating (G, PG, PG-13, R, NC-17, or NR if not rated)
   - Cast (top 3-4 lead actors)
   - Director
   - Theater count estimate (e.g., "3,500+ theaters", "500-1,000 theaters", "50-100 theaters")
   - Brief description (1-2 sentences including plot summary, franchise info, or notable details)

Requirements:
- Only list CONFIRMED theatrical releases with specific dates
- Mark tentative dates as "TBA"
- Distinguish between wide releases (major studio releases) and limited/platform releases
- Include both blockbuster releases and arthouse/indie films
- Note if film is a sequel, reboot, or franchise film

Return ONLY valid JSON with this exact structure:
{
  "week_number": "YYYY-WW",
  "week_start": "YYYY-MM-DD",
  "week_end": "YYYY-MM-DD",
  "country": "us",
  "categories": [
    {
      "category_id": "wide-release",
      "category_name": "Wide Release",
      "movies": [
        {
          "title": "Movie Title",
          "release_date": "YYYY-MM-DD",
          "genre": "Genre",
          "rating": "PG-13",
          "studio": "Studio Name",
          "cast": ["Actor 1", "Actor 2", "Actor 3"],
          "director": "Director Name",
          "theater_count": "3,500+ theaters",
          "description": "Brief description."
        }
      ]
    },
    {
      "category_id": "limited-release",
      "category_name": "Limited Release",
      "movies": []
    }
  ]
}

If a category has no releases, return empty movies array. Do not omit categories.`;
}

// ============================================================================
// MERGE AND DELTA TRACKING UTILITIES
// ============================================================================

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Normalize movie title for comparison (lowercase, remove special chars)
 * @param {string} title - Movie title
 * @returns {string} Normalized title
 */
function normalizeTitle(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Load existing week data from file
 * @param {string} country - Country ID
 * @param {string} weekType - Week type
 * @returns {Object|null} Existing data or null
 */
function loadExistingData(country, weekType) {
    const dataPath = path.join(__dirname, '..', 'data', country, `${weekType}.json`);
    try {
        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            console.log(`📂 Loaded existing data: ${countMovies(data)} movies`);
            return data;
        }
    } catch (error) {
        console.warn(`Warning: Could not load existing data: ${error.message}`);
    }
    return null;
}

/**
 * Count total movies across all categories
 * @param {Object} weekData - Week data object
 * @returns {number} Total movie count
 */
function countMovies(weekData) {
    if (!weekData?.categories) return 0;
    return weekData.categories.reduce((sum, cat) => sum + (cat.movies?.length || 0), 0);
}

/**
 * Merge new movies into existing data (append-only, dedupe by title)
 * @param {Object} existing - Existing week data
 * @param {Object} newData - New data from API
 * @returns {Object} Merged data with first_seen timestamps
 */
function mergeMovieData(existing, newData) {
    const now = new Date().toISOString();
    
    // Create a map of existing movies by normalized title for quick lookup
    const existingMoviesMap = new Map();
    if (existing?.categories) {
        existing.categories.forEach(cat => {
            cat.movies?.forEach(movie => {
                const key = `${cat.id}:${normalizeTitle(movie.title)}`;
                existingMoviesMap.set(key, movie);
            });
        });
    }
    
    // Start with the new data structure
    const merged = {
        week_number: newData.week_number,
        week_start: newData.week_start,
        week_end: newData.week_end,
        country: newData.country,
        last_updated: now,
        fetch_count: (existing?.fetch_count || 0) + 1,
        categories: []
    };
    
    // Preserve fetch history
    merged.fetch_history = existing?.fetch_history || [];
    merged.fetch_history.push({
        timestamp: now,
        new_movies_count: 0 // Will be updated
    });
    
    // Keep only last 10 fetches in history
    if (merged.fetch_history.length > 10) {
        merged.fetch_history = merged.fetch_history.slice(-10);
    }
    
    let totalNewMovies = 0;
    
    // Process each category
    newData.categories.forEach(newCat => {
        const mergedCat = {
            id: newCat.id,
            name: newCat.name,
            movies: []
        };
        
        // Get existing movies for this category
        const existingCat = existing?.categories?.find(c => c.id === newCat.id);
        const existingCatMovies = new Map();
        existingCat?.movies?.forEach(m => {
            existingCatMovies.set(normalizeTitle(m.title), m);
        });
        
        // Add all existing movies first (preserve first_seen)
        existingCatMovies.forEach((movie, normalizedTitle) => {
            mergedCat.movies.push(movie);
        });
        
        // Add new movies that don't exist yet
        newCat.movies?.forEach(newMovie => {
            const normalizedTitle = normalizeTitle(newMovie.title);
            if (!existingCatMovies.has(normalizedTitle)) {
                // This is a new movie!
                const movieWithMeta = {
                    ...newMovie,
                    first_seen: now,
                    is_new: true
                };
                mergedCat.movies.push(movieWithMeta);
                totalNewMovies++;
                console.log(`   🆕 New movie: ${newMovie.title}`);
            }
        });
        
        merged.categories.push(mergedCat);
    });
    
    // Update fetch history with new movie count
    merged.fetch_history[merged.fetch_history.length - 1].new_movies_count = totalNewMovies;
    
    // Update is_new flag based on age (48 hours)
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    merged.categories.forEach(cat => {
        cat.movies?.forEach(movie => {
            if (movie.first_seen) {
                movie.is_new = movie.first_seen > cutoffTime;
            }
        });
    });
    
    console.log(`📊 Merged: ${totalNewMovies} new movies added`);
    
    return merged;
}

/**
 * Merge movies from multiple API responses (dedupe by title)
 * @param {Array<Object>} responses - Array of parsed API responses
 * @returns {Object} Single merged response
 */
function mergeMultipleResponses(responses) {
    if (responses.length === 0) return null;
    if (responses.length === 1) return responses[0];
    
    // Use first response as base
    const merged = { ...responses[0] };
    
    // Create a map to track unique movies per category
    const categoryMovies = new Map();
    
    responses.forEach(response => {
        response.categories?.forEach(cat => {
            if (!categoryMovies.has(cat.id)) {
                categoryMovies.set(cat.id, {
                    id: cat.id,
                    name: cat.name,
                    movies: new Map()
                });
            }
            
            const catData = categoryMovies.get(cat.id);
            cat.movies?.forEach(movie => {
                const key = normalizeTitle(movie.title);
                if (!catData.movies.has(key)) {
                    catData.movies.set(key, movie);
                }
            });
        });
    });
    
    // Convert maps back to arrays
    merged.categories = Array.from(categoryMovies.values()).map(cat => ({
        id: cat.id,
        name: cat.name,
        movies: Array.from(cat.movies.values())
    }));
    
    return merged;
}

/**
 * Fetch week data for theatrical movie releases
 * Feature 18: Fetch current week theatrical releases from Perplexity API
 * 
 * Enhanced with:
 * - Multiple API calls (3 attempts) to get more complete data
 * - Merge with existing data (append-only)
 * - Track first_seen timestamps for NEW badges
 * 
 * @param {string} country - Country ID ('us' or 'india')
 * @param {string} weekType - Week type ('current-week', 'last-week', 'next-week')
 * @returns {Promise<object>} - Parsed and validated week data
 */
async function fetchWeekData(country, weekType = 'current-week') {
    const {getCurrentWeekInfo, getPreviousWeekInfo, getNextWeekInfo} = require('./utils/date-utils');
    const fsPromises = require('fs').promises;
    
    // Configuration for multi-fetch
    const API_CALL_ATTEMPTS = 3;       // Number of API calls to make
    const DELAY_BETWEEN_CALLS = 5000;  // 5 seconds between calls
    
    // Get week info based on weekType
    let weekInfo;
    if (weekType === 'current-week') {
        weekInfo = getCurrentWeekInfo();
    } else if (weekType === 'last-week') {
        weekInfo = getPreviousWeekInfo();
    } else if (weekType === 'next-week') {
        weekInfo = getNextWeekInfo();
    } else {
        throw new Error(`Invalid weekType: ${weekType}. Must be 'current-week', 'last-week', or 'next-week'`);
    }
    
    // Get country config
    const countryConfig = COUNTRY_CONFIG[country];
    if (!countryConfig) {
        throw new Error(`Invalid country: ${country}. Must be 'us' or 'india'`);
    }
    
    // Use the pre-formatted week range from date-utils
    const weekRange = weekInfo.week_range;
    
    console.log(`Fetching ${weekType} theatrical releases for ${countryConfig.name}...`);
    console.log(`Week: ${weekInfo.week_number} (${weekRange})`);
    
    try {
        // 1. Load existing data (for merge)
        const existingData = loadExistingData(country, weekType);
        
        // 2. Build prompt
        const prompt = updatePromptForMovies(weekRange, countryConfig);
        
        // 3. Call Perplexity API multiple times and collect responses
        console.log(`Calling Perplexity API (${API_CALL_ATTEMPTS} attempts for better coverage)...`);
        const apiResponses = [];
        
        for (let attempt = 1; attempt <= API_CALL_ATTEMPTS; attempt++) {
            try {
                console.log(`   API call ${attempt}/${API_CALL_ATTEMPTS}...`);
                const apiResponse = await callPerplexityAPI(prompt, countryConfig);
                const parsedData = parseResponse(apiResponse);
                
                // Normalize category structure
                if (parsedData.categories) {
                    parsedData.categories = parsedData.categories.map(cat => ({
                        id: cat.id || cat.category_id,
                        name: cat.name || cat.category_name,
                        movies: Array.isArray(cat.movies) ? cat.movies : []
                    }));
                }
                
                const movieCount = countMovies({ categories: parsedData.categories });
                console.log(`   ✓ Attempt ${attempt}: Found ${movieCount} movies`);
                apiResponses.push(parsedData);
                
                // Wait between calls (except for last one)
                if (attempt < API_CALL_ATTEMPTS) {
                    console.log(`   Waiting ${DELAY_BETWEEN_CALLS/1000}s before next call...`);
                    await sleep(DELAY_BETWEEN_CALLS);
                }
            } catch (error) {
                console.warn(`   ⚠ Attempt ${attempt} failed: ${error.message}`);
            }
        }
        
        if (apiResponses.length === 0) {
            throw new Error('All API calls failed');
        }
        
        // 4. Merge all API responses together (dedupe by title)
        console.log('Merging responses from multiple API calls...');
        const mergedApiData = mergeMultipleResponses(apiResponses);
        console.log(`📊 Total unique movies from API: ${countMovies({ categories: mergedApiData.categories })}`);
        
        // 5. Create base week data structure
        const newWeekData = {
            week_number: weekInfo.week_id,  // Use "2025-50" format
            week_start: weekInfo.week_start,
            week_end: weekInfo.week_end,
            country: country,
            categories: mergedApiData.categories || []
        };
        
        // 6. Merge with existing data (append-only, preserve first_seen)
        let finalWeekData;
        if (existingData) {
            console.log('Merging with existing data (append-only)...');
            finalWeekData = mergeMovieData(existingData, newWeekData);
        } else {
            // No existing data - mark all as new
            const now = new Date().toISOString();
            finalWeekData = {
                ...newWeekData,
                last_updated: now,
                fetch_count: 1,
                fetch_history: [{
                    timestamp: now,
                    new_movies_count: countMovies(newWeekData)
                }]
            };
            
            // Add first_seen to all movies
            finalWeekData.categories.forEach(cat => {
                cat.movies?.forEach(movie => {
                    movie.first_seen = now;
                    movie.is_new = true;
                });
            });
        }
        
        // 7. Validate
        console.log('Validating data...');
        if (!finalWeekData.week_number || !finalWeekData.categories) {
            throw new Error('Week data missing required fields: week_number or categories');
        }
        
        const totalMovies = countMovies(finalWeekData);
        console.log(`✅ Data validated: ${totalMovies} total movies`);
        
        // 8. Save to data/{country}/{weekType}.json
        const dataDir = path.join(__dirname, '..', 'data', country);
        await fsPromises.mkdir(dataDir, {recursive: true});
        
        const dataFilePath = path.join(dataDir, `${weekType}.json`);
        await fsPromises.writeFile(dataFilePath, JSON.stringify(finalWeekData, null, 2), 'utf8');
        
        console.log(`✅ Data saved to ${dataFilePath}`);
        
        // 9. Return final merged data
        return finalWeekData;
        
    } catch (error) {
        console.error(`Error fetching ${weekType} data for ${country}:`, error.message);
        throw error;
    }
}

// ============================================================================
// Prompt Generation - OTT Releases (Legacy/Original Function)
// ============================================================================

/**
 * Build the prompt for Perplexity API
 * @param {string} weekRange - The week date range string
 * @param {Object} country - Country configuration object
 * @returns {string} The formatted prompt
 */
function buildPrompt(weekRange, country) {
    // Enhanced prompt for India with regional coverage
    if (country.id === 'india') {
        return `You are a senior entertainment data analyst and OTT tracking specialist for the Indian market. You have deep knowledge of regional industries (Tollywood, Bollywood, Kollywood, Mollywood, Sandalwood) and niche regional streaming platforms.

Task: Generate a comprehensive report of verified OTT releases across all Indian languages for ${weekRange}.

Scope & Coverage:
1. Languages - Search explicitly for content in:
   - Major: Hindi, Telugu, Tamil, Malayalam, Kannada
   - Regional: Bengali, Marathi, Punjabi, Gujarati, Bhojpuri

2. Platforms to cover: ${country.platforms.join(', ')}

3. For EACH release, provide:
   - Title (original name)
   - Release date (format: YYYY-MM-DD, or mark as "TBA" if unconfirmed)
   - Type (movie or series)
   - Industry/Language (e.g., "Tollywood/Telugu", "Bollywood/Hindi", "Kollywood/Tamil")
   - Genre
   - Cast (top 3-4 actors)
   - Dubbing details (if multi-language audio available, list all: e.g., "Hindi, Telugu, Tamil, Malayalam")
   - Release type (Direct-to-OTT or Post-Theatrical)
   - Brief description (1-2 sentences)

Requirements:
- Scan for BOTH "Direct-to-OTT" and "Post-Theatrical" digital premieres
- Do NOT list rumored dates as confirmed - mark as "TBA" if uncertain
- For South Indian/Pan-Indian films, explicitly state if dubbed versions available
- Include ALL new releases, not just blockbusters
- If a major language has no releases, note: "No confirmed [Language] releases this period"

Return ONLY valid JSON with this exact structure:
{
  "platforms": [
    {
      "id": "platform-id",
      "name": "Platform Name",
      "releases": [
        {
          "title": "Title Name",
          "release_date": "YYYY-MM-DD",
          "type": "movie|series",
          "industry": "Bollywood/Hindi",
          "genre": "Genre",
          "language": "Hindi",
          "actors": ["Actor 1", "Actor 2", "Actor 3"],
          "dubbing": "Hindi, Telugu, Tamil",
          "release_type": "Direct-to-OTT",
          "description": "Brief description."
        }
      ]
    }
  ]
}

Platform ID mapping (use lowercase with hyphens):
netflix, prime-video, disney-plus-hotstar, sonyliv, zee5, jiocinema, aha, hoichoi, sunnxt, manoramamax, etv-win, planet-marathi, chaupal`;
    }
    
    // Comprehensive prompt for US market
    return `You are a senior entertainment data analyst and OTT tracking specialist for the **United States market**. You have deep knowledge of the US entertainment industry (Hollywood, streaming platforms, theatrical releases) and comprehensive coverage of all major and emerging streaming services. Your priority is accuracy, comprehensive coverage, and distinguishing between direct-to-OTT originals, theatrical-to-streaming transitions, and catalog additions.

## Task:
Generate a comprehensive report of verified OTT releases across all US streaming platforms for the period: **${weekRange}**.

## Scope & Constraints:

**Platforms:** Cover all major and emerging platforms:
- **Major/Tier 1:** ${country.platforms.slice(0, 7).join(', ')}
- **Tier 2/Emerging:** ${country.platforms.slice(7).join(', ')}

**Content Categories:**
- Hollywood mainstream releases (wide theatrical appeal)
- Independent and arthouse films
- International content with English subtitles/dubbing available in US market
- Documentaries and docuseries
- Reality, competition, and unscripted content
- Animation (theatrical and television)
- Standup comedy and live events

**Verification:** Do not list "rumored" dates as confirmed. If a date is tentative, mark it as "TBA" or "Rumored." Only include releases with official platform confirmation.

**Release Type Details:** For theatrical-to-streaming releases, explicitly state the original theatrical release date and windowing information.

**Audio/Accessibility:** For international or specialized content, note available audio tracks and subtitle options.

## Output Requirements:

For EACH release, provide:
- Title
- Release date (format: YYYY-MM-DD, or "TBA" if unconfirmed)
- Type (movie or series)
- Genre
- Language (primary language)
- Content category (mainstream, indie, international, documentary, animation, comedy, reality)
- Release type (Direct-to-OTT, Post-Theatrical, or Catalog Addition)
- Actors (top 3-4 main cast members)
- Description (1-2 sentences including notable info like award nominations, franchise info)
- Theatrical info (if applicable: original release date, window duration)

## Process:
1. First, scan for "Direct-to-OTT Originals" (content created specifically for streaming)
2. Second, scan for "Post-Theatrical Digital Premieres" (theatrical releases transitioning to streaming)
3. Third, scan for notable "Catalog/Archive Additions" (significant library expansions)

Return ONLY valid JSON with this exact structure:
{
  "platforms": [
    {
      "id": "platform-id",
      "name": "Platform Name",
      "releases": [
        {
          "title": "Title Name",
          "release_date": "YYYY-MM-DD",
          "type": "movie|series",
          "genre": "Genre",
          "language": "English",
          "content_category": "mainstream|indie|international|documentary|animation|comedy|reality",
          "release_type": "Direct-to-OTT|Post-Theatrical|Catalog Addition",
          "actors": ["Actor 1", "Actor 2", "Actor 3"],
          "description": "Brief description including notable info.",
          "theatrical_info": "Optional: Original release date and window info"
        }
      ]
    }
  ]
}

Platform ID mapping (use lowercase with hyphens):
netflix, prime-video, disney-plus, hulu, apple-tv-plus, max, paramount-plus, peacock, discovery-plus, starz, mubi, criterion-channel, tubi, pluto-tv

Important:
- Include ALL confirmed new releases, not just blockbusters
- If a platform has no new releases this period, include it with an empty releases array
- For multi-platform simultaneous releases, include in each platform's list
- Flag exclusive/platform-only content in the description`;
}

/**
 * Call the Perplexity API
 * @param {string} prompt - The prompt to send
 * @param {Object} country - Country configuration
 * @returns {Promise<Object>} The API response
 */
async function callPerplexityAPI(prompt, country) {
    const apiKey = getApiKey();
    
    // Enhanced system message for theatrical releases
    const systemMessage = country.id === 'india'
        ? 'You are a senior box office analyst and theatrical release tracker specializing in Indian cinema (Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood). You have comprehensive knowledge of theatrical movie releases across all Indian film industries. Your priority is accuracy, comprehensive coverage of all theatrical releases (NOT OTT/streaming), and multi-language coverage. Always respond with valid JSON only, no markdown formatting or code blocks.'
        : 'You are a senior box office analyst and theatrical release tracker for the United States market. You have comprehensive knowledge of Hollywood studio releases, independent films, and limited theatrical releases. Your priority is accuracy, comprehensive coverage of all theatrical releases (NOT streaming/VOD), and distinguishing between wide and limited releases. Always respond with valid JSON only, no markdown formatting or code blocks.';
    
    const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemMessage
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            web_search_options: {
                search_context_size: 'high'
            }
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Perplexity API error (${response.status}): ${error}`);
    }
    
    return response.json();
}

/**
 * Parse the API response and extract release data
 * @param {Object} apiResponse - The raw API response
 * @returns {Object} Parsed release data
 */
function parseResponse(apiResponse) {
    const content = apiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
        throw new Error('No content in API response');
    }
    
    // Try to parse as JSON
    try {
        return JSON.parse(content);
    } catch (e) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }
        
        // Try to find JSON object in content
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            return JSON.parse(objectMatch[0]);
        }
        
        throw new Error('Could not parse API response as JSON');
    }
}

/**
 * Generate the complete week data object
 * @param {Object} releaseData - Parsed release data from API
 * @param {Object} country - Country configuration
 * @param {Date} [date] - Optional date (defaults to now)
 * @returns {Object} Complete week data object
 */
function generateWeekData(releaseData, country, date) {
    const now = date || new Date();
    const { start, end } = getWeekDateRange(now);
    const weekNumber = getISOWeekNumber(now);
    const year = now.getFullYear();
    
    return {
        week_number: weekNumber,
        year: year,
        week_id: `${year}-${String(weekNumber).padStart(2, '0')}`,
        week_start: start.toISOString().split('T')[0],
        week_end: end.toISOString().split('T')[0],
        week_range: formatDateRange(start, end),
        week_title: `Week ${weekNumber}: ${formatDateRange(start, end)}`,
        country: {
            id: country.id,
            name: country.name,
            flag: country.flag
        },
        generated_at: now.toISOString(),
        platforms: releaseData.platforms || []
    };
}

/**
 * Save data to JSON file
 * @param {Object} data - Data to save
 * @param {string} filePath - Target file path
 */
function saveToFile(data, filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    console.log(`✅ Saved to ${filePath}`);
}

/**
 * Update archive index for a country
 * @param {Object} weekData - Week data to add to index
 * @param {string} countryId - Country ID
 */
function updateArchiveIndex(weekData, countryId) {
    // Only update archive index if we have the required fields
    if (!weekData.week_number) {
        console.log('Skipping archive index update (no week_number)');
        return;
    }
    
    const indexPath = path.join(__dirname, '..', `data/${countryId}/archive-index.json`);
    let index = { archives: [] };
    
    if (fs.existsSync(indexPath)) {
        try {
            index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        } catch (e) {
            console.warn(`Warning: Could not parse existing archive index for ${countryId}`);
        }
    }
    
    // Create week_id from week_number if not present
    const weekId = weekData.week_id || weekData.week_number;
    
    // Create week title and range from dates if not present
    const weekTitle = weekData.week_title || `Week ${weekData.week_number.split('-')[1]}`;
    const weekRange = weekData.week_range || `${weekData.week_start} - ${weekData.week_end}`;
    
    // Check if this week already exists
    const existingIndex = index.archives.findIndex(a => a.weekId === weekId);
    
    const archiveEntry = {
        weekId: weekId,
        weekTitle: weekTitle,
        weekRange: weekRange,
        generatedAt: weekData.generated_at || new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
        index.archives[existingIndex] = archiveEntry;
    } else {
        index.archives.unshift(archiveEntry);
    }
    
    // Sort by week ID descending (handle both string and undefined)
    index.archives.sort((a, b) => {
        const aId = a.weekId || '';
        const bId = b.weekId || '';
        return bId.localeCompare(aId);
    });
    
    // Keep only last 52 weeks
    index.archives = index.archives.slice(0, 52);
    
    saveToFile(index, `data/${countryId}/archive-index.json`);
}

/**
 * Fetch releases for a single country
 * @param {Object} country - Country configuration
 * @param {string} weekRange - Week date range string
 * @returns {Promise<Object>} Week data for the country
 */
async function fetchCountryReleases(country, weekRange) {
    console.log(`\n${country.flag} Fetching releases for ${country.name}...`);
    
    const prompt = buildPrompt(weekRange, country);
    const apiResponse = await callPerplexityAPI(prompt, country);
    const releaseData = parseResponse(apiResponse);
    const weekData = generateWeekData(releaseData, country);
    
    // Log summary
    const totalReleases = weekData.platforms.reduce((sum, p) => sum + (p.releases?.length || 0), 0);
    console.log(`   Found ${totalReleases} releases across ${weekData.platforms.length} platforms`);
    
    return weekData;
}

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        country: null,
        week: 'current-week'
    };
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--country' && args[i + 1]) {
            options.country = args[i + 1];
            i++;
        } else if (args[i] === '--week' && args[i + 1]) {
            options.week = args[i + 1];
            i++;
        }
    }
    
    return options;
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🎬 Theatrical Movie Releases Fetcher');
        console.log('====================================\n');
        
        // Parse command line arguments
        const options = parseArgs();
        
        // Determine which countries to fetch
        const countriesToFetch = options.country 
            ? { [options.country]: COUNTRY_CONFIG[options.country] }
            : COUNTRY_CONFIG;
        
        if (!countriesToFetch || Object.keys(countriesToFetch).length === 0) {
            throw new Error(`Invalid country: ${options.country}. Must be 'us' or 'india'`);
        }
        
        console.log(`📅 Week Type: ${options.week}`);
        console.log(`🌍 Countries: ${Object.keys(countriesToFetch).join(', ')}\n`);
        
        // Fetch releases for each country
        for (const [countryId, countryConfig] of Object.entries(countriesToFetch)) {
            try {
                console.log(`\n${countryConfig.flag} Fetching ${options.week} for ${countryConfig.name}...`);
                
                const weekData = await fetchWeekData(countryId, options.week);
                
                // Save to appropriate file
                const outputFile = `data/${countryId}/${options.week}.json`;
                saveToFile(weekData, outputFile);
                console.log(`✅ Saved to ${outputFile}`);
                
                // If current week, also archive it
                if (options.week === 'current-week' && weekData.week_number) {
                    const archiveFile = `data/${countryId}/archive/${weekData.week_number}.json`;
                    saveToFile(weekData, archiveFile);
                    console.log(`📦 Archived to ${archiveFile}`);
                    
                    // Update archive index
                    updateArchiveIndex(weekData, countryId);
                }
                
            } catch (error) {
                console.error(`❌ Error fetching ${countryConfig.name}:`, error.message);
                if (error.stack) {
                    console.error(error.stack);
                }
            }
            
            // Add a small delay between API calls to be respectful
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

// Export for testing
module.exports = {
    COUNTRIES,
    COUNTRY_CONFIG,
    getISOWeekNumber,
    getWeekDateRange,
    formatDateRange,
    updatePromptForMovies, // Feature 17: Theatrical releases prompt
    fetchWeekData, // Feature 18: Fetch week data for theatrical releases
    buildPrompt,
    callPerplexityAPI,
    parseResponse,
    generateWeekData
};
