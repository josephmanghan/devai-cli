# Joe's Ollama CLI Application Project Brief

## Project Goal

Build a working **Git Commit Message Generator CLI** that uses Ollama and `qwen2.5-coder:1.5b` to automatically generate high-quality Conventional Commit messages from staged git changes. The tool must be extremely simple, the project completable end-to-end by an intermediate developer, and provide genuine developer utility as a GitHub-ready demonstration of local SLM integration.

## Application Decision

### Primary Application: Git Commit Message Generator

**Selected Tool:** `ollacli commit` - An intelligent git commit assistant

**Note:** `ollacli` is a working name. Final package name to be determined during implementation based on npm availability and branding.

**Core Functionality:**

1. **Commit Analysis**: Gathers staged changes and file status
   - Analyzes staged git changes (`git diff --cached`)
   - Analyzes file status indicators (`git status --short`)
2. **Message Generation**: Generates Conventional Commit format messages via `qwen2.5-coder:1.5b`
3. **Interactive Preview**: Displays generated commit message for user review
4. **User Interaction**: Approve/edit in CLI editor (Nano or equivalent)/regenerate/reject
5. **Commit Execution**: Runs `git commit -m "..."` on user approval

**Why This Application:**

- ✅ **Simplest to build**: Bounded input/output (git diff → commit message)
- ✅ **Perfect SLM fit**: Text-only, pattern-matching task ideal for 1.5B model
- ✅ **High frequency**: Used 10-50x/day by active developers
- ✅ **Proven pattern**: Validates against existing tools (aicommits, commitron)
- ✅ **Company alignment**: Supports adoption of Conventional Commits standard
- ✅ **Privacy**: Keeps proprietary code changes 100% local
- ✅ **Deliverable**: Can complete MVP in 2-4 sprints

**Target Use Case:**

This tool is designed for **incremental, mid-development commits** - not final PR merge commits. Developers use it throughout their workflow for granular, work-in-progress changes like component updates, partial feature implementations, and small fixes. Commits are frequent, component-focused, and iterative rather than polished final summaries.

## Personal Requirements & Constraints

### Technical Profile

- **Background**: Angular frontend developer
- **Node.js**: Comfortable with beginner Node.js concepts
- **CLI Experience**: Relatively little, but quick learner
- **Code Approach**: Comfortable using agents to write code as long as he understands requirements
- **Hardware**: M1/M2 Mac (optimal for `qwen2.5-coder:1.5b` performance)

### Success Criteria

- **Deliverable**: Working CLI application that can be completed end-to-end
- **Scope**: Complete full start-to-finish development lifecycle
- **Sharing**: GitHub-ready project (CV-worthy, demonstrates SLM integration patterns)
- **Simplicity**: Prioritize achievable MVP over feature-complete
- **Learning**: Complete understanding of Ollama integration and orchestrator architecture

### Non-Functional Requirements

- **Achievable Scope**: Feature scope narrow enough for intermediate developer to deliver complete project including full SDLC requirements (GitHub management, npm packaging, README, documentation, version management)
- **Deliverability**: Must be achievable as a complete, working project with full understanding of every component
- **npm Distribution**: Tool must be installable via npm registry for global CLI access
- **Zero-Config Philosophy**: Tool should work immediately after installation with sensible defaults
- **Lightweight Footprint**: Minimal dependencies, single command, optional configuration
- **Technical Preference**: CLI approach (easiest path for Ollama integration)
- **GitHub Ready**: Project should be shareable and demonstrate full development process
- **Performance**: Sub-1-second response time for commit message generation, 90% reliability.

## Development Standards

**Context7 Integration:** Leverages Context7 MCP for Node.js best practices and architectural patterns.

**Style Guides:** Project follows documented style guides for Node.js CLI, clean code principles, unit testing, and Ollama integration patterns (see `dev/styleguides/`).

## Technical Architecture

### Platform Stack

- **Model**: `qwen2.5-coder:1.5b` (optimized for code tasks, superior instruction-following)
- **Runtime**: Ollama (local inference engine)
- **CLI Framework**: Node.js (TypeScript optional)
- **Integration Pattern**: Orchestrator Architecture

### Orchestrator Pattern

```
User → CLI App (Node.js) → Execute git commands → Get text output
                         → Send text to Ollama API → Receive commit message
                         → Show preview → Execute git commit (on approval)
```

**Key Architectural Points:**

- The model ONLY processes text (cannot execute commands or read files directly)
- The CLI app acts as the "brain" that orchestrates:
  - Git command execution (`git diff`, `git status`)
  - Prompt construction with context
  - Ollama API communication
  - User interaction and confirmation
  - Final commit execution

### Technical Context

- **Platform**: Ollama with local SLM models
- **Model Choice**: `qwen2.5-coder:1.5b` - optimized for code tasks with superior instruction-following
- **Target Environment**: Standard developer laptops (8GB-16GB RAM), M1/M2 Mac optimal
- **Expected Performance**:
  - Model load time: <100ms (if Ollama resident)
  - Inference time: <0.5s (typical commit message ~20-30 tokens)
  - Total UX: Sub-1-second from command to preview

### Technical Risks & Considerations

- **Model lifecycle**: Ollama keep-alive behavior unknown. Must validate startup/inference/cleanup fits within 1-second target without manual start/stop.
- **Auto-pull complexity**: npm post-install pulling 1GB+ model risks permission/network/timeout failures.
- **Output compliance**: 1.5B model may produce non-compliant format despite few-shot prompting. Requires regex validation and graceful failure.
- **Diff size limits**: Large diffs may overwhelm model context window. May need truncation or chunking strategy.

### Available Research Context

The project has extensive [background research](docs/research) already completed:

- ✅ Ollama technical foundation and API capabilities
- ✅ SLM capabilities and constraints analysis (text-only, no vision for 1B model)
- ✅ Developer activity audit research (30 micro-tasks identified and scored)
- ✅ Application idea exploration and prioritization
- ✅ CLI patterns and developer workflow analysis
- ✅ Competitive landscape (aicommits, commitron exist but may have different approaches)

## MVP Scope: Git Commit Generator

### Must-Have Features (Phase 1)

**Core Command:**

```bash
ollacli commit
```

**Functionality:**

1. **Pre-commit validation**: Exit gracefully with clear guidance if no staged changes exist
2. **Context gathering**: Execute `git diff --cached` and `git status --short`
   - **`git diff --cached`**: Analyzes staged changes only (what will actually be committed)
   - **`git status --short`**: Provides concise file status indicators (M/A/D) vs verbose human-readable output
3. **Type elicitation**: Prompt user to select commit type via numbered list or arrow-key selection
   - Elicited type informs prompt construction to improve generation quality
4. **Prompt construction**: Build context-rich prompt including elicited type for Conventional Commits
5. **Model inference**: Send to `qwen2.5-coder:1.5b` via Ollama API
6. **Interactive preview**: Display generated commit message
7. **User interaction**: Approve/edit in CLI editor (Nano or equivalent)/regenerate/reject
8. **Commit execution**: Run `git commit -m "..."` on approval

**Conventional Commit Support:**

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **Format**:

  ```
  <type>: <description>

  <body>
  ```

- **In Scope (MVP)**: Type, Description, Body
- **Out of Scope (MVP)**: Scope `(module)`, Footer (issue tracking, breaking changes)

**Examples:**

```bash
feat: add email validation to registration form

Added email format validation and duplicate check on the registration form.
Uses regex pattern for format validation and checks against existing users
before allowing submission.
```

```bash
refactor: extract UserCard component from UserList

Moved user card rendering logic into separate reusable component. Accepts user
props and click handlers. Makes UserList cleaner and card styling easier to
maintain across views.
```

```bash
fix: handle null user case in profile dropdown

Added null check before accessing user.name in dropdown component. Prevents
crash when user data hasn't loaded yet. Shows loading state instead.
```

### Nice-to-Have Features (Post-MVP Suggestions)

- **User description prompt**: Optional prompt asking user to describe the change in their own words before generation. Provides additional context to improve message quality. Also serves as fallback strategy if diff-only inference proves insufficient.
  - Could be implemented via `--describe` flag to keep default flow frictionless
- **Interactive clarification**: Model requests additional context from user when confidence is low or changes are ambiguous. More exploratory idea requiring multi-turn interaction and confidence assessment.
- `--dry-run`: Generate message without committing
- `--auto`: Skip preview and auto-commit
- `--all` flag: Auto-stage all changes and generate commit (address the "no staged changes" workflow)
  - Would use `git diff` (without --cached) to analyze unstaged changes before auto-staging
- `--ticket` flag: Accept explicit Jira ticket or user story reference to include in commit context
- `--context` flag: Accept additional working context description to inform commit message generation
- **Footer support**: Add conventional commit footers (moved from MVP for workflow simplicity). Could extend elicitation pattern to include footer options
- **Scope support**: Add optional scope to commit format `<type>(<scope>): <description>` where scope identifies the module/component affected (e.g., `feat(auth):`, `fix(api):`). Could implement via elicitation pattern (like type selection) or detection (file path analysis, heuristics, configuration)
- Configuration file support for customization:
  - Model selection and management (choose different models based on hardware capabilities and use case requirements)
  - Commit message templates and preferences
  - Default commit types/scope preferences
  - Default ticket/context settings per repository
  - Reduction of flags

## Future Expansion Ideas

The architecture supports future expansion into a multi-tool suite. **These are suggestions only - not requirements.**

**Potential Commands:**

- **`ollacli pr`**: PR description generator using Map-Reduce approach to summarize branch changes
- **`ollacli screenshot`**: Vision-based (Moondream2 VLM) screenshot auto-organizer for documentation workflows

**Decision**: Focus exclusively on Git Commit tool for MVP. Consider expansion only after successful completion and validation.

## Research Synthesis & Market Validation

Comprehensive competitive analysis and feasibility research has been completed ([Local SLM Dev Tool Research](docs/research/Local%20SLM%20Dev%20Tool%20Research.md), [Competitive Git Commit Tool Feature Analysis](docs/research/Competitive%20Git%20Commit%20Tool%20Feature%20Analysis.md)). Key findings:

### Core Value: Automating Commit Messages

Regardless of tool landscape, automating commit message generation delivers measurable value:

- **Improves SDLC documentation**: Commits become reliable historical context instead of throwaway messages ("wip", "fix", "asdf")
- **Reduces developer friction**: No mental cost to write meaningful commits during flow state
- **Minimizes cognitive load**: Developers context-switch less between implementation and commit messaging
- **Enhances code review**: Better commits provide crucial context for reviews and future maintenance

This value applies whether using Conventional Commits or regular commit formats.

### Market Gap Confirmed: "Local-First" Opportunity

**Question: Are we reinventing the wheel?**
**Answer: No - there is a clear market gap.**

Existing tools fall into two categories:

- **Cloud-native tools** (`aicommits`, `opencommit`) that _tolerate_ local models but default to OpenAI, introducing latency (2-5s) and privacy concerns
- **Configuration-heavy tools** (`opencommit`, `czg`) that require DevOps-level setup, manual Ollama management, and extensive config files

**The Local-First Gap:**
No tool combines Zero-Config setup, low-latency local inference (no API calls, small model), and guaranteed privacy in one tool.

**Our Differentiation Strategy:**

1. **Privacy-first (Default)**: 100% local inference, zero data egress guaranteed
2. **Speed**: Sub-1s latency vs 2-5s cloud latency
3. **Zero-config**: Auto-detect Ollama, auto-provision models, sensible defaults
4. **Compliance Engine**: Automates Conventional Commits adherence without cognitive load

**Strategic Positioning**: "Trojan Horse" approach - low-risk entry point for enterprise local AI adoption through commit generation.

### Conventional Commits: Validated for All Commit Types

**Question: Is Conventional Commits appropriate for mid-development commits?**
**Answer: Yes - position as compliance automation, not format enforcement.**

Research shows:

- Conventional Commits introduce "Process Friction" - cognitive load of remembering types/scopes
- Our tool **removes cognitive load** by automating classification
- Acts as **"interactive tutor"** for developers learning the standard
- Ensures **100% adherence** without slowing development

**Critical Implementation Requirements:**

- Strict enforcement as **default** (not optional)
- Use **Few-Shot Prompting** (not zero-shot) to prime model with examples
- **Regex validation** post-generation to guarantee compliance
- Fail gracefully if model produces non-compliant output

**Value Proposition**: Not a "message writer" but a **compliance engine** that eliminates the burden of the standard.

### Context Approach: Start Minimal, Extend Strategically

**Question: How much context should we provide the model?**
**Answer: MVP uses minimal context. Advanced context is post-MVP differentiation.**

**MVP Approach (Minimal Context):**

- Input: `git diff --cached` + `git status --short` + system prompt (includes few-shot examples)
- Model: `qwen2.5-coder:1.5b` (superior to `llama3.2:1b` for structured output)
- Focus: Speed, privacy, Conventional Commits compliance

**Post-MVP Opportunities (Suggestions Only):**

- Branch metadata parsing for Jira IDs (e.g., `feature/PROJ-123` → append ticket reference)
- Scope detection implementation (e.g., file path analysis `src/app/auth/*.ts` → scope: `auth`, or heuristics/configuration-based approaches)

**Complexity Trade-off:**
Research validates starting minimal to ensure deliverability. Context-aware features add differentiation but increase complexity. Defer to post-MVP.

### Model Selection: Qwen 2.5 Coder 1.5B

Research identifies `qwen2.5-coder:1.5b` as superior to `llama3.2:1b`:

- Higher instruction-following scores (IFEval benchmarks)
- Fine-tuned specifically for code tasks
- Less prone to "chatty" outputs or hallucinations
- Handles structured output (Conventional Commits) more reliably

**Performance on M1/M2 hardware:**

- Memory footprint: ~1.2GB RAM
- Inference speed: 70-90 tokens/sec
- Total latency: 0.4-0.8s for typical commit message
- Load time: <100ms (if Ollama resident)

## Error Handling & UX Philosophy

**Boundary Conditions & Decisions:**

### No Staged Changes

**Decision:** Manual staging approach for MVP

- User gets helpful error message with specific guidance
- `Run: git add <files>  # stage specific files`
- `  or: git add .       # stage all changes`
- Post-MVP: Consider `--all` flag to auto-stage everything

### Ollama Environment State

**Decision:** Graceful degradation with user guidance

- **Ollama not running:** Clear error message to start Ollama, exit gracefully (like colima tool)
- **Model not available:** Auto-pull `qwen2.5-coder:1.5b` (defer to post-MVP for implementation)
- **Model auto-pull:** Complexity to be addressed later, not MVP blocker

### Configuration Philosophy

**Decision:** Zero-config for MVP

- No configuration files or settings
- Fixed model choice (`qwen2.5-coder:1.5b`)
- Fixed Conventional Commit format (full spec with smart generation)
- Future: Optional configuration for advanced features

### Git Error Handling

**Decision:** Pass-through Git errors deterministically

- **Git Command Failures**: Report Git errors directly to user and exit gracefully
- **User Responsibility**: User resolves underlying Git issues
- **Clear Messaging**: Deterministic error reporting without ambiguity

### User Interaction Flow

**Decision:** Low-friction CLI editor workflow

- **Edit**: Open generated commit message in CLI editor (Nano or equivalent) for user modifications
- **Regenerate**: If scope permits, allow re-running generation without re-analysis
- **Reject/Exit**: User can abandon commit generation at any point
- **No Copy/Paste**: Direct editor access to maintain low-friction experience

### Distribution Model

**Decision:** Global npm package

- Published to npm registry (free for public packages)
- Installation: `npm install -g ollacli` (or alternative final name)
- Post-install: Automatically pulls `qwen2.5-coder:1.5b` model from Ollama (via npm post-install script)
- Name flexibility retained for future refinement

## Success Definition & Metrics

Joe will feel successful when he has:

### Technical Success

1. ✅ A working `ollacli commit` command that generates quality commit messages
2. ✅ Complete understanding of Ollama integration patterns
3. ✅ Functional orchestrator architecture (CLI ↔ Git ↔ Ollama)
4. ✅ Sub-1-second response time on M1/M2 hardware
5. ✅ Conventional Commit format support

### Deliverable Success

1. ✅ GitHub repository with complete source code
2. ✅ Documentation (README, architecture docs, usage guide)
3. ✅ Working installation process (npm install or similar)
4. ✅ Demonstrates full development lifecycle
5. ✅ CV-worthy project showing SLM integration skills

### Learning Success

1. ✅ Deep understanding of how local SLMs work
2. ✅ Confidence to build more complex SLM applications
3. ✅ Understanding of orchestrator vs. model capabilities
4. ✅ Knowledge of Ollama API and integration patterns
5. ✅ Foundation for future dev productivity tools

### Success Metrics

**Quantitative Success Criteria:**

- **Personal Acceptance Testing**: Separate test repo, multiple runs, target ~90% acceptance rate (late-stage story)
- **User Feedback Quality**: Qualitative feedback from local developers
- **Unit Test Coverage**: Comprehensive Jest coverage following style guide patterns

**User Experience Metrics:**

- **Response Time**: Sub-1-second from command to preview
- **Error Clarity**: Deterministic Git error reporting
- **User Control**: Edit workflow (Regenerate/Reject are nice-to-haves if scope permits)

**Testing Strategy:**

- **Unit Testing**: Jest with getData()/getInstance() patterns (per `dev/styleguides/unit-test-patterns.md`)
- **Integration Testing**: Jest-based git output scenario coverage (tooling needs assessed later, we may be able to run Ollama via Jest?)
- **Manual Testing**: Personal testing + user feedback stories (late-stage development)

## Next Steps

**Brief Status**: ✅ Complete. Ready to proceed to PRD.

1. **Product Requirements Document (PRD)**
   - Define detailed functional requirements
   - Specify user stories and acceptance criteria
   - Document MVP feature boundaries
   - Define testing strategy

2. **Technical Architecture & Design**
   - Define project structure
   - Design Ollama integration layer
   - Plan prompt engineering strategy (Few-Shot approach)
   - Define configuration approach

3. **Implementation**
   - Break down into sprints/phases
   - Begin MVP development
   - Iterative testing and validation

## References

**Research Documentation:**

- [Local SLM Dev Tool Research](docs/research/Local%20SLM%20Dev%20Tool%20Research.md) - Competitive analysis & feasibility assessment
- [Competitive Git Commit Tool Feature Analysis](docs/research/Competitive%20Git%20Commit%20Tool%20Feature%20Analysis.md) - Feature benchmarking & roadmap

**External Resources:**

- Ollama docs - https://docs.ollama.com/
- Ollama github - https://github.com/ollama/ollama
- Conventional Commits spec - https://www.conventionalcommits.org/
