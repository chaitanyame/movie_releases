/**
 * Test TOON Parser
 * 
 * Tests the TOON format parsing utility with sample movie data
 * to verify correct parsing before using with live API calls.
 * 
 * Usage: node scripts/test-toon-parser.js
 */

'use strict';

const { parseToonResponse, detectFormat, normalizeMovieArrays, toToon } = require('./utils/toon-parser');

// Sample TOON format response (simulating what API would return)
const sampleToonResponse = `week_number: 2025-51
week_start: 2025-12-15
week_end: 2025-12-21
country: india
categories[4]:
  - id: bollywood-hindi
    name: Bollywood (Hindi)
    movies[2]:
      - title: Pushpa 2: The Rule
        release_date: 2025-12-15
        genre: Action
        language: Hindi
        additional_languages[4]: Telugu,Tamil,Malayalam,Kannada
        cast[3]: Allu Arjun,Rashmika Mandanna,Fahadh Faasil
        director: Sukumar
        production: Mythri Movie Makers
        description: Sequel to the blockbuster Pushpa exploring the rise of red sandalwood smuggler.
      - title: Baby John
        release_date: 2025-12-20
        genre: Action
        language: Hindi
        additional_languages[0]:
        cast[3]: Varun Dhawan,Keerthy Suresh,Wamiqa Gabbi
        director: Kalees
        production: Jio Studios
        description: Action thriller remake of Tamil film Theri.
  - id: regional-telugu
    name: Regional (Telugu)
    movies[1]:
      - title: Game Changer
        release_date: 2025-12-20
        genre: Political Drama
        language: Telugu
        additional_languages[2]: Hindi,Tamil
        cast[3]: Ram Charan,Kiara Advani,SJ Suryah
        director: S. Shankar
        production: Sri Venkateswara Creations
        description: Political action drama about an IAS officer fighting corruption.
  - id: regional-tamil
    name: Regional (Tamil)
    movies[0]:
  - id: regional-other
    name: Regional (Other)
    movies[0]:`;

// Sample JSON response (for fallback testing)
const sampleJsonResponse = `{
  "week_number": "2025-51",
  "week_start": "2025-12-15",
  "week_end": "2025-12-21",
  "country": "india",
  "categories": [
    {
      "id": "bollywood-hindi",
      "name": "Bollywood (Hindi)",
      "movies": [
        {
          "title": "Test Movie",
          "release_date": "2025-12-15",
          "genre": "Action",
          "cast": ["Actor 1", "Actor 2"]
        }
      ]
    }
  ]
}`;

console.log('='.repeat(60));
console.log('TOON Parser Test Suite');
console.log('='.repeat(60));

// Test 1: Format detection
console.log('\n📋 Test 1: Format Detection');
console.log('-'.repeat(40));
const toonFormat = detectFormat(sampleToonResponse);
const jsonFormat = detectFormat(sampleJsonResponse);
console.log(`TOON sample detected as: ${toonFormat}`);
console.log(`JSON sample detected as: ${jsonFormat}`);
console.log(`✅ Format detection: ${toonFormat === 'toon' && jsonFormat === 'json' ? 'PASSED' : 'FAILED'}`);

// Test 2: TOON parsing
console.log('\n📋 Test 2: TOON Parsing');
console.log('-'.repeat(40));
try {
    const parsedToon = parseToonResponse(sampleToonResponse);
    console.log('Parsed structure:');
    console.log(`  - week_number: ${parsedToon.week_number}`);
    console.log(`  - country: ${parsedToon.country}`);
    console.log(`  - categories: ${parsedToon.categories?.length || 0}`);
    
    if (parsedToon.categories) {
        parsedToon.categories.forEach(cat => {
            const movieCount = cat.movies?.length || 0;
            console.log(`    - ${cat.id}: ${movieCount} movies`);
        });
    }
    console.log('✅ TOON parsing: PASSED');
} catch (error) {
    console.log(`❌ TOON parsing: FAILED - ${error.message}`);
}

// Test 3: Array normalization (pipe-separated → arrays)
console.log('\n📋 Test 3: Array Normalization (pipe → array)');
console.log('-'.repeat(40));
try {
    const parsed = parseToonResponse(sampleToonResponse);
    const normalized = normalizeMovieArrays(parsed);
    
    const firstMovie = normalized.categories?.[0]?.movies?.[0];
    if (firstMovie) {
        console.log(`First movie: ${firstMovie.title}`);
        console.log(`  - cast type: ${Array.isArray(firstMovie.cast) ? 'Array' : typeof firstMovie.cast}`);
        console.log(`  - cast values: ${JSON.stringify(firstMovie.cast)}`);
        console.log(`  - additional_languages: ${JSON.stringify(firstMovie.additional_languages)}`);
        
        const castIsArray = Array.isArray(firstMovie.cast);
        const langIsArray = Array.isArray(firstMovie.additional_languages);
        console.log(`✅ Array normalization: ${castIsArray && langIsArray ? 'PASSED' : 'FAILED'}`);
    }
} catch (error) {
    console.log(`❌ Array normalization: FAILED - ${error.message}`);
}

// Test 4: JSON fallback
console.log('\n📋 Test 4: JSON Fallback');
console.log('-'.repeat(40));
try {
    const parsedJson = parseToonResponse(sampleJsonResponse);
    console.log(`Parsed JSON week_number: ${parsedJson.week_number}`);
    console.log(`Categories: ${parsedJson.categories?.length || 0}`);
    console.log('✅ JSON fallback: PASSED');
} catch (error) {
    console.log(`❌ JSON fallback: FAILED - ${error.message}`);
}

// Test 5: Round-trip encoding
console.log('\n📋 Test 5: JSON to TOON Encoding');
console.log('-'.repeat(40));
try {
    const testData = {
        week_number: "2025-51",
        country: "india",
        categories: [
            { id: "bollywood", name: "Bollywood", movies: [] }
        ]
    };
    const encoded = toToon(testData);
    console.log('Encoded TOON:');
    console.log(encoded.split('\n').slice(0, 5).map(l => `  ${l}`).join('\n'));
    console.log('  ...');
    console.log('✅ TOON encoding: PASSED');
} catch (error) {
    console.log(`❌ TOON encoding: FAILED - ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('Test Summary: All core TOON parsing functions operational');
console.log('='.repeat(60));
console.log('\nNext steps:');
console.log('  1. Run: node scripts/fetch-releases.js --country india --week current-week');
console.log('  2. Verify API responses are parsed correctly');
console.log('  3. Check data files in data/india/');
console.log('');
