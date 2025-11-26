# Joe's Ollama CLI Application Project Brief

## Project Goal

Build a working **Git Commit Message Generator CLI** that uses Ollama and `qwen2.5-coder:1.5b` to automatically generate high-quality Conventional Commit messages from staged git changes. The tool must be extremely simple, completable end-to-end by an intermediate developer, and provide genuine developer utility as a GitHub-ready demonstration of local SLM integration.

## Application Decision

### Primary Application: Git Commit Message Generator

**Selected Tool:** `ollacli commit` - An intelligent git commit assistant

**Core Functionality:**

1. Analyzes staged git changes (`git diff --cached`)
2. Reads git status and repository context
3. Generates Conventional Commit format messages via `qwen2.5-coder:1.5b`
4. Provides interactive preview and confirmation
5. Executes the commit on user approval

**Why This Application:**

- ✅ **Simplest to build**: Bounded input/output (git diff → commit message)
- ✅ **Perfect SLM fit**: Text-only, pattern-matching task ideal for 1B model
- ✅ **High frequency**: Used 10-50x/day by active developers
- ✅ **Proven pattern**: Validates against existing tools (aicommits, commitron)
- ✅ **Company alignment**: Supports adoption of Conventional Commits standard
- ✅ **Privacy**: Keeps proprietary code changes 100% local
- ✅ **Deliverable**: Can complete MVP in 2-4 sprints

## Personal Requirements & Constraints

### Technical Profile

- **Background**: Angular frontend developer
- **Node.js**: Comfortable with beginner Node.js concepts
- **CLI Experience**: Built basic CLI tools before, quick learner
- **Code Approach**: Comfortable using agents to write code as long as he understands requirements
- **Hardware**: M1/M2 Mac (optimal for `llama3.2` performance)

### Success Criteria

- **Deliverable**: Working CLI application that can be completed end-to-end
- **Scope**: Complete full start-to-finish development lifecycle
- **Sharing**: GitHub-ready project (CV-worthy, demonstrates SLM integration patterns)
- **Simplicity**: Prioritize achievable MVP over feature-complete
- **Learning**: Complete understanding of Ollama integration and orchestrator architecture

### Non-Functional Requirements

- **Extreme Simplicity**: Feature scope must be narrow enough for intermediate developer to complete end-to-end in 2-4 sprints
- **Deliverability**: Must be achievable as a complete, working project with full understanding of every component
- **Zero-Config Philosophy**: Tool should work immediately after installation with sensible defaults
- **Lightweight Footprint**: Minimal dependencies, single command, optional configuration
- **Technical Preference**: CLI approach (easiest path for Ollama integration)
- **Learning Focus**: Complete understanding of how each module works
- **GitHub Ready**: Project should be shareable and demonstrate full development process
- **Performance**: Sub-1-second response time for commit message generation

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

### Available Research Context

The project has extensive [background research](dev/research) already completed:

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

1. **Pre-commit validation**: Check for staged changes, provide clear guidance if none
2. **Context gathering**: Execute `git diff --cached` and `git status --short`
3. **Prompt construction**: Build context-rich prompt for Conventional Commits
4. **Model inference**: Send to `qwen2.5-coder:1.5b` via Ollama API
5. **Interactive preview**: Display generated commit message
6. **User interaction**: Approve/edit in CLI editor (Nano or equivalent)/regenerate/reject
7. **Commit execution**: Run `git commit -m "..."` on approval

**Conventional Commit Support:**

- Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`
- Format: `<type>(<optional-scope>): <description>`
- **Full format support** with smart generation:
  - **Body**: Included automatically when changes need explanation beyond subject
  - **Footer**: Included for breaking changes or issue references
  - **AI decides** when to include body/footer based on diff context

### Nice-to-Have Features (Post-MVP Suggestions)

- `--dry-run`: Generate message without committing
- `--auto`: Skip preview and auto-commit
- `--all` flag: Auto-stage all changes and generate commit (address the "no staged changes" workflow)
- Configuration file support for customization:
  - Model selection and management
  - Commit message templates and preferences
  - Default commit types/scope preferences
- Enhanced auto-pull functionality for model management

## Future Expansion Ideas

The architecture supports future expansion into a multi-tool suite. **These are suggestions only - not requirements.**

**Potential Commands:**

- **`ollacli pr`**: PR description generator using Map-Reduce approach to summarize branch changes
- **`ollacli screenshot`**: Vision-based (Moondream2 VLM) screenshot auto-organizer for documentation workflows

**Decision**: Focus exclusively on Git Commit tool for MVP. Consider expansion only after successful completion and validation.

## Research Synthesis & Market Validation

Comprehensive competitive analysis and feasibility research has been completed ([Local SLM Dev Tool Research](docs/research/Local%20SLM%20Dev%20Tool%20Research.md), [Competitive Git Commit Tool Feature Analysis](docs/research/Competitive%20Git%20Commit%20Tool%20Feature%20Analysis.md)). Key findings:

### Market Gap Confirmed: "Local-First" Opportunity

**Question: Are we reinventing the wheel?**
**Answer: No - there is a clear market gap.**

Existing tools fall into two categories:

- **Cloud-native tools** (`aicommits`, `opencommit`) that _tolerate_ local models but default to OpenAI, introducing latency (2-5s) and privacy concerns
- **Configuration-heavy tools** (`opencommit`, `czg`) that require DevOps-level setup, manual Ollama management, and extensive config files

**The Local-First Gap:**
No tool currently provides a "Zero-Config" experience for local SLMs with auto-provisioning, seamless Ollama integration, and guaranteed privacy.

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

- Input: `git diff --cached` + `git status`
- Model: `qwen2.5-coder:1.5b` (superior to `llama3.2:1b` for structured output)
- Focus: Speed, privacy, Conventional Commits compliance

**Post-MVP Opportunities (Suggestions Only):**

- Branch metadata parsing for Jira IDs (e.g., `feature/PROJ-123` → append ticket reference)
- Smart scope detection from file paths (e.g., `src/app/auth/*.ts` → scope: `auth`)
- Heuristic pre-processing (e.g., all `.md` files → force type: `docs`)

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
- **Unit Testing**: Jest with getData()/getInstance() patterns (per dev/styleguides/unit-test-patterns.md)
- **Integration Testing**: Jest-based git output scenario coverage (tooling needs assessed later)
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
