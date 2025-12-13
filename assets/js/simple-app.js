/**
 * Simple Movie Releases App
 * Displays markdown content beautifully with card-based layout
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
 * Parse markdown and convert to beautiful card-based HTML
 * Groups movies by language/category with detailed movie cards
 */
function parseMarkdown(markdown) {
    const lines = markdown.split('\n');
    let html = '';
    let inCategory = false;
    let inMovie = false;
    let currentMovie = null;
    
    /**
     * Render a complete movie card with all details
     */
    function renderMovieCard() {
        if (!currentMovie) return '';
        
        const m = currentMovie;
        let cardHtml = `<article class="movie-card">`;
        
        // Movie header with title
        cardHtml += `<div class="movie-header">
            <h3 class="movie-title">${m.title}</h3>`;
        
        // Genre badges
        if (m.genre) {
            const genres = m.genre.split(',').map(g => g.trim());
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
        if (m.releaseDate) {
            cardHtml += `<div class="movie-info-row">
                <span class="info-icon">📅</span>
                <span class="info-text">${m.releaseDate}</span>
            </div>`;
        }
        
        // Cast (actors)
        if (m.cast) {
            cardHtml += `<div class="movie-info-row cast-row">
                <span class="info-icon">⭐</span>
                <span class="info-label">Cast:</span>
                <span class="info-text">${m.cast}</span>
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
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Main title
        if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
            const title = trimmed.substring(2);
            html += `<header class="releases-header"><h1 class="releases-title">${title}</h1></header>`;
        }
        // Metadata lines (Week, Last Updated, etc.)
        else if (trimmed.startsWith('**') && trimmed.includes(':') && !inMovie) {
            const content = trimmed.replace(/\*\*/g, '');
            html += `<p class="releases-meta">${content}</p>`;
        }
        // Horizontal rule
        else if (trimmed === '---') {
            if (inMovie) {
                html += renderMovieCard();
                currentMovie = null;
                inMovie = false;
            }
            if (inCategory) {
                html += '</div></section>';
                inCategory = false;
            }
        }
        // Category/Language header
        else if (trimmed.startsWith('## ')) {
            if (inMovie) {
                html += renderMovieCard();
                currentMovie = null;
                inMovie = false;
            }
            if (inCategory) {
                html += '</div></section>';
            }
            
            const categoryName = trimmed.substring(3);
            const icon = getCategoryIcon(categoryName);
            
            html += `<section class="language-section">
                <div class="language-header">
                    <span class="language-icon">${icon}</span>
                    <h2 class="language-title">${categoryName}</h2>
                </div>
                <div class="movies-grid">`;
            inCategory = true;
        }
        // Movie title
        else if (trimmed.startsWith('### ')) {
            if (inMovie) {
                html += renderMovieCard();
            }
            
            const movieTitle = trimmed.substring(4).replace(/^\d+\.\s*/, '');
            currentMovie = { title: movieTitle };
            inMovie = true;
        }
        // Movie details
        else if (trimmed.startsWith('- **') && currentMovie) {
            const match = trimmed.match(/- \*\*(.*?)\*\*:\s*(.*)/);
            if (match) {
                const label = match[1].toLowerCase();
                const value = match[2];
                
                if (label.includes('date')) {
                    currentMovie.releaseDate = value;
                } else if (label.includes('genre')) {
                    currentMovie.genre = value;
                } else if (label.includes('cast')) {
                    currentMovie.cast = value;
                } else if (label.includes('director')) {
                    currentMovie.director = value;
                } else if (label.includes('description') || label.includes('plot')) {
                    currentMovie.description = value;
                }
            }
        }
    }
    
    // Close open tags
    if (inMovie) {
        html += renderMovieCard();
    }
    if (inCategory) {
        html += '</div></section>';
    }
    
    return html;
}

/**
 * Load and display releases for current country
 */
async function loadReleases() {
    console.log('loadReleases called, country:', currentCountry);
    showLoading();
    hideError();
    
    try {
        const filename = currentCountry === 'us' ? 'RELEASES-US.md' : 'RELEASES.md';
        console.log('Fetching:', filename);
        
        const response = await fetch(filename);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch releases: ${response.status}`);
        }
        
        const markdown = await response.text();
        console.log('Markdown length:', markdown.length);
        
        const html = parseMarkdown(markdown);
        console.log('HTML length:', html.length);
        
        if (releasesContent) {
            releasesContent.innerHTML = html;
            console.log('Content injected successfully');
        }
        
        hideLoading();
        console.log('Loading hidden');
        
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
