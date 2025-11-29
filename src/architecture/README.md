# Hexagonal Architecture Guide

This project follows **Pragmatic Hexagonal Architecture** (Ports & Adapters) to maintain clean separation between business logic and external dependencies.

## Architecture Pattern

Think of this as **"Plugs and Sockets"**:

- **Ports (Sockets):** Interfaces in `src/core/ports/` - define WHAT the application needs
- **Adapters (Plugs):** Classes in `src/infrastructure/adapters/` - implement HOW it's done

## Directory Structure

```
src/
├── core/                           # Domain layer (pure business logic, no external deps)
│   ├── ports/                      # Port interfaces (contracts for adapters)
│   │   └── example-port.ts         # Example: ExamplePort interface
│   └── types/                      # Domain types and error classes
│       └── errors.types.ts         # AppError, UserError, SystemError classes
│
├── infrastructure/                 # Adapters (external service implementations)
│   └── adapters/                   # Adapter implementations
│       └── example-adapter.ts      # Example: ExampleAdapter implements ExamplePort
│
├── feature/                        # Use cases & business logic orchestration (future)
│   └── commit/                     # Future: commit generation use cases
│
├── ui/                             # CLI commands and user interaction (future)
│   └── commands/                   # Future: Commander.js command handlers
│
└── architecture/                   # Architecture documentation
    └── README.md                   # This file
```

## Layer Responsibilities

### Core Layer (`src/core/`)

**Purpose:** Pure domain logic and business rules

- **ZERO external dependencies** (no `ollama`, `execa`, `fs` imports)
- **Domain types** and business entities
- **Port interfaces** defining contracts
- **Error classes** for domain-specific errors

**Rules:**

- No external library imports
- Interfaces describe capabilities, not implementation details
- Pure functions when possible
- Domain validation and business rules

### Infrastructure Layer (`src/infrastructure/`)

**Purpose:** Connect to external systems and services

- **Adapters** implementing core interfaces
- **External dependencies** (Ollama SDK, execa, fs, etc.)
- **Configuration** and system integration
- **Logging** and monitoring

**Rules:**

- Depends on core ports (interfaces)
- Can import external libraries
- Implements technology-specific concerns
- Handles external system failures

### Feature Layer (`src/feature/`)

**Purpose:** Business logic orchestration and use cases

- **Use cases** coordinating multiple domains
- **Controllers** orchestrating application flow
- **Business workflows** spanning multiple services
- **Input validation** and business rule enforcement

**Rules:**

- Depends on core ports (not concrete adapters)
- No direct external dependencies
- Orchestrates domain logic
- Implements application-level patterns

### UI Layer (`src/ui/`)

**Purpose:** User interface and interaction

- **CLI commands** and argument parsing
- **User prompts** and interaction handling
- **Output formatting** and display logic
- **Error presentation** to users

**Rules:**

- Depends on features layer
- Handles user input/output
- Contains presentation logic only
- No business logic implementation

## Dependency Flow

```
UI Layer
    ↓ depends on
Feature Layer
    ↓ depends on
Core Layer
    ↑ implemented by
Infrastructure Layer
```

**Key Principle:** Inward dependency flow only. UI → Feature → Core, Infrastructure implements Core ports.

## Adding New Components

### 1. Create Port Interface (Core)

```typescript
// src/core/ports/new-service.ts
export interface NewService {
  process(input: string): Promise<string>;
}
```

### 2. Implement Adapter (Infrastructure)

```typescript
// src/infrastructure/adapters/new-adapter.ts
import type { NewService } from '../../core/ports/new-service.js';

export class NewAdapter implements NewService {
  async process(input: string): Promise<string> {
    // Implementation with external dependencies
    return externalService.process(input);
  }
}
```

### 3. Create Use Case (Features)

```typescript
// src/feature/new-feature/use-case.ts
export class NewUseCase {
  constructor(
    private readonly service: NewService // Depends on interface, not adapter
  ) {}

  async execute(input: string): Promise<string> {
    return await this.service.process(input);
  }
}
```

### 4. Wire Dependencies (Composition Root)

```typescript
// src/main.ts - Composition root
import { NewAdapter } from './infrastructure/adapters/new-adapter.js';
import { NewUseCase } from './feature/new-feature/use-case.js';

// Manual dependency injection
const adapter = new NewAdapter();
const useCase = new NewUseCase(adapter);
```

## Benefits

1. **Testability:** Mock interfaces easily in tests
2. **Swappable Implementations:** Switch Ollama ↔ OpenAI without changing core logic
3. **Clear Boundaries:** External dependencies isolated in infrastructure layer
4. **Domain Focus:** Core business logic pure and testable
5. **Maintainability:** Each layer has single responsibility

## Example: Current Implementation

The current example demonstrates this pattern:

```typescript
// Core port (interface)
export interface ExamplePort {
  process(input: string): Promise<string>;
}

// Infrastructure adapter (implementation)
export class ExampleAdapter implements ExamplePort {
  async process(input: string): Promise<string> {
    return input.toUpperCase(); // Real working logic
  }
}
```

This pattern will be extended with real business logic ports:

- `GitPort` → `ShellGitAdapter` (Epic 3)
- `LlmPort` → `OllamaAdapter` (Epic 2)
- `EditorPort` → `ShellEditorAdapter` (Epic 5)

## Clean Code Standards

All code follows these standards:

- **Functions ≤15 lines** with 0-2 arguments maximum
- **Constructor injection** for dependencies
- **Class member ordering:** Constructor → Private → Public
- **Kebab-case file naming** (`example-adapter.ts`)
- **PascalCase classes** (`ExampleAdapter`)
- **Self-documenting code** with comments for "why" not "what"

See `dev/styleguides/clean-code.md` for complete standards.
