/**
 * OTT Weekly Releases - Main Application
 * Vanilla JavaScript ES6+ module with multi-country support
 * Extended for theatrical movie releases
 */

'use strict';

// Country configurations
const COUNTRIES = {
    us: { id: 'us', name: 'United States', flag: '🇺🇸' },
    india: { id: 'india', name: 'India', flag: '🇮🇳' }
};

// DOM Elements
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const currentWeekPost = document.getElementById('current-week-post');
const archiveNav = document.getElementById('archive-nav');
const archiveNavList = archiveNav ? archiveNav.querySelector('nav') : null;
const backToCurrentButton = document.getElementById('back-to-current');
const mainContent = document.querySelector('.main-content');
const countryButtons = document.querySelectorAll('.country-btn');
const weekButtons = document.querySelectorAll('.week-btn');
const activeWeekTitle = document.getElementById('active-week-title');

// State
let currentCountry = 'us';
let currentArchiveIndex = null;
let activeWeekId = null;
let currentWeekData = null;
let currentWeekType = 'current-week'; // Track active week (last-week, current-week, next-week)
let weekDataCache = {}; // Cache for week data to avoid refetching

// ============================================================================
// Feature 19: Country Detection
// ============================================================================

/**
 * Detect user's country based on timezone
 * Feature 19: Auto-detect user region from timezone
 * @returns {string} Country ID ('us' or 'india')
 */
function detectUserCountry() {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Indian timezones
        if (timezone.includes('Kolkata') || 
            timezone.includes('Asia/Calcutta') ||
            timezone.includes('India')) {
            return 'india';
        }
        
        // US timezones
        if (timezone.includes('America/') || 
            timezone.includes('US/') ||
            timezone.includes('Pacific') ||
            timezone.includes('Mountain') ||
            timezone.includes('Central') ||
            timezone.includes('Eastern')) {
            return 'us';
        }
        
        // Default to US
        return 'us';
    } catch (e) {
        console.error('Error detecting timezone:', e);
        return 'us';
    }
}

/**
 * Detect user's country based on timezone (legacy name)
 * @returns {string} Country ID ('us' or 'india')
 */
function detectCountry() {
    return detectUserCountry();
}

/**
 * Get saved country preference or detect
 * @returns {string} Country ID
 */
function getCountryPreference() {
    // Check localStorage first
    const saved = localStorage.getItem('movie-country');
    if (saved && COUNTRIES[saved]) {
        return saved;
    }
    
    // Fall back to detection
    return detectUserCountry();
}

/**
 * Save country preference
 * @param {string} countryId - Country ID to save
 */
function saveCountryPreference(countryId) {
    localStorage.setItem('movie-country', countryId);
}

// ============================================================================
// Feature 20: Data Loading for Theatrical Releases
// ============================================================================

/**
 * Load week data for theatrical movie releases
 * Feature 20: Fetch and display current week theatrical releases
 * 
 * @param {string} country - Country ID ('us' or 'india')
 * @param {string} weekType - Week type ('current-week', 'last-week', 'next-week')
 * @returns {Promise<Object>} - The week's release data
 */
async function loadWeekData(country, weekType = 'current-week') {
    // Check cache first
    const cacheKey = `${country}-${weekType}`;
    if (weekDataCache[cacheKey]) {
        console.log(`Using cached data for ${cacheKey}`);
        return weekDataCache[cacheKey];
    }
    
    try {
        showLoading();
        hideError();
        
        // Use absolute path for GitHub Pages, relative for local
        const basePath = window.location.hostname.includes('github.io') 
            ? '/movie_releases/data' 
            : 'data';
        
        const url = `${basePath}/${country}/${weekType}.json`;
        console.log(`Fetching data from: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache the data
        weekDataCache[cacheKey] = data;
        
        console.log(`Loaded ${weekType} data for ${country}:`, data);
        
        // Render the movie releases
        await renderMovieReleases(data);
        
        return data;
        
    } catch (error) {
        console.error(`Error loading ${weekType} for ${country}:`, error);
        showError(`Unable to load ${weekType} releases. Please try again later.`);
        throw error;
    } finally {
        hideLoading();
    }
}

// ============================================================================
// Feature 21 & 22: Movie Release Rendering
// ============================================================================

/**
 * Render movie releases organized by category
 * Feature 21 & 22: Display movie cards organized by distribution categories
 * 
 * @param {Object} data - Week data object with categories
 * @returns {Promise<void>}
 */
async function renderMovieReleases(data) {
    if (!currentWeekPost) {
        console.error('currentWeekPost element not found');
        return;
    }
    
    // Update week title
    updateWeekTitle(data);
    
    // Clear existing content
    currentWeekPost.innerHTML = '';
    
    // Check if we have categories
    if (!data.categories || data.categories.length === 0) {
        currentWeekPost.innerHTML = '<p class="no-releases">No theatrical releases found for this week.</p>';
        return;
    }
    
    // Render each category
    data.categories.forEach(category => {
        const categoryElement = renderCategory(category);
        currentWeekPost.appendChild(categoryElement);
    });
    
    console.log('Movie releases rendered successfully');
}

/**
 * Update week title display
 * @param {Object} data - Week data object
 */
function updateWeekTitle(data) {
    if (!activeWeekTitle) return;
    
    // Format: "Week 50: December 9-15, 2025"
    const weekNum = data.week_number ? data.week_number.split('-')[1] : '??';
    const startDate = new Date(data.week_start);
    const endDate = new Date(data.week_end);
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[startDate.getMonth()];
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = startDate.getFullYear();
    
    activeWeekTitle.textContent = `Week ${weekNum}: ${month} ${startDay}-${endDay}, ${year}`;
}

/**
 * Render a single category section
 * Feature 22: Display category with header and movies
 * 
 * @param {Object} category - Category object with category_id, category_name, movies
 * @returns {HTMLElement} - Category section element
 */
function renderCategory(category) {
    const section = document.createElement('section');
    section.className = 'movie-category';
    section.setAttribute('data-category', category.id);
    
    // Category header
    const header = document.createElement('h3');
    header.className = 'category-header';
    const movieCount = category.movies ? category.movies.length : 0;
    header.textContent = `${category.name} (${movieCount} ${movieCount === 1 ? 'movie' : 'movies'})`;
    section.appendChild(header);
    
    // Movies container
    const moviesContainer = document.createElement('div');
    moviesContainer.className = 'movies-grid';
    
    if (category.movies && category.movies.length > 0) {
        const isUpcoming = currentWeekType === 'next-week';
        category.movies.forEach(movie => {
            const movieCard = renderMovieCard(movie, isUpcoming);
            moviesContainer.appendChild(movieCard);
        });
    } else {
        const noMovies = document.createElement('p');
        noMovies.className = 'no-movies';
        noMovies.textContent = 'No releases in this category for this week.';
        moviesContainer.appendChild(noMovies);
    }
    
    section.appendChild(moviesContainer);
    return section;
}

/**
 * Render upcoming badge for next week movies
 * Feature 44: Visual indicator for upcoming releases
 * 
 * @returns {HTMLElement} - Badge element
 */
function renderUpcomingBadge() {
    const badge = document.createElement('span');
    badge.className = 'upcoming-badge';
    badge.textContent = '🎬 Upcoming';
    badge.setAttribute('aria-label', 'Upcoming release');
    return badge;
}

/**
 * Render a single movie card
 * Feature 21: Display individual movie information
 * Feature 44: Add upcoming badge for next week
 * 
 * @param {Object} movie - Movie object with title, release_date, genre, cast, etc.
 * @param {boolean} isUpcoming - Whether to show upcoming badge
 * @returns {HTMLElement} - Movie card element
 */
function renderMovieCard(movie, isUpcoming = false) {
    const card = document.createElement('article');
    card.className = 'movie-card';
    
    // Add upcoming badge if this is next week
    if (isUpcoming) {
        const badge = renderUpcomingBadge();
        card.appendChild(badge);
    }
    
    // Movie title
    const title = document.createElement('h4');
    title.className = 'movie-title';
    title.textContent = movie.title;
    card.appendChild(title);
    
    // Release date
    const releaseDate = document.createElement('div');
    releaseDate.className = 'release-date';
    // Show raw YYYY-MM-DD format per test requirements
    releaseDate.textContent = movie.release_date;
    card.appendChild(releaseDate);
    
    // Genre
    if (movie.genre) {
        const genre = document.createElement('div');
        genre.className = 'genres';
        genre.innerHTML = `<span class="genre-tag">${movie.genre}</span>`;
        card.appendChild(genre);
    }
    
    // Language (for India releases)
    if (movie.language) {
        const language = document.createElement('div');
        language.className = 'language-info';
        language.innerHTML = `<span class="language-badge" data-language="${movie.language}">${movie.language}</span>`;
        
        // Additional languages for multi-language releases
        if (movie.additional_languages && movie.additional_languages.length > 0) {
            movie.additional_languages.forEach(lang => {
                language.innerHTML += ` <span class="language-badge" data-language="${lang}">${lang}</span>`;
            });
        }
        
        card.appendChild(language);
    }
    
    // Rating (for US releases)
    if (movie.rating) {
        const rating = document.createElement('div');
        rating.className = 'rating';
        rating.textContent = `Rated: ${movie.rating}`;
        card.appendChild(rating);
    }
    
    // Cast
    if (movie.cast && movie.cast.length > 0) {
        const cast = document.createElement('div');
        cast.className = 'cast';
        cast.innerHTML = '<strong>Cast:</strong> ' + movie.cast.slice(0, 4).join(', ');
        card.appendChild(cast);
    }
    
    // Director
    if (movie.director) {
        const director = document.createElement('div');
        director.className = 'director';
        director.innerHTML = `<strong>Director:</strong> ${movie.director}`;
        card.appendChild(director);
    }
    
    // Studio/Production
    if (movie.studio) {
        const studio = document.createElement('div');
        studio.className = 'studio';
        studio.textContent = movie.studio;
        card.appendChild(studio);
    }
    
    if (movie.production) {
        const production = document.createElement('div');
        production.className = 'production';
        production.textContent = movie.production;
        card.appendChild(production);
    }
    
    // Theater count (for US releases)
    if (movie.theater_count) {
        const theaterCount = document.createElement('div');
        theaterCount.className = 'theater-count';
        theaterCount.textContent = `Theaters: ${movie.theater_count}`;
        card.appendChild(theaterCount);
    }
    
    // Description
    if (movie.description) {
        const description = document.createElement('p');
        description.className = 'movie-description';
        description.textContent = movie.description;
        card.appendChild(description);
    }
    
    return card;
}

/**
 * Get saved country preference or detect
 * @returns {string} Country ID
 */
function getCountryPreference() {
    // Check localStorage first
    const saved = localStorage.getItem('movie-country');
    if (saved && COUNTRIES[saved]) {
        return saved;
    }
    
    // Fall back to detection
    return detectUserCountry();
}

/**
 * Save country preference
 * @param {string} countryId - Country ID to save
 */
function saveCountryPreference(countryId) {
    localStorage.setItem('movie-country', countryId);
}

/**
 * Update country button states
 * @param {string} activeCountry - Active country ID
 */
function updateCountryButtons(activeCountry) {
    countryButtons.forEach(btn => {
        const isActive = btn.dataset.country === activeCountry;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive.toString());
        if (isActive) {
            btn.setAttribute('aria-current', 'page');
        } else {
            btn.removeAttribute('aria-current');
        }
    });
}

/**
 * Show loading indicator
 */
function showLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    if (mainContent) {
        mainContent.setAttribute('aria-busy', 'true');
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    if (mainContent) {
        mainContent.setAttribute('aria-busy', 'false');
    }
}

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

/**
 * Hide error message
 */
function hideError() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

function showBackToCurrent() {
    if (backToCurrentButton) {
        backToCurrentButton.style.display = 'inline-flex';
    }
}

function hideBackToCurrent() {
    if (backToCurrentButton) {
        backToCurrentButton.style.display = 'none';
    }
}

/**
 * Load current week's releases from JSON file
 * @param {string} countryId - Country ID to load
 * @returns {Promise<Object>} - The week's release data
 */
async function loadCurrentWeek(countryId) {
    try {
        showLoading();
        hideError();
        
        // Use absolute path from repository root for GitHub Pages
        const basePath = window.location.hostname.includes('github.io') 
            ? '/movie_releases/data' 
            : 'data';
        const response = await fetch(`${basePath}/${countryId}/current-week.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status}`);
        }
        
        const data = await response.json();
        currentWeekData = data;
        return data;
    } catch (error) {
        console.error('Error loading current week:', error);
        showError('Unable to load releases. Please try again later.');
        throw error;
    } finally {
        hideLoading();
    }
}

/**
 * Render actors as tags
 * @param {Array} actors - Array of actor names
 * @returns {string} - HTML string
 */
function renderActors(actors) {
    if (!actors || actors.length === 0) return '';
    
    const actorTags = actors.slice(0, 4).map(actor => 
        `<span class="actor-tag">${actor}</span>`
    ).join('');
    
    return `<div class="release-actors">${actorTags}</div>`;
}

/**
 * Check if a movie is new (added in last 48 hours)
 * @param {Object} release - Release data object
 * @returns {boolean} - True if movie is new
 */
function isNewRelease(release) {
    if (release.is_new === true) return true;
    if (!release.first_seen) return false;
    
    const firstSeen = new Date(release.first_seen);
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
    return firstSeen > cutoff;
}

/**
 * Render a single release item
 * @param {Object} release - Release data object
 * @returns {string} - HTML string
 */
function renderRelease(release) {
    const isNew = isNewRelease(release);
    const newBadge = isNew ? '<span class="release-new-badge">NEW</span>' : '';
    
    return `
        <div class="release-item ${isNew ? 'release-item--new' : ''}">
            <div class="release-header">
                <h4 class="release-title">${release.title}</h4>
                ${newBadge}
                ${release.language ? `<span class="release-language">${release.language}</span>` : ''}
            </div>
            <div class="release-meta">
                <span class="release-date">${release.release_date}</span>
                <span class="release-type">${release.type}</span>
                ${release.genre ? `<span class="release-genre">${release.genre}</span>` : ''}
                ${release.industry ? `<span class="release-industry">${release.industry}</span>` : ''}
                ${release.content_category ? `<span class="release-category">${release.content_category}</span>` : ''}
                ${release.release_type ? `<span class="release-ott-type">${release.release_type}</span>` : ''}
            </div>
            ${release.theatrical_info ? `<div class="release-theatrical"><span class="theatrical-label">🎬 Theatrical:</span> ${release.theatrical_info}</div>` : ''}
            ${release.dubbing ? `<div class="release-dubbing"><span class="dubbing-label">🌐 Available in:</span> ${release.dubbing}</div>` : ''}
            ${renderActors(release.actors)}
            ${release.description ? `<p class="release-description">${release.description}</p>` : ''}
        </div>
    `;
}

/**
 * Render a platform section with its releases
 * @param {Object} platform - Platform data object
 * @returns {string} - HTML string
 */
function renderPlatform(platform) {
    const releasesHtml = platform.releases.map(renderRelease).join('');
    const logoPath = `assets/images/logos/${platform.id}.svg`;
    const releaseCount = platform.releases.length;
    
    return `
        <section class="platform-section" data-platform="${platform.id}" aria-labelledby="platform-${platform.id}">
            <h3 class="platform-title" id="platform-${platform.id}">
                <img src="${logoPath}" alt="${platform.name} logo" class="platform-logo" loading="lazy" width="36" height="36" onerror="this.style.display='none'">
                ${platform.name}
                <span class="platform-count">${releaseCount}</span>
            </h3>
            <div class="platform-releases">
                ${releasesHtml || '<p class="no-releases">No releases this week</p>'}
            </div>
        </section>
    `;
}

/**
 * Format a timestamp for display using user's locale
 * @param {string} isoString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatLastUpdated(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    } catch {
        return isoString;
    }
}

/**
 * Render the complete post with all platforms
 * @param {Object} postData - Complete week's data
 * @returns {string} - HTML string
 */
function renderPost(postData) {
    const platformsHtml = postData.platforms.map(renderPlatform).join('');
    const lastUpdated = postData.generated_at ? formatLastUpdated(postData.generated_at) : '';
    const countryInfo = postData.country || COUNTRIES[currentCountry];
    
    // Calculate total releases
    const totalReleases = postData.platforms.reduce((sum, p) => sum + (p.releases?.length || 0), 0);
    
    return `
        <header class="post-header">
            <div class="post-country-badge">
                <span class="country-flag-large">${countryInfo.flag}</span>
                <span class="country-name-label">${countryInfo.name}</span>
            </div>
            <h2 class="post-title">${postData.week_title}</h2>
            <p class="post-meta">
                <time datetime="${postData.week_start}">${postData.week_range}</time>
                <span class="total-releases">${totalReleases} new releases</span>
            </p>
        </header>
        <div class="post-content">
            ${platformsHtml}
        </div>
        ${lastUpdated ? `<footer class="post-footer"><p class="last-updated">Last updated: <time datetime="${postData.generated_at}">${lastUpdated}</time></p></footer>` : ''}
    `;
}

// ============================================================================
// Feature 61-65: Hash Router (URL Routing)
// ============================================================================

/**
 * Parse hash parameters from URL
 * Feature 64: Extract route info from window.location.hash
 * Format: #weekType/country (e.g., #current/us, #last-week/india)
 * @returns {Object} Parsed parameters { weekType, country, wasValid }
 */
function parseHashParams() {
    const hash = window.location.hash.slice(1); // Remove '#'
    
    if (!hash) {
        return { weekType: 'current', country: currentCountry, wasValid: true };
    }
    
    const parts = hash.split('/');
    const weekType = parts[0] || 'current';
    const country = parts[1] || currentCountry;
    
    // Validate week type
    const validWeekTypes = ['current', 'last-week', 'next-week'];
    const weekTypeValid = validWeekTypes.includes(weekType);
    
    // Validate country
    const countryValid = COUNTRIES[country] !== undefined;
    
    const wasValid = weekTypeValid && countryValid;
    
    return { 
        weekType: weekTypeValid ? weekType : 'current',
        country: countryValid ? country : currentCountry,
        wasValid
    };
}

/**
 * Update URL hash without triggering hashchange event
 * Feature 63: Sync URL with state
 * @param {string} weekType - Week type (current, last-week, next-week)
 * @param {string} country - Country ID
 */
function updateUrlHash(weekType, country) {
    const newHash = `#${weekType}/${country}`;
    
    // Only update if different to prevent infinite loop
    if (window.location.hash !== newHash) {
        window.location.hash = newHash;
    }
}

/**
 * Handle invalid hash by redirecting to default
 * Feature 65: Error handling for invalid hashes
 * @param {string} reason - Reason for invalid hash
 */
function handleInvalidHash(reason) {
    console.warn(`Invalid hash: ${reason}. Redirecting to default.`);
    updateUrlHash('current', currentCountry);
}

/**
 * Apply route from current hash
 * Feature 61: Initialize router and load from hash
 */
async function applyRouteFromHash() {
    const { weekType, country, wasValid } = parseHashParams();
    
    // If hash was invalid, redirect to default
    if (!wasValid) {
        handleInvalidHash('Invalid week type or country');
        return;
    }
    
    let needsDataReload = false;
    
    // Update country if different
    if (country !== currentCountry) {
        currentCountry = country;
        saveCountryPreference(country);
        updateCountryButtons(country);
        needsDataReload = true;
    }
    
    // Map weekType to currentWeekType format
    const weekTypeMap = {
        'current': 'current-week',
        'last-week': 'last-week',
        'next-week': 'next-week'
    };
    
    const mappedWeekType = weekTypeMap[weekType] || 'current-week';
    
    // Check if week type changed
    if (mappedWeekType !== currentWeekType) {
        currentWeekType = mappedWeekType;
        needsDataReload = true;
    }
    
    // Load data if country or week changed
    if (needsDataReload) {
        await loadWeekData(country, mappedWeekType);
        
        // Update UI
        const weekButtonId = {
            'current-week': 'current',
            'last-week': 'last',
            'next-week': 'next'
        }[mappedWeekType];
        
        updateWeekButtons(weekButtonId);
        
        if (currentWeekData) {
            await renderCurrentWeek();
            updateActiveWeekTitle(currentWeekData);
        }
    }
}

/**
 * Handle hash change events
 * Feature 62: Hash change listener
 */
async function handleHashChange() {
    await applyRouteFromHash();
}

/**
 * Initialize the application
 */
async function init() {
    try {
        // Get country preference (auto-detect or saved)
        currentCountry = getCountryPreference();
        updateCountryButtons(currentCountry);
        
        // Set default hash if none provided
        if (!window.location.hash) {
            updateUrlHash('current', currentCountry);
        }
        
        // Load current week data
        const data = await loadCurrentWeek(currentCountry);
        
        if (currentWeekPost && data) {
            await renderCurrentWeek();
            updateWeekButtons('current'); // Set initial week button state
            updateActiveWeekTitle(data); // Set initial week title
        }
        
        // Load archive navigation
        await loadArchiveIndex(currentCountry);

        // Apply initial route from hash after nav is ready
        await applyRouteFromHash();
        window.addEventListener('hashchange', handleHashChange);

        // Set up country toggle handlers
        countryButtons.forEach(btn => {
            btn.addEventListener('click', handleCountryChange);
        });

        // Set up week navigation handlers
        weekButtons.forEach(btn => {
            btn.addEventListener('click', handleWeekChange);
        });

        if (backToCurrentButton) {
            backToCurrentButton.addEventListener('click', () => {
                window.location.hash = '#current';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
    } catch (error) {
        // Error already handled in loadCurrentWeek
        console.error('Initialization failed:', error);
    }
}

/**
 * Handle country change
 * @param {Event} event - Click event
 */
async function handleCountryChange(event) {
    const newCountry = event.currentTarget.dataset.country;
    
    if (newCountry === currentCountry) return;
    
    currentCountry = newCountry;
    saveCountryPreference(newCountry);
    updateCountryButtons(newCountry);
    
    // Update hash with new country (keep current week type)
    const weekType = {
        'current-week': 'current',
        'last-week': 'last-week',
        'next-week': 'next-week'
    }[currentWeekType] || 'current';
    
    updateUrlHash(weekType, newCountry);
    
    try {
        // Load new country data
        await loadCurrentWeek(currentCountry);
        await renderCurrentWeek();
        
        // Load archive for new country
        await loadArchiveIndex(currentCountry);
        
    } catch (error) {
        console.error('Error switching country:', error);
    }
}

/**
 * Handle week navigation change
 * Feature 26-36: Week navigation between last/current/next
 * @param {Event} event - Click event
 */
async function handleWeekChange(event) {
    const weekId = event.currentTarget.dataset.week; // 'last', 'current', 'next'
    const newWeekType = `${weekId}-week`; // 'last-week', 'current-week', 'next-week'
    
    if (newWeekType === currentWeekType) return;
    
    currentWeekType = newWeekType;
    updateWeekButtons(weekId);
    
    // Update URL hash with new week type
    const weekTypeForHash = weekId === 'current' ? 'current' : newWeekType;
    updateUrlHash(weekTypeForHash, currentCountry);
    
    try {
        // Load week data
        const data = await loadWeekData(currentCountry, newWeekType);
        
        if (data) {
            currentWeekData = data;
            await renderCurrentWeek();
            updateActiveWeekTitle(data);
        }
        
    } catch (error) {
        console.error('Error switching week:', error);
    }
}

/**
 * Update active week button state
 * @param {string} weekId - Active week ID ('last', 'current', 'next')
 */
function updateWeekButtons(weekId) {
    weekButtons.forEach(btn => {
        const btnWeekId = btn.dataset.week;
        const isActive = btnWeekId === weekId;
        
        if (isActive) {
            btn.classList.add('active');
            btn.setAttribute('aria-current', 'true');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.removeAttribute('aria-current');
            btn.setAttribute('aria-pressed', 'false');
        }
    });
}

/**
 * Update active week title display
 * @param {Object} data - Week data
 */
function updateActiveWeekTitle(data) {
    if (!activeWeekTitle || !data) return;
    
    const startDate = new Date(data.week_start);
    const endDate = new Date(data.week_end);
    
    // Format: "Week XX: Month DD-DD, YYYY"
    const weekNum = data.week_number.split('-')[1]; // Get week number from "YYYY-WW"
    const month = startDate.toLocaleDateString('en-US', { month: 'long' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = endDate.getFullYear();
    
    activeWeekTitle.textContent = `Week ${weekNum}: ${month} ${startDay}-${endDay}, ${year}`;
}

/**
 * Load archive index and render navigation
 * @param {string} countryId - Country ID
 * @returns {Promise<void>}
 */
async function loadArchiveIndex(countryId) {
    try {
        const basePath = window.location.hostname.includes('github.io') 
            ? '/movie_releases/data' 
            : 'data';
        const response = await fetch(`${basePath}/${countryId}/archive-index.json`);
        
        if (!response.ok) {
            console.warn('Archive index not found');
            return;
        }
        
        currentArchiveIndex = await response.json();
        renderArchiveNav(currentArchiveIndex);
        
    } catch (error) {
        console.warn('Error loading archive index:', error);
    }
}

/**
 * Render archive navigation list
 * @param {Object} archiveIndex - Archive index data
 */
function renderArchiveNav(archiveIndex) {
    if (!archiveNavList || !archiveIndex.archives) {
        return;
    }
    
    if (archiveIndex.archives.length === 0) {
        archiveNavList.innerHTML = '<p class="no-archives">No archived weeks yet</p>';
        return;
    }
    
    const itemsHtml = archiveIndex.archives.map(archive => {
        const isActive = archive.weekId === activeWeekId;
        return `
            <button 
                class="archive-item${isActive ? ' active' : ''}" 
                data-week-id="${archive.weekId}"
                aria-label="View ${archive.weekTitle}"
            >
                ${archive.weekTitle}
            </button>
        `;
    }).join('');
    
    archiveNavList.innerHTML = itemsHtml;
    
    // Add click handlers
    archiveNavList.querySelectorAll('.archive-item').forEach(item => {
        item.addEventListener('click', handleArchiveClick);
    });
}

/**
 * Handle click on archive item
 * @param {Event} event - Click event
 */
function handleArchiveClick(event) {
    const weekId = event.currentTarget.getAttribute('data-week-id');
    if (weekId) {
        const targetHash = `#archive/${weekId}`;
        if (window.location.hash === targetHash) {
            applyRouteFromHash();
        } else {
            window.location.hash = targetHash;
        }
    }
}

/**
 * Load and display an archived week
 * @param {string} weekId - Week ID in YYYY-WW format
 */
async function loadArchivedWeek(weekId) {
    try {
        showLoading();
        hideError();
        
        const basePath = window.location.hostname.includes('github.io') 
            ? '/movie_releases/data' 
            : 'data';
        const response = await fetch(`${basePath}/${currentCountry}/archive/${weekId}.json`);
        
        if (!response.ok) {
            throw new Error(`Archive not found: ${weekId}`);
        }
        
        const data = await response.json();
        
        if (currentWeekPost) {
            currentWeekPost.innerHTML = renderPost(data);
        }
        
        activeWeekId = weekId;
        updateActiveArchiveItem(weekId);
        showBackToCurrent();
        
    } catch (error) {
        console.error('Error loading archived week:', error);
        showError(`Unable to load archive for ${weekId}`);
    } finally {
        hideLoading();
    }
}

/**
 * Update the active state in archive navigation
 * @param {string} weekId - Active week ID
 */
function updateActiveArchiveItem(weekId) {
    if (!archiveNavList) return;
    
    archiveNavList.querySelectorAll('.archive-item').forEach(item => {
        if (item.getAttribute('data-week-id') === weekId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Render the current week post using cached data
 */
async function renderCurrentWeek() {
    if (!currentWeekData || !currentWeekPost) return;
    await renderMovieReleases(currentWeekData);
    activeWeekId = currentWeekData.week_id || 'current';
    updateActiveArchiveItem(activeWeekId);
    hideBackToCurrent();
}

/**
 * Parse the current URL hash and return a routing object
 * @returns {{type: 'current'|'archive', weekId?: string}}
 */
function getRouteFromHash() {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash || hash === 'current') {
        return { type: 'current' };
    }
    if (hash.startsWith('archive/')) {
        const parts = hash.split('/');
        const weekId = parts[1];
        if (weekId) {
            return { type: 'archive', weekId };
        }
    }
    return { type: 'current' };
}

/**
 * Apply routing based on the current hash
 */
async function applyRouteFromHash() {
    const route = getRouteFromHash();
    if (route.type === 'archive' && route.weekId) {
        await loadArchivedWeek(route.weekId);
    } else {
        await renderCurrentWeek();
    }
}

/**
 * Handle hashchange events
 */
async function handleHashChange() {
    await applyRouteFromHash();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
