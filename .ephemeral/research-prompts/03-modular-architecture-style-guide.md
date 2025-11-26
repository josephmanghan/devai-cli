# Deep Research Prompt: Modular Architecture & Extensibility Style Guide

## Context

I'm building a **Git Commit Message Generator CLI** with specific requirements for modularity and extensibility:

**Current MVP:** `ollacli commit` - Generate Conventional Commit messages via Ollama

**Future expansion potential:**

- `ollacli pr` - Generate PR descriptions
- `ollacli screenshot` - Intelligent screenshot naming
- Different commit message formats (Conventional Commits, custom company formats, etc.)
- Different LLM providers (Ollama, OpenAI, Anthropic)

**Stack:** Node.js CLI + Ollama + Git integration

**Critical requirement:** Architecture must allow easy swapping of:

- Commit message templates/formats (without touching core logic)
- Output formatters (Conventional Commits vs other formats)
- Future commands (plugin-style architecture?)
- Potentially LLM providers (Ollama → others)

## Research Objective

**Produce a concise, actionable style guide** for architecting this CLI tool with modularity and extensibility in mind.

Focus on **practical patterns for this specific project**, not generic architecture theory.

## Required Output Format

**Style guide must be:**

- ✅ **High signal, low noise** (token-efficient, no verbose explanations)
- ✅ **Prescriptive** ("Use X pattern, not Y" with brief rationale)
- ✅ **Project-specific** (applied to CLI + Ollama + git commit generator context)
- ✅ **Actionable** (clear folder structure, module boundaries, interface examples)
- ✅ **Concise** (aim for ~1000-1500 words max)

**Format structure:**

```
# Modular Architecture Style Guide

## Separation of Concerns
[Which layers to separate and why]

## Recommended Module Structure
[Folder/file organization for modularity]

## Template System Architecture
[How to make commit templates easily swappable]

## Adapter/Provider Pattern
[How to abstract Ollama so other providers can be swapped in]

## Configuration Management
[How to manage user preferences, custom templates, etc.]

## Extensibility for Future Commands
[How to add new commands without refactoring]

## Interface Definitions
[Key interfaces/abstractions to define upfront]
```

## Specific Questions to Answer

1. **Separation of concerns:** What are the key layers (CLI layer, Git service, LLM service, Formatter/Template layer, Config layer)?
2. **Template system:** How to make commit message templates easily editable and swappable (separate files? Config-driven? Plugin system?)?
3. **Adapter pattern:** Should Ollama be abstracted behind an interface (so future LLM providers can be swapped)?
4. **Formatter pattern:** How to separate commit message formatting logic from generation logic?
5. **Command pattern:** How to structure CLI commands so new commands (`pr`, `screenshot`) can be added easily?
6. **Configuration:** How to manage user config (default templates, custom formats, model preferences)?
7. **Plugin architecture:** Is a full plugin system overkill for MVP, or should we design for it upfront?
8. **Dependency injection:** Should we use DI to make modules testable and swappable?
9. **File organization:** What folder structure supports this modularity (e.g., `src/services/`, `src/templates/`, `src/commands/`)?

## Success Criteria

The style guide should enable:

- Easy swapping of commit message templates (edit a config file, not code)
- Adding new commands (`ollacli pr`) without major refactoring
- Abstracting Ollama so other LLM providers could be supported later
- Clean module boundaries (easy to test, easy to understand)
- Balance between "simple MVP" and "professional extensibility"

## Real-World Use Case Examples

**Example 1: Swapping commit templates**
User wants to change from:

```
feat(scope): description
```

to:

```
[JIRA-123] Feature: description
```

This should be a config change, not a code change.

**Example 2: Adding new command**
Future: Add `ollacli pr` command.
Should reuse: Ollama service, Git service, Config management.
Should add: New prompt template, new command handler.

**Example 3: Different LLM provider**
Future: Some users want to use OpenAI instead of Ollama.
Should require: Implementing an interface, not rewriting the app.

## Output Constraints

- **Maximum length:** ~1500 words
- **No fluff:** Skip generic design pattern explanations, focus on applied architecture
- **Token-efficient:** This will be loaded into LLM context during development
- **Markdown format:** Headings, folder structure examples, interface snippets
- **Code snippets:** Brief TypeScript/JavaScript examples of key interfaces/patterns

---

**Run this as Gemini Deep Research. Output will be saved as `/dev/style-guides/modular-architecture.md`**
