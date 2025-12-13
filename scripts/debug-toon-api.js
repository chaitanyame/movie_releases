/**
 * Debug TOON API Response
 * Tests the actual Perplexity API response format
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const { parseToonResponse, normalizeMovieArrays } = require('./utils/toon-parser');

async function test() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        console.log('No API key found');
        return;
    }
    
    console.log('Calling Perplexity API...');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
                { 
                    role: 'system', 
                    content: 'Return data in TOON format exactly as shown. Use 2-space indentation. No JSON, no markdown, no code blocks.' 
                },
                { 
                    role: 'user', 
                    content: `List 2 movies releasing in India this week December 8-14, 2025 in this exact TOON format:

week_number: 2025-50
week_start: 2025-12-08
week_end: 2025-12-14
country: india
categories[2]:
  - id: bollywood-hindi
    name: Bollywood (Hindi)
    movies[1]:
      - title: Movie Name
        release_date: 2025-12-12
        genre: Action
        language: Hindi
        cast[2]: Actor1,Actor2
        director: Director Name
        production: Studio
        description: Brief description.
  - id: regional-telugu
    name: Regional (Telugu)
    movies[0]:` 
                }
            ]
        })
    });
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('=== RAW API RESPONSE ===');
    console.log(content);
    console.log('');
    console.log('=== ATTEMPTING PARSE ===');
    
    try {
        const parsed = parseToonResponse(content);
        console.log('Parsed successfully!');
        console.log(JSON.stringify(parsed, null, 2));
        
        console.log('\n=== CATEGORY CHECK ===');
        if (parsed.categories) {
            parsed.categories.forEach((cat, i) => {
                console.log(`Category ${i}: ${cat.id}`);
                console.log(`  movies type: ${typeof cat.movies}`);
                console.log(`  movies isArray: ${Array.isArray(cat.movies)}`);
                console.log(`  movies value: ${JSON.stringify(cat.movies)}`);
            });
        }
    } catch(e) {
        console.log('Parse error:', e.message);
        console.log(e.stack);
    }
}

test().catch(console.error);
