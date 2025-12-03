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

/**
 * Generates commit messages using an LLM with retry logic and validation.
 * Implements structured generation with error recovery to ensure high-quality output.
 */
export class GenerateCommit {
  private readonly MAX_RETRIES = 5;
  private readonly DEFAULT_GENERATION_OPTIONS: GenerationOptions = {
    model: 'qwen2.5-coder:1.5b',
    temperature: 0.3,
    num_ctx: 10000,
  };

  constructor(private readonly llmProvider: LlmPort) {}

  /**
   * Executes the commit message generation process.
   *
   * @param input - Contains commit type, git diff, and optional status information
   * @returns Promise<string> - The generated and validated commit message
   * @throws {ValidationError} When input validation fails
   */
  async execute(input: GenerateCommitInput): Promise<string> {
    this.validateInput(input);
    return await this.executeWithRetry(input);
  }

  /**
   * Validates the input parameters before generation.
   *
   * @param input - The input to validate
   * @throws {ValidationError} When commit type or diff is empty
   */
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

  /**
   * Executes generation with retry logic for validation failures.
   *
   * @param input - The input for commit generation
   * @returns Promise<string> - Successfully generated commit message
   * @throws {ValidationError} When maximum retries are exceeded
   */
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

  /**
   * Attempts a single generation attempt with the LLM.
   *
   * @param input - The input for commit generation
   * @param retryError - Previous validation error to guide correction
   * @returns Promise<string> - Processed and validated commit message
   * @throws {ValidationError} When response processing fails
   */
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

  /**
   * Builds the user prompt for the LLM.
   *
   * @param input - The input for commit generation
   * @param retryError - Optional previous error for retry context
   * @returns string - The formatted prompt for the LLM
   */
  private buildPrompt(input: GenerateCommitInput, retryError?: string): string {
    return buildUserPrompt({
      commitType: input.commitType,
      diff: input.diff,
      status: input.status,
      retryError,
    });
  }

  /**
   * Processes the raw LLM response through parsing, validation, and formatting.
   *
   * @param rawResponse - The raw response from the LLM
   * @param commitType - The expected commit type for enforcement
   * @returns string - The processed and formatted commit message
   * @throws {ValidationError} When message validation fails
   */
  private processResponse(rawResponse: string, commitType: string): string {
    const parsedMessage = this.parseResponse(rawResponse);
    this.validateMessage(parsedMessage);

    const typeEnforcedMessage = enforceType(parsedMessage, commitType);
    return normalizeFormat(typeEnforcedMessage);
  }

  /**
   * Validates the structure of the generated commit message.
   *
   * @param message - The commit message to validate
   * @throws {ValidationError} When message structure is invalid
   */
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

  /**
   * Parses the raw LLM response to extract the commit message.
   * Removes conversational prefixes and markdown formatting.
   *
   * @param response - The raw response from the LLM
   * @returns string - The cleaned commit message
   * @throws {ValidationError} When response is empty after cleaning
   */
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
