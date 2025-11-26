# Angular Clean Code Principles

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
      guideline: 'If names must differ, they should differ in meaning. Avoid arbitrary distinctions like `product1`, `product2`.'
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
# Foundational OOP principles for all classes (services, components, etc.).
# -------------------------------------------------------------------
class_design_principles:
  description: 'These principles apply to ANY class within the application to ensure they are robust, maintainable, and easy to understand.'
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
# 5. Angular Component Standards
# Specific rules for the internal structure of Angular components.
# -------------------------------------------------------------------
angular_component_standards:
  description: 'Standards for ensuring consistency, readability, and adherence to best practices for all Angular components.'
  enabled: true
  global_attributes:
    - 'Components are always standalone.'
    - 'Prioritise use of modern signals-based architecture.'
    - 'Utilise built-in Control Flow (e.g., @if) in component templates.'
  class_member_order:
    summary: 'A consistent ordering of class members improves readability and makes it easier to locate specific properties and methods.'
    order:
      - 'inject()'
      - 'signal input'
      - 'signal output'
      - 'Other Signal APIs (e.g. viewChild, model)'
      - 'State Properties (e.g. subjects, other state variables)'
      - 'constructor()'
      - 'Lifecycle Hooks (e.g. ngOnInit, ngOnDestroy)'
      - 'Public Methods'
      - 'Protected/Private Methods'
    visibility_rule:
      guideline: 'Within each category, members should be sorted by visibility: public, then protected, then private.'

# -------------------------------------------------------------------
# 6. Design Patterns
# Defines the different types of components and their roles in the system.
# -------------------------------------------------------------------
design_patterns:
  description: 'Separate components by their domain to improve reusability, testability, and separation of concerns.'
  enabled: true
  types:
    smart_feature:
      name: 'Smart (Feature) Components'
      responsibility: "Manage state, fetch data, and handle business logic. They are the 'brains' of a journey."
      attributes:
        - 'Handles business logic.'
        - 'State Management: Within the feature layer, Signal Stores are used for handling local or feature-specific state.'
    dumb_presentational:
      name: 'Dumb (UI/Presentational) Components'
      responsibility: 'Purely display data. They have no knowledge of application state.'
      attributes:
        - 'I/O: Uses Signals for reactive inputs and outputs.'
        - 'Testing: Use Storybook to visually test UI in isolation.'
    data_access:
      name: 'Data Access Layer'
      responsibility: 'Encapsulates all interactions with external data sources (e.g., HTTP clients).'
      attributes:
        - 'Scope: Implemented as injectable services via inject().'
    util:
      name: 'Util Layer'
      responsibility: 'Provides shared, generic functionality, type definitions, and constants.'
      attributes:
        - 'Content: Contains pure functions, constants, TypeScript interfaces/types, and configuration.'

# -------------------------------------------------------------------
# 7. Data & State Management
# Principles for predictable state.
# -------------------------------------------------------------------
data_and_state_management:
  description: 'Managing state is critical for building predictable and scalable applications.'
  enabled: true
  principles:
    - principle: 'Embrace Immutability'
      guideline: 'Do not mutate data directly. Treat state as immutable by creating new objects when changes occur.'
      rationale: "Immutability prevents side effects and is highly compatible with Angular's Change Detection and RxJS streams."

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
      guideline: 'The only acceptable use for explanatory comments is to document public-facing APIs (e.g., service methods, `input/output` signals) for documentation and IDE support.'
```
