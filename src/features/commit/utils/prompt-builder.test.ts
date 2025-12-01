import { describe, expect, it } from 'vitest';

import { buildUserPrompt, PromptParameters } from './prompt-builder';

describe('buildUserPrompt', () => {
  it('builds prompt with all required parameters', () => {
    const params: PromptParameters = {
      commitType: 'feat',
      diff: 'src/app.ts\n+ new feature',
      status: 'modified',
    };

    const result = buildUserPrompt(params);

    expect(result).toContain('Commit Type: feat');
    expect(result).toContain('Current Status: modified');
    expect(result).toContain('Git Diff:');
    expect(result).toContain('src/app.ts\n+ new feature');
    expect(result).toContain('feat: description');
  });

  it('handles empty diff', () => {
    const params: PromptParameters = {
      commitType: 'fix',
      diff: '',
      status: 'added',
    };

    const result = buildUserPrompt(params);

    expect(result).toContain('Commit Type: fix');
    expect(result).toContain('Current Status: added');
    expect(result).toContain('Git Diff:\n\n');
    expect(result).toContain('fix: description');
  });

  it('handles special characters in diff', () => {
    const params: PromptParameters = {
      commitType: 'docs',
      diff: 'README.md\n- removed line\n+ added line with "quotes" & symbols',
      status: 'modified',
    };

    const result = buildUserPrompt(params);

    expect(result).toContain('Commit Type: docs');
    expect(result).toContain(
      '- removed line\n+ added line with "quotes" & symbols'
    );
    expect(result).toContain('docs: description');
  });

  it('is pure function - same input produces same output', () => {
    const params: PromptParameters = {
      commitType: 'refactor',
      diff: 'src/utils.ts',
      status: 'deleted',
    };

    const result1 = buildUserPrompt(params);
    const result2 = buildUserPrompt(params);

    expect(result1).toBe(result2);
  });

  it('handles multiline diffs', () => {
    const params: PromptParameters = {
      commitType: 'chore',
      diff: 'package.json\n+ "dependency": "^1.0.0"\nsrc/config.ts\n- old config\n+ new config',
      status: 'modified',
    };

    const result = buildUserPrompt(params);

    expect(result).toContain('package.json\n+ "dependency": "^1.0.0"');
    expect(result).toContain('src/config.ts\n- old config\n+ new config');
  });
});
