/**
 * Fetch OTT Releases Script
 * 
 * This script calls the Perplexity API to fetch current week's OTT releases
 * and generates the JSON data file for the static site.
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

// Platform list
const PLATFORMS = [
    'Netflix',
    'Prime Video', 
    'Disney+',
    'Hulu',
    'Apple TV+',
    'Max',
    'Paramount+',
    'Peacock'
];

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
 * @returns {string} The formatted prompt
 */
function buildPrompt(weekRange) {
    return `Find all new movie and TV series releases for ${weekRange} on the following streaming platforms: ${PLATFORMS.join(', ')}.

For each release, provide:
- Title
- Release date
- Type (movie or series)
- Genre
- Brief description (1-2 sentences)

Return the data as valid JSON only, with no additional text. Use this exact structure:
{
  "platforms": [
    {
      "id": "netflix",
      "name": "Netflix",
      "releases": [
        {
          "title": "Title Name",
          "release_date": "YYYY-MM-DD",
          "type": "movie|series",
          "genre": "Genre",
          "description": "Brief description"
        }
      ]
    }
  ]
}`;
}

/**
 * Call the Perplexity API
 * @param {string} prompt - The prompt to send
 * @returns {Promise<Object>} The API response
 */
async function callPerplexityAPI(prompt) {
    const apiKey = getApiKey();
    
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
                    content: 'You are a helpful assistant that provides accurate information about streaming platform releases. Always respond with valid JSON only, no markdown formatting or code blocks.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            web_search_options: {
                search_context_size: 'low'
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
        throw new Error('Could not parse API response as JSON');
    }
}

/**
 * Generate the complete week data object
 * @param {Object} releaseData - Parsed release data from API
 * @param {Date} [date] - Optional date (defaults to now)
 * @returns {Object} Complete week data object
 */
function generateWeekData(releaseData, date) {
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
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved to ${filePath}`);
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('Fetching OTT releases...');
        
        const now = new Date();
        const { start, end } = getWeekDateRange(now);
        const weekRange = formatDateRange(start, end);
        
        console.log(`Week: ${weekRange}`);
        
        const prompt = buildPrompt(weekRange);
        const apiResponse = await callPerplexityAPI(prompt);
        const releaseData = parseResponse(apiResponse);
        const weekData = generateWeekData(releaseData);
        
        // Save current week
        saveToFile(weekData, 'data/current-week.json');
        
        // Archive with week ID
        saveToFile(weekData, `data/archive/${weekData.week_id}.json`);
        
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

// Export for testing
module.exports = {
    getISOWeekNumber,
    getWeekDateRange,
    formatDateRange,
    buildPrompt,
    callPerplexityAPI,
    parseResponse,
    generateWeekData
};
