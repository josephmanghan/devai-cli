/* eslint-disable n/no-process-exit */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Command, CommanderError } from 'commander';
import { Ollama } from 'ollama';

import { AppError, OllamaModelConfig } from './core/index.js';
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

const currentDir = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(currentDir, '../package.json'), 'utf-8')
);

/**
 * Create Ollama adapter for CLI commands.
 */
function createOllamaAdapter(modelConfig: OllamaModelConfig): OllamaAdapter {
  const ollamaClient = new Ollama();
  return new OllamaAdapter(
    ollamaClient,
    modelConfig.baseModel,
    modelConfig.systemPrompt
  );
}

/**
 * Composition root - creates and wires all dependencies for commit command.
 */
export function createCommitCommand(
  modelConfig: OllamaModelConfig
): CommitController {
  const ollamaAdapter = createOllamaAdapter(modelConfig);
  const gitAdapter = new ShellGitAdapter();
  const editorAdapter = new ShellEditorAdapter();
  const commitUi = new CommitAdapter();

  const validatePreconditions = new ValidatePreconditions(
    gitAdapter,
    ollamaAdapter
  );

  const generateCommit = new GenerateCommit(ollamaAdapter, modelConfig);

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
  const ollamaAdapter = createOllamaAdapter(modelConfig);
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
    .name('devai-cli')
    .description(
      'Local-first CLI tool for AI-powered git commit message generation using Ollama'
    )
    .version(pkg.version, '-v, --version', 'Show version number')
    .option('-a, --all', 'Stage all changes before generating commit');

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
  setupErrorHandlers();

  const program = createProgram();

  program.exitOverride();

  try {
    program.parse();
  } catch (error) {
    if (error instanceof CommanderError && error.exitCode === 0) {
      process.exit(0);
    }
    handleError(error);
  }
}

/**
 * Setup global error handlers for uncaught errors
 */
function setupErrorHandlers(): void {
  process.on('unhandledRejection', (error: unknown) => {
    handleError(error);
  });

  process.on('uncaughtException', (error: unknown) => {
    handleError(error);
  });
}

/**
 * Format and display error to user
 */
function handleError(error: unknown): never {
  if (error instanceof AppError) {
    console.error(`\n❌ ${error.message}`);
    if (error.remediation !== undefined && error.remediation.length > 0) {
      console.error(`\n💡 ${error.remediation}\n`);
    }
    process.exit(error.code);
  }

  if (error instanceof Error) {
    console.error(`\n❌ Unexpected error: ${error.message}\n`);
    process.exit(1);
  }

  console.error(`\n❌ Unknown error occurred\n`);
  process.exit(1);
}
