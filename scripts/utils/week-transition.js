/**
 * Week Transition Logic - Three-Week Sliding Window
 * 
 * Handles the three-week sliding window model (last/current/next).
 * On Monday at 00:00 UTC, performs rotation:
 *   next-week.json → current-week.json → last-week.json → archive/YYYY-WW.json
 * 
 * @module scripts/utils/week-transition
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  getWeekId,
  getWeekTitle,
  isNewWeek,
  getWeekDateRange,
  formatDate,
  getPreviousWeekInfo,
  getCurrentWeekInfo,
  getNextWeekInfo
} = require('./date-utils');

/**
 * Get file paths for a country's week files.
 * 
 * @param {string} country - Country code ('us' or 'india')
 * @returns {{last: string, current: string, next: string, archiveDir: string}}
 */
function getCountryPaths(country) {
  const baseDir = `data/${country}`;
  return {
    last: `${baseDir}/last-week.json`,
    current: `${baseDir}/current-week.json`,
    next: `${baseDir}/next-week.json`,
    archiveDir: `${baseDir}/archive`
  };
}

/**
 * Get the archive file path for a given week ID and country.
 * 
 * @param {string} country - Country code ('us' or 'india')
 * @param {string} weekId - Week ID in YYYY-WW format
 * @returns {string} Path to archive file
 */
function getArchivePath(country, weekId) {
  const { archiveDir } = getCountryPaths(country);
  return `${archiveDir}/${weekId}.json`;
}

/**
 * Check if week transition should occur.
 * Returns true if:
 * - Current date is Monday (new week)
 * - current-week.json exists and has data from a previous week
 * 
 * @param {Date} currentDate - The current date to check
 * @param {string} country - Country code ('us' or 'india')
 * @returns {boolean} True if transition should occur
 */
function shouldTransition(currentDate, country) {
  // Only transition on Mondays
  if (!isNewWeek(currentDate)) {
    return false;
  }

  const { current } = getCountryPaths(country);

  // Check if current week file exists
  if (!fs.existsSync(current)) {
    return false;
  }

  // Read current week file and check week_id
  const fileContent = fs.readFileSync(current, 'utf8');
  const currentWeekData = JSON.parse(fileContent);

  // If no week_id, transition needed
  if (!currentWeekData.week_id) {
    return true;
  }

  // Check if file week_id is different from current week
  const currentWeekId = getWeekId(currentDate);
  return currentWeekData.week_id !== currentWeekId;
}

/**
 * Perform three-week sliding window transition for a country.
 * Rotation: next → current → last → archive
 * 
 * @param {Date} transitionDate - The date when transition occurs (typically Monday)
 * @param {string} country - Country code ('us' or 'india')
 * @returns {{transitioned: boolean, archivedWeek?: string, newCurrentWeek?: string, newNextWeek?: string, reason?: string}}
 */
function transitionWeeks(transitionDate, country) {
  const paths = getCountryPaths(country);
  const currentWeekId = getWeekId(transitionDate);

  // Check if current-week.json exists and needs transition
  if (fs.existsSync(paths.current)) {
    const currentData = JSON.parse(fs.readFileSync(paths.current, 'utf8'));
    
    // If already on current week, no transition needed
    if (currentData.week_id === currentWeekId) {
      return { transitioned: false, reason: 'already_current_week' };
    }
  }

  // STEP 1: Archive last-week.json if it exists
  let archivedWeekId = null;
  if (fs.existsSync(paths.last)) {
    const lastWeekData = JSON.parse(fs.readFileSync(paths.last, 'utf8'));
    if (lastWeekData.week_id) {
      const archivePath = getArchivePath(country, lastWeekData.week_id);
      
      // Ensure archive directory exists
      if (!fs.existsSync(paths.archiveDir)) {
        fs.mkdirSync(paths.archiveDir, { recursive: true });
      }
      
      // Only archive if not already archived
      if (!fs.existsSync(archivePath)) {
        fs.writeFileSync(archivePath, JSON.stringify(lastWeekData, null, 2));
        archivedWeekId = lastWeekData.week_id;
      }
    }
  }

  // STEP 2: Move current-week.json → last-week.json
  if (fs.existsSync(paths.current)) {
    const currentData = fs.readFileSync(paths.current, 'utf8');
    fs.writeFileSync(paths.last, currentData);
  }

  // STEP 3: Move next-week.json → current-week.json
  if (fs.existsSync(paths.next)) {
    const nextData = fs.readFileSync(paths.next, 'utf8');
    fs.writeFileSync(paths.current, nextData);
  }

  // STEP 4: Create new next-week.json with empty structure
  const nextWeekInfo = getNextWeekInfo(transitionDate);
  const newNextWeekData = createEmptyWeekStructure(nextWeekInfo, country, 'next-week');
  fs.writeFileSync(paths.next, JSON.stringify(newNextWeekData, null, 2));

  return {
    transitioned: true,
    archivedWeek: archivedWeekId,
    newCurrentWeek: currentWeekId,
    newNextWeek: nextWeekInfo.week_id
  };
}

/**
 * Create empty week structure with metadata.
 * 
 * @param {{week_id: string, week_start: string, week_end: string, week_range: string, week_number: number, year: number, week_title: string}} weekInfo - Week metadata from date-utils
 * @param {string} country - Country code ('us' or 'india')
 * @param {string} weekType - Type of week ('last-week', 'current-week', 'next-week')
 * @returns {Object} Empty week data structure
 */
function createEmptyWeekStructure(weekInfo, country, weekType) {
  // Country metadata
  const countryData = {
    us: { id: 'us', name: 'United States', flag: '🇺🇸' },
    india: { id: 'india', name: 'India', flag: '🇮🇳' }
  };

  // Distribution categories per country
  const categories = {
    us: [
      { category_id: 'wide-release', category_name: 'Wide Release', releases: [] },
      { category_id: 'limited-release', category_name: 'Limited Release', releases: [] }
    ],
    india: [
      { category_id: 'bollywood-hindi', category_name: 'Bollywood (Hindi)', releases: [] },
      { category_id: 'regional-tamil', category_name: 'Regional (Tamil)', releases: [] },
      { category_id: 'regional-telugu', category_name: 'Regional (Telugu)', releases: [] },
      { category_id: 'regional-other', category_name: 'Regional (Other)', releases: [] }
    ]
  };

  return {
    week_number: weekInfo.week_number,
    year: weekInfo.year,
    week_id: weekInfo.week_id,
    week_start: weekInfo.week_start,
    week_end: weekInfo.week_end,
    week_range: weekInfo.week_range,
    week_title: weekInfo.week_title,
    week_type: weekType,
    country: countryData[country],
    generated_at: new Date().toISOString(),
    distribution_categories: categories[country]
  };
}

/**
 * Initialize all three week files for a country if they don't exist.
 * 
 * @param {Date} referenceDate - Reference date (typically now)
 * @param {string} country - Country code ('us' or 'india')
 */
function initializeWeekFiles(referenceDate, country) {
  const paths = getCountryPaths(country);
  
  // Create last-week.json if missing
  if (!fs.existsSync(paths.last)) {
    const lastWeekInfo = getPreviousWeekInfo(referenceDate);
    const lastWeekData = createEmptyWeekStructure(lastWeekInfo, country, 'last-week');
    fs.writeFileSync(paths.last, JSON.stringify(lastWeekData, null, 2));
  }
  
  // Create current-week.json if missing
  if (!fs.existsSync(paths.current)) {
    const currentWeekInfo = getCurrentWeekInfo(referenceDate);
    const currentWeekData = createEmptyWeekStructure(currentWeekInfo, country, 'current-week');
    fs.writeFileSync(paths.current, JSON.stringify(currentWeekData, null, 2));
  }
  
  // Create next-week.json if missing
  if (!fs.existsSync(paths.next)) {
    const nextWeekInfo = getNextWeekInfo(referenceDate);
    const nextWeekData = createEmptyWeekStructure(nextWeekInfo, country, 'next-week');
    fs.writeFileSync(paths.next, JSON.stringify(nextWeekData, null, 2));
  }
}

/**
 * Perform week transition for both countries if needed.
 * 
 * @param {Date} currentDate - The current date
 * @returns {{us: Object, india: Object}}
 */
function performWeekTransition(currentDate) {
  const results = {
    us: transitionWeeks(currentDate, 'us'),
    india: transitionWeeks(currentDate, 'india')
  };
  
  return results;
}

module.exports = {
  getCountryPaths,
  getArchivePath,
  shouldTransition,
  transitionWeeks,
  createEmptyWeekStructure,
  initializeWeekFiles,
  performWeekTransition
};
