import {
  GenerateCommitInput,
  GenerationOptions,
  LlmPort,
  ValidationError,
} from '../../../core/index.js';
import {
  buildUserPrompt,
  enforceType,
  normalizeFormat,
  validateStructure,
} from '../utils/index.js';

export class GenerateCommit {
  private readonly MAX_RETRIES = 5;
  private readonly DEFAULT_GENERATION_OPTIONS: GenerationOptions = {
    model: 'qwen2.5-coder:1.5b',
    temperature: 0.3,
    num_ctx: 10000,
  };

  constructor(private readonly llmProvider: LlmPort) {}

  async execute(input: GenerateCommitInput): Promise<string> {
    this.validateInput(input);
    return await this.executeWithRetry(input);
  }

  private validateInput(input: GenerateCommitInput): void {
    if (input.commitType.trim().length === 0) {
      throw new ValidationError(
        'Commit type cannot be empty',
        '[R]egenerate [E]dit manually [C]ancel'
      );
    }
    if (input.diff.trim().length === 0) {
      throw new ValidationError(
        'Git diff cannot be empty',
        '[R]egenerate [E]dit manually [C]ancel'
      );
    }
  }

  private async executeWithRetry(input: GenerateCommitInput): Promise<string> {
    let retriesLeft = this.MAX_RETRIES;
    let lastValidationError: string | undefined;

    while (retriesLeft > 0) {
      try {
        return await this.attemptGeneration(input, lastValidationError);
      } catch (error) {
        if (error instanceof ValidationError) {
          retriesLeft--;
          lastValidationError = error.message;
          continue;
        }
        throw error;
      }
    }

    throw new ValidationError(
      'Failed to generate valid commit message after maximum attempts',
      '[R]egenerate [E]dit manually [C]ancel'
    );
  }

  private async attemptGeneration(
    input: GenerateCommitInput,
    retryError?: string
  ): Promise<string> {
    const prompt = this.buildPrompt(input, retryError);
    const rawResponse = await this.llmProvider.generate(
      prompt,
      this.DEFAULT_GENERATION_OPTIONS
    );
    return this.processResponse(rawResponse, input.commitType);
  }

  private buildPrompt(input: GenerateCommitInput, retryError?: string): string {
    return buildUserPrompt({
      commitType: input.commitType,
      diff: input.diff,
      status: input.status,
      retryError,
    });
  }

  private processResponse(rawResponse: string, commitType: string): string {
    const parsedMessage = this.parseResponse(rawResponse);
    this.validateMessage(parsedMessage);

    const typeEnforcedMessage = enforceType(parsedMessage, commitType);
    return normalizeFormat(typeEnforcedMessage);
  }

  private validateMessage(message: string): void {
    const validationResult = validateStructure(message);

    if (!validationResult.isValid) {
      throw new ValidationError(
        validationResult.error !== undefined
          ? validationResult.error
          : 'Invalid commit message format'
      );
    }
  }

  private parseResponse(response: string): string {
    const lines = response.trim().split('\n');
    const firstLine = lines[0]?.trim();

    if (firstLine === undefined || firstLine.length === 0) {
      throw new ValidationError('Empty response received from LLM');
    }

    // Remove common conversational prefixes and markdown formatting
    const cleanLine = firstLine
      .replace(/^(Here is|Here's) (the )?commit message:?\s*/i, '')
      .replace(/^Commit message:?\s*/i, '')
      .replace(/^```\w*\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    if (cleanLine.length === 0) {
      throw new ValidationError('Empty response received from LLM');
    }

    return cleanLine;
  }
}
