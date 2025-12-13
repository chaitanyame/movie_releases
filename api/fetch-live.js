require('dotenv').config();
const axios = require('axios');
const { parseToonResponse, normalizeMovieArrays } = require('../scripts/utils/toon-parser');

async function fetchLiveReleases(country = 'india') {
    const weekRange = 'December 8-14, 2025';
    const systemMessage = 'You are a senior film industry analyst tracking theatrical movie releases in India. Always respond in TOON format (Token-Oriented Object Notation) exactly as specified. Use pipe (|) for array separators. No JSON, no markdown, no code blocks.';
    
    const prompt = `You are a senior film industry analyst tracking theatrical movie releases in India. You have comprehensive knowledge of Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood, and all regional film industries.

CRITICAL: Search exhaustively across ALL Indian film industry sources, trade publications, and movie databases. This is a comprehensive theatrical release tracking system - missing releases is NOT acceptable.

Task: Generate a COMPLETE and COMPREHENSIVE report of ALL verified theatrical movie releases for December 8-14, 2025.

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
   - Industry/Language
   - Genre
   - Cast (top 3-4 lead actors, pipe-separated)
   - Director
   - Production house/studio
   - Brief description

IMPORTANT: Return data in TOON format (Token-Oriented Object Notation), NOT JSON.
TOON is a compact, YAML-like format that reduces tokens. Use commas for arrays.

Return ONLY valid TOON format with this EXACT structure (indentation matters):

week_number: 2025-50
week_start: 2025-12-08
week_end: 2025-12-14
country: india
categories[4]:
  - id: bollywood-hindi
    name: Bollywood (Hindi)
    movies[N]:
      - title: Movie Title
        release_date: 2025-12-13
        genre: Action
        language: Hindi
        cast[3]: Actor 1,Actor 2,Actor 3
        director: Director Name
        production: Production House
        description: Brief description.
  - id: regional-telugu
    name: Regional (Telugu)
    movies[0]:
  - id: regional-tamil
    name: Regional (Tamil)
    movies[0]:
  - id: regional-other
    name: Regional (Other)
    movies[0]:

TOON Format Rules:
- Use 2-space indentation for nesting
- Arrays use [N] notation where N is the count
- Primitive arrays use comma separation: cast[3]: Actor1,Actor2,Actor3
- Object arrays use - prefix for each item
- Empty arrays use [0]: with nothing after
- No quotes, no JSON syntax`;

    try {
        const response = await axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
                model: 'sonar-pro',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
                max_tokens: 4000,
                return_citations: true,
                search_recency_filter: 'week',
                web_search_options: {
                    search_context_size: 'high'
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Parse TOON response with JSON fallback
        let result = parseToonResponse(response.data.choices[0].message.content);
        
        // Normalize pipe-separated arrays to actual arrays
        result = normalizeMovieArrays(result);
        
        // Normalize field names
        if (result?.categories) {
            result.categories = result.categories.map(cat => ({
                id: cat.category_id || cat.id,
                name: cat.category_name || cat.name,
                movies: cat.movies || []
            }));
        }
        
        return result;
    } catch (error) {
        console.error('Error fetching from Perplexity API:', error.message);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    fetchLiveReleases()
        .then(data => {
            console.log(JSON.stringify(data, null, 2));
        })
        .catch(err => {
            console.error('Failed:', err.message);
            process.exit(1);
        });
}

module.exports = { fetchLiveReleases };
