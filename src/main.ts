import { readFileSync } from 'node:fs';

import { Command } from 'commander';
import { Ollama } from 'ollama';

import type { OllamaModelConfig } from './core/types/llm-types.js';
import { SetupCommand } from './features/setup/setup-command.js';
import { CONVENTIONAL_COMMIT_MODEL_CONFIG } from './infrastructure/config/conventional-commit-model.config.js';
import { OllamaAdapter } from './infrastructure/llm/ollama-adapter.js';
import { ConsoleSetupRenderer } from './ui/setup/console-setup-renderer.js';

// Package info from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/**
 * Composition root - creates and wires all dependencies.
 */
export function createSetupCommand(
  modelConfig: OllamaModelConfig
): SetupCommand {
  const ollamaClient = new Ollama();
  const ollamaAdapter = new OllamaAdapter(
    ollamaClient,
    modelConfig.baseModel,
    modelConfig.systemPrompt,
    modelConfig.parameters
  );

  // Create Setup UI renderer
  const setupUi = new ConsoleSetupRenderer();

  // Create and inject dependencies into feature
  return new SetupCommand(modelConfig, ollamaAdapter, setupUi);
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

  // Register setup command with proper DI wiring
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
