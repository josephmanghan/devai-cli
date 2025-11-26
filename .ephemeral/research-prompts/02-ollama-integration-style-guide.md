# Deep Research Prompt: Ollama Integration Best Practices Style Guide

## Context

I'm building a **Git Commit Message Generator CLI** that integrates with Ollama:

- Model: `llama3.2:1b` (1B parameter model, optimal for speed/performance)
- Use case: Generate Conventional Commit messages from git diffs
- Platform: Node.js CLI application
- Target performance: <1s inference time (warm start)
- Environment: M1/M2 Mac, local development

**Architecture pattern:**

```
User → CLI App (Node.js) → Execute git commands → Get text output
                         → Send to Ollama API → Receive commit message
                         → Show preview → Execute git commit (on approval)
```

**Key constraint:** The model only processes text - the CLI app orchestrates everything (git commands, prompt construction, user interaction).

## Research Objective

**Produce a concise, actionable style guide** for integrating Ollama into this Node.js CLI tool following best practices.

This style guide will inform:

1. How to structure the Ollama client/service layer
2. How to manage prompts and templates (must be easily swappable)
3. How to handle errors, timeouts, and edge cases
4. How to optimize for performance (model loading, caching, etc.)

## Required Output Format

**Style guide must be:**

- ✅ **High signal, low noise** (token-efficient, no verbose explanations)
- ✅ **Prescriptive** ("Use X, not Y" with brief rationale)
- ✅ **Project-specific** (tailored to llama3.2:1b + commit message generation)
- ✅ **Actionable** (can be directly applied during implementation)
- ✅ **Concise** (aim for ~1000-1500 words max)

**Format structure:**

```
# Ollama Integration Style Guide

## Ollama Client Setup
[How to connect, which library/approach]

## Prompt Engineering for Commit Messages
[Structure, best practices for llama3.2:1b]

## Template Management
[How to make prompts/templates easily swappable]

## API Communication Patterns
[Streaming vs non-streaming, error handling]

## Performance Optimization
[Model loading, caching, response time]

## Error Handling & Resilience
[What to do when Ollama is down, model not found, etc.]

## Testing Ollama Integration
[How to mock/test LLM responses]
```

## Specific Questions to Answer

1. **Client library:** Use official Ollama JS library vs raw HTTP fetch vs other?
2. **Prompt structure:** How to structure prompts for code diff → commit message task?
3. **Template system:** Best pattern for making prompt templates easily editable/swappable (JSON? YAML? Separate files?)?
4. **Streaming:** Should we use streaming API for incremental responses, or simple non-streaming for this use case?
5. **Model loading:** How to handle cold start vs warm start? Pre-load model?
6. **Error handling:** What errors to expect (model not found, Ollama not running, timeout, etc.)? How to handle gracefully?
7. **Context management:** How much git diff context can llama3.2:1b handle? Token limits?
8. **Response parsing:** How to extract clean commit messages from LLM responses (avoid markdown artifacts, etc.)?
9. **Configuration:** How to let users configure model choice, temperature, etc.?
10. **Testing:** How to test Ollama integration without hitting the live API every time?

## Success Criteria

The style guide should enable implementation of:

- Robust Ollama client service
- Clean prompt/template management (easy to modify commit message formats)
- Graceful error handling
- Fast, reliable commit message generation
- Easy testing without live Ollama dependency

## Output Constraints

- **Maximum length:** ~1500 words
- **No fluff:** Skip generic LLM explanations, focus on Ollama-specific patterns
- **Token-efficient:** This will be loaded into LLM context during development
- **Markdown format:** Headings, code examples, lists (easy to scan)
- **Code snippets:** Include brief examples where helpful (TypeScript/JavaScript)

---

**Run this as Gemini Deep Research. Output will be saved as `/dev/style-guides/ollama-integration.md`**
