/**
 * Simple Movie Releases App
 * Displays markdown content beautifully
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
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    if (releasesContent) {
        releasesContent.style.display = 'none';
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    if (releasesContent) {
        releasesContent.style.display = 'block';
    }
}

/**
 * Show error message
 */
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
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
 * Parse markdown into beautiful card-based HTML
 */
function parseMarkdown(markdown) {
    const lines = markdown.split('\n');
    let html = '';
    let currentLanguageCard = null;
    let currentMovie = null;
    let inMovieSection = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Main title (# header)
        if (line.startsWith('# ')) {
            html += `<h1 class="page-title">${line.substring(2)}</h1>`;
        }
        // Language/Category headers (## header)
        else if (line.startsWith('## ')) {
            // Close previous language card if exists
            if (currentLanguageCard) {
                html += '</div></div>'; // Close movies-grid and language-card
            }
            
            const categoryName = line.substring(3);
            currentLanguageCard = true;
            html += `
                <div class="language-card">
                    <h2 class="language-title">${categoryName}</h2>
                    <div class="movies-grid">`;
        }
        // Movie title (### header)
        else if (line.startsWith('### ')) {
            // Close previous movie card if exists
            if (currentMovie) {
                html += '</div>'; // Close movie-card
            }
            
            const movieTitle = line.substring(4);
            currentMovie = true;
            html += `<div class="movie-card"><h3 class="movie-title">${movieTitle}</h3>`;
        }
        // Movie details (bullet points)
        else if (line.startsWith('- **')) {
            const match = line.match(/- \*\*(.*?)\*\*:\s*(.*)/);
            if (match) {
                const [, label, value] = match;
                html += `<div class="movie-detail"><span class="detail-label">${label}:</span> <span class="detail-value">${value}</span></div>`;
            }
        }
        // Metadata lines (bold)
        else if (line.startsWith('**')) {
            html += `<p class="metadata">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
        }
        // Horizontal rule
        else if (line === '---') {
            html += '<hr class="section-divider">';
        }
        // Regular text
        else if (line && !line.startsWith('#')) {
            // Skip empty lines
        }
    }
    
    // Close any open tags
    if (currentMovie) {
        html += '</div>'; // Close last movie-card
    }
    if (currentLanguageCard) {
        html += '</div></div>'; // Close movies-grid and language-card
    }
    
    return html;
}

/**
 * Load and display releases for current country
 */
async function loadReleases() {
    showLoading();
    hideError();
    
    try {
        const filename = currentCountry === 'us' ? 'RELEASES-US.md' : 'RELEASES.md';
        const response = await fetch(filename);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch releases: ${response.status}`);
        }
        
        const markdown = await response.text();
        const html = parseMarkdown(markdown);
        
        if (releasesContent) {
            releasesContent.innerHTML = html;
        }
        
        hideLoading();
        
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
