import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Build Configuration (Story 1.2)', () => {
  it('should have tsup config file with ESM settings', () => {
    const config = readFileSync('tsup.config.ts', 'utf-8');

    expect(config).toContain("entry: ['src/index.ts']");
    expect(config).toContain("format: ['esm']");
    expect(config).toContain('target: \'es2022\'');
    expect(config).toContain('outDir: \'dist\'');
    expect(config).toContain('sourcemap: true');
    expect(config).toContain('minify: true');
    expect(config).toContain('clean: true');
  });
});