import { describe, expect, it } from 'vitest';

import { enforceType } from './type-enforcer';

describe('enforceType', () => {
  it('overwrites existing commit type with new type', () => {
    const originalMessage = 'fix: resolve login issue';
    const newType = 'feat';

    const result = enforceType(originalMessage, newType);

    expect(result).toBe('feat: resolve login issue');
  });

  it('handles whitespace in message and type correctly', () => {
    const originalMessage = '  fix:  resolve login issue  ';
    const newType = '  feat  ';

    const result = enforceType(originalMessage, newType);

    expect(result).toBe('feat: resolve login issue');
  });

  it('adds type to message without existing type', () => {
    const originalMessage = 'resolve login issue';
    const newType = 'fix';

    const result = enforceType(originalMessage, newType);

    expect(result).toBe('fix: resolve login issue');
  });

  it('handles empty original message', () => {
    const result = enforceType('', 'feat');

    expect(result).toBe('');
  });

  it('handles null/undefined original message', () => {
    expect(enforceType(null as unknown as string, 'feat')).toBe('');
    expect(enforceType(undefined as unknown as string, 'feat')).toBe('');
  });

  it('handles empty new type by returning original message', () => {
    const originalMessage = 'feat: add new feature';

    const result = enforceType(originalMessage, '');

    expect(result).toBe('feat: add new feature');
  });

  it('handles null/undefined new type by returning original message', () => {
    const originalMessage = 'feat: add new feature';

    expect(enforceType(originalMessage, null as unknown as string)).toBe(
      'feat: add new feature'
    );
    expect(enforceType(originalMessage, undefined as unknown as string)).toBe(
      'feat: add new feature'
    );
  });

  it('handles message with only type and no description', () => {
    const originalMessage = 'feat:';
    const newType = 'fix';

    const result = enforceType(originalMessage, newType);

    expect(result).toBe('fix');
  });

  it('preserves description with multiple colons correctly', () => {
    const originalMessage = 'docs: update: README with new format';
    const newType = 'chore';

    const result = enforceType(originalMessage, newType);

    expect(result).toBe('chore: update: README with new format');
  });

  it('handles message with leading whitespace before description', () => {
    const originalMessage = 'feat:   add new feature';
    const newType = 'fix';

    const result = enforceType(originalMessage, newType);

    expect(result).toBe('fix: add new feature');
  });

  it('is pure function - same input produces same output', () => {
    const originalMessage = 'refactor: improve performance';
    const newType = 'perf';

    const result1 = enforceType(originalMessage, newType);
    const result2 = enforceType(originalMessage, newType);

    expect(result1).toBe(result2);
  });

  it('handles edge case with only whitespace message', () => {
    const result = enforceType('   ', 'feat');

    expect(result).toBe('feat: ');
  });
});
