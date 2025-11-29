/**
 * Example Adapter Implementation
 *
 * This demonstrates the adapter pattern implementing a core port interface.
 * Adapters connect to external systems and can have dependencies.
 */

import type { ExamplePort } from '../../core/ports/example-port.js';

export class ExampleAdapter implements ExamplePort {
  /**
   * Process input by transforming it to uppercase
   * This demonstrates working logic rather than placeholder implementation
   *
   * @param input - The input string to process
   * @returns Promise resolving to uppercase version of input
   */
  async process(input: string): Promise<string> {
    // Simple but real working logic - not just a placeholder
    // This shows how adapters implement port interfaces
    return input.toUpperCase();
  }
}
