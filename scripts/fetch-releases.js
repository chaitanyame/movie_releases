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
const MODEL = 'sonar';

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
    
    // Enhanced system message for both countries
    const systemMessage = country.id === 'india'
        ? 'You are a senior entertainment data analyst and OTT tracking specialist with expertise in Indian regional cinema (Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood). You have deep knowledge of all major and regional streaming platforms in India. Your priority is accuracy, comprehensive multi-language coverage, and distinguishing between original and dubbed releases. Always respond with valid JSON only, no markdown formatting or code blocks.'
        : 'You are a senior entertainment data analyst and OTT tracking specialist for the United States market. You have deep knowledge of Hollywood, streaming platforms, and theatrical release windows. Your priority is accuracy, comprehensive coverage of all platforms (major and emerging), and distinguishing between direct-to-OTT originals, post-theatrical releases, and catalog additions. Always respond with valid JSON only, no markdown formatting or code blocks.';
    
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
    const indexPath = path.join(__dirname, '..', `data/${countryId}/archive-index.json`);
    let index = { archives: [] };
    
    if (fs.existsSync(indexPath)) {
        try {
            index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        } catch (e) {
            console.warn(`Warning: Could not parse existing archive index for ${countryId}`);
        }
    }
    
    // Check if this week already exists
    const existingIndex = index.archives.findIndex(a => a.weekId === weekData.week_id);
    
    const archiveEntry = {
        weekId: weekData.week_id,
        weekTitle: weekData.week_title,
        weekRange: weekData.week_range,
        generatedAt: weekData.generated_at
    };
    
    if (existingIndex >= 0) {
        index.archives[existingIndex] = archiveEntry;
    } else {
        index.archives.unshift(archiveEntry);
    }
    
    // Sort by week ID descending
    index.archives.sort((a, b) => b.weekId.localeCompare(a.weekId));
    
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
 * Main function
 */
async function main() {
    try {
        console.log('🎬 OTT Weekly Releases Fetcher');
        console.log('================================\n');
        
        const now = new Date();
        const { start, end } = getWeekDateRange(now);
        const weekRange = formatDateRange(start, end);
        
        console.log(`📅 Week: ${weekRange}`);
        
        // Fetch releases for each country
        for (const [countryId, country] of Object.entries(COUNTRIES)) {
            try {
                const weekData = await fetchCountryReleases(country, weekRange);
                
                // Save current week
                saveToFile(weekData, `data/${countryId}/current-week.json`);
                
                // Archive with week ID
                saveToFile(weekData, `data/${countryId}/archive/${weekData.week_id}.json`);
                
                // Update archive index
                updateArchiveIndex(weekData, countryId);
                
            } catch (error) {
                console.error(`❌ Error fetching ${country.name}:`, error.message);
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
    getISOWeekNumber,
    getWeekDateRange,
    formatDateRange,
    buildPrompt,
    callPerplexityAPI,
    parseResponse,
    generateWeekData
};
