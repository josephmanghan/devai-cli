/**
 * Ollama CLI Tool - Local-first git commit message generation
 *
 * CLI bootstrap file with Commander.js setup
 * Entry point is src/index.ts (barrel file).
 */

import { Command } from 'commander';
import { readFileSync } from 'node:fs';

// Package info from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/**
 * Create and configure the CLI program
 * @returns Configured Commander instance
 */
export function createProgram(): Command {
  const program = new Command();

  // Configure program basics
  program
    .name('ollatool')
    .description('Local-first CLI tool for AI-powered git commit message generation using Ollama')
    .version(pkg.version, '--version', 'Show version number');

  return program;
}

/**
 * Main application entry point
 * Executes the CLI program
 */
export function main(): void {
  const program = createProgram();

  // Parse command line arguments
  program.parse();
}
