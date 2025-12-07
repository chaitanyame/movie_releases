/**
 * OTT Weekly Releases - Main Application
 * Vanilla JavaScript ES6+ module
 */

'use strict';

// DOM Elements
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const currentWeekPost = document.getElementById('current-week-post');
const archiveNav = document.getElementById('archive-nav');
const archiveNavList = archiveNav ? archiveNav.querySelector('nav') : null;

// State
let currentArchiveIndex = null;
let activeWeekId = null;

/**
 * Show loading indicator
 */
function showLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
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

/**
 * Load current week's releases from JSON file
 * @returns {Promise<Object>} - The week's release data
 */
async function loadCurrentWeek() {
    try {
        showLoading();
        hideError();
        
        const response = await fetch('data/current-week.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status}`);
        }
        
        const data = await response.json();
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
 * Render a single release item
 * @param {Object} release - Release data object
 * @returns {string} - HTML string
 */
function renderRelease(release) {
    return `
        <div class="release-item">
            <h4 class="release-title">${release.title}</h4>
            <div class="release-meta">
                <span class="release-date">${release.release_date}</span>
                <span class="release-type">${release.type}</span>
                ${release.genre ? `<span class="release-genre">${release.genre}</span>` : ''}
            </div>
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
    
    return `
        <section class="platform-section" data-platform="${platform.id}">
            <h3 class="platform-title">${platform.name}</h3>
            <div class="platform-releases">
                ${releasesHtml || '<p class="no-releases">No releases this week</p>'}
            </div>
        </section>
    `;
}

/**
 * Render the complete post with all platforms
 * @param {Object} postData - Complete week's data
 * @returns {string} - HTML string
 */
function renderPost(postData) {
    const platformsHtml = postData.platforms.map(renderPlatform).join('');
    
    return `
        <header class="post-header">
            <h2 class="post-title">${postData.week_title}</h2>
            <p class="post-meta">
                <time datetime="${postData.week_start}">${postData.week_range}</time>
            </p>
        </header>
        <div class="post-content">
            ${platformsHtml}
        </div>
    `;
}

/**
 * Initialize the application
 */
async function init() {
    try {
        // Load current week data
        const data = await loadCurrentWeek();
        
        if (currentWeekPost && data) {
            currentWeekPost.innerHTML = renderPost(data);
            activeWeekId = data.week_id || 'current';
        }
        
        // Load archive navigation
        await loadArchiveIndex();
        
    } catch (error) {
        // Error already handled in loadCurrentWeek
        console.error('Initialization failed:', error);
    }
}

/**
 * Load archive index and render navigation
 * @returns {Promise<void>}
 */
async function loadArchiveIndex() {
    try {
        const response = await fetch('data/archive-index.json');
        
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
        loadArchivedWeek(weekId);
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
        
        const response = await fetch(`data/archive/${weekId}.json`);
        
        if (!response.ok) {
            throw new Error(`Archive not found: ${weekId}`);
        }
        
        const data = await response.json();
        
        if (currentWeekPost) {
            currentWeekPost.innerHTML = renderPost(data);
        }
        
        activeWeekId = weekId;
        updateActiveArchiveItem(weekId);
        
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

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
