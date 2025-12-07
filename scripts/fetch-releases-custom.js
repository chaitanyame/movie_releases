/**
 * Fetch OTT Releases for Custom Date Range
 * 
 * This script calls the Perplexity API to fetch OTT releases
 * for a specific date range (not just the current week).
 * 
 * Environment variables:
 *   - PERPLEXITY_API_KEY: API key for Perplexity
 *   - START_DATE: Start date in YYYY-MM-DD format
 *   - END_DATE: End date in YYYY-MM-DD format
 *   - COUNTRY: Country to fetch (us, india, or both)
 *   - SAVE_AS_CURRENT: Whether to also save as current-week.json
 * 
 * Usage:
 *   START_DATE=2025-11-25 END_DATE=2025-12-01 COUNTRY=both node scripts/fetch-releases-custom.js
 * 
 * @module scripts/fetch-releases-custom
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

// Country configurations
const COUNTRIES = {
    us: {
        id: 'us',
        name: 'United States',
        flag: '🇺🇸',
        platforms: [
            'Netflix', 'Prime Video', 'Disney+', 'Hulu', 'Apple TV+',
            'Max', 'Paramount+', 'Peacock', 'Discovery+', 'Starz',
            'Mubi', 'Criterion Channel', 'Tubi', 'Pluto TV'
        ]
    },
    india: {
        id: 'india',
        name: 'India',
        flag: '🇮🇳',
        platforms: [
            'Netflix', 'Prime Video', 'Disney+ Hotstar', 'SonyLIV',
            'ZEE5', 'JioCinema', 'Aha', 'Hoichoi', 'SunNXT',
            'ManoramaMAX', 'ETV Win', 'Planet Marathi', 'Chaupal'
        ]
    }
};

/**
 * Get the API key from environment variable
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
 */
function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Format a date range as a human-readable string
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
 */
function buildPrompt(weekRange, country) {
    if (country.id === 'india') {
        return `You are a senior entertainment data analyst and OTT tracking specialist for the Indian market.

Task: Generate a comprehensive report of verified OTT releases across all Indian languages for the period: **${weekRange}**.

Platforms to cover: ${country.platforms.join(', ')}

Languages to cover: Hindi, Telugu, Tamil, Malayalam, Kannada, Bengali, Marathi, Punjabi, Gujarati, Bhojpuri

For EACH release, provide:
- Title (original name)
- Release date (format: YYYY-MM-DD)
- Type (movie or series)
- Industry/Language (e.g., "Tollywood/Telugu", "Bollywood/Hindi")
- Genre
- Cast (top 3-4 actors)
- Dubbing details (if multi-language audio available)
- Release type (Direct-to-OTT or Post-Theatrical)
- Brief description (1-2 sentences)

Return ONLY valid JSON with this structure:
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
          "actors": ["Actor 1", "Actor 2"],
          "dubbing": "Hindi, Telugu, Tamil",
          "release_type": "Direct-to-OTT",
          "description": "Brief description."
        }
      ]
    }
  ]
}

Platform ID mapping: netflix, prime-video, disney-plus-hotstar, sonyliv, zee5, jiocinema, aha, hoichoi, sunnxt, manoramamax, etv-win, planet-marathi, chaupal

IMPORTANT: Include ALL platforms listed above, even if they have no releases (use empty releases array).`;
    }
    
    return `You are a senior entertainment data analyst and OTT tracking specialist for the **United States market**. You have deep knowledge of the US entertainment industry and comprehensive coverage of all major and emerging streaming services.

## Task:
Generate a comprehensive report of verified OTT releases across all US streaming platforms for the period: **${weekRange}**.

## Platforms (MUST include ALL):
- **Major/Tier 1:** ${country.platforms.slice(0, 7).join(', ')}
- **Tier 2/Emerging:** ${country.platforms.slice(7).join(', ')}

## Content Categories to cover:
- Hollywood mainstream releases
- Independent and arthouse films
- International content available in US
- Documentaries and docuseries
- Reality, competition, and unscripted content
- Animation (theatrical and television)
- Standup comedy and live events

For EACH release, provide:
- Title
- Release date (YYYY-MM-DD)
- Type (movie or series)
- Genre
- Language
- Content category (mainstream, indie, international, documentary, animation, comedy, reality)
- Release type (Direct-to-OTT, Post-Theatrical, or Catalog Addition)
- Cast (top 3-4 actors)
- Description (1-2 sentences)
- Theatrical info (if applicable)

Return ONLY valid JSON:
{
  "platforms": [
    {
      "id": "platform-id",
      "name": "Platform Name",
      "releases": [
        {
          "title": "Title",
          "release_date": "YYYY-MM-DD",
          "type": "movie|series",
          "genre": "Genre",
          "language": "English",
          "content_category": "mainstream|indie|international|documentary|animation|comedy|reality",
          "release_type": "Direct-to-OTT|Post-Theatrical|Catalog Addition",
          "actors": ["Actor 1", "Actor 2"],
          "description": "Description.",
          "theatrical_info": ""
        }
      ]
    }
  ]
}

Platform IDs (use exactly these): netflix, prime-video, disney-plus, hulu, apple-tv-plus, max, paramount-plus, peacock, discovery-plus, starz, mubi, criterion-channel, tubi, pluto-tv

CRITICAL: 
- Include ALL 14 platforms listed above, even if they have no releases (use empty releases array)
- Search for ALL streaming services, not just Netflix
- Include ALL major releases from Prime Video, Disney+, Max, Hulu, Apple TV+, Paramount+, etc.`;
}

/**
 * Call Perplexity API
 */
async function callPerplexityAPI(prompt, country) {
    const apiKey = getApiKey();
    
    const systemMessage = country.id === 'india'
        ? 'You are a senior entertainment data analyst and OTT tracking specialist with expertise in Indian regional cinema (Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood). You have deep knowledge of all major and regional streaming platforms in India. Your priority is accuracy, comprehensive multi-language coverage, and including ALL platforms even if they have no releases. Always respond with valid JSON only, no markdown formatting or code blocks.'
        : 'You are a senior entertainment data analyst and OTT tracking specialist for the United States market. You have deep knowledge of Hollywood, streaming platforms, and theatrical release windows. Your priority is accuracy, comprehensive coverage of ALL platforms (major and emerging), and including ALL platforms even if they have no releases. Always respond with valid JSON only, no markdown formatting or code blocks.';
    
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
            temperature: 0.1,
            max_tokens: 8000,
            web_search_options: {
                search_context_size: 'high'
            }
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
}

/**
 * Parse API response
 */
function parseResponse(apiResponse) {
    const content = apiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
        throw new Error('No content in API response');
    }
    
    try {
        return JSON.parse(content);
    } catch (e) {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }
        
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            return JSON.parse(objectMatch[0]);
        }
        
        throw new Error('Could not parse API response as JSON');
    }
}

/**
 * Generate the complete week data object for custom dates
 */
function generateWeekData(releaseData, country, startDate, endDate) {
    const weekNumber = getISOWeekNumber(startDate);
    const year = startDate.getFullYear();
    
    return {
        week_number: weekNumber,
        year: year,
        week_id: `${year}-${String(weekNumber).padStart(2, '0')}`,
        week_start: startDate.toISOString().split('T')[0],
        week_end: endDate.toISOString().split('T')[0],
        week_range: formatDateRange(startDate, endDate),
        week_title: `Week ${weekNumber}: ${formatDateRange(startDate, endDate)}`,
        country: {
            id: country.id,
            name: country.name,
            flag: country.flag
        },
        generated_at: new Date().toISOString(),
        platforms: releaseData.platforms || []
    };
}

/**
 * Save data to JSON file
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
    
    index.archives.sort((a, b) => b.weekId.localeCompare(a.weekId));
    index.archives = index.archives.slice(0, 52);
    
    saveToFile(index, `data/${countryId}/archive-index.json`);
}

/**
 * Fetch releases for a single country with custom dates
 */
async function fetchCountryReleases(country, startDate, endDate) {
    const weekRange = formatDateRange(startDate, endDate);
    console.log(`\n${country.flag} Fetching releases for ${country.name}...`);
    console.log(`   📅 Date range: ${weekRange}`);
    
    const prompt = buildPrompt(weekRange, country);
    const apiResponse = await callPerplexityAPI(prompt, country);
    const releaseData = parseResponse(apiResponse);
    const weekData = generateWeekData(releaseData, country, startDate, endDate);
    
    const totalReleases = weekData.platforms.reduce((sum, p) => sum + (p.releases?.length || 0), 0);
    console.log(`   Found ${totalReleases} releases across ${weekData.platforms.length} platforms`);
    
    return weekData;
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🎬 OTT Weekly Releases - Custom Date Range Fetcher');
        console.log('===================================================\n');
        
        // Get parameters from environment
        const startDateStr = process.env.START_DATE;
        const endDateStr = process.env.END_DATE;
        const countryParam = process.env.COUNTRY || 'both';
        const saveAsCurrent = process.env.SAVE_AS_CURRENT === 'true';
        
        if (!startDateStr || !endDateStr) {
            throw new Error('START_DATE and END_DATE environment variables are required');
        }
        
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Invalid date format. Use YYYY-MM-DD');
        }
        
        console.log(`📅 Start Date: ${startDateStr}`);
        console.log(`📅 End Date: ${endDateStr}`);
        console.log(`🌍 Country: ${countryParam}`);
        console.log(`💾 Save as current: ${saveAsCurrent}`);
        
        // Determine which countries to fetch
        const countriesToFetch = countryParam === 'both' 
            ? Object.values(COUNTRIES)
            : [COUNTRIES[countryParam]].filter(Boolean);
        
        if (countriesToFetch.length === 0) {
            throw new Error(`Invalid country: ${countryParam}. Use 'us', 'india', or 'both'`);
        }
        
        // Fetch releases for each country
        for (const country of countriesToFetch) {
            try {
                const weekData = await fetchCountryReleases(country, startDate, endDate);
                
                // Always save to archive
                saveToFile(weekData, `data/${country.id}/archive/${weekData.week_id}.json`);
                
                // Optionally save as current week
                if (saveAsCurrent) {
                    saveToFile(weekData, `data/${country.id}/current-week.json`);
                }
                
                // Update archive index
                updateArchiveIndex(weekData, country.id);
                
            } catch (error) {
                console.error(`❌ Error fetching ${country.name}:`, error.message);
            }
            
            // Add delay between API calls
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

module.exports = {
    COUNTRIES,
    getISOWeekNumber,
    formatDateRange,
    buildPrompt,
    callPerplexityAPI,
    parseResponse,
    generateWeekData
};
