import { describe, expect, it } from 'vitest';
import { ExampleAdapter } from './example-adapter.js';
import type { ExamplePort } from '../../core/ports/example-port.js';

describe('ExampleAdapter', () => {
  let adapter: ExampleAdapter;

  beforeEach(() => {
    adapter = new ExampleAdapter();
  });

  it('should implement ExamplePort interface', () => {
    expect(adapter).toBeInstanceOf(ExampleAdapter);

    // Verify it implements the interface
    const isPortImplementation = (obj: unknown): obj is ExamplePort => {
      return typeof obj === 'object' && obj !== null && 'process' in obj;
    };

    expect(isPortImplementation(adapter)).toBe(true);
  });

  it('should process input to uppercase', async () => {
    const result = await adapter.process('hello world');
    expect(result).toBe('HELLO WORLD');
  });

  it('should handle empty string', async () => {
    const result = await adapter.process('');
    expect(result).toBe('');
  });

  it('should handle special characters', async () => {
    const result = await adapter.process('Hello! @#$');
    expect(result).toBe('HELLO! @#$');
  });
});
