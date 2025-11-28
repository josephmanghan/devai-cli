# Ollama-CLI-application - Product Requirements Document

**Author:** Joe
**Date:** 2025-11-27
**Version:** 1.0

**🚨 MVP SCOPE IS ABSOLUTE: This project must deliver a complete, working NPM package. All decisions must prioritize deliverability over additional features. Choose simpler implementations that work over complex ones that add weeks. When in doubt, leave it out.**

---

## Executive Summary

This PRD defines requirements for a local-first CLI tool suite that enhances developer productivity using Small Language Models (SLMs) via Ollama. The first command, `commit`, generates high-quality Conventional Commit messages from staged git changes with sub-1-second latency, 100% local privacy, and zero configuration required. The tool architecture supports future expansion into additional developer productivity commands (PR descriptions, screenshot organization) while maintaining the core principles of speed, privacy, and simplicity.

### What Makes This Special

The tool is not just another commit message generator—it's a **Local-First Compliance Engine** that solves critical pain points:

1. **Privacy-First (Default)**: 100% local inference using Ollama and an appropriate Small Language Model. Zero data egress—proprietary code diffs never leave the developer's machine. This addresses enterprise Data Loss Prevention (DLP) requirements that currently prevent adoption of cloud-based tools like GitHub Copilot in regulated environments.

2. **Speed Over Cloud**: Sub-1-second response time on M1/M2/M3 hardware vs 2-5 second latency for cloud-based competitors (aicommits, opencommit). Preserves developer flow state by making AI generation feel instantaneous—indistinguishable from native git commands.

3. **Zero-Config Experience**: No API keys, no manual Ollama configuration, no DevOps setup. The tool auto-detects Ollama, auto-provisions models, and works immediately after installation with sensible defaults.

4. **Conventional Commits Support**: The tool generates commit messages following the Conventional Commits standard by default, making it easier for teams to adopt and maintain consistent commit history. Future iterations may support custom templates and alternative commit formats.

**Strategic Positioning**: Starting with commit generation as the first command establishes the Ollama infrastructure on developer machines, enabling future expansion into additional local-first productivity tools (PR descriptions, screenshot organization) while maintaining the core principles of speed, privacy, and simplicity.

---

## Project Classification

**Technical Type:** CLI Tool (Developer Productivity)
**Domain:** General Software Development
**Complexity:** Low (no regulatory/compliance burdens)

**Classification Rationale:**

This is a command-line developer tool targeting high-frequency micro-interactions (git commits). As a general-purpose developer productivity tool outside regulated industries (healthcare, fintech, etc.), it faces low domain complexity. The primary technical challenges are performance optimization (latency), user experience (zero-config setup), and reliability (output format compliance)—not regulatory compliance or domain-specific validation.

---

## Success Criteria

Success for this tool is defined by three dimensions: technical capability, developer adoption, and learning outcomes for the developer (Joe).

**Technical Success:**

- Sub-3-second end-to-end latency on M1/M2 hardware (command invocation → message preview)
- 90%+ acceptance rate during personal acceptance testing in real development workflows
- 100% Conventional Commits format compliance (validated via regex post-generation)
- Zero data egress—all processing occurs locally without network calls to external APIs
- Graceful error handling for edge cases (no staged changes, Ollama not running, model unavailable)

**Adoption & Usability:**

- Zero-config first-run experience—tool works immediately after `npm install -g [tool-name]`
- High-quality commit messages that developers accept without significant editing (90%+ acceptance)
- Seamless integration into existing git workflows—no need to remember new commands or break muscle memory
- Deterministic error messages that guide users to resolution (e.g., "Ollama not detected. Install from ollama.com")

**Learning & Deliverability:**

- Complete understanding of Ollama integration patterns and orchestrator architecture
- Deep knowledge of local SLM capabilities, constraints, and prompt engineering for small models
- Full development lifecycle completion: working code, tests, documentation, npm packaging, GitHub repository
- CV-worthy demonstration of local AI integration for developer productivity

**What "Good" Looks Like:**

- A developer stages changes, runs `git commit`, and sees a well-formatted Conventional Commit message appear in their editor within 1 second
- The message accurately summarizes the changes with correct type classification (feat/fix/chore) and concise description
- The developer saves and closes without needing to edit, trusting the AI-generated content
- The tool feels like a native git enhancement, not an external AI service

---

## Product Scope

### MVP - Minimum Viable Product

**Core Command: `[tool-name] commit`**

The MVP focuses exclusively on automating git commit message generation with strict Conventional Commits adherence and sub-second performance.

**Must-Have Capabilities:**

1. **Pre-commit Validation**
   - Detect if no staged changes exist
   - Exit gracefully with clear guidance: "No staged changes. Run: git add <files>"
   - Fail fast before doing any heavy operations

2. **Ollama Lifecycle Management**
   - Auto-detect Ollama availability at `http://localhost:11434`
   - If not running: Provide clear instructions to start it (`ollama serve`) and exit gracefully
   - If not installed: Provide installation link (https://ollama.com) and exit gracefully
   - Auto-provision required model if not present (with progress bar)
   - Handle model loading delays gracefully with spinner/progress indicator
   - Fail fast if Ollama cannot be made available

3. **Commit Type Elicitation**
   - Present numbered list of Conventional Commit types to user: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
   - Use arrow-key selection or number input for type choice
   - Lightweight user interaction before heavy context gathering
   - Store selected type to inject into prompt later

4. **Context Gathering**
   - Execute `git diff --cached` to capture staged changes only
   - Execute `git status --short` for concise file status indicators (M/A/D)
   - Analyze diff content and file paths to inform commit classification
   - Only performed after confirming Ollama is available and type is selected

5. **Model Inference**
   - Construct prompt with few-shot examples, user-selected type, and diff context
   - Send to Ollama with Conventional Commits format constraints
   - Stream response with sub-1s latency target
   - Handle inference failures with retry option

6. **Format Compliance Validation**
   - Post-generation regex validation: `/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):.+/`
   - Enforce Conventional Commits format: `<type>: <description>\n\n<body>`
   - Silent retry mechanism: if regex fails, automatically retry generation (up to max retries - TBD) without exposing failures to user
   - Only show user messages that pass first-level validation check
   - User can then choose to edit or regenerate if content quality is unsatisfactory

7. **Interactive Preview & Edit**
   - Display generated commit message in terminal for review
   - Offer options: [A]pprove, [E]dit, [R]egenerate, [C]ancel
   - Edit: Open default CLI editor (Nano/Vim) with message pre-filled for user modification
   - Approve: Execute `git commit -m "..."` with generated or edited message

**In-Scope Constraints:**

- Type, Description, and Body fields only (no Scope or Footer in MVP)
- Single model: Qwen 2.5 Coder 1.5B identified as primary target (see Model Selection Strategy section for details and alternatives)
- Local execution only (no cloud fallback)
- English language output only

**Out of Scope (MVP):**

- Scope field: `type(scope): description` format
- Footer support: issue tracking, breaking changes notation
- Git hooks integration (prepare-commit-msg)
- Multi-language commit message support
- Custom configuration files
- `--dry-run` and `--auto` flags

**Possible MVP Scope (Stretch Goal):**

- `--all` flag: Auto-stage all changes before generating commit
  - Aligns with zero-config philosophy (convenience)
- `--all` flag: Auto-stage all changes before generating commit
  - Aligns with zero-config philosophy (convenience)
  - Lower priority: manual staging is more common workflow
  - Implementation: simple `git add .` before context gathering
  - Decision: Include if time permits, otherwise defer to post-MVP

### Growth Features (Post-MVP)

**Configuration & Customization:**

- Configuration file support (`~/.config/[tool-name]/config.json`)
  - Model selection (switch between qwen2.5-coder, llama3.2, codellama)
  - Custom commit types and templates beyond Conventional Commits
  - Locale settings for non-English commit messages
  - Default behavior flags (auto-stage, skip preview, etc.)
  - Configurable retry logic (max retry attempts for validation failures)

**Advanced Workflow Integration:**

- `--all` flag: Auto-stage all changes before generating commit
- Git hooks: `prepare-commit-msg` hook installer that automatically intercepts `git commit` to generate messages without explicit CLI invocation.
- `--hint` flag: Provide manual context hint to guide generation (e.g., `--hint "fixing login bug"`)
- Auto-start Ollama: Automatically spawn Ollama daemon if installed but not running (simplifies user experience)

**Context Enhancement:**

- Branch metadata parsing: Extract Jira/issue IDs from branch names (e.g., `feature/PROJ-123` → append to footer)
- Scope detection: Infer scope from file paths (e.g., `src/app/auth/*.ts` → scope: `auth`)
- Multi-file diff summarization: Smart truncation for large diffs (>4k tokens) using Map-Reduce approach
- Custom ignore patterns: `.toolignore` file to exclude files from AI context (lockfiles, generated assets)

**Conventional Commits Extensions:**

- Scope support: Add optional `(scope)` field based on file path analysis or user elicitation
- Footer support: e.g. Breaking changes (`BREAKING CHANGE:`), issue references (`Refs: #123`)
- GitMoji support: Optional emoji prefixes for visual commit classification (🐛 fix, ✨ feat)

### Vision (Future)

**Multi-Command CLI Suite:**

The tool evolves from a single-purpose commit generator into a comprehensive local-first developer productivity suite.

**`[tool-name] pr` - Pull Request Description Generator:**

- Aggregate commit history from feature branch
- Use Map-Reduce summarization for multi-file diffs
- Generate PR title, summary, changes list, and testing strategy
- Integrate with `gh` (GitHub CLI) for one-command PR creation

**`[tool-name] screenshot` - Vision-Based Screenshot Organization:**

- Background daemon monitors `~/Desktop` or `~/Screenshots`
- Use Moondream2 VLM to analyze screenshot content (UI elements, code snippets, terminal output)
- Auto-rename files with semantic descriptions (e.g., `2025-11-27_login-modal-error-state.png`)
- Zero user input required—fully automated organization

**`[tool-name] daemon` - Performance Optimization:**

- Background process keeps Ollama model loaded in VRAM
- Eliminates cold-start latency (2-5 seconds) for instant responses
- Configurable keep-alive duration and resource limits

**Advanced Context Awareness:**

- Project structure analysis: Send directory tree to model for better scope detection
- Codebase-aware suggestions: RAG implementation using local embeddings for project-specific commit patterns
- Multi-turn interaction: Model requests clarification from user when diff is ambiguous

---

## CLI Tool Specific Requirements

As a command-line developer tool, this product must adhere to Unix philosophy and modern CLI best practices while delivering exceptional user experience through intelligent automation.

**Command Structure:**

- Primary command: `[tool-name] commit`
- Future commands: `[tool-name] pr`, `[tool-name] screenshot`, `[tool-name] daemon`
- Follow verb-noun pattern for clarity and discoverability
- Support `--help` and `--version` flags globally

**Interactive vs Scriptable:**

- **Primary Mode**: Interactive TUI with rich prompts, spinners, and progress bars
- **Scriptable Mode**: Support for `--dry-run` (output to stdout) and `--auto` (non-interactive) flags for CI/CD integration
- Detect TTY mode: rich output in terminal, plain text when piped
- Exit codes: 0 (success), 1 (user cancel), 2 (error - no staged changes), 3 (error - Ollama unavailable)

**Output Formats:**

- Default: Rich terminal output with colors, emojis, and formatting (using libraries like chalk, ora)
- Piped output: Plain text suitable for parsing or logging
- JSON output: `--json` flag for machine-readable responses (post-MVP)
- Streaming: Real-time token streaming for commit message generation (visual feedback during inference)

**Configuration Method:**

- Zero-config by default (sensible defaults for 80% use case)
- Optional config file: `~/.config/[tool-name]/config.json` for power users (post-MVP)
- Environment variables: `OLLAMA_HOST`, `OLLAMA_MODEL` for override capability (post-MVP)
- Per-repo config: `.toolrc` file in repo root for team-wide settings (post-MVP)

**Shell Integration:**

- Installation via npm: `npm install -g [tool-name]`
- Binary available in PATH immediately after installation
- Shell completion support (bash, zsh, fish) for command and flag autocomplete (post-MVP)
- Respect user's `$EDITOR` environment variable for terminal editor selection (Nano, Vim, Emacs, etc.), with fallback to Nano if not set

**Error Handling Philosophy:**

- Fail gracefully with actionable error messages
- Never crash with stack traces in user-facing output (log to debug file instead)
- Provide clear remediation steps: "Ollama not detected. Install from https://ollama.com"
- Distinguish between user error (no staged changes), system error (Ollama down), and bugs (unexpected exceptions)

### Model Selection Strategy

**Target Model (Pre-Testing):**

Research and competitive analysis have identified **Qwen 2.5 Coder 1.5B** (4-bit quantization) as the most appropriate model for this use case based on:

- Superior instruction-following scores (IFEval benchmarks) compared to Llama 3.2 1B
- Fine-tuning specifically for code tasks and structured output
- Lower tendency for "chatty" outputs or conversational filler
- Reliable handling of Conventional Commits format constraints
- Memory footprint: ~1.2GB RAM (acceptable for background use)
- Performance on M1/M2: 70-90 tokens/sec, ~0.4-0.8s for typical commit message

**Validation Requirement:**

The model selection is subject to validation testing during implementation. If Qwen 2.5 Coder does not meet acceptance criteria (90%+ acceptance rate, sub-1s latency, format compliance), alternative models will be evaluated:

- Llama 3.2 1B (general-purpose, wider compatibility)
- CodeLlama 7B (higher capability, increased resource requirements)
- Llama 3.2 3B (middle ground between speed and capability)

**Architecture Flexibility:**

The tool architecture must support model switching without code changes. Model name should be configurable via environment variable during development to enable rapid iteration and testing. User-facing model selection is a post-MVP feature—MVP uses a single hard-coded default model.

**Implementation Considerations (for Architecture phase):**

The following Ollama request parameters require technical decisions during architecture/development:

- **Temperature**: Controls output randomness. MVP likely uses fixed low value (e.g., 0.1-0.2) for deterministic commit messages.
- **Keep-alive**: Controls how long model stays in memory. MVP may use `-1` (indefinite) or high value for performance, avoiding cold-start latency.
- **Context window (num_ctx)**: Model default should suffice for MVP, but architecture must handle detection when diff exceeds limits.
- **UX Design Decision:**
  **Spinner Library:** Chose `ora` library for cross-platform terminal animations
  **Design:** Unicode dots animation for professional appearance
  **Rationale:** Battle-tested, handles Windows/macOS/Linux differences automatically
  **MVP Scope:** Zero additional complexity for users, reliable performance feedback

**Alternative Validation Strategy:**

- **Single-pass validation** (simpler, faster): Generate full message, validate with regex, retry if invalid.
- **Multi-pass sectioned generation** (more reliable, slower): Prompt model separately for type, description, body; validate each section individually before assembly.
- Trade-off: Reliability vs. latency. Start with single-pass; consider multi-pass if reliability issues emerge during testing.

### Future Technical Considerations (Post-MVP):

**Edge Cases to Document:**
- Mid-generation daemon death: Document as edge case, don't implement specific handling initially
- Git repository corruption: Document as edge case, rely on git's own error reporting
- Editor fallback failures: Document fallback chain ($EDITOR → vim → nano → vi → notepad), already covered in stories

**Migration Strategy Questions:**
- CLI tool migration patterns: Research how popular CLI tools handle version upgrades with breaking changes
- Custom model upgrade strategy: How to migrate users from ollatool-commit v1 to v2 when system prompt changes
- Configuration migration: Strategy for handling config file format changes between versions
- Timeline: Document as v1.1+ consideration, not MVP blocker

**Performance Validation Gaps:**
- Empirical performance data: Add performance benchmarking as post-MVP task to validate actual vs. target latency
- Context window testing: Validate real-world diff sizes vs. 128K token limit under various development scenarios
- Hardware variability: Test on different Mac/Windows/Linux configurations, not just M1/M2 as

**CRITICAL: First-Run Model Provisioning Flow:**

- **Problem**: Tool requires both base model download AND custom model creation (with system prompt baked in via Modelfile). This only works if Ollama is running.
- **Ollama model creation**: Tool doesn't just use base model + dynamic prompt. It creates a custom Ollama model via Modelfile that includes the system prompt, creating a new model (e.g., `[tool-name]-commit:latest`) based on `qwen2.5-coder:1.5b`.
- **Recommended approach**:
  - **npm postinstall hook**: Attempt full setup (download base model + create custom model). If Ollama not running, exit gracefully: "Ollama not detected. Install Ollama, run `ollama serve`, then: [tool-name] setup"
  - **Explicit setup command**: `[tool-name] setup` - Downloads base model (if missing) AND creates custom model with system prompt. Shows progress for both operations.
  - **Just-in-time fallback**: If custom model somehow missing when user runs `commit`, recreate it then (edge case only)
- **User flow**: npm install tool → install Ollama → `ollama serve` → [postinstall succeeds OR user runs setup] → `[tool-name] commit`
- **Architecture phase must define**: Modelfile structure, custom model naming convention, setup command implementation

---

## User Experience Principles

While this is a CLI tool without a graphical interface, user experience is paramount. The tool must feel like a natural extension of git rather than an external AI service.

**Speed is UX:**

- Sub-1-second response time is non-negotiable. Anything slower breaks developer flow.
- Show immediate feedback: spinner during model loading, streaming tokens during generation.
- Perceived performance matters: display progress even if waiting for Ollama to start.

**Trust Through Transparency:**

- Always show the generated message before committing—never auto-commit without user review.
- Provide clear indication of what the tool is doing: "Analyzing staged changes...", "Generating commit message..."
- If generation fails or format is invalid, explain why and offer remediation.

**Low Friction, High Control:**

- Default path should be 3 keystrokes: select type → review message → approve.
- Power users can bypass with flags (`--auto`, `--dry-run`) when they trust the output.
- Editing is always available—open user's preferred $EDITOR with message pre-filled.

**Graceful Degradation:**

- If Ollama is not installed or not running: provide installation/startup instructions and exit gracefully (similar to how Docker fails with a helpful message when Colima isn't running).
- If model is unavailable: offer to auto-download with progress bar and size estimate (edge case where user deleted model after installation).
- If the context window is being exceeded: exit with error explaining the limitation and suggest staging fewer files (intelligent truncation is post-MVP).

### Key Interaction Patterns

**Primary Flow - Happy Path:**

```
1. User: git add <files>
2. User: [tool-name] commit
3. Tool: [Check] Validates staged changes exist
4. Tool: [Check] Detects Ollama availability (exits if not running)
5. Tool: [Prompt] "Select commit type: 1) feat  2) fix  3) docs ..."
6. User: [Input] 2
7. Tool: [Spinner] "Analyzing staged changes..."
8. Tool: [Streaming] "fix: handle null token in login service\n\nAdded null check..."
9. Tool: [Prompt] "[A]pprove [E]dit [R]egenerate [C]ancel"
10. User: [Input] a
11. Tool: [Success] "✓ Committed: fix: handle null token in login service"
```

**Edit Flow:**

```
9. Tool: [Prompt] "[A]pprove [E]dit [R]egenerate [C]ancel"
10. User: [Input] e
11. Tool: [Opens $EDITOR with message]
12. User: [Edits message, saves, closes]
13. Tool: [Success] "✓ Committed: <edited message>"
```

**Error Flow - No Staged Changes:**

```
2. User: [tool-name] commit
3. Tool: [Error] "No staged changes detected.

   Stage your changes first:
     git add <files>     # stage specific files
     git add .           # stage all changes

   Or use --all flag to auto-stage (post-MVP feature)"
4. Tool: [Exit code 2]
```

**Error Flow - Ollama Not Running:**

```
2. User: [tool-name] commit
3. Tool: [Error] "Ollama is not running.

   Start Ollama:
     ollama serve

   Or install from:
     https://ollama.com/download"
4. Tool: [Exit code 3]
```

---

## Functional Requirements

These requirements define WHAT capabilities the tool must have to deliver the product vision. Each requirement is a testable, implementation-agnostic statement of functionality.

### Git Integration & Context Gathering

**FR1**: The tool can detect whether any files are staged in the git staging area.

**FR2**: The tool can read the complete diff of all staged changes (`git diff --cached`).

**FR3**: The tool can read the status of all files in the repository (`git status --short`).

**FR4**: The tool can identify file paths and extensions from staged changes to inform commit classification.

**FR5**: The tool can execute git commit commands with user-approved commit messages.

**FR6**: The tool operates only within git repositories and fails gracefully when run outside one.

### Ollama & Model Lifecycle Management

**FR7**: The tool can detect whether the Ollama daemon is running and accessible at the configured endpoint.

**FR8**: The tool can check if the required model (hard-coded for MVP) is present on the local system.

**FR9**: The tool can automatically download (pull) the required model if it is not present, displaying download progress.

**FR10**: The tool can send inference requests to Ollama with custom prompts and receive streaming responses.

**FR11**: The tool can detect when the diff exceeds the model's context window and exit with an error message suggesting to stage fewer files.

**FR12**: The tool can detect and report Ollama connection failures with actionable error messages.

### Commit Type & Classification

**FR13**: The tool can present users with a list of valid Conventional Commit types (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert).

**FR14**: Users can select a commit type via numbered selection or arrow-key navigation.

**FR15**: The tool injects the user-selected commit type into the prompt to guide model generation.

**FR16**: The tool validates generated commit messages using a structural regex (`^\w+: .+`) to ensure they follow the standard format, ignoring the specific type (which is overwritten).

**FR17**: If generated output fails structural validation (e.g., contains conversational text), the tool silently retries generation (up to a maximum retry limit) without exposing failures to the user.

### Commit Message Generation

**FR18**: The tool constructs prompts using few-shot examples to prime the model for Conventional Commits format.

**FR19**: The tool sends diff context, file status, and commit type to the model for message generation.

**FR20**: The tool provides visual feedback during message generation to indicate processing is occurring (e.g., spinner or token streaming).

**FR21**: The tool generates commit messages with three components: type, description (subject), and body.

**FR22**: Generated descriptions follow imperative mood ("add feature" not "added feature").

**FR23**: Generated descriptions are concise (target: 50 characters or less for subject line).

**FR24**: The tool ensures the final commit message contains no conversational filler (e.g., "Here is a commit message:"). Primary strategy: strong prompt engineering to prevent filler generation. Fallback: detection and stripping (complex to implement reliably).

### Interactive User Workflow

**FR25**: The tool displays generated commit messages in the terminal for user review before committing.

**FR26**: Users can approve generated commit messages to proceed with git commit.

**FR27**: Users can edit commit messages by opening them in their configured CLI editor ($EDITOR).

**FR28**: Users can regenerate commit messages if unsatisfied with the initial output.

**FR29**: Users can cancel the commit operation at any point without side effects.

**FR30**: The tool displays clear action prompts with keyboard shortcuts ([A]pprove, [E]dit, [R]egenerate, [C]ancel).

**FR31**: When users edit messages, the tool captures the edited content and uses it for the commit.

**FR32**: The tool confirms successful commits with a summary of the committed message.

### Error Handling & Edge Cases

**FR33**: When no staged changes exist, the tool exits with an error message explaining how to stage files.

**FR34**: When Ollama is not running, the tool exits with instructions to start or install Ollama.

**FR35**: When the required model is not available, the tool offers to download it automatically.

**FR36**: When git commands fail (e.g., not a git repo), the tool displays git's error message and exits.

**FR37**: When model inference fails or times out, the tool reports the error and allows retry.

**FR38**: The tool distinguishes between user errors (exit code 1-2), system errors (exit code 3), and bugs (exit code 4+).

**FR39**: All error messages include actionable remediation steps, not just problem descriptions.

### Performance & Resource Management

**FR40**: The tool completes the full workflow (command invocation to commit) in under 1 second on M1/M2 hardware.

**FR41**: The tool provides immediate visual feedback (spinner/progress) when waiting for Ollama responses.

**FR42**: The tool respects system resources by using quantized models with memory footprints under 2GB.

**FR43**: The tool can operate while other development tools (IDE, browser, Docker) are running without causing memory pressure.

### Configuration & Extensibility

**FR44**: The tool uses sensible defaults that work without any configuration (zero-config principle).

**FR45**: The tool respects the `OLLAMA_HOST` environment variable for custom Ollama endpoints.

**FR46**: The tool respects the `$EDITOR` environment variable (when set to a terminal editor like Nano/Vim/Emacs) for editing commit messages, with Nano as the fallback if `$EDITOR` is not set.

**FR47**: The tool provides `--help` flag to display usage information and available commands.

**FR48**: The tool provides `--version` flag to display current version number.

**FR49**: The tool's architecture supports adding new commands (pr, screenshot) without breaking existing functionality.

---

## Non-Functional Requirements

These requirements define HOW WELL the system must perform, not what it does. They establish quality attributes that enable the tool to succeed in real-world developer workflows.

### Performance

**NFR-P1: Latency Target**

- End-to-end workflow completion in <1 second on M1/M2 hardware (command invocation → commit completion)
- Model inference time: <800ms for typical commit message (20-30 tokens)
- Time-to-first-token (TTFT): <50ms when model is already loaded in memory

**NFR-P2: Resource Efficiency**

- Maximum memory footprint: 2GB RAM for model + inference runtime during active use
- CPU usage: ≤50% of one performance core during active inference
- Idle resource usage: 0% when not actively generating (model unloaded from memory after use; Ollama daemon persistence is user-managed, not controlled by tool)

**NFR-P3: Startup Performance**

- CLI tool initialization: <100ms (binary load + argument parsing)
- Ollama connection check: <200ms timeout for availability detection
- Model loading (cold start): <2 seconds when model must be loaded into memory

**NFR-P4: Perceived Performance**

- Display visual feedback (spinner/progress) within 100ms of user action
- Stream tokens in real-time (no buffering entire response before display)
- Progress bars for long-running operations (model downloads, large diff analysis)

### Security & Privacy

**NFR-S1: Data Privacy (Critical)**

- 100% local processing—no code diffs transmitted over network to external services
- No telemetry, analytics, or usage tracking without explicit opt-in
- All model inference occurs on localhost via Ollama API

**NFR-S2: Credentials & Secrets**

- No API keys required for operation (zero-config principle)
- No storage of user credentials or authentication tokens
- Respect for git's credential handling (tool never accesses git credentials)

**NFR-S3: Code Integrity**

- Tool never modifies source code files—only interacts with git metadata
- Tool only writes to `.git/` directory via standard git commands (no direct manipulation)
- User approval required before any git commit is executed

**NFR-S4: Dependency Security**

- All npm dependencies scanned for known vulnerabilities (npm audit)
- Minimal dependency tree to reduce attack surface
- No dependencies with native binary components (prefer pure JavaScript where possible)

### Reliability & Error Handling

**NFR-R1: Graceful Degradation**

- Tool never crashes with unhandled exceptions in user-facing operation
- All errors caught, logged to debug file, and presented with actionable messages
- No data loss: if commit fails, user's changes remain staged and uncommitted

**NFR-R2: Deterministic Behavior**

- Same diff + same commit type → consistent message format (though content may vary slightly due to model stochasticity)
- Error conditions always produce the same error code and message structure
- No race conditions or timing-dependent bugs in git command execution

**NFR-R3: Resilience to External Failures**

- Ollama connection failures handled gracefully (no hang, clear error message)
- Model download failures (network issues) allow retry without restarting tool
- Git command failures (repo corruption, permission issues) reported clearly without tool crash

**NFR-R4: Testing Coverage**

- Unit test coverage: ≥80% of core logic (git integration, prompt construction, message validation)
- Integration tests: Mock Ollama responses for deterministic testing
- Manual acceptance testing: 90%+ acceptance rate across 50+ real commits

### Compatibility & Integration

**NFR-C1: Platform Support (MVP)**

- macOS: M1/M2/M3 (primary target), Intel Macs (secondary)
- Git versions: 2.x and above (standard modern git)
- Node.js: v18+ (LTS and Current releases)

**NFR-C2: Platform Support (Post-MVP)**

- Linux: Ubuntu 22.04+, Debian 11+, Fedora 38+
- Windows: WSL2 (Windows Subsystem for Linux 2)

**NFR-C3: Terminal Compatibility**

- Works in: iTerm2, Terminal.app, Warp, Alacritty, Kitty
- Respects TERM environment variable for color/formatting capability detection
- Graceful fallback to plain text when piped or in non-TTY mode

**NFR-C4: Git Workflow Integration**

- Compatible with standard git workflows (feature branches, rebasing, merging)
- Does not interfere with git hooks installed by other tools (Husky, pre-commit frameworks)
- Respects `.gitignore` and `.git/info/exclude` patterns

**NFR-C5: Ollama Integration**

- Compatible with Ollama v0.1.x and above
- Handles Ollama API version changes gracefully (fallback to core features if new API unavailable)
- Supports custom Ollama installations (non-standard ports, remote instances via OLLAMA_HOST)

### Usability & Developer Experience

**NFR-U1: Zero-Config First Run**

- Tool must work immediately after `npm install -g [tool-name]` without requiring configuration files
- Sensible defaults for all settings (model, temperature, context window)
- Auto-detection and auto-provisioning of required resources (Ollama, model)

**NFR-U2: Error Message Quality**

- All error messages written in plain English (no jargon or error codes without explanation)
- Every error includes specific remediation steps (not just "failed to connect")
- Error messages use color/formatting to distinguish severity (red for errors, yellow for warnings)

**NFR-U3: Documentation**

- `--help` output provides complete usage information without requiring external docs
- README includes quickstart, installation, troubleshooting, and examples
- Inline code comments follow style guide patterns (self-documenting code preferred)

**NFR-U4: Observability** (post-MVP)

- Optional debug logging via `DEBUG=[tool-name]` environment variable
- Logs include: git command execution, Ollama requests/responses, validation results
- Log file location printed in debug mode for troubleshooting

### Maintainability & Extensibility

**NFR-M1: Code Organization**

- Modular architecture separating concerns: git integration, Ollama client, prompt engineering, UI
- Clear interfaces between modules to enable testing and future refactoring
- Following project style guides (dev/styleguides/) for consistency

**NFR-M2: Prompt Engineering**

- System prompts defined in Modelfile and baked into custom Ollama model during setup (e.g., `[tool-name]-commit:latest` created from base model + system prompt)
- Few-shot examples and prompt templates stored in separate files for easy modification and experimentation
- Custom model recreated when prompts are updated (via setup or dedicated command)
- Model-specific prompt variations supported for different base models

**NFR-M3: Extensibility**

- Command pattern architecture allows adding new commands (pr, screenshot) without modifying existing code
- Plugin-like structure for future integrations (git hooks, IDE extensions)
- Configuration system designed for expansion (custom commit types, templates)

---

## Summary & Next Steps

**PRD Status**: ✅ Complete

This PRD defines a local-first CLI tool for automating git commit message generation with these core attributes:

- **49 Functional Requirements** covering git integration, Ollama management, commit generation, user workflow, error handling, and extensibility
- **Privacy-first architecture** guaranteeing 100% local processing with zero data egress
- **Sub-1-second performance target** on M1/M2 hardware to preserve developer flow
- **Zero-config experience** with automatic Ollama detection and model provisioning
- **Conventional Commits support** as default format with future template extensibility

**What Makes This Product Special:**
The tool is not just a commit message generator—it's a compliance engine that eliminates the cognitive load of writing standardized commits while maintaining complete privacy and instant responsiveness. It establishes the foundation for a broader suite of local-first developer productivity tools.

**Reference Documentation:**

- Product Brief: dev/brief.md
- Research: docs/research/ (Competitive Analysis, Ollama Architecture, Local SLM Feasibility)
- Style Guides: dev/styleguides/ (Node.js, Unit Testing, Clean Code, Ollama Integration)

---

## Recommended Next Steps

**Immediate Next Steps:**

1. **UX Design** (Optional but Recommended)
   - Design terminal interaction flows and visual feedback patterns
   - Create mockups of error messages and success states
   - Define exact CLI output formatting and color schemes

2. **Technical Architecture** (Required Before Implementation)
   - Define project structure (modules, directory layout)
   - Design Ollama integration layer and API abstraction
   - Specify prompt engineering strategy (few-shot examples, template structure)
   - Document configuration approach (environment variables, future config file schema)
   - Define error handling taxonomy and exit code standards

3. **Epic & Story Breakdown** (After Architecture)
   - Create epics for: Git Integration, Ollama Management, Message Generation, User Interaction, Testing & QA
   - Break down into implementable stories with acceptance criteria
   - Prioritize stories for MVP delivery

**Success Criteria Reminder:**
This project succeeds when you (Joe) can:

- Run `[tool-name] commit` in your real development workflow and get high-quality commit messages in <1s
- Understand every component of the Ollama integration and orchestrator architecture
- Publish a complete, working npm package to demonstrate local AI integration patterns
- Use this as a foundation for expanding into additional local-first developer productivity tools

---

_This PRD was created through collaborative discovery between Joe and the BMad Method PM agent, synthesizing the product brief and competitive research into comprehensive functional requirements._
