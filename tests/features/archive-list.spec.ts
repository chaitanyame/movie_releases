/**
 * Archive List Generator Tests
 * 
 * Tests for generating and maintaining an index of archived weeks.
 * 
 * @module tests/features/archive-list.spec.ts
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARCHIVE_DIR = path.join(__dirname, '../../data/archive');
const ARCHIVE_INDEX_PATH = path.join(__dirname, '../../data/archive-index.json');

test.describe('Archive Index Generator', () => {
  
  test.beforeAll(async () => {
    // Create test archive files for testing
    if (!fs.existsSync(ARCHIVE_DIR)) {
      fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }
    
    // Create sample archive files
    const week1 = {
      weekId: '2024-48',
      weekTitle: 'Week 48: November 25 - December 1, 2024',
      dateRange: { start: '2024-11-25', end: '2024-12-01' },
      posts: [{ id: 1, title: 'Test Release' }]
    };
    
    const week2 = {
      weekId: '2024-49',
      weekTitle: 'Week 49: December 2-8, 2024',
      dateRange: { start: '2024-12-02', end: '2024-12-08' },
      posts: [{ id: 2, title: 'Another Release' }]
    };
    
    fs.writeFileSync(path.join(ARCHIVE_DIR, '2024-48.json'), JSON.stringify(week1, null, 2));
    fs.writeFileSync(path.join(ARCHIVE_DIR, '2024-49.json'), JSON.stringify(week2, null, 2));
  });

  test.afterAll(async () => {
    // Clean up test files
    if (fs.existsSync(path.join(ARCHIVE_DIR, '2024-48.json'))) {
      fs.unlinkSync(path.join(ARCHIVE_DIR, '2024-48.json'));
    }
    if (fs.existsSync(path.join(ARCHIVE_DIR, '2024-49.json'))) {
      fs.unlinkSync(path.join(ARCHIVE_DIR, '2024-49.json'));
    }
    if (fs.existsSync(ARCHIVE_INDEX_PATH)) {
      fs.unlinkSync(ARCHIVE_INDEX_PATH);
    }
  });

  test('should generate archive-index.json when script is run', async () => {
    // Run the archive index generator script
    const { execSync } = require('child_process');
    execSync('node scripts/generate-archive-index.js', { cwd: path.join(__dirname, '../..') });
    
    // Check that archive-index.json exists
    expect(fs.existsSync(ARCHIVE_INDEX_PATH)).toBeTruthy();
  });

  test('should create valid JSON with correct structure', async () => {
    const { execSync } = require('child_process');
    execSync('node scripts/generate-archive-index.js', { cwd: path.join(__dirname, '../..') });
    
    const indexContent = fs.readFileSync(ARCHIVE_INDEX_PATH, 'utf8');
    const index = JSON.parse(indexContent);
    
    expect(index).toHaveProperty('archives');
    expect(Array.isArray(index.archives)).toBeTruthy();
    expect(index).toHaveProperty('lastUpdated');
  });

  test('should list all archive files in directory', async () => {
    const { execSync } = require('child_process');
    execSync('node scripts/generate-archive-index.js', { cwd: path.join(__dirname, '../..') });
    
    const indexContent = fs.readFileSync(ARCHIVE_INDEX_PATH, 'utf8');
    const index = JSON.parse(indexContent);
    
    expect(index.archives.length).toBeGreaterThanOrEqual(2);
    
    const weekIds = index.archives.map((a: any) => a.weekId);
    expect(weekIds).toContain('2024-48');
    expect(weekIds).toContain('2024-49');
  });

  test('should include week metadata in each entry', async () => {
    const { execSync } = require('child_process');
    execSync('node scripts/generate-archive-index.js', { cwd: path.join(__dirname, '../..') });
    
    const indexContent = fs.readFileSync(ARCHIVE_INDEX_PATH, 'utf8');
    const index = JSON.parse(indexContent);
    
    const firstArchive = index.archives[0];
    expect(firstArchive).toHaveProperty('weekId');
    expect(firstArchive).toHaveProperty('weekTitle');
    expect(firstArchive).toHaveProperty('dateRange');
    expect(firstArchive).toHaveProperty('fileName');
    expect(firstArchive.dateRange).toHaveProperty('start');
    expect(firstArchive.dateRange).toHaveProperty('end');
  });

  test('should sort archives by date (newest first)', async () => {
    const { execSync } = require('child_process');
    execSync('node scripts/generate-archive-index.js', { cwd: path.join(__dirname, '../..') });
    
    const indexContent = fs.readFileSync(ARCHIVE_INDEX_PATH, 'utf8');
    const index = JSON.parse(indexContent);
    
    // Week 49 should come before Week 48
    expect(index.archives[0].weekId).toBe('2024-49');
    expect(index.archives[1].weekId).toBe('2024-48');
  });

  test('should handle empty archive directory gracefully', async () => {
    // Temporarily remove archive files
    const tempFiles = fs.readdirSync(ARCHIVE_DIR);
    tempFiles.forEach(file => {
      if (file.endsWith('.json')) {
        fs.renameSync(
          path.join(ARCHIVE_DIR, file),
          path.join(ARCHIVE_DIR, file + '.backup')
        );
      }
    });
    
    const { execSync } = require('child_process');
    execSync('node scripts/generate-archive-index.js', { cwd: path.join(__dirname, '../..') });
    
    const indexContent = fs.readFileSync(ARCHIVE_INDEX_PATH, 'utf8');
    const index = JSON.parse(indexContent);
    
    expect(index.archives).toEqual([]);
    
    // Restore files
    tempFiles.forEach(file => {
      if (file.endsWith('.json')) {
        fs.renameSync(
          path.join(ARCHIVE_DIR, file + '.backup'),
          path.join(ARCHIVE_DIR, file)
        );
      }
    });
  });

  test('should include post count in metadata', async () => {
    const { execSync } = require('child_process');
    execSync('node scripts/generate-archive-index.js', { cwd: path.join(__dirname, '../..') });
    
    const indexContent = fs.readFileSync(ARCHIVE_INDEX_PATH, 'utf8');
    const index = JSON.parse(indexContent);
    
    const week49 = index.archives.find((a: any) => a.weekId === '2024-49');
    expect(week49).toHaveProperty('postCount');
    expect(week49.postCount).toBe(1);
  });

  test('should skip invalid JSON files', async () => {
    // Create an invalid JSON file
    fs.writeFileSync(path.join(ARCHIVE_DIR, '2024-50.json'), 'not valid json');
    
    const { execSync } = require('child_process');
    const result = execSync('node scripts/generate-archive-index.js', { 
      cwd: path.join(__dirname, '../..'),
      encoding: 'utf8'
    });
    
    // Should not crash, should skip the invalid file
    expect(fs.existsSync(ARCHIVE_INDEX_PATH)).toBeTruthy();
    
    // Clean up
    fs.unlinkSync(path.join(ARCHIVE_DIR, '2024-50.json'));
  });
});
