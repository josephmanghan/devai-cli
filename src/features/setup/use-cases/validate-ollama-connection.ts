import { LlmPort, SystemError } from '../../../core/index.js';

/**
 * Validates Ollama daemon connectivity.
 * Single responsibility: Check that Ollama is running and accessible.
 */
export class ValidateOllamaConnection {
  constructor(private readonly llmPort: LlmPort) {}

  /**
   * Executes daemon connectivity validation.
   *
   * @throws {SystemError} When daemon is not running or not accessible (exit code 3)
   */
  async execute(): Promise<void> {
    const isDaemonConnected = await this.llmPort.checkConnection();

    if (!isDaemonConnected) {
      throw new SystemError(
        'Ollama daemon is not running or accessible',
        'Start Ollama: ollama serve\n\nOr install from: https://ollama.com/download'
      );
    }
  }
}
