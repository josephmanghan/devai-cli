import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import type { OllamaModelConfig } from './core/types/llm-types.js';
import { SetupCommand } from './features/setup/setup-command.js';
import { CONVENTIONAL_COMMIT_MODEL_CONFIG } from './infrastructure/config/conventional-commit-model.config.js';

// Package info from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/**
 * Factory function for creating setup commands with different model types.
 * Enables clean extensibility.
 */
export function createSetupCommand(
  modelConfig: OllamaModelConfig
): SetupCommand {
  return new SetupCommand(modelConfig);
}

/**
 * Create and configure the CLI program
 * @returns Configured Commander instance
 */
export function createProgram(): Command {
  const program = new Command();

  // Configure program basics
  program
    .name('ollatool')
    .description(
      'Local-first CLI tool for AI-powered git commit message generation using Ollama'
    )
    .version(pkg.version, '--version', 'Show version number');

  // Register setup command
  const setupCommand = createSetupCommand(CONVENTIONAL_COMMIT_MODEL_CONFIG);
  setupCommand.register(program);

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
