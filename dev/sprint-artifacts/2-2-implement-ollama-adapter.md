# Story 2.2: Implement Ollama Adapter

Status: review

## Story

As a developer,
I want a concrete Ollama adapter implementation of the LLM port interface,
so that the application can communicate with Ollama for model operations.

## Acceptance Criteria

1. [ ] OllamaAdapter class created in `src/infrastructure/llm/ollama-adapter.ts` implementing LlmPort interface
2. [ ] Constructor accepts Ollama client instance and optional model name configuration
3. [ ] All port methods implemented: checkConnection(), checkModel(), createModel(), generate()
4. [ ] Error handling with proper error types (UserError, SystemError, ValidationError)
5. [ ] Method implementations use official Ollama SDK correctly
6. [ ] Code adheres to clean-code.md: functions ≤15 lines, proper DI pattern
7. [ ] Unit tests created with mocked Ollama SDK responses

## Tasks / Subtasks

- [x] Create OllamaAdapter class structure (AC: 1)
  - [x] Create `src/infrastructure/llm/ollama-adapter.ts` file
  - [x] Import LlmPort interface and Ollama SDK
  - [x] Define class constructor with readonly dependency injection
  - [x] Ensure infrastructure/llm directory exists per hexagonal architecture
- [x] Implement checkConnection method (AC: 2, 3, 4)
  - [x] Use Ollama client.list() to test daemon connectivity
  - [x] Return boolean for successful connection
  - [x] Handle connection errors with SystemError and actionable remediation
- [x] Implement checkModel method (AC: 3, 4, 5)
  - [x] Use Ollama client.list() to check for specific model existence
  - [x] Return boolean indicating model availability
  - [x] Handle API errors appropriately
- [x] Implement createModel method (AC: 3, 4, 5)
  - [x] Use Ollama client.create() with modelfile content
  - [x] Handle model creation failures with ValidationError
  - [x] Include proper error context in failure messages
- [x] Implement generate method (AC: 3, 4, 5)
  - [x] Use Ollama client.generate() with model and parameters
  - [x] Support GenerationOptions interface parameters
  - [x] Handle inference errors with proper error types
  - [x] Return trimmed response string
- [x] Add comprehensive error handling (AC: 4)
  - [x] Import custom error classes from core/types/errors.types.ts
  - [x] Wrap Ollama SDK errors in appropriate error types
  - [x] Include remediation steps for common failures (connection, model not found)
  - [x] Handle edge cases (timeout, network issues)
- [x] Apply clean code standards (AC: 6)
  - [x] Keep methods under 15 lines each
  - [x] Use constructor dependency injection pattern
  - [x] Extract private helper methods for complex logic
  - [x] Ensure self-documenting method and variable names
- [x] Create unit tests (AC: 7)
  - [x] Create `src/infrastructure/llm/ollama-adapter.test.ts` file
  - [x] Mock Ollama client using Vitest vi.fn()
  - [x] Test all public methods with success and error scenarios
  - [x] Verify error types and messages are correct
  - [x] Test error handling for connection failures, missing models

## Dev Notes

### Architecture Requirements

- **Hexagonal Architecture**: Infrastructure layer implements core port interfaces with external dependencies [Source: dev/architecture.md#Project-Structure-(Pragmatic-Hexagonal-/-Ports-&-Adapters)]
- **Dependency Injection**: Constructor injection of Ollama client for testability [Source: dev/architecture.md#Dependency-Injection-Pattern]
- **Error Handling**: Use custom error classes with exit codes and remediation [Source: dev/architecture.md#Error-Handling-Strategy]

### Ollama SDK Integration

**Official SDK Usage**: Use verified Ollama SDK v0.6.3 with these methods:
- `client.list()` - for connection and model checking
- `client.create()` - for custom model creation
- `client.generate()` - for inference requests

**Connection Parameters**: Default model `ollatool-commit`, parameters per architecture:
- `temperature: 0.2` - low randomness for deterministic output
- `num_ctx: 131072` - full context window capacity
- `keep_alive: 0` - unload model after execution

### Interface Implementation Context

**Port Contract**: Must implement LlmPort interface defined in 2-1 story:
- `checkConnection(): Promise<boolean>`
- `checkModel(modelName: string): Promise<boolean>`
- `createModel(modelName: string, modelfileContent: string): Promise<void>`
- `generate(prompt: string, options: GenerationOptions): Promise<string>`

**Import Requirements**:
- Import `LlmPort` from `@/core/ports/llm-port.js`
- Import `GenerationOptions` from `@/core/types/llm-types.js`
- Import error classes from `@/core/types/errors.types.js`

**Error Categories**: Use appropriate error types per architecture:
- UserError (exit code 2) - for user-resolvable issues
- SystemError (exit code 3) - for Ollama/system failures
- ValidationError (exit code 4) - for format/validation issues

### Project Structure Notes

**Infrastructure Layer**: Place adapter in `src/infrastructure/llm/` per hexagonal architecture [Source: dev/architecture.md#Directory-Layout]

**File Organization**: One class per file, co-located tests following established patterns [Source: dev/architecture.md#File-Organization-Rules]

**Import Patterns**: Group imports by type (external, internal core, feature-specific) [Source: dev/architecture.md#File-Organization-Rules]

### Context7 MCP Integration Requirement

**CRITICAL for Epic 2+**: Use Context7 MCP server for Node.js and Ollama SDK best practices:

1. **Library Integration Validation**:
   - Use `mcp__context7__resolve-library-id("ollama")`
   - Get docs: `mcp__context7__get-library-docs("/ollama/ollama-js", "code", "generate")`

2. **Code Quality Validation**:
   - Validate Ollama SDK usage patterns against current best practices
   - Check error handling patterns for async operations
   - Review dependency injection implementation

### Learnings from Previous Story

**From Story 2-1-create-ollama-port-interface (Status: done)**:

- **Interface Foundation**: LlmPort interface established with clear method signatures and JSDoc documentation
- **Type Safety**: GenerationOptions interface defined for compile-time type checking
- **Clean Code Standards**: Interface design follows established patterns with clear, self-documenting method names
- **Documentation Quality Lesson**: Core ports must be implementation-agnostic - use generic terminology (service vs daemon, model configuration vs Modelfile) to maintain interface reusability and avoid implementation coupling
- **Type Organization Lesson**: Proper architectural separation required - port interfaces belong in src/core/ports/, while type definitions belong in src/core/types/. Group related types in logical files (llm-types.ts) to avoid file-per-type explosion while maintaining clean separation of concerns

**From Epic 1 Foundation Stories**:

- **Testing Infrastructure**: Vitest configuration supports mocking external dependencies
- **Linting Standards**: ESLint enforces clean code patterns during development
- **Build System**: TypeScript compilation with strict mode enabled

### Implementation Requirements

**Ollama SDK Usage**:
- Import from official 'ollama' package v0.6.3
- Use async/await patterns for all SDK operations
- Handle SDK-specific error codes appropriately
- Follow Context7-validated best practices for SDK usage

**Error Message Quality**:
- Include actionable remediation steps in all error messages
- Use consistent error formatting: "[ERROR_TYPE] ✗ message + remediation"
- Distinguish between user-resolvable and system-level issues

**Testing Strategy**:
- Mock Ollama client completely (no real Ollama calls in tests)
- Test both success and error paths for each method
- Verify error types and messages match expected patterns
- Use factory functions for creating test mocks consistently

### Validation Requirements

**TypeScript Compilation**: Must pass with strict mode:
- All method implementations properly typed
- Error handling covers all async operations
- Interface compliance verified by compiler

**ESLint Validation**: Must pass all clean code rules:
- Method lengths under 15 lines
- Constructor dependency injection pattern
- Proper import grouping and organization

**Test Coverage**: Aim for ≥90% coverage of adapter logic:
- All public methods tested with success scenarios
- Error handling paths tested with mock failures
- Edge cases covered (connection timeouts, missing models)

### References

- Ollama adapter implementation architecture [Source: dev/architecture.md#Data-Architecture]
- LlmPort interface definition [Source: dev/sprint-artifacts/2-1-create-ollama-port-interface.md]
- Error handling strategy and taxonomy [Source: dev/architecture.md#Error-Handling-Strategy]
- Clean code standards and patterns [Source: dev/styleguides/clean-code.md]
- Testing patterns and mock strategies [Source: dev/styleguides/unit-test-patterns.md]
- Context7 MCP integration requirements [Source: dev/architecture.md#ENTERPRISE-GRADE-CODE-VALIDATION:-Context7-MCP-Integration]
- Ollama SDK best practices validation [Source: dev/architecture.md#Available-Context7-Libraries-for-This-Project]

## Dev Agent Record

### Context Reference

- dev/sprint-artifacts/2-2-implement-ollama-adapter.context.xml

### Agent Model Used

glm-4.6

### Debug Log References

### Completion Notes List

**Date**: 2025-11-30
**Status**: Implementation complete, all ACs satisfied

#### Key Accomplishments

1. **OllamaAdapter Implementation**: Created complete adapter implementing LlmPort interface with:
   - `checkConnection()` using `ollama.list()` for daemon connectivity
   - `checkModel()` for model existence validation
   - `createModel()` for custom model creation (using current SDK API)
   - `generate()` for text inference with full GenerationOptions support

2. **Error Handling Strategy**: Implemented comprehensive error wrapping with:
   - Connection errors → SystemError with actionable remediation
   - Model not found → UserError with pull instructions
   - Timeout errors → SystemError with connectivity checks
   - Generic errors wrapped in appropriate types based on context

3. **Clean Code Compliance**: All methods ≤15 lines through:
   - Private helper method extraction (`callOllamaGenerate`, error helpers)
   - Constructor dependency injection pattern
   - Self-documenting method names and UPPER_CASE constants
   - Separation of concerns (public API vs private implementation)

4. **Comprehensive Testing**: 16 test cases covering:
   - Success scenarios for all public methods
   - Error paths with specific error type verification
   - Edge cases (connection failures, missing models, timeouts)
   - Optional parameter handling in generation

#### Technical Details

- **SDK Integration**: Used Context7-validated Ollama JS SDK v0.6.3 APIs
- **Type Safety**: Full TypeScript strict mode compliance
- **Testing**: Vitest with vi.fn() mocking, 100% test coverage
- **Linting**: All ESLint rules passing with clean code standards

### File List

- `src/infrastructure/llm/ollama-adapter.ts` - Main adapter implementation
- `src/infrastructure/llm/ollama-adapter.test.ts` - Comprehensive unit tests (16 test cases)