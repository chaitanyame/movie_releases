/**
 * Date Utility Functions
 * 
 * Provides utilities for calculating ISO week numbers, date ranges,
 * and formatting dates for the OTT Weekly Releases application.
 * All dates are handled in UTC to avoid timezone issues.
 * 
 * @module scripts/utils/date-utils
 */

'use strict';

/**
 * Calculate the ISO week number for a given date.
 * ISO weeks start on Monday and week 1 contains the first Thursday of the year.
 * 
 * @param {Date} date - The date to calculate the week number for
 * @returns {number} ISO week number (1-53)
 */
function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday (0) = 7
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  
  // Get first day of the year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  
  // Calculate full weeks to nearest Thursday
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  return weekNum;
}

/**
 * Get the date range (Monday to Sunday) for the week containing the given date.
 * 
 * @param {Date} date - Any date within the desired week
 * @returns {{start: Date, end: Date}} Object with start (Monday) and end (Sunday) dates
 */
function getWeekDateRange(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  
  // Get the day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = d.getUTCDay();
  
  // Calculate days to subtract to get to Monday
  // If Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1) days
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  // Create Monday date
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  
  // Create Sunday date (Monday + 6 days)
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}

/**
 * Format a date range as a human-readable string.
 * 
 * Examples:
 * - Same month: "December 2-8, 2024"
 * - Cross month: "November 25 - December 1, 2024"
 * - Cross year: "December 30, 2024 - January 5, 2025"
 * 
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string} Formatted date range string
 */
function formatDateRange(start, end) {
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const endMonth = end.getUTCMonth();
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const startMonthName = monthNames[startMonth];
  const endMonthName = monthNames[endMonth];
  
  // Same year, same month
  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonthName} ${startDay}-${endDay}, ${startYear}`;
  }
  
  // Same year, different month
  if (startYear === endYear) {
    return `${startMonthName} ${startDay} - ${endMonthName} ${endDay}, ${endYear}`;
  }
  
  // Different year
  return `${startMonthName} ${startDay}, ${startYear} - ${endMonthName} ${endDay}, ${endYear}`;
}

/**
 * Format a date as YYYY-MM-DD string.
 * 
 * @param {Date} date - The date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if the given date is a Monday (start of a new week).
 * 
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is a Monday
 */
function isNewWeek(date) {
  return date.getUTCDay() === 1; // 1 = Monday
}

/**
 * Get week identifier in YYYY-WW format.
 * 
 * @param {Date} date - The date to get week ID for
 * @returns {string} Week ID (e.g., "2024-49")
 */
function getWeekId(date) {
  const weekNum = getISOWeekNumber(date);
  const { start } = getWeekDateRange(date);
  const year = start.getUTCFullYear();
  return `${year}-${String(weekNum).padStart(2, '0')}`;
}

/**
 * Get week title string.
 * 
 * @param {Date} date - The date within the week
 * @returns {string} Week title (e.g., "Week 49: December 2-8, 2024")
 */
function getWeekTitle(date) {
  const weekNum = getISOWeekNumber(date);
  const { start, end } = getWeekDateRange(date);
  const dateRange = formatDateRange(start, end);
  return `Week ${weekNum}: ${dateRange}`;
}

module.exports = {
  getISOWeekNumber,
  getWeekDateRange,
  formatDateRange,
  formatDate,
  isNewWeek,
  getWeekId,
  getWeekTitle
};
