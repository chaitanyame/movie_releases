const fs = require('fs');

function parseToon(toonText) {
    const lines = toonText.split('\n');
    const data = {
        week_number: '',
        categories: []
    };
    
    let currentCategory = null;
    let currentMovie = null;
    let inCastArray = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const spaces = line.match(/^ */)[0].length;
        const level = spaces / 2;
        const trimmed = line.trim();
        
        // Cast items at level 5
        if (level === 5 && inCastArray && currentMovie && trimmed.startsWith('- ')) {
            currentMovie.cast.push(trimmed.substring(2).trim());
            continue;
        }
        
        if (trimmed === '-') {
            if (level === 1) {
                currentCategory = { id: '', name: '', movies: [] };
                data.categories.push(currentCategory);
                currentMovie = null;
                inCastArray = false;
            } else if (level === 3 && currentCategory) {
                currentMovie = { title: '', cast: [], genre: '', director: '', description: '' };
                currentCategory.movies.push(currentMovie);
                inCastArray = false;
            }
            continue;
        }
        
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex === -1) continue;
        
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        
        if (level === 0 && key === 'week_number') data.week_number = value;
        else if (level === 2 && currentCategory) {
            if (key === 'id') currentCategory.id = value;
            else if (key === 'name') currentCategory.name = value;
        }
        else if (level === 4 && currentMovie) {
            if (key === 'title') { currentMovie.title = value; inCastArray = false; }
            else if (key === 'genre') { currentMovie.genre = value; inCastArray = false; }
            else if (key === 'director') { currentMovie.director = value; inCastArray = false; }
            else if (key === 'description') { currentMovie.description = value; inCastArray = false; }
            else if (key === 'cast') inCastArray = true;
        }
    }
    
    return data;
}

const toonText = fs.readFileSync('data/india/current-week.toon', 'utf8');
const data = parseToon(toonText);
console.log(`Week: ${data.week_number}, Categories: ${data.categories.length}`);
data.categories.forEach(cat => {
    console.log(`  ${cat.name}: ${cat.movies.length} movies`);
    cat.movies.slice(0, 2).forEach(m => console.log(`    - ${m.title} (cast: ${m.cast.length})`));
});
