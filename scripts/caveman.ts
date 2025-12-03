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

const STOP_WORDS = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  "aren't",
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  "can't",
  'cannot',
  'could',
  "couldn't",
  'did',
  "didn't",
  'do',
  'does',
  "doesn't",
  'doing',
  "don't",
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  "hadn't",
  'has',
  "hasn't",
  'have',
  "haven't",
  'having',
  'he',
  "he'd",
  "he'll",
  "he's",
  'her',
  'here',
  "here's",
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  "how's",
  'i',
  "i'd",
  "i'll",
  "i'm",
  "i've",
  'if',
  'in',
  'into',
  'is',
  "isn't",
  'it',
  "it's",
  'its',
  'itself',
  "let's",
  'me',
  'more',
  'most',
  "mustn't",
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'ought',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  "shan't",
  'she',
  "she'd",
  "she'll",
  "she's",
  'should',
  "shouldn't",
  'so',
  'some',
  'such',
  'than',
  'that',
  "that's",
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  "there's",
  'these',
  'they',
  "they'd",
  "they'll",
  "they're",
  "they've",
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  "wasn't",
  'we',
  "we'd",
  "we'll",
  "we're",
  "we've",
  'were',
  "weren't",
  'what',
  "what's",
  'when',
  "when's",
  'where',
  "where's",
  'which',
  'while',
  'who',
  "who's",
  'whom',
  'why',
  "why's",
  'with',
  "won't",
  'would',
  "wouldn't",
  'you',
  "you'd",
  "you'll",
  "you're",
  "you've",
  'your',
  'yours',
  'yourself',
  'yourselves',
]);

// Parse CLI Args
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    input: {
      type: 'string',
      short: 'i',
      default: './devai-cli-document-project',
    },
    output: { type: 'string', short: 'o', default: './caveman-docs' },
  },
});

const toCaveman = (text: string, isCode: boolean): string => {
  if (!text) return '';

  // STRATEGY FOR CODE FILES (Experimental)
  // Don't remove stopwords from code, it breaks logic. Just compact it.
  if (isCode) {
    return text
      .replace(/\/\/.*$/gm, '') // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\s+/g, ' '); // Compact whitespace
  }

  // STRATEGY FOR TEXT/MARKDOWN
  let processed = text.toLowerCase();

  // 1. Protect Structure: Turn newlines into a temporary placeholder
  processed = processed.replace(/\n/g, ' __NEWLINE__ ');

  // 2. Clean Punctuation (Keep # for headers, - for lists)
  processed = processed.replace(/[^\w\s#\-\.\/]/g, '');

  // 3. Process Words
  const words = processed.split(' ').filter(word => {
    const cleanWord = word.trim();
    if (cleanWord === '__newline__') return true; // Keep structure
    // Keep headers/lists
    if (cleanWord.startsWith('#') || cleanWord.startsWith('-')) return true;
    return !STOP_WORDS.has(cleanWord) && cleanWord.length > 1;
  });

  // 4. Reassemble and restore newlines
  return words
    .join(' ')
    .replace(/__newline__/gi, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};

// Recursive file walker
const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
  const files = readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

const processFiles = (): void => {
  const inputDir = values.input!; // Non-null assertion because of default
  const outputDir = values.output!;

  console.log(`🚀 Starting Caveman Converter`);
  console.log(`   Input:  ${inputDir}`);
  console.log(`   Output: ${outputDir}`);
  console.log('---');

  if (!existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  const allFiles = getAllFiles(inputDir);
  const supportedExtensions = ['.md', '.txt', '.js', '.ts', '.json'];

  let totalOriginal = 0;
  let totalCaveman = 0;
  let processedCount = 0;

  for (const filePath of allFiles) {
    const ext = extname(filePath);
    if (!supportedExtensions.includes(ext)) continue;

    // Determine output path (mirroring directory structure)
    const relativePath = relative(inputDir, filePath);
    const outputPath = join(outputDir, relativePath);

    // Ensure subdir exists
    mkdirSync(dirname(outputPath), { recursive: true });

    const content = readFileSync(filePath, 'utf-8');
    const isCode = ['.js', '.ts', '.json'].includes(ext);

    const cavemanContent = toCaveman(content, isCode);

    writeFileSync(outputPath, cavemanContent, 'utf-8');

    totalOriginal += content.length;
    totalCaveman += cavemanContent.length;
    processedCount++;
  }

  const reduction = Math.round((1 - totalCaveman / totalOriginal) * 100);

  console.log(`📊 SUMMARY:`);
  console.log(`   Files processed: ${processedCount}`);
  console.log(`   Original Size:   ${(totalOriginal / 1024).toFixed(2)} KB`);
  console.log(`   Caveman Size:    ${(totalCaveman / 1024).toFixed(2)} KB`);
  console.log(`   Total Reduction: ${reduction}% 📉`);
};

processFiles();
