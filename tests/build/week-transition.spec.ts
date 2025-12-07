/**
 * Week Transition Logic Tests
 * 
 * Tests for detecting new weeks, archiving current week data,
 * and handling year boundaries.
 * 
 * @module tests/build/week-transition.spec.ts
 */

const fs = require('fs');
const path = require('path');

// Mock fs module
jest.mock('fs');

// Import week-transition module after mocking
const weekTransition = require('../../scripts/utils/week-transition');

describe('Week Transition Logic', () => {
  const DATA_DIR = 'data';
  const ARCHIVE_DIR = 'data/archive';
  const CURRENT_WEEK_PATH = 'data/current-week.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldArchive', () => {
    test('should return true when current date is Monday and current week file exists with old data', () => {
      const monday = new Date('2024-12-09T00:00:00.000Z'); // Monday
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        weekId: '2024-49', // Previous week
        posts: []
      }));

      const result = weekTransition.shouldArchive(monday);
      expect(result).toBe(true);
    });

    test('should return false when current date is not Monday', () => {
      const tuesday = new Date('2024-12-10T00:00:00.000Z'); // Tuesday
      
      const result = weekTransition.shouldArchive(tuesday);
      expect(result).toBe(false);
    });

    test('should return false when current week file does not exist', () => {
      const monday = new Date('2024-12-09T00:00:00.000Z'); // Monday
      fs.existsSync.mockReturnValue(false);

      const result = weekTransition.shouldArchive(monday);
      expect(result).toBe(false);
    });

    test('should return false when file weekId matches current week', () => {
      const monday = new Date('2024-12-09T00:00:00.000Z'); // Monday
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        weekId: '2024-50', // Same week as Monday (Dec 9 is week 50)
        posts: []
      }));

      const result = weekTransition.shouldArchive(monday);
      expect(result).toBe(false);
    });
  });

  describe('getArchivePath', () => {
    test('should return correct archive path for a week', () => {
      const weekId = '2024-49';
      const result = weekTransition.getArchivePath(weekId);
      expect(result).toBe('data/archive/2024-49.json');
    });

    test('should handle week 1 correctly', () => {
      const weekId = '2025-01';
      const result = weekTransition.getArchivePath(weekId);
      expect(result).toBe('data/archive/2025-01.json');
    });

    test('should handle week 52 correctly', () => {
      const weekId = '2024-52';
      const result = weekTransition.getArchivePath(weekId);
      expect(result).toBe('data/archive/2024-52.json');
    });
  });

  describe('archiveCurrentWeek', () => {
    test('should copy current week file to archive directory', () => {
      const currentWeekData = {
        weekId: '2024-49',
        weekTitle: 'Week 49: December 2-8, 2024',
        posts: [{ id: 1, title: 'Test' }]
      };

      fs.existsSync.mockImplementation((p) => {
        if (p === CURRENT_WEEK_PATH) return true;
        if (p === ARCHIVE_DIR) return true;
        if (p === 'data/archive/2024-49.json') return false;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(currentWeekData));
      fs.writeFileSync.mockImplementation(() => {});
      fs.mkdirSync.mockImplementation(() => undefined);

      weekTransition.archiveCurrentWeek();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'data/archive/2024-49.json',
        expect.any(String)
      );
    });

    test('should create archive directory if it does not exist', () => {
      const currentWeekData = {
        weekId: '2024-49',
        posts: []
      };

      fs.existsSync.mockImplementation((p) => {
        if (p === CURRENT_WEEK_PATH) return true;
        if (p === ARCHIVE_DIR) return false;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(currentWeekData));
      fs.writeFileSync.mockImplementation(() => {});
      fs.mkdirSync.mockImplementation(() => undefined);

      weekTransition.archiveCurrentWeek();

      expect(fs.mkdirSync).toHaveBeenCalledWith(ARCHIVE_DIR, { recursive: true });
    });

    test('should not overwrite existing archive files', () => {
      const currentWeekData = {
        weekId: '2024-49',
        posts: []
      };

      fs.existsSync.mockImplementation((p) => {
        if (p === CURRENT_WEEK_PATH) return true;
        if (p === ARCHIVE_DIR) return true;
        if (p === 'data/archive/2024-49.json') return true; // Already exists
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(currentWeekData));

      const result = weekTransition.archiveCurrentWeek();

      expect(result).toEqual({ archived: false, reason: 'archive_exists' });
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    test('should return success status when archiving completes', () => {
      const currentWeekData = {
        weekId: '2024-49',
        posts: []
      };

      fs.existsSync.mockImplementation((p) => {
        if (p === CURRENT_WEEK_PATH) return true;
        if (p === ARCHIVE_DIR) return true;
        if (p === 'data/archive/2024-49.json') return false;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(currentWeekData));
      fs.writeFileSync.mockImplementation(() => {});

      const result = weekTransition.archiveCurrentWeek();

      expect(result).toEqual({
        archived: true,
        archivePath: 'data/archive/2024-49.json',
        weekId: '2024-49'
      });
    });
  });

  describe('resetCurrentWeek', () => {
    test('should create empty current week file for new week', () => {
      const newWeekDate = new Date('2024-12-09T00:00:00.000Z'); // Monday of week 50
      fs.writeFileSync.mockImplementation(() => {});

      weekTransition.resetCurrentWeek(newWeekDate);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CURRENT_WEEK_PATH,
        expect.stringContaining('"weekId": "2024-50"')
      );
    });

    test('should include correct week metadata', () => {
      const newWeekDate = new Date('2024-12-09T00:00:00.000Z');
      fs.writeFileSync.mockImplementation(() => {});

      weekTransition.resetCurrentWeek(newWeekDate);

      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenData = JSON.parse(writeCall[1]);
      
      expect(writtenData.weekId).toBe('2024-50');
      expect(writtenData.weekTitle).toContain('Week 50');
      expect(writtenData.posts).toEqual([]);
      expect(writtenData.dateRange).toBeDefined();
    });
  });

  describe('performWeekTransition', () => {
    test('should archive old week and reset current week on Monday', () => {
      const monday = new Date('2024-12-09T00:00:00.000Z');
      const previousWeekData = {
        weekId: '2024-49',
        posts: [{ id: 1 }]
      };

      fs.existsSync.mockImplementation((p) => {
        if (p === CURRENT_WEEK_PATH) return true;
        if (p === ARCHIVE_DIR) return true;
        if (p === 'data/archive/2024-49.json') return false;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(previousWeekData));
      fs.writeFileSync.mockImplementation(() => {});

      const result = weekTransition.performWeekTransition(monday);

      expect(result).toEqual({
        transitioned: true,
        archivedWeek: '2024-49',
        newWeek: '2024-50'
      });
    });

    test('should do nothing if not Monday', () => {
      const tuesday = new Date('2024-12-10T00:00:00.000Z');

      const result = weekTransition.performWeekTransition(tuesday);

      expect(result).toEqual({
        transitioned: false,
        reason: 'not_monday'
      });
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    test('should handle year boundary (week 52 to week 1)', () => {
      const mondayNewYear = new Date('2024-12-30T00:00:00.000Z'); // Monday of week 1 2025
      const previousWeekData = {
        weekId: '2024-52',
        posts: []
      };

      fs.existsSync.mockImplementation((p) => {
        if (p === CURRENT_WEEK_PATH) return true;
        if (p === ARCHIVE_DIR) return true;
        if (p === 'data/archive/2024-52.json') return false;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(previousWeekData));
      fs.writeFileSync.mockImplementation(() => {});

      const result = weekTransition.performWeekTransition(mondayNewYear);

      expect(result.transitioned).toBe(true);
      expect(result.archivedWeek).toBe('2024-52');
      // Week 1 of 2025 starts on Dec 30, 2024
      expect(result.newWeek).toBe('2025-01');
    });
  });

  describe('edge cases', () => {
    test('should handle corrupted JSON in current week file', () => {
      const monday = new Date('2024-12-09T00:00:00.000Z');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('not valid json');

      expect(() => weekTransition.shouldArchive(monday)).toThrow();
    });

    test('should handle missing weekId in current week file', () => {
      const monday = new Date('2024-12-09T00:00:00.000Z');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ posts: [] }));

      const result = weekTransition.shouldArchive(monday);
      expect(result).toBe(false);
    });
  });
});
