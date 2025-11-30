# Story 2.1: Create Ollama Port Interface

Status: ready-for-dev

## Story

As a developer,
I want a port interface defining Ollama operations,
so that the core domain doesn't depend on the Ollama SDK implementation.

## Acceptance Criteria

1. [ ] Interface created in `src/core/ports/llm-port.ts`
2. [ ] Methods defined: `checkConnection()`, `checkModel()`, `createModel()`, `generate()`
3. [ ] Type definitions for `GenerationOptions` interface with model, temperature, num_ctx, keep_alive
4. [ ] Interface documented with JSDoc explaining parameters and return types
5. [ ] Zero external dependencies in core/ layer (verified via import analysis)
6. [ ] Code adheres to clean-code.md: functions ≤15 lines, self-documenting names

## Tasks / Subtasks

- [ ] Create LlmPort interface file (AC: 1)
  - [ ] Create `src/core/ports/llm-port.ts` with interface definition
  - [ ] Ensure core/ports directory exists per hexagonal architecture
- [ ] Define interface methods (AC: 2)
  - [ ] Add `checkConnection(): Promise<boolean>` for daemon availability
  - [ ] Add `checkModel(modelName: string): Promise<boolean>` for model existence
  - [ ] Add `createModel(modelName: string, modelfileContent: string): Promise<void>` for custom model creation
  - [ ] Add `generate(prompt: string, options: GenerationOptions): Promise<string>` for future Epic 4 use
- [ ] Create supporting type definitions (AC: 3)
  - [ ] Define `GenerationOptions` interface with model, temperature, num_ctx, keep_alive fields
  - [ ] Export both interface and types from the file
- [ ] Add comprehensive JSDoc documentation (AC: 4)
  - [ ] Document each method with @param, @returns, @throws
  - [ ] Explain the purpose and usage patterns
  - [ ] Include examples for complex methods like generate()
- [ ] Validate core layer isolation (AC: 5)
  - [ ] Verify no external imports (no 'ollama', 'execa', 'fs' in core/)
  - [ ] Ensure file contains only TypeScript interfaces and types
  - [ ] Run import analysis to confirm zero external dependencies
- [ ] Apply clean code standards (AC: 6)
  - [ ] Review interface for clear, self-documenting method names
  - [ ] Ensure JSDoc follows established patterns
  - [ ] Run linting to verify all standards are met

## Dev Notes

### Architecture Requirements

- **Hexagonal Architecture**: Core layer defines ports (interfaces) with zero external dependencies [Source: dev/architecture.md#Project-Structure-(Pragmatic-Hexagonal-/-Ports-&-Adapters)]
- **Clean Code Standards**: Functions ≤15 lines, camelCase naming, self-documenting code [Source: dev/styleguides/clean-code.md]
- **TypeScript Strict Mode**: All interfaces must compile with strict mode enabled [Source: dev/sprint-artifacts/1-1-initialize-typescript-project-with-esm.md]

### Interface Design Context

**Port Interface Purpose**: Defines contract for LLM provider operations while keeping core business logic isolated from external dependencies [Source: dev/sprint-artifacts/tech-spec-epic-2.md#System-Architecture-Alignment]

**Method Signatures**: Derived from FR7-FR12 requirements and Ollama integration patterns [Source: dev/sprint-artifacts/tech-spec-epic-2.md#APIs-and-Interfaces]

**Future Extensibility**: Interface designed to support OpenAI fallback in post-MVP (LLM-agnostic design) [Source: dev/architecture.md#Decision-Table]

### Project Structure Notes

**Core Layer Responsibilities**: Pure business logic, no external deps, domain entities and ports only [Source: dev/architecture.md#Directory-Layout]

**Hexagonal Architecture Pattern**: Core → Ports (interfaces) → Adapters (implementations) [Source: dev/architecture.md#Dependency-Flow-(Hexagonal-Pattern)]

**File Organization**: One interface per file, exports at bottom, imports grouped by type [Source: dev/architecture.md#File-Organization-Rules]

### Context7 MCP Integration Requirement

**CRITICAL for Epic 2+**: Use Context7 MCP server for Node.js best practices validation:

1. **Library Integration**: Before finalizing interface patterns, validate against Node.js best practices:
   - Use `mcp__context7__resolve-library-id("nodebestpractices")`
   - Get docs: `mcp__context7__get-library-docs("/goldbergyoni/nodebestpractices", "code", "interface-design")`

2. **Code Quality Validation**: Use Context7 for:
   - Node.js interface design patterns
   - TypeScript interface best practices
   - Error handling patterns for async methods

**Available Context7 Libraries**:
- `/goldbergyoni/nodebestpractices` (80.2 benchmark score) [Source: dev/architecture.md#ENTERPRISE-GRADE-CODE-VALIDATION:-Context7-MCP-Integration]

### Learnings from Previous Story

**From Story 1-6-setup-linting-formatting (Status: Changes Requested)**:

- **Critical Lesson**: Missing ESLint rules for clean code enforcement caused issues - ensure interface design follows established patterns from the start
- **Context7 Requirement**: Epic 2+ requires Context7 MCP validation for all implementation decisions
- **Clean Code Standards**: Architecture enforces ≤15 lines per function - apply same rigor to interface design clarity
- **Quality Gates**: Run `npm run pr` (format:check, lint, typecheck, test, build) before marking story complete

**From Epic 1 Foundation Stories**:

- **Hexagonal Structure**: Core/ports directory already established in 1-5, follow existing patterns
- **TypeScript Configuration**: Strict mode enabled, interfaces must compile cleanly
- **Testing Strategy**: Interfaces don't need runtime tests (TypeScript provides compile-time safety)

### Validation Requirements

**Import Analysis**: Verify core/ has zero external dependencies:
- No imports from 'ollama', 'execa', 'fs', 'path'
- Only TypeScript type imports allowed
- Core layer isolation confirmed

**TypeScript Compilation**: Must pass with strict mode:
- All method signatures properly typed
- Generic types correctly used where needed
- No implicit any types

**ESLint Validation**: Must pass all clean code rules:
- Interface naming follows PascalCase
- Method names follow camelCase
- JSDoc comments present and useful

### References

- Hexagonal architecture ports and adapters pattern [Source: dev/architecture.md#Project-Structure-(Pragmatic-Hexagonal-/-Ports-&-Adapters)]
- Interface design specifications from tech spec [Source: dev/sprint-artifacts/tech-spec-epic-2.md#APIs-and-Interfaces]
- Clean code standards for interface design [Source: dev/styleguides/clean-code.md]
- TypeScript configuration and strict mode [Source: dev/sprint-artifacts/1-1-initialize-typescript-project-with-esm.md]
- Context7 MCP integration requirements [Source: dev/architecture.md#ENTERPRISE-GRADE-CODE-VALIDATION:-Context7-MCP-Integration]
- Node.js best practices validation via Context7 [Source: dev/architecture.md#Available-Context7-Libraries-for-This-Project]
- Project structure and file organization [Source: dev/architecture.md#File-Organization-Rules]

## Dev Agent Record

### Context Reference

- dev/sprint-artifacts/2-1-create-ollama-port-interface.context.xml

### Agent Model Used

glm-4.6

### Debug Log References

### Completion Notes List

### File List