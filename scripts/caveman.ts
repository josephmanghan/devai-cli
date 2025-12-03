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
 * Removes comments and compacts whitespace in code.
 * Used for both pure code files and code within markdown fences.
 */
const compactCode = (code: string): string => {
  return code
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\s+/g, ' '); // Compact whitespace to single spaces
};

/**
 * Removes English stop words and special characters from text while preserving structure.
 * Maintains newlines, headers (#), and list markers (-) to preserve document hierarchy.
 */
const removeStopWords = (text: string): string => {
  let processed = text.toLowerCase();
  processed = processed.replace(/\n/g, ' __NEWLINE__ '); // Preserve newlines with placeholder

  // Keep word chars, spaces, headers (#), list markers (-), file extensions (.), and paths (/)
  processed = processed.replace(/[^\w\s#\-\.\/]/g, '');

  const words = processed.split(' ').filter(word => {
    const cleanWord = word.trim();
    if (cleanWord === '__newline__') return true; // Keep structure markers
    if (cleanWord.startsWith('#') || cleanWord.startsWith('-')) return true; // Keep markdown syntax
    return !STOP_WORDS.has(cleanWord) && cleanWord.length > 1; // Filter stop words and single chars
  });

  return words
    .join(' ')
    .replace(/__newline__/gi, '\n') // Restore newlines
    .replace(/[ \t]+/g, ' ') // Collapse multiple spaces
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Limit consecutive blank lines to 2
    .trim();
};

/**
 * Represents a segment of markdown content.
 * Used to preserve code while processing surrounding text separately.
 */
type MarkdownSegment = {
  type: 'text' | 'code-fence' | 'inline-code';
  content: string;
};

/**
 * Parses markdown to identify and separate code fences and inline code from plain text.
 * Uses regex to find triple-backtick fences (```...```) and single-backtick inline code (`...`).
 * Returns segments that can be processed according to their type.
 */
const parseMarkdown = (text: string): MarkdownSegment[] => {
  const segments: MarkdownSegment[] = [];
  const regex = /(```[\s\S]*?```|`[^`]+`)/g; // Match code fences and inline code
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add any text before the matched code block
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const matchedContent = match[0];
    if (matchedContent.startsWith('```')) {
      segments.push({ type: 'code-fence', content: matchedContent });
    } else {
      segments.push({ type: 'inline-code', content: matchedContent });
    }

    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last code block
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
};

/**
 * Main conversion function that applies caveman format to text.
 * Strips box-drawing characters globally, then handles code vs text differently:
 * - Pure code files: compacted
 * - Markdown files: parses into segments and processes each appropriately
 *
 * @param text - Content to convert
 * @param isCode - True if pure code file, false if markdown/text
 * @returns Caveman-formatted content
 */
const toCaveman = (text: string, isCode: boolean): string => {
  if (!text) return '';

  // Strip box-drawing characters globally (everywhere, including in code)
  text = text.replace(/[┌─┐↓↑├┤└┘]/g, '');

  // For pure code files, apply code compaction
  if (isCode) {
    return compactCode(text);
  }

  // For markdown/text, parse into segments and process each type appropriately
  const segments = parseMarkdown(text);
  return segments
    .map(segment => {
      if (segment.type === 'inline-code') {
        return segment.content; // Preserve inline code completely
      } else if (segment.type === 'code-fence') {
        // Extract code from fence, apply compaction, restore fence
        const match = segment.content.match(/^```(\w+)?\n([\s\S]*?)\n```$/);
        if (match) {
          const [, lang, code] = match;
          return `\`\`\`${lang || ''}\n${compactCode(code)}\n\`\`\``;
        }
        return segment.content;
      } else {
        // Apply stop word removal to plain text segments
        return removeStopWords(segment.content);
      }
    })
    .join('');
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
