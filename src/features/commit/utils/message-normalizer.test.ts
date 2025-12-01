import { describe, expect, it } from 'vitest';

import { normalizeFormat } from './message-normalizer';

describe('normalizeFormat', () => {
  it('normalizes simple commit message with subject only', () => {
    const message = 'feat: add new feature';

    const result = normalizeFormat(message);

    expect(result).toBe('feat: add new feature');
  });

  it('adds blank line separator between subject and body', () => {
    const message = 'feat: add new feature\nthis is the body of the commit';

    const result = normalizeFormat(message);

    expect(result).toBe(
      'feat: add new feature\n\nthis is the body of the commit'
    );
  });

  it('handles multiple blank lines in body by normalizing to single blank line', () => {
    const message = 'feat: add feature\n\n\nbody line 1\n\nbody line 2';

    const result = normalizeFormat(message);

    expect(result).toBe('feat: add feature\n\nbody line 1\n\nbody line 2');
  });

  it('trims whitespace from message', () => {
    const message =
      '  feat:  add new feature  \n\n  body line 1  \n  body line 2  ';

    const result = normalizeFormat(message);

    expect(result).toBe('feat: add new feature\n\nbody line 1\n\nbody line 2');
  });

  it('handles message without colon by returning trimmed message', () => {
    const message = 'simple message without colon';

    const result = normalizeFormat(message);

    expect(result).toBe('simple message without colon');
  });

  it('handles message with only type and no description', () => {
    const message = 'feat:';

    const result = normalizeFormat(message);

    expect(result).toBe('feat');
  });

  it('handles empty message', () => {
    const result = normalizeFormat('');

    expect(result).toBe('');
  });

  it('handles null/undefined input', () => {
    expect(normalizeFormat(null as unknown as string)).toBe('');
    expect(normalizeFormat(undefined as unknown as string)).toBe('');
  });

  it('removes empty lines from body content', () => {
    const message =
      'feat: add feature\n\nbody line 1\n\n\nbody line 2\n\nbody line 3';

    const result = normalizeFormat(message);

    expect(result).toBe(
      'feat: add feature\n\nbody line 1\n\nbody line 2\n\nbody line 3'
    );
  });

  it('handles message with multiple colons correctly', () => {
    const message =
      'docs: update: README with new format\n\nadditional details';

    const result = normalizeFormat(message);

    expect(result).toBe(
      'docs: update: README with new format\n\nadditional details'
    );
  });

  it('preserves subject line with proper formatting', () => {
    const message =
      'fix: resolve authentication issue\n\nThe issue was caused by\ncors configuration\n\nFixed by updating settings';

    const result = normalizeFormat(message);

    expect(result).toBe(
      'fix: resolve authentication issue\n\nThe issue was caused by\n\ncors configuration\n\nFixed by updating settings'
    );
  });

  it('is pure function - same input produces same output', () => {
    const message =
      'refactor: improve performance\n\noptimized database queries';
    const result1 = normalizeFormat(message);
    const result2 = normalizeFormat(message);

    expect(result1).toBe(result2);
  });

  it('handles whitespace-only body content', () => {
    const message = 'chore: update dependencies\n\n\n\n';

    const result = normalizeFormat(message);

    expect(result).toBe('chore: update dependencies');
  });
});
