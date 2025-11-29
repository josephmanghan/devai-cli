import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import n from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  js.configs.recommended,
  {
    ...n.configs['flat/recommended-module'],
    settings: {
      node: {
        convertPath: {
          'src/**/*.ts': ['^src/(.+?)\\.ts$', 'dist/$1.js'],
        },
      },
    },
  },
  {
    plugins: {
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  prettierConfig,
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.test.ts'], // Exclude test files from type-aware parsing
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        performance: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-unused-vars': 'off',
      'max-lines-per-function': [
        'error',
        {
          max: 15,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      complexity: ['warn', 10],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
        },
        {
          selector: 'function',
          format: ['camelCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
    },
  },
  // Test files: Basic parsing (no type-aware checking)
  {
    files: ['src/**/*.test.ts', 'tests/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        // Explicitly disable projectService to override production config
        projectService: false,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'off',
      'max-lines-per-function': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-missing-import': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'scripts/**',
      '*.config.js',
      '*.config.cjs',
      '.vscode/**',
      'dev/ux-color-themes.html',
      '.bmad/**',
    ],
  },
];
