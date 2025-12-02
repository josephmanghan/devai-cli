import { readFileSync } from 'node:fs';

import { Command } from 'commander';
import { Ollama } from 'ollama';

import { OllamaModelConfig } from './core/index.js';
import { CommitController } from './features/commit/controllers/commit-controller.js';
import {
  GenerateCommit,
  ValidatePreconditions,
} from './features/commit/index.js';
import { SetupController } from './features/setup/controllers/setup-controller.js';
import {
  EnsureBaseModel,
  ProvisionCustomModel,
  ValidateOllamaConnection,
} from './features/setup/use-cases/index.js';
import {
  CONVENTIONAL_COMMIT_MODEL_CONFIG,
  OllamaAdapter,
  ShellEditorAdapter,
  ShellGitAdapter,
} from './infrastructure/index.js';
import { CommitAdapter } from './ui/adapters/commit-adapter.js';
import { ConsoleSetupRenderer } from './ui/index.js';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/**
 * Create shared infrastructure adapters for CLI commands.
 */
function createSharedAdapters(modelConfig: OllamaModelConfig) {
  const ollamaClient = new Ollama();
  return new OllamaAdapter(
    ollamaClient,
    modelConfig.baseModel,
    modelConfig.systemPrompt,
    modelConfig.parameters
  );
}

/**
 * Composition root - creates and wires all dependencies for commit command.
 */
export function createCommitCommand(
  modelConfig: OllamaModelConfig
): CommitController {
  const ollamaAdapter = createSharedAdapters(modelConfig);
  const gitAdapter = new ShellGitAdapter();
  const editorAdapter = new ShellEditorAdapter();
  const commitUi = new CommitAdapter();

  const validatePreconditions = new ValidatePreconditions(
    gitAdapter,
    ollamaAdapter
  );
  const generateCommit = new GenerateCommit(ollamaAdapter);

  return new CommitController(
    gitAdapter,
    editorAdapter,
    commitUi,
    validatePreconditions,
    generateCommit
  );
}

/**
 * Composition root - creates and wires all dependencies for setup command.
 */
export function createSetupCommand(
  modelConfig: OllamaModelConfig
): SetupController {
  const ollamaAdapter = createSharedAdapters(modelConfig);
  const setupUi = new ConsoleSetupRenderer();

  return new SetupController(
    modelConfig,
    new ValidateOllamaConnection(ollamaAdapter),
    new EnsureBaseModel(ollamaAdapter, modelConfig.baseModel),
    new ProvisionCustomModel(ollamaAdapter, modelConfig),
    setupUi
  );
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

  const commitCommand = createCommitCommand(CONVENTIONAL_COMMIT_MODEL_CONFIG);
  commitCommand.register(program);

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
