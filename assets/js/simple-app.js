/**
 * Simple Movie Releases App
 * Displays TOON format content beautifully with card-based layout
 */

'use strict';

// DOM Elements
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const releasesContent = document.getElementById('releases-content');
const countryButtons = document.querySelectorAll('.country-btn');

// State
let currentCountry = 'india';

/**
 * Show loading indicator
 */
function showLoading() {
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    if (releasesContent) releasesContent.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (releasesContent) releasesContent.style.display = 'block';
}

/**
 * Show error message
 */
function showError(message) {
    if (errorMessage) {
        errorMessage.innerHTML = `<div class="error-content"><span class="error-icon">⚠️</span><p>${message}</p></div>`;
        errorMessage.style.display = 'block';
    }
    hideLoading();
}

/**
 * Hide error message
 */
function hideError() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

/**
 * Get icon for category
 */
function getCategoryIcon(categoryName) {
    const name = categoryName.toLowerCase();
    if (name.includes('hindi') || name.includes('bollywood')) return '🎬';
    if (name.includes('telugu') || name.includes('tollywood')) return '🌟';
    if (name.includes('tamil') || name.includes('kollywood')) return '🎭';
    if (name.includes('malayalam') || name.includes('mollywood')) return '🌴';
    if (name.includes('kannada') || name.includes('sandalwood')) return '🎪';
    if (name.includes('marathi')) return '🏛️';
    if (name.includes('gujarati')) return '🎯';
    if (name.includes('bengali')) return '📽️';
    if (name.includes('major') || name.includes('studio')) return '🎬';
    if (name.includes('independent') || name.includes('limited')) return '🎭';
    if (name.includes('genre')) return '🎪';
    if (name.includes('art') || name.includes('specialty')) return '🎨';
    return '🎥';
}

/**
 * Parse TOON format to structured data
 * TOON uses 2-space indentation and key: value format
 * Array items are marked with "  -" at the appropriate indent level
 */
function parseToon(toonText) {
    const lines = toonText.split('\n');
    const data = {
        week_number: '',
        week_start: '',
        week_end: '',
        country: '',
        last_updated: '',
        categories: []
    };
    
    let currentCategory = null;
    let currentMovie = null;
    let inCastArray = false;
    
    for (let line of lines) {
        if (!line.trim()) continue;
        
        // Calculate indent level (number of leading spaces / 2)
        const spaces = line.match(/^ */)[0].length;
        const level = spaces / 2;
        
        const trimmed = line.trim();
        
        // Cast array items at level 5 (10 spaces)
        if (level === 5 && inCastArray && currentMovie && trimmed.startsWith('- ')) {
            const castMember = trimmed.substring(2).trim();
            if (castMember) {
                currentMovie.cast.push(castMember);
            }
            continue;
        }
        
        // Check if this is an array item marker without value
        if (trimmed === '-') {
            if (level === 1) {
                // New category
                currentCategory = {
                    id: '',
                    name: '',
                    movies: []
                };
                data.categories.push(currentCategory);
                currentMovie = null;
                inCastArray = false;
            } else if (level === 3 && currentCategory) {
                // New movie
                currentMovie = {
                    title: '',
                    release_date: '',
                    genre: '',
                    cast: [],
                    director: '',
                    description: '',
                    first_seen: '',
                    is_new: false
                };
                currentCategory.movies.push(currentMovie);
                inCastArray = false;
            }
            continue;
        }
        
        // Handle key: value pairs
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex === -1) continue;
        
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        
        // Root level fields (level 0)
        if (level === 0) {
            if (key === 'week_number') data.week_number = value;
            else if (key === 'week_start') data.week_start = value;
            else if (key === 'week_end') data.week_end = value;
            else if (key === 'country') data.country = value;
            else if (key === 'last_updated') data.last_updated = value;
        }
        // Category level (level 2 - after "  -")
        else if (level === 2 && currentCategory) {
            if (key === 'id') currentCategory.id = value;
            else if (key === 'name') currentCategory.name = value;
            // "movies:" is just a marker, ignore
        }
        // Movie level (level 4 - after "      -")
        else if (level === 4 && currentMovie) {
            if (key === 'title') {
                currentMovie.title = value;
                inCastArray = false;
            }
            else if (key === 'release_date') {
                currentMovie.release_date = value;
                inCastArray = false;
            }
            else if (key === 'genre') {
                currentMovie.genre = value;
                inCastArray = false;
            }
            else if (key === 'director') {
                currentMovie.director = value;
                inCastArray = false;
            }
            else if (key === 'description') {
                currentMovie.description = value;
                inCastArray = false;
            }
            else if (key === 'first_seen') {
                currentMovie.first_seen = value;
                inCastArray = false;
            }
            else if (key === 'is_new') {
                currentMovie.is_new = value === 'true';
                inCastArray = false;
            }
            else if (key === 'cast') {
                // Start of cast array - next lines at level 5 will be cast members
                inCastArray = true;
            }
        }
    }
    
    return data;
}

/**
 * Render a complete movie card with all details
 */
function renderMovieCard(movie) {
    if (!movie) return '';
    
    const m = movie;
    let cardHtml = `<article class="movie-card">`;
    
    // Movie header with title
    cardHtml += `<div class="movie-header">
        <h3 class="movie-title">${m.title || 'Untitled'}</h3>`;
    
    // Genre badges
    if (m.genre) {
        const genres = Array.isArray(m.genre) ? m.genre : m.genre.split(',').map(g => g.trim());
        cardHtml += `<div class="genre-badges">`;
        for (const genre of genres) {
            cardHtml += `<span class="genre-badge">${genre}</span>`;
        }
        cardHtml += `</div>`;
    }
    cardHtml += `</div>`;
    
    // Movie body with details
    cardHtml += `<div class="movie-body">`;
    
    // Release date
    if (m.release_date) {
        cardHtml += `<div class="movie-info-row">
            <span class="info-icon">📅</span>
            <span class="info-text">${m.release_date}</span>
        </div>`;
    }
    
    // Cast (actors)
    if (m.cast && m.cast.length > 0) {
        const castText = Array.isArray(m.cast) ? m.cast.join(', ') : m.cast;
        cardHtml += `<div class="movie-info-row cast-row">
            <span class="info-icon">⭐</span>
            <span class="info-label">Cast:</span>
            <span class="info-text">${castText}</span>
        </div>`;
    }
    
    // Director
    if (m.director) {
        cardHtml += `<div class="movie-info-row">
            <span class="info-icon">🎬</span>
            <span class="info-label">Director:</span>
            <span class="info-text">${m.director}</span>
        </div>`;
    }
    
    // Description/Plot
    if (m.description) {
        cardHtml += `<div class="movie-description">
            <p>${m.description}</p>
        </div>`;
    }
    
    cardHtml += `</div></article>`;
    return cardHtml;
}

/**
 * Convert parsed TOON data to beautiful card-based HTML
 */
function dataToHtml(data) {
    let html = '';
    
    // Add header with week information
    if (data.week_number) {
        html += `<header class="releases-header">`;
        html += `<h1 class="releases-title">This Week's Theatrical Releases</h1>`;
        html += `<p class="releases-meta">Week: ${data.week_number}</p>`;
        if (data.week_start && data.week_end) {
            html += `<p class="releases-meta">${data.week_start} to ${data.week_end}</p>`;
        }
        html += `</header>`;
    }
    
    // Process categories
    if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
            if (!category.movies || category.movies.length === 0) continue;
            
            // Category header
            const icon = getCategoryIcon(category.name);
            html += `<section class="platform-section">`;
            html += `<div class="platform-header">`;
            html += `<span class="platform-icon">${icon}</span>`;
            html += `<h2 class="platform-name">${category.name}</h2>`;
            html += `<span class="movie-count">${category.movies.length} ${category.movies.length === 1 ? 'movie' : 'movies'}</span>`;
            html += `</div>`;
            html += `<div class="movies-grid">`;
            
            // Render movie cards
            for (const movie of category.movies) {
                html += renderMovieCard(movie);
            }
            
            html += `</div></section>`;
        }
    }
    
    // If no content
    if (html === '' || !data.categories || data.categories.every(cat => !cat.movies || cat.movies.length === 0)) {
        html = `<div class="empty-state">
            <p class="empty-icon">🎬</p>
            <p class="empty-text">No releases found for this week.</p>
        </div>`;
    }
    
    return html;
}

/**
 * Load movie releases for the current country
 */
async function loadReleases() {
    showLoading();
    hideError();
    
    try {
        const filename = `data/${currentCountry}/current-week.toon`;
        console.log('Fetching TOON format:', filename);
        
        const response = await fetch(filename);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch releases: ${response.status}`);
        }
        
        const toonText = await response.text();
        console.log('TOON data loaded, length:', toonText.length);
        
        const data = parseToon(toonText);
        console.log('Parsed TOON data:', data);
        
        const html = dataToHtml(data);
        console.log('HTML generated, length:', html.length);
        
        if (releasesContent) {
            releasesContent.innerHTML = html;
            console.log('Content injected successfully');
        }
        
        hideLoading();
        console.log('Loading complete');
        
    } catch (error) {
        console.error('Error loading releases:', error);
        showError(`Failed to load ${currentCountry === 'us' ? 'US' : 'Indian'} movie releases. Please try again later.`);
    }
}

/**
 * Handle country button clicks
 */
function handleCountryChange(event) {
    const button = event.currentTarget;
    const country = button.getAttribute('data-country');
    
    if (country === currentCountry) return;
    
    // Update button states
    countryButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    
    currentCountry = country;
    
    // Load releases for selected country
    loadReleases();
}

/**
 * Initialize the app
 */
function init() {
    console.log('Initializing simple-app.js v4.0 (TOON format support)');
    
    // Add event listeners to country buttons
    countryButtons.forEach(button => {
        button.addEventListener('click', handleCountryChange);
    });
    
    // Load initial data
    loadReleases();
}

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
