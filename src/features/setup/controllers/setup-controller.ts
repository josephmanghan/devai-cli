import { Command } from 'commander';

import { SetupUiPort } from '../../../core/ports/setup-ui-port.js';
import { AppError, SystemError } from '../../../core/types/errors.types.js';
import type { OllamaModelConfig } from '../../../core/types/llm-types.js';
import { ProvisionEnvironment } from '../use-cases/provision-environment.js';

/**
 * Primary adapter for the `ollatool setup` command.
 * Serves as a thin wrapper that delegates business logic to the ProvisionEnvironment use case.
 */
export class SetupController {
  constructor(
    private readonly modelConfig: OllamaModelConfig,
    private readonly provisionEnvironment: ProvisionEnvironment,
    private readonly ui: SetupUiPort
  ) {}

  /**
   * Registers the setup command with the Commander.js program.
   * @param program - The Commander.js program instance
   */
  register(program: Command): void {
    program
      .command('setup')
      .description('Configure Ollama integration and provision custom model')
      .action(async () => {
        await this.execute();
      });
  }

  /**
   * Executes the setup command by delegating to the ProvisionEnvironment use case.
   */
  private async execute(): Promise<void> {
    try {
      this.ui.showIntro();
      await this.provisionEnvironment.execute();
      this.ui.showOutro(this.modelConfig);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handles errors and rethrows them for proper exit code handling.
   */
  private handleError(error: unknown): never {
    if (error instanceof AppError) {
      throw error;
    }

    const systemError = new SystemError(
      'An unexpected error occurred during setup',
      'This may indicate a bug or configuration issue. Please report this issue with the details above.'
    );
    throw systemError;
  }
}
