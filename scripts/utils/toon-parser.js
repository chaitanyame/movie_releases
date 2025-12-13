/**
 * TOON Format Parser Utility
 * 
 * This module provides utilities for parsing TOON (Token-Oriented Object Notation)
 * format responses from the Perplexity API. TOON reduces token usage by ~40%
 * compared to JSON while maintaining lossless round-trip conversion.
 * 
 * @see https://github.com/toon-format/toon
 * @module scripts/utils/toon-parser
 */

'use strict';

const { decode, encode } = require('@toon-format/toon');

/**
 * Parse a TOON format string to JavaScript object
 * Falls back to JSON parsing if TOON parsing fails
 * 
 * @param {string} toonString - TOON formatted string
 * @returns {Object} Parsed JavaScript object
 * @throws {Error} If both TOON and JSON parsing fail
 */
function parseToonResponse(toonString) {
    if (!toonString || typeof toonString !== 'string') {
        throw new Error('Invalid input: expected non-empty string');
    }

    // Try TOON parsing first
    try {
        const parsed = decode(toonString);
        console.log('   ✓ Parsed as TOON format');
        return parsed;
    } catch (toonError) {
        console.log(`   ⚠ TOON parse failed: ${toonError.message}`);
        
        // Fallback: Try JSON parsing
        try {
            // Check if it looks like JSON (starts with { or [)
            const trimmed = toonString.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                const parsed = JSON.parse(trimmed);
                console.log('   ✓ Fallback: Parsed as JSON format');
                return parsed;
            }
            
            // Try extracting JSON from markdown code blocks
            const jsonMatch = toonString.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1]);
                console.log('   ✓ Fallback: Parsed JSON from code block');
                return parsed;
            }
            
            // Try finding JSON object in content
            const objectMatch = toonString.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                const parsed = JSON.parse(objectMatch[0]);
                console.log('   ✓ Fallback: Extracted JSON from content');
                return parsed;
            }
            
            throw new Error('Content is neither valid TOON nor JSON');
        } catch (jsonError) {
            throw new Error(`Failed to parse response. TOON error: ${toonError.message}. JSON error: ${jsonError.message}`);
        }
    }
}

/**
 * Detect if a string is in TOON format vs JSON format
 * 
 * @param {string} content - String to check
 * @returns {'toon'|'json'|'unknown'} Detected format
 */
function detectFormat(content) {
    if (!content || typeof content !== 'string') {
        return 'unknown';
    }

    const trimmed = content.trim();
    
    // JSON typically starts with { or [
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return 'json';
    }
    
    // TOON format indicators:
    // - Lines with key: value
    // - Tabular arrays like array[N]{col1,col2}:
    // - No opening braces at start
    if (trimmed.match(/^\w+(\[|\{|:)/m) || trimmed.match(/^\w+\[\d*\]\{[\w,]+\}:/m)) {
        return 'toon';
    }
    
    return 'unknown';
}

/**
 * Encode JavaScript object to TOON format
 * Used for creating TOON format examples in prompts
 * 
 * @param {Object} data - JavaScript object to encode
 * @param {Object} options - Encoding options
 * @param {string} options.delimiter - Delimiter for arrays (',' | '\t' | '|')
 * @returns {string} TOON formatted string
 */
function toToon(data, options = {}) {
    return encode(data, {
        delimiter: options.delimiter || ',',
        indent: options.indent || 2,
        keyFolding: options.keyFolding || 'off'
    });
}

/**
 * Generate TOON format example for India movie data structure
 * Used in API prompts to show the expected response format
 * 
 * @param {string} weekNumber - Week number (e.g., "2025-50")
 * @param {string} weekStart - Week start date (e.g., "2025-12-09")
 * @param {string} weekEnd - Week end date (e.g., "2025-12-15")
 * @returns {string} TOON format example
 */
function getToonExampleIndia(weekNumber, weekStart, weekEnd) {
    return `week_number: ${weekNumber}
week_start: ${weekStart}
week_end: ${weekEnd}
country: india
categories[4]{id,name}:
  bollywood-hindi,Bollywood (Hindi)
  regional-telugu,Regional (Telugu)
  regional-tamil,Regional (Tamil)
  regional-other,Regional (Other)
bollywood-hindi.movies[N]{title,release_date,genre,language,additional_languages,cast,director,production,description}:
  Movie Title,YYYY-MM-DD,Genre,Hindi,Telugu|Tamil,Actor1|Actor2|Actor3,Director Name,Production House,Brief description of the movie.
regional-telugu.movies[N]{title,release_date,genre,language,additional_languages,cast,director,production,description}:
  Telugu Movie,YYYY-MM-DD,Action,Telugu,Hindi|Tamil,Actor1|Actor2,Director,Studio,Description here.`;
}

/**
 * Generate TOON format example for US movie data structure
 * Used in API prompts to show the expected response format
 * 
 * @param {string} weekNumber - Week number (e.g., "2025-50")
 * @param {string} weekStart - Week start date (e.g., "2025-12-09")
 * @param {string} weekEnd - Week end date (e.g., "2025-12-15")
 * @returns {string} TOON format example
 */
function getToonExampleUS(weekNumber, weekStart, weekEnd) {
    return `week_number: ${weekNumber}
week_start: ${weekStart}
week_end: ${weekEnd}
country: us
categories[2]{id,name}:
  wide-release,Wide Release
  limited-release,Limited Release
wide-release.movies[N]{title,release_date,genre,rating,studio,cast,director,theater_count,description}:
  Movie Title,YYYY-MM-DD,Action,PG-13,Studio Name,Actor1|Actor2|Actor3,Director Name,3500+ theaters,Brief description of the movie.
limited-release.movies[N]{title,release_date,genre,rating,studio,cast,director,theater_count,description}:
  Indie Film,YYYY-MM-DD,Drama,R,A24,Actor1|Actor2,Director,50-100 theaters,Arthouse film description.`;
}

/**
 * Parse TOON movies array - normalize any remaining pipe-delimited values
 * The TOON library handles arrays natively with comma separation,
 * but this provides additional fallback handling.
 * 
 * Also handles the case where empty arrays come back as {} from TOON parser
 * when LLM returns "movies:" instead of "movies[0]:"
 * 
 * @param {Object} parsedData - Parsed TOON data
 * @returns {Object} Data with normalized arrays
 */
function normalizeMovieArrays(parsedData) {
    if (!parsedData?.categories) return parsedData;
    
    parsedData.categories = parsedData.categories.map(cat => {
        // Handle case where movies is an empty object {} instead of array []
        // This happens when LLM returns "movies:" instead of "movies[0]:"
        if (!cat.movies || (typeof cat.movies === 'object' && !Array.isArray(cat.movies) && Object.keys(cat.movies).length === 0)) {
            cat.movies = [];
            return cat;
        }
        
        // Ensure movies is an array
        if (!Array.isArray(cat.movies)) {
            cat.movies = [];
            return cat;
        }
        
        cat.movies = cat.movies.map(movie => {
            // Convert pipe-separated strings to arrays (fallback for older format)
            if (typeof movie.cast === 'string' && movie.cast.includes('|')) {
                movie.cast = movie.cast.split('|').map(s => s.trim()).filter(Boolean);
            }
            if (typeof movie.additional_languages === 'string' && movie.additional_languages.includes('|')) {
                movie.additional_languages = movie.additional_languages.split('|').map(s => s.trim()).filter(Boolean);
            }
            if (typeof movie.actors === 'string' && movie.actors.includes('|')) {
                movie.actors = movie.actors.split('|').map(s => s.trim()).filter(Boolean);
            }
            
            // Ensure arrays are always arrays (even empty)
            if (!movie.cast) movie.cast = [];
            if (!movie.additional_languages) movie.additional_languages = [];
            
            return movie;
        });
        
        return cat;
    });
    
    return parsedData;
}

module.exports = {
    parseToonResponse,
    detectFormat,
    toToon,
    getToonExampleIndia,
    getToonExampleUS,
    normalizeMovieArrays
};
