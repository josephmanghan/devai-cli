import { describe, expect, it } from 'vitest';

import { validateMessage, validateStructure } from './format-validator';

describe('validateStructure', () => {
  it('accepts valid conventional commit format', () => {
    const result = validateStructure('feat: add new feature');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects empty string', () => {
    const result = validateStructure('');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message must be a non-empty string');
  });

  it('rejects non-string input', () => {
    const result = validateStructure(null as unknown as string);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message must be a non-empty string');
  });

  it('rejects message without colon', () => {
    const result = validateStructure('add new feature');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message must follow format: type: description');
  });

  it('rejects message without description after colon', () => {
    const result = validateStructure('feat: ');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message must follow format: type: description');
  });

  it('accepts whitespace and trims correctly', () => {
    const result = validateStructure('  feat: add new feature  ');

    expect(result.isValid).toBe(true);
  });

  it('accepts different commit types', () => {
    const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];

    types.forEach(type => {
      const result = validateStructure(`${type}: some description`);
      expect(result.isValid).toBe(true);
    });
  });
});

describe('validateMessage', () => {
  it('accepts valid conventional commit with proper description', () => {
    const result = validateMessage('fix: resolve login issue');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects empty description', () => {
    const result = validateMessage('feat: ');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Commit description cannot be empty');
  });

  it('rejects description that is too long', () => {
    const longDescription = 'a'.repeat(101);
    const result = validateMessage(`feat: ${longDescription}`);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      'Commit description must be 100 characters or less'
    );
  });

  it('accepts exactly 100 character description', () => {
    const description = 'a'.repeat(100);
    const result = validateMessage(`feat: ${description}`);

    expect(result.isValid).toBe(true);
  });

  it('rejects invalid commit type with special characters', () => {
    const result = validateMessage('feat@: add new feature');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Commit type must contain only word characters');
  });

  it('handles commit body with multiple colons correctly', () => {
    const result = validateMessage(
      'feat: add feature: with colon in description'
    );

    expect(result.isValid).toBe(true);
  });

  it('is pure function - same input produces same output', () => {
    const message = 'docs: update README';
    const result1 = validateMessage(message);
    const result2 = validateMessage(message);

    expect(result1).toEqual(result2);
  });

  it('handles whitespace correctly', () => {
    const result = validateMessage('  refactor: cleanup code  ');

    expect(result.isValid).toBe(true);
  });
});
