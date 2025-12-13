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
 * Parse markdown to HTML (basic implementation)
 */
function parseMarkdown(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    
    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr>');
    
    // Lists
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><h/g, '<h');
    html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
    html = html.replace(/<p><hr><\/p>/g, '<hr>');
    html = html.replace(/<p><ul>/g, '<ul>');
    html = html.replace(/<\/ul><\/p>/g, '</ul>');
    
    return html;
}

/**
 * Load and display releases for current country
 */
async function loadReleases() {
    showLoading();
    hideError();
    
    try {
        const response = await fetch('RELEASES.md');
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
        showError('Failed to load movie releases. Please try again later.');
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
    
    // For now, we only have India data
    if (country === 'us') {
        showError('US releases coming soon!');
    } else {
        loadReleases();
    }
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
