/**
 * Week Transition Logic
 * 
 * Handles detection of new weeks, archiving of previous week data,
 * and creation of new week files. Supports year boundary handling.
 * 
 * @module scripts/utils/week-transition
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { getWeekId, getWeekTitle, isNewWeek, getWeekDateRange, formatDate } = require('./date-utils');

// Constants
const DATA_DIR = 'data';
const ARCHIVE_DIR = 'data/archive';
const CURRENT_WEEK_PATH = 'data/current-week.json';

/**
 * Get the archive file path for a given week ID.
 * 
 * @param {string} weekId - Week ID in YYYY-WW format
 * @returns {string} Path to archive file
 */
function getArchivePath(weekId) {
  return `${ARCHIVE_DIR}/${weekId}.json`;
}

/**
 * Check if the current week file should be archived.
 * Returns true if:
 * - Current date is Monday (new week)
 * - Current week file exists
 * - File contains data from a previous week
 * 
 * @param {Date} currentDate - The current date to check
 * @returns {boolean} True if archiving should occur
 */
function shouldArchive(currentDate) {
  // Only archive on Mondays
  if (!isNewWeek(currentDate)) {
    return false;
  }

  // Check if current week file exists
  if (!fs.existsSync(CURRENT_WEEK_PATH)) {
    return false;
  }

  // Read current week file and check weekId
  const fileContent = fs.readFileSync(CURRENT_WEEK_PATH, 'utf8');
  const currentWeekData = JSON.parse(fileContent);

  // If no weekId, nothing to archive
  if (!currentWeekData.weekId) {
    return false;
  }

  // Check if file weekId is different from current week
  const currentWeekId = getWeekId(currentDate);
  return currentWeekData.weekId !== currentWeekId;
}

/**
 * Archive the current week file to the archive directory.
 * Preserves existing archive files (never overwrites).
 * 
 * @returns {{archived: boolean, archivePath?: string, weekId?: string, reason?: string}}
 */
function archiveCurrentWeek() {
  // Read current week file
  if (!fs.existsSync(CURRENT_WEEK_PATH)) {
    return { archived: false, reason: 'no_current_week' };
  }

  const fileContent = fs.readFileSync(CURRENT_WEEK_PATH, 'utf8');
  const currentWeekData = JSON.parse(fileContent);

  if (!currentWeekData.weekId) {
    return { archived: false, reason: 'no_week_id' };
  }

  const archivePath = getArchivePath(currentWeekData.weekId);

  // Never overwrite existing archives
  if (fs.existsSync(archivePath)) {
    return { archived: false, reason: 'archive_exists' };
  }

  // Ensure archive directory exists
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }

  // Write archive file
  fs.writeFileSync(archivePath, JSON.stringify(currentWeekData, null, 2));

  return {
    archived: true,
    archivePath: archivePath,
    weekId: currentWeekData.weekId
  };
}

/**
 * Reset the current week file for a new week.
 * Creates a new empty structure with correct week metadata.
 * 
 * @param {Date} newWeekDate - The date of the new week (typically Monday)
 */
function resetCurrentWeek(newWeekDate) {
  const weekId = getWeekId(newWeekDate);
  const weekTitle = getWeekTitle(newWeekDate);
  const { start, end } = getWeekDateRange(newWeekDate);

  const newWeekData = {
    weekId: weekId,
    weekTitle: weekTitle,
    dateRange: {
      start: formatDate(start),
      end: formatDate(end)
    },
    generatedAt: new Date().toISOString(),
    posts: []
  };

  fs.writeFileSync(CURRENT_WEEK_PATH, JSON.stringify(newWeekData, null, 2));
}

/**
 * Perform a complete week transition.
 * Archives the old week and resets current week for the new week.
 * 
 * @param {Date} currentDate - The current date
 * @returns {{transitioned: boolean, archivedWeek?: string, newWeek?: string, reason?: string}}
 */
function performWeekTransition(currentDate) {
  // Check if it's time to transition
  if (!isNewWeek(currentDate)) {
    return { transitioned: false, reason: 'not_monday' };
  }

  // Check if we have data to archive
  if (!fs.existsSync(CURRENT_WEEK_PATH)) {
    // No current week file, just create new one
    resetCurrentWeek(currentDate);
    return {
      transitioned: true,
      archivedWeek: null,
      newWeek: getWeekId(currentDate)
    };
  }

  // Read old week data
  const fileContent = fs.readFileSync(CURRENT_WEEK_PATH, 'utf8');
  const oldWeekData = JSON.parse(fileContent);
  const oldWeekId = oldWeekData.weekId;
  const newWeekId = getWeekId(currentDate);

  // If already on current week, no transition needed
  if (oldWeekId === newWeekId) {
    return { transitioned: false, reason: 'already_current_week' };
  }

  // Archive old week
  const archiveResult = archiveCurrentWeek();
  
  // Reset for new week
  resetCurrentWeek(currentDate);

  return {
    transitioned: true,
    archivedWeek: oldWeekId,
    newWeek: newWeekId
  };
}

module.exports = {
  getArchivePath,
  shouldArchive,
  archiveCurrentWeek,
  resetCurrentWeek,
  performWeekTransition,
  CURRENT_WEEK_PATH,
  ARCHIVE_DIR
};
