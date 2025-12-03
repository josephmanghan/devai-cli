# development guide - devai-cli

## prerequisites dependencies

### system requirements

- node.js v20.0.0 higher lts current supported
- ollama latest version`qwen2.5-coder:1.5b`model
- vram 2gb required ai model
- operating system macos linux windows wsl2 supported

### development dependencies```json

{ "@eslint/js": "^9.39.1", "@types/node": "^24.10.1", "@typescript-eslint/eslint-plugin": "^8.48.0", "@typescript-eslint/parser": "^8.48.0", "@vitest/coverage-v8": "^4.0.14", "eslint": "^9.39.1", "eslint-config-prettier": "^10.1.8", "prettier": "^3.0.0", "tsx": "latest", "typescript": "^5.9.3", "vitest": "^4.0.14" }
`### runtime dependencies`json
{ "@clack/prompts": "^0.11.0", "commander": "14.0.2", "debug": "^4.4.3", "execa": "^9.6.1", "ollama": "^0.6.3", "ora": "^9.0.0" }

````## environment setup

 ### 1. install dependencies```bash
npm install
```### 2. install start ollama```bash
# Install Ollama (visit https: # Start Ollama daemon ollama serve
```### 3. setup development environment```bash
# Validate setup and install dependencies npm run validate:setup # Create development symlink for local testing npm run build:link
```### 4. environment configuration

 additional environment variables required. application uses

 - shell commands git operations
 - local ollama instance default http//localhost11434
 - node.js built-in modules file system operations

 ## local development commands

 ### core development```bash
# Run in development mode with hot reload npm run dev # Build the project npm run build # Run type checking without emitting files npm run typecheck
```### testing commands```bash
# Run all tests npm run test # Run unit tests only npm run test:unit # Run integration tests only npm run test:integration # Run E2E tests only npm run test:e2e # Run tests in watch mode npm run test:watch # Run tests with coverage report npm run test:coverage # Run demo scripts npm run test:demo
```### code quality```bash
# Format all code npm run format # Check code formatting npm run format:check # Run linting npm run lint # Fix linting issues npm run lint:fix
```### build distribution```bash
# Build for production npm run build # Full PR validation (format, lint, typecheck, test, build) npm run pr # Lite PR validation (skip integration/E2E tests) npm run pr:lite
```## build process

 ### typescript configuration

 - target es2022
 - module esnext
 - output esm format
 - sourcemap enabled
 - minification enabled production

 ### build tool tsup```typescript
 export default defineConfig({ entry: ['src/index.ts'], format: ['esm'], target: 'es2022', outDir: 'dist', sourcemap: true, minify: true, clean: true, shims: true, });
```### output structure```
dist/ index.js # Main CLI executable index.js.map # Source maps [compiled modules] # All TypeScript modules compiled
```## testing strategy

 ### test organization

 - unit tests`src/**/*.test.ts`- test individual functions classes
 - integration tests`tests/integration/`- test component interactions
 - e2e tests`tests/e2e/`- test complete user workflows
 - test helpers`tests/helpers/`- mocks test utilities

 ### coverage requirements```typescript
 coverage: { thresholds: { lines: 80, functions: 80, branches: 80, statements: 80, }, }
```### test environment

 - runtime node.js environment
 - timeout 15 seconds per test
 - globals vitest globals enabled
 - path aliases`@/``src/``@tests/``tests/`### test utilities

 - git harness`tests/helpers/git-harness.ts`- isolated git repositories
 - mock llm provider`tests/helpers/mock-llm-provider.ts`- simulated ai responses
 - performance tracker`tests/helpers/performance-tracker.ts`- test performance monitoring

 ## common development tasks

 ### adding new cli commands

 1. create controller`src/features/[feature]/controllers/`2. implement use cases`src/features/[feature]/use-cases/`3. add command registration`src/main.ts`4. write unit integration tests
 5. update documentation

 ### modifying ai model configuration

 1. edit`src/infrastructure/config/conventional-commit-model.config.ts`2. update system prompt model parameters
 3. test different models using`npm run test:demo`4. update setup documentation

 ### adding new adapters

 1. define port interface`src/core/ports/`2. implement adapter`src/infrastructure/adapters/`3. create use case appropriate feature
 4. write comprehensive tests
 5. update dependency injection`src/main.ts`### debugging ai integration```bash
# Enable debug logging DEBUG=devai-cli:* npm run dev # Test with custom prompts tsx scripts/run-demos.ts # Test Ollama connection directly npm run validate:setup
```## code style standards

 ### eslint configuration

 - strict typescript type-aware linting enabled
 - import sorting automatic import organization
 - code complexity max 10 complexity per function
 - function length max 20 lines excluding tests
 - naming conventions camelcase variables pascalcase types

 ### prettier configuration

 - tab width spaces
 - semi-colons required
 - quotes single quotes
 - trailing commas es5 compatible
 - print width 80 characters

 ### typescript standards

 - strict mode enabled
 - implicit disallowed
 - unused variables error underscore exception
 - return awaiting required async functions
 - boolean expressions strict type checking

 ## performance considerations

 ### ai model performance

 - model qwen2.5-coder1.5b optimized commit messages
 - context window 131072 tokens
 - temperature 0.2 consistent responses
 - keep alive cleanup use

 ### git operations

 - shell commands use execa better error handling
 - large diffs performance optimization development
 - concurrent operations sequential processing avoid conflicts

 ### memory management

 - stream processing large git diffs
 - connection cleanup proper ollama client disposal
 - error boundaries comprehensive error recovery

 ## troubleshooting

 ### common issues

 ollama connection errors```bash
# Check Ollama status ollama list # Restart Ollama daemon ollama serve # Validate connection npm run validate:setup
```build issues```bash
# Clean build rm -rf dist node_modules npm install npm run build
```test failures```bash
# Check Git configuration git config --global user.name "Test User" git config --global user.email "test@example.com" # Run tests with verbose output npm run test -- --reporter=verbose
```performance issues```bash
# Check available VRAM ollama ps # Monitor performance DEBUG=devai-cli:performance npm run test:demo
````
