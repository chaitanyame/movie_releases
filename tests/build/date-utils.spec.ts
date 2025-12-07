/**
 * Date Utility Functions Tests
 * Tests for ISO week number calculation, date ranges, and formatting
 */

const { 
  getISOWeekNumber, 
  getWeekDateRange, 
  formatDateRange, 
  isNewWeek,
  formatDate
} = require('../../scripts/utils/date-utils');

describe('Date Utility Functions', () => {
  
  describe('getISOWeekNumber', () => {
    
    test('should return week 1 for January 1, 2024 (Monday)', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      expect(getISOWeekNumber(date)).toBe(1);
    });

    test('should return week 49 for December 2, 2024', () => {
      const date = new Date('2024-12-02T00:00:00Z');
      expect(getISOWeekNumber(date)).toBe(49);
    });

    test('should return week 52 for December 30, 2024', () => {
      const date = new Date('2024-12-30T00:00:00Z');
      expect(getISOWeekNumber(date)).toBe(1); // Week 1 of 2025
    });

    test('should handle year boundaries correctly', () => {
      // Dec 31, 2023 is a Sunday in week 52 of 2023
      const date = new Date('2023-12-31T00:00:00Z');
      expect(getISOWeekNumber(date)).toBe(52);
    });

    test('should handle leap years correctly', () => {
      const date = new Date('2024-02-29T00:00:00Z');
      expect(getISOWeekNumber(date)).toBe(9);
    });
  });

  describe('getWeekDateRange', () => {
    
    test('should return Monday-Sunday range for any day in week', () => {
      // December 4, 2024 is a Wednesday
      const date = new Date('2024-12-04T12:00:00Z');
      const { start, end } = getWeekDateRange(date);
      
      expect(start.toISOString().split('T')[0]).toBe('2024-12-02'); // Monday
      expect(end.toISOString().split('T')[0]).toBe('2024-12-08'); // Sunday
    });

    test('should return same range when given Monday', () => {
      const date = new Date('2024-12-02T00:00:00Z');
      const { start, end } = getWeekDateRange(date);
      
      expect(start.toISOString().split('T')[0]).toBe('2024-12-02');
      expect(end.toISOString().split('T')[0]).toBe('2024-12-08');
    });

    test('should return same range when given Sunday', () => {
      const date = new Date('2024-12-08T23:59:59Z');
      const { start, end } = getWeekDateRange(date);
      
      expect(start.toISOString().split('T')[0]).toBe('2024-12-02');
      expect(end.toISOString().split('T')[0]).toBe('2024-12-08');
    });

    test('should handle month boundaries', () => {
      // November 29, 2024 is a Friday, week spans Nov-Dec
      const date = new Date('2024-11-29T00:00:00Z');
      const { start, end } = getWeekDateRange(date);
      
      expect(start.toISOString().split('T')[0]).toBe('2024-11-25'); // Monday
      expect(end.toISOString().split('T')[0]).toBe('2024-12-01'); // Sunday
    });

    test('should handle year boundaries', () => {
      // December 31, 2024 is a Tuesday
      const date = new Date('2024-12-31T00:00:00Z');
      const { start, end } = getWeekDateRange(date);
      
      expect(start.toISOString().split('T')[0]).toBe('2024-12-30'); // Monday
      expect(end.toISOString().split('T')[0]).toBe('2025-01-05'); // Sunday
    });
  });

  describe('formatDateRange', () => {
    
    test('should format same-month range correctly', () => {
      const start = new Date('2024-12-02T00:00:00Z');
      const end = new Date('2024-12-08T00:00:00Z');
      
      const result = formatDateRange(start, end);
      expect(result).toBe('December 2-8, 2024');
    });

    test('should format cross-month range correctly', () => {
      const start = new Date('2024-11-25T00:00:00Z');
      const end = new Date('2024-12-01T00:00:00Z');
      
      const result = formatDateRange(start, end);
      expect(result).toBe('November 25 - December 1, 2024');
    });

    test('should format cross-year range correctly', () => {
      const start = new Date('2024-12-30T00:00:00Z');
      const end = new Date('2025-01-05T00:00:00Z');
      
      const result = formatDateRange(start, end);
      expect(result).toBe('December 30, 2024 - January 5, 2025');
    });
  });

  describe('formatDate', () => {
    
    test('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-12-02T00:00:00Z');
      expect(formatDate(date)).toBe('2024-12-02');
    });

    test('should pad single digit months and days', () => {
      const date = new Date('2024-01-05T00:00:00Z');
      expect(formatDate(date)).toBe('2024-01-05');
    });
  });

  describe('isNewWeek', () => {
    
    test('should return true on Monday', () => {
      // Mock the current date to Monday
      const monday = new Date('2024-12-02T09:00:00Z');
      expect(isNewWeek(monday)).toBe(true);
    });

    test('should return false on other days', () => {
      const tuesday = new Date('2024-12-03T09:00:00Z');
      expect(isNewWeek(tuesday)).toBe(false);
      
      const sunday = new Date('2024-12-08T09:00:00Z');
      expect(isNewWeek(sunday)).toBe(false);
    });
  });
});
