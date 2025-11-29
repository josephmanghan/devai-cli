/**
 * Example Port Interface
 *
 * This is a demonstration of port interface pattern per hexagonal architecture.
 * Ports define contracts without external dependencies.
 *
 * @example
 * ```typescript
 * // Adapter implements this interface
 * class ExampleAdapter implements ExamplePort {
 *   async process(input: string): Promise<string> {
 *     return input.toUpperCase();
 *   }
 * }
 * ```
 */

export interface ExamplePort {
  /**
   * Process the input and return a result
   * @param input - The input string to process
   * @returns Promise resolving to processed string
   */
  process(input: string): Promise<string>;
}
