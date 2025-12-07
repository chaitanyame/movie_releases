/**
 * OTT Weekly Releases - Main Application
 * Vanilla JavaScript ES6+ module with multi-country support
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

// State
let currentCountry = 'us';
let currentArchiveIndex = null;
let activeWeekId = null;
let currentWeekData = null;

/**
 * Detect user's country based on timezone
 * @returns {string} Country ID ('us' or 'india')
 */
function detectCountry() {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // Indian timezones
        if (timezone.includes('Kolkata') || timezone.includes('Asia/Calcutta')) {
            return 'india';
        }
        // Default to US
        return 'us';
    } catch (e) {
        return 'us';
    }
}

/**
 * Get saved country preference or detect
 * @returns {string} Country ID
 */
function getCountryPreference() {
    const saved = localStorage.getItem('ott-country');
    if (saved && COUNTRIES[saved]) {
        return saved;
    }
    return detectCountry();
}

/**
 * Save country preference
 * @param {string} countryId - Country ID to save
 */
function saveCountryPreference(countryId) {
    localStorage.setItem('ott-country', countryId);
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
            ? '/ott_news/data' 
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
 * Render a single release item
 * @param {Object} release - Release data object
 * @returns {string} - HTML string
 */
function renderRelease(release) {
    return `
        <div class="release-item">
            <div class="release-header">
                <h4 class="release-title">${release.title}</h4>
                ${release.language ? `<span class="release-language">${release.language}</span>` : ''}
            </div>
            <div class="release-meta">
                <span class="release-date">${release.release_date}</span>
                <span class="release-type">${release.type}</span>
                ${release.genre ? `<span class="release-genre">${release.genre}</span>` : ''}
                ${release.industry ? `<span class="release-industry">${release.industry}</span>` : ''}
                ${release.release_type ? `<span class="release-ott-type">${release.release_type}</span>` : ''}
            </div>
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
    const logoPath = `assets/images/logos/${platform.id}.webp`;
    const logoFallback = `assets/images/logos/${platform.id}.jpg`;
    const releaseCount = platform.releases.length;
    
    return `
        <section class="platform-section" data-platform="${platform.id}" aria-labelledby="platform-${platform.id}">
            <h3 class="platform-title" id="platform-${platform.id}">
                <picture>
                    <source srcset="${logoPath}" type="image/webp">
                    <img src="${logoFallback}" alt="${platform.name} logo" class="platform-logo" loading="lazy" width="24" height="24" onerror="this.style.display='none'">
                </picture>
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

/**
 * Initialize the application
 */
async function init() {
    try {
        // Get country preference (auto-detect or saved)
        currentCountry = getCountryPreference();
        updateCountryButtons(currentCountry);
        
        // Load current week data
        const data = await loadCurrentWeek(currentCountry);
        
        if (currentWeekPost && data) {
            renderCurrentWeek();
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
    
    // Clear hash to go to current week
    window.location.hash = '';
    
    try {
        // Load new country data
        await loadCurrentWeek(currentCountry);
        renderCurrentWeek();
        
        // Load archive for new country
        await loadArchiveIndex(currentCountry);
        
    } catch (error) {
        console.error('Error switching country:', error);
    }
}

/**
 * Load archive index and render navigation
 * @param {string} countryId - Country ID
 * @returns {Promise<void>}
 */
async function loadArchiveIndex(countryId) {
    try {
        const basePath = window.location.hostname.includes('github.io') 
            ? '/ott_news/data' 
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
            ? '/ott_news/data' 
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
function renderCurrentWeek() {
    if (!currentWeekData || !currentWeekPost) return;
    currentWeekPost.innerHTML = renderPost(currentWeekData);
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
        renderCurrentWeek();
    }
}

/**
 * Handle hashchange events
 */
function handleHashChange() {
    applyRouteFromHash();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
