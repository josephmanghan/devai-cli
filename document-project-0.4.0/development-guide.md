# Development Guide - devai-cli

## Prerequisites and Dependencies

### System Requirements

- **Node.js**: v20.0.0 or higher (LTS and Current supported)
- **Ollama**: Latest version with `qwen2.5-coder:1.5b` model
- **VRAM**: ~2GB required for the AI model
- **Operating System**: macOS, Linux, Windows (WSL2 supported)

### Development Dependencies

```json
{
  "@eslint/js": "^9.39.1",
  "@types/node": "^24.10.1",
  "@typescript-eslint/eslint-plugin": "^8.48.0",
  "@typescript-eslint/parser": "^8.48.0",
  "@vitest/coverage-v8": "^4.0.14",
  "eslint": "^9.39.1",
  "eslint-config-prettier": "^10.1.8",
  "prettier": "^3.0.0",
  "tsx": "latest",
  "typescript": "^5.9.3",
  "vitest": "^4.0.14"
}
```

### Runtime Dependencies

```json
{
  "@clack/prompts": "^0.11.0",
  "commander": "14.0.2",
  "debug": "^4.4.3",
  "execa": "^9.6.1",
  "ollama": "^0.6.3",
  "ora": "^9.0.0"
}
```

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install and Start Ollama

```bash
# Install Ollama (visit https://ollama.com/download)
# Start Ollama daemon
ollama serve
```

### 3. Setup Development Environment

```bash
# Validate setup and install dependencies
npm run validate:setup

# Create development symlink for local testing
npm run build:link
```

### 4. Environment Configuration

No additional environment variables required. The application uses:

- Shell commands for Git operations
- Local Ollama instance (default: http://localhost:11434)
- Node.js built-in modules for file system operations

## Local Development Commands

### Core Development

```bash
# Run in development mode with hot reload
npm run dev

# Build the project
npm run build

# Run type checking without emitting files
npm run typecheck
```

### Testing Commands

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run demo scripts
npm run test:demo
```

### Code Quality

```bash
# Format all code
npm run format

# Check code formatting
npm run format:check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Build and Distribution

```bash
# Build for production
npm run build

# Full PR validation (format, lint, typecheck, test, build)
npm run pr

# Lite PR validation (skip integration/E2E tests)
npm run pr:lite
```

## Build Process

### TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext
- **Output**: ESM format
- **Sourcemap**: Enabled
- **Minification**: Enabled (production)

### Build Tool: tsup

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  outDir: 'dist',
  sourcemap: true,
  minify: true,
  clean: true,
  shims: true,
});
```

### Output Structure

```
dist/
├── index.js              # Main CLI executable
├── index.js.map          # Source maps
└── [compiled modules]    # All TypeScript modules compiled
```

## Testing Strategy

### Test Organization

- **Unit Tests**: `src/**/*.test.ts` - Test individual functions and classes
- **Integration Tests**: `tests/integration/` - Test component interactions
- **E2E Tests**: `tests/e2e/` - Test complete user workflows
- **Test Helpers**: `tests/helpers/` - Mocks and test utilities

### Coverage Requirements

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

### Test Environment

- **Runtime**: Node.js environment
- **Timeout**: 15 seconds per test
- **Globals**: Vitest globals enabled
- **Path Aliases**: `@/` for `src/`, `@tests/` for `tests/`

### Test Utilities

- **Git Harness**: `tests/helpers/git-harness.ts` - Isolated Git repositories
- **Mock LLM Provider**: `tests/helpers/mock-llm-provider.ts` - Simulated AI responses
- **Performance Tracker**: `tests/helpers/performance-tracker.ts` - Test performance monitoring

## Common Development Tasks

### Adding New CLI Commands

1. Create controller in `src/features/[feature]/controllers/`
2. Implement use cases in `src/features/[feature]/use-cases/`
3. Add command registration in `src/main.ts`
4. Write unit and integration tests
5. Update documentation

### Modifying AI Model Configuration

1. Edit `src/infrastructure/config/conventional-commit-model.config.ts`
2. Update system prompt and model parameters
3. Test with different models using `npm run test:demo`
4. Update setup documentation

### Adding New Adapters

1. Define port interface in `src/core/ports/`
2. Implement adapter in `src/infrastructure/adapters/`
3. Create use case in appropriate feature
4. Write comprehensive tests
5. Update dependency injection in `src/main.ts`

### Debugging AI Integration

```bash
# Enable debug logging
DEBUG=devai-cli:* npm run dev

# Test with custom prompts
tsx scripts/run-demos.ts

# Test Ollama connection directly
npm run validate:setup
```

## Code Style and Standards

### ESLint Configuration

- **Strict TypeScript**: Type-aware linting enabled
- **Import Sorting**: Automatic import organization
- **Code Complexity**: Max 10 complexity per function
- **Function Length**: Max 20 lines (excluding tests)
- **Naming Conventions**: camelCase variables, PascalCase types

### Prettier Configuration

- **Tab Width**: 2 spaces
- **Semi-colons**: Required
- **Quotes**: Single quotes
- **Trailing Commas**: ES5 compatible
- **Print Width**: 80 characters

### TypeScript Standards

- **Strict Mode**: Enabled
- **No Implicit Any**: Disallowed
- **Unused Variables**: Error (with underscore exception)
- **Return Awaiting**: Required for async functions
- **Boolean Expressions**: Strict type checking

## Performance Considerations

### AI Model Performance

- **Model**: qwen2.5-coder:1.5b optimized for commit messages
- **Context Window**: 131,072 tokens
- **Temperature**: 0.2 (consistent responses)
- **Keep Alive**: 0 (cleanup after use)

### Git Operations

- **Shell Commands**: Use execa for better error handling
- **Large Diffs**: Performance optimization in development
- **Concurrent Operations**: Sequential processing to avoid conflicts

### Memory Management

- **Stream Processing**: For large git diffs
- **Connection Cleanup**: Proper Ollama client disposal
- **Error Boundaries**: Comprehensive error recovery

## Troubleshooting

### Common Issues

**Ollama Connection Errors**

```bash
# Check Ollama status
ollama list

# Restart Ollama daemon
ollama serve

# Validate connection
npm run validate:setup
```

**Build Issues**

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

**Test Failures**

```bash
# Check Git configuration
git config --global user.name "Test User"
git config --global user.email "test@example.com"

# Run tests with verbose output
npm run test -- --reporter=verbose
```

**Performance Issues**

```bash
# Check available VRAM
ollama ps

# Monitor performance
DEBUG=devai-cli:performance npm run test:demo
```
