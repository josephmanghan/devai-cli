import { describe, it, expect } from 'vitest';
import config from './vitest.config';

describe('Vitest Configuration', () => {
  it('should have Node.js environment configured', () => {
    expect(config.test?.environment).toBe('node');
  });

  it('should have globals enabled', () => {
    expect(config.test?.globals).toBe(true);
  });

  it('should have 10 second timeout configured', () => {
    expect(config.test?.timeout).toBe(10000);
  });

  it('should use V8 coverage provider', () => {
    expect(config.test?.coverage?.provider).toBe('v8');
  });

  it('should have coverage thresholds set to 80%', () => {
    const thresholds = config.test?.coverage?.thresholds;
    expect(thresholds?.lines).toBe(80);
    expect(thresholds?.functions).toBe(80);
    expect(thresholds?.branches).toBe(80);
    expect(thresholds?.statements).toBe(80);
  });

  it('should configure coverage reporters', () => {
    const reporters = config.test?.coverage?.reporter;
    expect(reporters).toContain('text');
    expect(reporters).toContain('json');
    expect(reporters).toContain('html');
  });

  it('should have path aliases configured', () => {
    const aliases = config.resolve?.alias;
    expect(aliases?.['@']).toBeDefined();
    expect(aliases?.['@tests']).toBeDefined();
  });

  it('should exclude test files and types from coverage', () => {
    const exclusions = config.test?.coverage?.exclude;
    expect(exclusions).toContain('**/*.test.ts');
    expect(exclusions).toContain('**/*.spec.ts');
    expect(exclusions).toContain('**/*.d.ts');
    expect(exclusions).toContain('tests/helpers/**');
  });
});