#!/usr/bin/env node
/**
 * Archive Index Generator
 * 
 * Scans the data/archive/ directory for archived week JSON files
 * and generates data/archive-index.json with metadata for navigation.
 * 
 * Usage:
 *   node scripts/generate-archive-index.js
 * 
 * @module scripts/generate-archive-index
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Constants
const ARCHIVE_DIR = path.join(__dirname, '../data/archive');
const ARCHIVE_INDEX_PATH = path.join(__dirname, '../data/archive-index.json');

/**
 * Generate the archive index from all JSON files in the archive directory.
 */
function generateArchiveIndex() {
  console.log('🗂️  Generating archive index...');
  
  // Ensure archive directory exists
  if (!fs.existsSync(ARCHIVE_DIR)) {
    console.log('⚠️  Archive directory does not exist, creating empty index');
    const emptyIndex = {
      archives: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(ARCHIVE_INDEX_PATH, JSON.stringify(emptyIndex, null, 2));
    return;
  }

  // Read all files in archive directory
  const files = fs.readdirSync(ARCHIVE_DIR);
  const archives = [];

  for (const file of files) {
    // Only process JSON files matching YYYY-WW.json pattern
    if (!file.endsWith('.json') || !file.match(/^\d{4}-\d{2}\.json$/)) {
      continue;
    }

    const filePath = path.join(ARCHIVE_DIR, file);
    
    try {
      // Read and parse the archive file
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // Extract metadata
      const archive = {
        weekId: data.weekId,
        weekTitle: data.weekTitle,
        dateRange: {
          start: data.dateRange.start,
          end: data.dateRange.end
        },
        fileName: file,
        postCount: data.posts ? data.posts.length : 0
      };

      archives.push(archive);
      console.log(`  ✓ Added ${file} (${archive.weekTitle})`);
      
    } catch (error) {
      console.error(`  ✗ Skipping ${file}: ${error.message}`);
    }
  }

  // Sort by weekId descending (newest first)
  archives.sort((a, b) => {
    // Compare by year first, then week number
    const [yearA, weekA] = a.weekId.split('-').map(Number);
    const [yearB, weekB] = b.weekId.split('-').map(Number);
    
    if (yearA !== yearB) {
      return yearB - yearA;
    }
    return weekB - weekA;
  });

  // Create index object
  const index = {
    archives: archives,
    lastUpdated: new Date().toISOString(),
    totalArchives: archives.length
  };

  // Write to file
  fs.writeFileSync(ARCHIVE_INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`✅ Archive index generated with ${archives.length} entries`);
  console.log(`   Saved to: ${ARCHIVE_INDEX_PATH}`);
}

// Run if called directly
if (require.main === module) {
  generateArchiveIndex();
}

module.exports = { generateArchiveIndex };
