require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchAndSaveAsMarkdown() {
    console.log('🎬 Fetching theatrical releases from Perplexity API...\n');
    
    const systemMessage = 'You are a senior film industry analyst tracking theatrical movie releases in India. Return ONLY valid JSON.';
    
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
   - Cast (top 3-4 lead actors)
   - Director
   - Production house/studio
   - Brief description

Return ONLY valid JSON with this structure:
{
  "week_number": "2025-50",
  "week_start": "2025-12-08",
  "week_end": "2025-12-14",
  "country": "india",
  "categories": [
    {
      "category_id": "bollywood-hindi",
      "category_name": "Bollywood (Hindi)",
      "movies": []
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
}`;

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
        
        console.log('📥 Received response from API\n');
        
        const content = response.data.choices[0].message.content;
        console.log('Raw API Response:');
        console.log(content);
        console.log('\n' + '='.repeat(80) + '\n');
        
        const result = JSON.parse(content);
        
        // Normalize categories structure
        if (!result.categories || !Array.isArray(result.categories)) {
            console.error('Result structure:', JSON.stringify(result, null, 2));
            throw new Error('Invalid API response: missing categories array');
        }
        
        // Generate markdown
        let markdown = `# Indian Theatrical Releases\n\n`;
        markdown += `**Week:** ${result.week_number} (${result.week_start} to ${result.week_end})\n\n`;
        markdown += `**Last Updated:** ${new Date().toLocaleString()}\n\n`;
        markdown += `---\n\n`;
        
        result.categories.forEach(category => {
            const catName = category.category_name || category.name;
            const movies = category.movies || [];
            
            markdown += `## ${catName}\n\n`;
            
            if (movies.length === 0) {
                markdown += `*No releases this week*\n\n`;
            } else {
                movies.forEach((movie, index) => {
                    markdown += `### ${index + 1}. ${movie.title}\n\n`;
                    if (movie.release_date) markdown += `**Release Date:** ${movie.release_date}\n\n`;
                    if (movie.industry_language || movie.language) markdown += `**Language:** ${movie.industry_language || movie.language}\n\n`;
                    if (movie.genre) markdown += `**Genre:** ${movie.genre}\n\n`;
                    if (movie.cast && movie.cast.length > 0) markdown += `**Cast:** ${movie.cast.join(', ')}\n\n`;
                    if (movie.director) markdown += `**Director:** ${movie.director}\n\n`;
                    if (movie.production_house || movie.production) markdown += `**Production:** ${movie.production_house || movie.production}\n\n`;
                    if (movie.description) markdown += `${movie.description}\n\n`;
                    markdown += `---\n\n`;
                });
            }
        });
        
        // Count total movies
        const totalMovies = result.categories.reduce((sum, cat) => sum + (cat.movies?.length || 0), 0);
        markdown += `\n**Total Movies:** ${totalMovies}\n`;
        
        // Save to file
        const outputPath = path.join(__dirname, '..', 'RELEASES.md');
        fs.writeFileSync(outputPath, markdown);
        
        console.log(`✅ Markdown saved to RELEASES.md`);
        console.log(`📊 Total movies: ${totalMovies}`);
        
        // Also save JSON for reference
        const jsonPath = path.join(__dirname, '..', 'releases.json');
        fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
        console.log(`✅ JSON saved to releases.json`);
        
        return result;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

fetchAndSaveAsMarkdown()
    .then(() => {
        console.log('\n🎉 Done! Commit and push RELEASES.md to see it on GitHub Pages.');
    })
    .catch(err => {
        console.error('Failed:', err.message);
        process.exit(1);
    });
