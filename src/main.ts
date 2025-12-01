import { readFileSync } from 'node:fs';

import { Command } from 'commander';
import { Ollama } from 'ollama';

import { OllamaModelConfig } from './core/index.js';
import { SetupCommand } from './features/setup/setup-command.js';
import {
  CONVENTIONAL_COMMIT_MODEL_CONFIG,
  OllamaAdapter,
} from './infrastructure/index.js';
import { ConsoleSetupRenderer } from './ui/index.js';

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

  const setupUi = new ConsoleSetupRenderer();

  return new SetupCommand(modelConfig, ollamaAdapter, setupUi);
}

/**
 * Create and configure the CLI program
 * @returns Configured Commander instance
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('ollatool')
    .description(
      'Local-first CLI tool for AI-powered git commit message generation using Ollama'
    )
    .version(pkg.version, '--version', 'Show version number');

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

  program.parse();
}
