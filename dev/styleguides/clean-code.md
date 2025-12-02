# Node.js CLI Clean Code Principles

```yaml
# -------------------------------------------------------------------
# 1. Foundational Principles
# Core mindset for approaching code quality.
# -------------------------------------------------------------------
foundational_principles:
  readability_over_cleverness:
    summary: "Prioritize clarity and straightforwardness over complex or 'clever' solutions."
    guideline: 'Code should be written primarily for human understanding, as maintainable code is readable code.'
    rationale: 'The cognitive overhead required to understand code is a direct tax on development velocity and future changes.'
  dry_dont_repeat_yourself:
    summary: 'Avoid duplicating code by extracting repeated logic into reusable abstractions.'
    guideline: 'Maintain a single, authoritative source of truth for every piece of knowledge in the system.'
    rationale: 'Duplication is a major source of maintenance issues, requiring updates in multiple places which is error-prone.'

# -------------------------------------------------------------------
# 2. Meaningful Names
# The intent behind naming conventions.
# -------------------------------------------------------------------
meaningful_names:
  description: 'A name should answer: why it exists, what it does, and how it is used. This is about conveying intent, not just syntax.'
  enabled: true
  principles:
    - principle: 'Use Intention-Revealing Names'
      guideline: "Choose names that clearly express the purpose of the entity without needing a comment. If a name needs a comment, it's not the right name."
    - principle: 'Make Meaningful Distinctions'
      guideline: 'If names must differ, they should differ in meaning. Avoid arbitrary distinctions like `provider1`, `provider2`.'
    - principle: 'Use Pronounceable and Searchable Names'
      guideline: 'Names that can be spoken are easier to discuss. Avoid single-letter variables or cryptic abbreviations that hinder code search.'

# -------------------------------------------------------------------
# 3. Functions & Methods
# Principles for composing clean logic.
# -------------------------------------------------------------------
functions_and_methods:
  description: 'Functions are the verbs of our code. They should be small, focused, and composed in a way that tells a clear story.'
  enabled: true
  rules:
    - rule: 'Do One Thing (Single Responsibility Principle)'
      guideline: 'A function should have one, and only one, job. Functions that do multiple things are difficult to test, reuse, and understand.'
    - rule: 'Keep Them Small'
      guideline: 'Functions should be small, preferably under 15 lines. This is a signal that a function may be doing more than one thing.'
      max_lines: 15
    - rule: 'Limit Arguments'
      guideline: 'The ideal number of arguments is 0-2. Three or more arguments is a strong indicator they should be encapsulated into a single object.'
      max_args: 2

# -------------------------------------------------------------------
# 4. Class Design Principles
# Foundational OOP principles for all classes (use cases, adapters, etc.).
# -------------------------------------------------------------------
class_design_principles:
  description: 'These principles apply to ANY class within the CLI application to ensure they are robust, maintainable, and easy to understand.'
  enabled: true
  principles:
    - principle: 'Single Responsibility Principle (SRP)'
      guideline: 'A class should have only one reason to change. Delegate unrelated responsibilities to other classes.'
    - principle: 'High Cohesion'
      guideline: 'Methods and properties within a class should be closely related. A class doing many unrelated things should be split.'
    - principle: 'Embrace Encapsulation'
      guideline: 'Hide internal implementation details and expose clear, minimal public interfaces to reduce coupling.'
    - principle: 'Open for Extension, Closed for Modification'
      guideline: 'Design classes to be extendable without modifying their source code. Use abstractions and Dependency Injection.'

# -------------------------------------------------------------------
# 5. CLI Class Standards
# Specific rules for the internal structure of CLI classes.
# -------------------------------------------------------------------
cli_class_standards:
  description: 'Standards for ensuring consistency, readability, and adherence to best practices for all CLI application classes.'
  enabled: true
  global_attributes:
    - 'Classes use constructor dependency injection.'
    - 'Prioritise composition over inheritance.'
    - 'All files use kebab-case naming (e.g., commit-controller.ts).'
  class_member_order:
    summary: 'A consistent ordering of class members improves readability and makes it easier to locate specific properties and methods.'
    order:
      - 'constructor() with readonly dependencies'
      - 'Private Properties (internal state)'
      - 'Public Properties (configuration/exposed state)'
      - 'Public Methods (API surface - called first by consumers)'
      - 'Private Methods (implementation helpers)'
    rationale: 'Constructor first (Node.js/TypeScript convention), then properties (private before public), then methods (public before private). Public methods are the API surface that consumers call, so they appear first. Private helper methods that support the public API appear below, keeping implementation details at the bottom.'

# -------------------------------------------------------------------
# 6. Design Patterns
# Defines the different types of components and their roles in the CLI.
# -------------------------------------------------------------------
design_patterns:
  description: 'Separate components by their domain to improve reusability, testability, and separation of concerns.'
  enabled: true
  types:
    smart_use_case:
      name: 'Use Cases (Business Logic)'
      responsibility: "Manage business logic and coordinate between adapters. They are the 'brains' of the application."
      attributes:
        - 'Handles business rules and orchestration.'
        - 'Dependencies injected via constructor using interfaces.'
        - 'Contains no infrastructure details (no file I/O, no HTTP, no CLI).'
    dumb_adapter:
      name: 'Adapters (Infrastructure)'
      responsibility: 'Handle technical infrastructure and external integrations. They have no knowledge of business logic.'
      attributes:
        - 'I/O: Implements interfaces for external services (git, LLM, file system).'
        - 'Testing: Easily mocked with test doubles.'
        - 'Configuration: Manages connection details and technical settings.'
    data_access:
      name: 'Data Access Layer'
      responsibility: 'Encapsulates all interactions with external data sources (e.g., git commands, LLM APIs).'
      attributes:
        - 'Scope: Implemented as injectable services via constructor injection.'
        - 'Interface: Always expose through contracts like IGitService, ILLMProvider.'
    util:
      name: 'Util Layer'
      responsibility: 'Provides shared, generic functionality, type definitions, and constants.'
      attributes:
        - 'Content: Contains pure functions, constants, TypeScript interfaces/types, and configuration schemas.'

# -------------------------------------------------------------------
# 7. Data & State Management
# Principles for predictable state.
# -------------------------------------------------------------------
data_and_state_management:
  description: 'Managing state is critical for building predictable and scalable CLI applications.'
  enabled: true
  principles:
    - principle: 'Embrace Immutability'
      guideline: 'Do not mutate data directly. Treat state as immutable by creating new objects when changes occur.'
      rationale: 'Immutability prevents side effects and is highly compatible with Node.js stream processing and error handling.'

# -------------------------------------------------------------------
# 8. Comments & Self-Documenting Code
# -------------------------------------------------------------------
comments_and_self_documenting_code:
  description: 'Code should be self-documenting. Comments are often an admission of failure to be clear.'
  enabled: true
  rules:
    - rule: 'Prioritize Self-Documenting Code'
      guideline: "Your primary goal should be to write code so clear that it doesn't need comments. Don't comment on the 'what'; refactor the code so it explains itself."
      rationale: 'Comments can lie as code evolves. The code itself is the only source of truth.'
    - rule: "Use Comments for 'Why', Not 'What'"
      guideline: "When necessary, a comment should explain the 'why'—the intent, business context, or a non-obvious consequence."
    - rule: 'Use TSDoc for Public APIs Only'
      guideline: 'The only acceptable use for explanatory comments is to document public-facing APIs (e.g., use case methods, adapter interfaces) for documentation and IDE support.'

# -------------------------------------------------------------------
# 9. Barrel Files vs Application Files
# CRITICAL: Distinguishing between re-export files and logic files
# -------------------------------------------------------------------
barrel_files_vs_application_files:
  description: 'Index files are barrel files that re-export modules. They should NEVER contain application logic.'
  enabled: true
  critical: true
  rationale: 'Mixing re-exports with logic violates single responsibility, creates testing confusion, and breaks module boundaries.'

  rules:
    - rule: 'Barrel Files Contain ONLY Re-exports'
      guideline: 'Files named index.ts are barrel files. They exist only to re-export other modules for convenience.'
      examples:
        valid_barrel_file: |
          // src/index.ts - CORRECT
          #!/usr/bin/env node
          import './main.js';

        invalid_barrel_file: |
          // src/index.ts - WRONG
          #!/usr/bin/env node
          import { Command } from 'commander';
          const program = new Command(); // ❌ Logic in barrel file!

    - rule: 'Barrel Files Do NOT Need Tests'
      guideline: 'Barrel files are configuration, not logic. They are validated by the build process and import resolution.'
      rationale: |
        1. Barrel files are build tools, not application logic
        2. They don't contain testable behavior
        3. Tests for them add maintenance burden without value
        4. Import failures are caught by TypeScript compiler
      examples:
        - 'src/index.ts - No test needed (it only imports main.ts)'
        - 'src/core/ports/index.ts - No test needed (it only re-exports interfaces)'
        - 'src/features/index.ts - No test needed (it only re-exports controllers)'

    - rule: 'Application Logic Lives in Named Files'
      guideline: 'Put logic in descriptively named files like main.ts, app.ts, bootstrap.ts, or feature-specific files.'
      examples:
        correct_pattern: |
          src/
          ├── index.ts              # Barrel: imports main.ts
          ├── main.ts               # Logic: CLI setup, DI, bootstrap
          ├── main.test.ts          # Tests: for main.ts logic
          └── features/
              ├── commit/
              │   ├── commit-controller.ts
              │   ├── commit-controller.test.ts
              │   └── index.ts      # Barrel: re-exports commit-controller

    - rule: 'CLI Entry Points: Shebang + Import Only'
      guideline: 'For CLI tools, src/index.ts should contain ONLY the shebang and a single import statement.'
      template: |
        #!/usr/bin/env node
        import './main.js';
      rationale: 'This keeps the executable entry point minimal while allowing main.ts to export testable functions.'

  common_violations:
    - violation: 'Putting Commander.js setup in src/index.ts'
      consequence: 'Makes the entry point untestable and violates barrel file principle'
      fix: 'Move Commander.js setup to src/main.ts and export createProgram() function'

    - violation: 'Testing index.ts barrel files'
      consequence: 'Wastes time testing re-exports, creates maintenance burden'
      fix: 'Delete the index.test.ts file - barrel files are validated by build process'

    - violation: 'Config file unit tests (tsup.config.ts.test.ts, vitest.config.ts.test.ts)'
      consequence: 'Build tools are not application logic - they are validated by the build itself'
      fix: 'Delete config file tests - they add no value and create maintenance burden'

# -------------------------------------------------------------------
# 10. Configuration Files Do NOT Need Tests
# CRITICAL: Build tools and config files validate themselves
# -------------------------------------------------------------------
configuration_files_testing_antipattern:
  description: 'Configuration files for build tools and frameworks should NEVER have unit tests.'
  enabled: true
  critical: true
  severity: 'BLOCKING'
  rationale: |
    1. Config files are build tools, not application logic
    2. If config is wrong, the build/tool will fail immediately
    3. The build process IS the validation - no separate tests needed
    4. Config tests add maintenance burden with ZERO value
    5. Tests become outdated when configs change

  historical_context: |
    Story 1-3 initially created tsup.config.test.ts which was later recognized as
    a mistake and removed. This anti-pattern keeps recurring with AI agents,
    requiring explicit prohibition in style guide.

  prohibited_test_files:
    description: 'These files should NEVER exist in the codebase'
    examples:
      - 'tsup.config.test.ts - ❌ FORBIDDEN'
      - 'vitest.config.test.ts - ❌ FORBIDDEN'
      - 'eslint.config.test.ts - ❌ FORBIDDEN'
      - 'prettier.config.test.ts - ❌ FORBIDDEN'
      - 'package.json.test.ts - ❌ FORBIDDEN'
      - 'tsconfig.json.test.ts - ❌ FORBIDDEN'
      - 'any-file-ending-in.config.test.ts - ❌ FORBIDDEN'

  what_to_test_instead:
    guideline: 'Validate configs by USING them, not testing them'
    examples:
      - 'tsup.config.ts → Run npm run build (if it fails, config is wrong)'
      - 'vitest.config.ts → Run npm test (if tests don't run, config is wrong)'
      - 'eslint.config.js → Run npm run lint (if it errors, config is wrong)'
      - 'package.json → npm install works = valid config'
    rationale: 'The tool itself validates the configuration. No unit test can be more reliable than the actual tool.'

  enforcement:
    level: 'ABSOLUTE'
    action: 'Any PR containing config file tests will be REJECTED immediately'
    justification: 'Zero tolerance policy - config tests provide zero value and waste developer time'

  agent_instructions:
    critical: true
    instructions:
      - 'NEVER create test files for any *.config.ts or *.config.js files'
      - 'NEVER suggest testing configuration files in story tasks'
      - 'If user requests config tests, explain this anti-pattern and refuse'
      - 'Validation of configs happens through build/tool execution, not unit tests'
      - 'Focus test effort on application logic, not build tooling'

  exceptions:
    description: 'There are NO exceptions to this rule'
    note: 'Even if config files export functions, those functions are build-time tools, not runtime logic'
```
