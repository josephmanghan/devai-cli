#!/usr/bin/env node

import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
  statSync,
} from 'node:fs';
import { join, extname, dirname, relative } from 'node:path';
import { parseArgs } from 'node:util';
import {
  INPUT_DIRECTORY,
  OUTPUT_DIRECTORY,
  STOP_WORDS,
} from './caveman.config';

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    input: {
      type: 'string',
      short: 'i',
      default: INPUT_DIRECTORY,
    },
    output: {
      type: 'string',
      short: 'o',
      default: OUTPUT_DIRECTORY,
    },
  },
});

// ============================================================================
// CORE CONVERSION LOGIC
// ============================================================================

/**
 * Converts text to "caveman" format by removing stop words and compacting whitespace.
 * Uses different strategies for code vs. text/markdown files.
 *
 * @param text - The input text to convert
 * @param isCode - Whether the text is code (true) or text/markdown (false)
 * @returns The converted caveman text
 */
const toCaveman = (text: string, isCode: boolean): string => {
  if (!text) return '';

  // For code, preserve logic by keeping all words (no stop word removal)
  // Only strip comments and compact whitespace to reduce size
  if (isCode) {
    return text
      .replace(/\/\/.*$/gm, '') // Remove single-line comments (// ...)
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments (/* ... */)
      .replace(/\s+/g, ' '); // Compact all whitespace to single spaces
  }

  // Remove stop words while preserving structure (headers, lists, paragraphs)
  let processed = text.toLowerCase();

  // Replace newlines with placeholder to preserve document structure
  processed = processed.replace(/\n/g, ' __NEWLINE__ ');

  // Keep: word chars (\w), whitespace (\s), # (headers), - (lists), . (extensions), / (paths)
  // Remove: quotes, commas, parentheses, brackets, etc.
  processed = processed.replace(/[^\w\s#\-\.\/]/g, '');

  // Split into words and remove common English stop words
  const words = processed.split(' ').filter(word => {
    const cleanWord = word.trim();
    if (cleanWord === '__newline__') return true;
    if (cleanWord.startsWith('#') || cleanWord.startsWith('-')) return true;
    return !STOP_WORDS.has(cleanWord) && cleanWord.length > 1;
  });

  // Reassemble and clean up whitespace
  return words
    .join(' ')
    .replace(/__newline__/gi, '\n') // Restore newlines from placeholders
    .replace(/[ \t]+/g, ' ') // Compact spaces and tabs to single space
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce 3+ newlines to 2 (paragraph breaks)
    .trim();
};

// ============================================================================
// FILE SYSTEM UTILITIES
// ============================================================================

/**
 * Recursively walks a directory tree and collects all file paths.
 * Skips node_modules and .git directories.
 *
 * @param dirPath - The directory to walk
 * @param arrayOfFiles - Accumulator for file paths (used during recursion)
 * @returns Array of absolute file paths found in the directory tree
 */
const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
  const files = readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      // Skip common directories that should not be processed
      if (file !== 'node_modules' && file !== '.git') {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

// ============================================================================
// MAIN PROCESSING FUNCTION
// ============================================================================

/**
 * Main function that processes all supported files from input directory,
 * converts them to caveman format, and writes to output directory.
 * Preserves directory structure and reports statistics on size reduction.
 */
const processFiles = (): void => {
  const inputDir = values.input!;
  const outputDir = values.output!;

  // Display startup information
  console.log(`🚀 Starting Caveman Converter`);
  console.log(`   Input:  ${inputDir}`);
  console.log(`   Output: ${outputDir}`);
  console.log('---');

  // Validate input directory exists
  if (!existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  // Collect all files and define which extensions to process
  const allFiles = getAllFiles(inputDir);
  const supportedExtensions = ['.md', '.txt', '.js', '.ts', '.json'];

  // Track statistics for final report
  let totalOriginal = 0;
  let totalCaveman = 0;
  let processedCount = 0;

  // Process each file
  for (const filePath of allFiles) {
    const ext = extname(filePath);
    if (!supportedExtensions.includes(ext)) continue;

    // Build output path preserving directory structure
    const relativePath = relative(inputDir, filePath);
    const outputPath = join(outputDir, relativePath);

    // Create output subdirectories as needed
    mkdirSync(dirname(outputPath), { recursive: true });

    // Read and convert file content
    const content = readFileSync(filePath, 'utf-8');
    const isCode = ['.js', '.ts', '.json'].includes(ext);

    const cavemanContent = toCaveman(content, isCode);

    // Write converted content to output
    writeFileSync(outputPath, cavemanContent, 'utf-8');

    // Update statistics
    totalOriginal += content.length;
    totalCaveman += cavemanContent.length;
    processedCount++;
  }

  // Calculate and display final statistics
  const reduction = Math.round((1 - totalCaveman / totalOriginal) * 100);

  console.log(`📊 SUMMARY:`);
  console.log(`   Files processed: ${processedCount}`);
  console.log(`   Original Size:   ${(totalOriginal / 1024).toFixed(2)} KB`);
  console.log(`   Caveman Size:    ${(totalCaveman / 1024).toFixed(2)} KB`);
  console.log(`   Total Reduction: ${reduction}% 📉`);
};

// ============================================================================
// SCRIPT ENTRY POINT
// ============================================================================

processFiles();
