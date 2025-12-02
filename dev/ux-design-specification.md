# ollatool - UX Design Specification

**Author:** Joe
**Date:** 2025-11-27
**Version:** 1.0
**Designed by:** Sally (UX Designer Agent)
**Status:** Complete

---

## Executive Summary

This UX design specification defines the complete terminal user experience for **ollatool**, a local-first CLI tool suite that enhances developer productivity using Small Language Models via Ollama. The design prioritizes speed, privacy, and simplicity through immediate visual feedback, clear error handling, and intuitive interaction patterns that feel like natural extensions of git workflows.

### Design Philosophy

**Speed is UX:** Sub-1-second response time with immediate visual feedback preserves developer flow state.

**Privacy First:** 100% local processing with clear error messaging that never exposes proprietary code.

**Zero-Config Experience:** Tool works immediately after installation with auto-detection and sensible defaults.

**Graceful Degradation:** All failure states provide actionable remediation steps without technical jargon.

---

## Project Context

### Core Experience Definition

**Project:** Local-first CLI tool for generating git commit messages using Ollama
**Tool Name:** ollatool
**Target Users:** Individual developers working in feature branches on daily incremental commits
**Core Workflow:** Stage changes → Run `ollatool commit` → Get instant commit message → Approve/edit → Commit completes

### Key UX Requirements from PRD

- **Performance:** Sub-1-second response time on M1/M2 hardware
- **Error Handling:** Clear guidance for no staged changes, Ollama unavailable, model issues
- **Conventional Commits:** Automated format compliance without cognitive load
- **Interactive Workflow:** Type selection, preview/edit, keyboard shortcuts
- **Privacy:** Zero data egress, all processing local

---

## Visual Design System

### Terminal Color Theme

**Primary Colors (accessible, high-contrast):**

- **Success (Green):** `#4ade80` - ✓ operations completed successfully
- **Error (Red):** `#f87171` - ✗ errors and failures
- **Warning (Yellow):** `#fbbf24` - ⚠ warnings and cautions
- **Info (Blue):** `#60a5fa` - ℹ informational messages
- **Highlight (Cyan):** `#38bdf8` - emphasized text and selections
- **Dim (Gray):** `#9ca3af` - secondary text and de-emphasized content

**Accessibility Compliance:**

- Respects `NO_COLOR` environment variable for colorblind users
- High contrast ratios (>4.5:1) for all color combinations
- Supports pipe output (plain text when redirected)
- Compatible with terminal emulators (iTerm2, Terminal.app, Warp, etc.)

### Typography & Spacing

**Font Family:** Terminal monospace (user's configured font)
**Layout:** Single-column flow with consistent 1-space indentation
**Spacing:** Compact but readable with blank lines between major sections

**Formatting Hierarchy:**

- **Labels/Prefixes:** `[INFO]`, `[ERROR]`, `[SUCCESS]` - consistent uppercase with brackets
- **Commands/Code:** User input and file paths in highlight color
- **Status Indicators:** Unicode symbols (✓ ✗ ⚠ ℹ) for quick visual scanning

---

## Interaction Patterns

### Progress Feedback System

**Immediate Response (within 100ms):**

- Show spinner for any operation >100ms
- Display checkmarks for completed validation steps
- Provide status transitions for perceived performance

**Progress Indicators:**

- **Connecting:** `[INFO] Connecting to Ollama...`
- **Model Loading:** `[INFO] Model loaded... ✓`
- **Analyzing:** `[INFO] Analyzing changes... ✓`
- **Generating:** `[INFO] Generating commit message...`

**Spinner Implementation:**

- **Library:** Use `ora` library for cross-platform compatibility
- **Design:** Unicode dots animation `⠋⠙⠹⠸⠼⠴` (clean, professional)
- **Performance:** 100ms frame intervals for smooth animation
- **Cross-platform:** Handles Windows/macOS/Linux terminal differences automatically
- **Zero-config:** Works out-of-the-box with sensible defaults

**Performance Perception:**

- Each step shows immediate acknowledgment
- Checkmarks appear as operations complete
- Total perceived time <1 second (even with model loading)

### Error Message System

**Error Severity Levels:**

- **ERROR (Red):** Blocking failures that require user action
- **WARNING (Yellow):** Non-blocking issues or informational alerts
- **INFO (Blue):** Status updates and guidance

**Error Message Format:**

```
[ERROR] ✗ <Clear problem description>

<Remediation steps with specific commands>
Exit code: <number>
```

**Key Error Flows:**

1. **No Staged Changes:**
   - Clear instruction to run `git add` commands
   - Examples for specific files vs all files
   - Exit code 2

2. **Ollama Not Running:**
   - Instruction to start `ollama serve`
   - Link to ollama.com/download for installation
   - Exit code 3

3. **Context Window Overflow:**
   - Clear explanation that changes are too large
   - Instruction to unstage and stage fewer files
   - Suggestion to commit in smaller batches
   - Exit code 2

4. **Git Repository Issues:**
   - Pass-through git error messages directly
   - Guidance for repository-specific issues

### Interactive Selection System

**Commit Type Selection:**

```
Select commit type:
[1] feat: A new feature
[2] fix: A bug fix
[3] docs: Documentation only changes
[4] style: Code style changes
[5] refactor: Code refactoring
[6] test: Adding or updating tests
[7] build: Build system or dependency changes
[8] ci: CI configuration changes
[9] chore: Maintenance tasks
[0] revert: Revert previous commits

Your choice (0-9):
```

**Keyboard Navigation:**

- Arrow keys: Up/Down for selection
- Number input: Direct selection (1-9, 0)
- Enter: Confirm selection
- Ctrl+C: Cancel operation

**Confirmation Prompts:**

```
feat: add OAuth2 integration
Added login endpoint and token validation for third-party authentication.

[A]pprove [E]dit [R]egenerate [C]ancel:
```

**Keyboard Shortcuts:**

- **A:** Approve and commit immediately
- **E:** Open message in $EDITOR for editing
- **R:** Regenerate commit message
- **C:** Cancel operation (no changes committed)

### Editing Workflow

**Editor Integration:**

- Opens user's configured `$EDITOR` (Nano, Vim, Emacs, etc.)
- Pre-fills editor with generated commit message
- Falls back to Nano if `$EDITOR` not set
- Preserves original message if user cancels edit

**Edit Flow:**

1. User selects [E]dit from confirmation
2. System opens editor with generated message
3. User modifies and saves
4. System reads edited content
5. Commits with edited message immediately

---

## User Journey Flows

### Primary Happy Path Flow

**Step-by-Step Experience:**

```bash
$ ollatool commit
[INFO] Detecting staged changes... ✓
[INFO] Connecting to Ollama... ✓
[INFO] Model loaded... ✓
[INFO] Analyzing changes... ✓

Select commit type:
[1] feat: A new feature
[2] fix: A bug fix
[3] docs: Documentation only changes
[4] style: Code style changes
[5] refactor: Code refactoring
[6] test: Adding or updating tests
[7] build: Build system or dependency changes
[8] ci: CI configuration changes
[9] chore: Maintenance tasks
[0] revert: Revert previous commits

Your choice (0-9): 2

[INFO] Generating commit message...

fix: resolve authentication timeout issue
Added timeout handling and retry logic for OAuth2 token refresh.
Prevents infinite loops when API services are temporarily unavailable.

[A]pprove [E]dit [R]egenerate [C]ancel: A

[SUCCESS] ✓ Committed: fix: resolve authentication timeout issue
```

**Flow Characteristics:**

- Immediate visual feedback at each step
- Clear progression through validation states
- Type selection with familiar conventional commit types
- Generated message appears instantly after brief processing
- One-key approval for frictionless workflow

### Error Recovery Flows

**Flow 1 - No Staged Changes:**

```bash
$ ollatool commit
[ERROR] ✗ No staged changes detected.

Stage your changes first:
  git add <files>     # stage specific files
  git add .           # stage all changes

Then run: ollatool commit
Exit code: 2
```

**Flow 2 - Ollama Not Available:**

```bash
$ ollatool commit
[ERROR] ✗ Ollama is not running.

Start Ollama:
  ollama serve

Or install from: https://ollama.com/download
Exit code: 3
```

**Flow 3 - Model Not Available:**

```bash
$ ollatool commit
[INFO] Detecting staged changes... ✓
[INFO] Connecting to Ollama... ✓
[ERROR] ✗ Custom model 'ollatool-commit' not found.

Run setup to configure Ollama:
  ollatool setup

Exit code: 4
```

**Flow 3a - Setup Command Success:**

```bash
$ ollatool setup
[INFO] Checking Ollama installation... ✓
[INFO] Connecting to Ollama daemon... ✓
[INFO] Checking base model... ✓
[INFO] Base model already present ✓
[INFO] Creating custom model ollatool-commit...
[SUCCESS] ✓ Setup complete. Run 'ollatool commit' to start.
```

**Flow 3b - Setup Command - First Time Setup:**

```bash
$ ollatool setup
[INFO] Checking Ollama installation... ✓
[INFO] Connecting to Ollama daemon... ✓
[INFO] Pulling base model qwen2.5-coder:1.5b...
[INFO] Download: 750MB / 1.2GB (62%)
[INFO] Download complete ✓
[INFO] Creating custom model ollatool-commit...
[SUCCESS] ✓ Setup complete. Run 'ollatool commit' to start.
```

**Flow 3c - Setup Command - Ollama Not Installed:**

```bash
$ ollatool setup
[ERROR] ✗ Ollama is not installed.

Install Ollama first:
  https://ollama.com/download

Then run: ollatool setup
Exit code: 3
```

**Flow 4 - Generation Failure:**

```bash
$ ollatool commit
[INFO] Generating commit message...
[ERROR] ✗ Failed to generate valid commit message.

[R]egenerate [C]ancel: R

[INFO] Regenerating commit message...
[SUCCESS] ✓ Generated commit message successfully
```

**Flow 5 - Context Window Overflow:**

```bash
$ ollatool commit
[INFO] Detecting staged changes... ✓
[INFO] Connecting to Ollama... ✓
[ERROR] ✗ Changes exceed model context window.

Your staged changes are too large for the model to process.

Try staging fewer files:
  git reset              # unstage all changes
  git add <files>        # stage specific files only

Or commit changes in smaller batches.
Exit code: 2
```

---

## Technical Implementation Guidelines

### Performance Requirements

**Response Time Targets:**

- CLI initialization: <100ms
- Ollama connection check: <200ms
- Model loading: <2s (cold start)
- Commit message generation: <800ms
- Total end-to-end: <1s (warm model)

**Resource Management:**

- Memory footprint: <2GB during active use
- CPU usage: ≤50% of one core during inference
- No persistent background processes

### Accessibility Standards

**WCAG 2.1 Level A Compliance:**

- Color contrast ratios >4.5:1 for all text
- Keyboard-only navigation support
- Screen reader compatibility via semantic text
- Color-blind friendly with NO_COLOR support

**Terminal Compatibility:**

- Works in: iTerm2, Terminal.app, Warp, Alacritty, Kitty
- Supports: TERM environment variable detection
- Fallback: Plain text for unsupported terminals

### Error Handling Standards

**Exit Code Mapping:**

- **0:** Success
- **1:** User cancel/interrupt
- **2:** No staged changes
- **3:** Ollama unavailable
- **4+:** Unexpected system error

**Error Message Standards:**

- Always include actionable remediation steps
- Use clear, non-technical language
- Provide specific commands when helpful
- Never expose stack traces in user-facing output

---

## Design Rationale & Decisions

### Why This Design Works for CLI Tools

**1. Immediate Feedback Loop:**

- Visual checkmarks within 100ms confirm system responsiveness
- Users never wonder "is it working?"
- Perceived performance matches technical performance goals

**2. Progressive Information Disclosure:**

- Start with validation, progress to selection, then generation
- Each step builds on previous confirmation
- Users understand what's happening at all times

**3. Consistent Interaction Patterns:**

- Numbered lists for selection (familiar CLI pattern)
- Single-key shortcuts for common actions
- Predictable keyboard behavior across all flows

**4. Error Prevention Through Design:**

- Clear validation before expensive operations (model loading)
- Unambiguous prompts prevent user confusion
- Graceful degradation when dependencies unavailable

### Design Decisions & Trade-offs

**Decision 1: Simple Spinners vs Progress Bars**

- **Chosen:** Simple text spinners with checkmarks
- **Rationale:** Model loading time is unpredictable; spinners work for any duration
- **Trade-off:** Less precise timing information, but more reliable feedback

**Decision 2: Immediate Type Selection vs Auto-Detection**

- **Chosen:** User-selected commit type via numbered menu
- **Rationale:** More reliable than AI classification for MVP scope
- **Trade-off:** One extra interaction step for guaranteed accuracy

**Decision 3: Keyboard Shortcuts vs Mouse/Touch Support**

- **Chosen:** Keyboard-only interaction (number + letter keys)
- **Rationale:** CLI users expect keyboard-first experience
- **Trade-off:** No mouse support, but fits CLI context perfectly

**Decision 4: Minimal Terminal Output vs Verbose Logging**

- **Chosen:** Essential information only, no debug output by default
- **Rationale:** Maintains clean, professional appearance
- **Trade-off:** Less troubleshooting info, but optional debug mode can be added later

**Decision 5: Explicit Setup vs Auto-Provisioning**

- **Chosen:** Explicit `ollatool setup` command required before first commit
- **Rationale:**
  - Preserves sub-1s commit performance (no model downloads during commit)
  - Clear separation of one-time setup vs repeated workflow
  - Users understand system requirements before committing
  - Fails fast with clear guidance if setup incomplete
- **Trade-off:** One additional setup step before first use, but aligns with zero-friction philosophy after setup

**Decision 6: Silent Retry vs Transparent Retry**

- **Chosen:** Completely silent retries for format validation failures
- **Rationale:**
  - Cleaner UX without technical noise
  - Users only see successful outputs or actionable errors
  - Retry mechanism is implementation detail, not user concern
  - Success is binary: good message or error, no "almost worked" states
- **Trade-off:** Less transparency into model struggles, but simpler mental model

---

## Validation & Testing Strategy

### User Acceptance Testing

**Success Metrics:**

- 90%+ acceptance rate for generated commit messages
- <1s perceived response time on target hardware
- Zero user confusion during error states
- Successful completion of typical developer workflow

**Testing Scenarios:**

1. **Happy Path:** Standard commit generation and approval
2. **Edit Workflow:** User modifies generated message before commit
3. **Error Recovery:** All documented error states with remediation
4. **Performance:** Timing measurement on M1/M2 hardware
5. **Accessibility:** NO_COLOR environment variable, keyboard navigation

### Implementation Validation Checklist

**Core Functionality:**

- [ ] Detects staged changes correctly
- [ ] Connects to Ollama at localhost:11434
- [ ] Loads qwen2.5-coder:1.5b model automatically
- [ ] Generates Conventional Commits format compliant messages
- [ ] Opens editor with $EDITOR or Nano fallback
- [ ] Executes git commit with user-approved message

**User Experience:**

- [ ] Sub-1s response time on warm model
- [ ] Clear error messages with actionable guidance
- [ ] Immediate visual feedback for all operations
- [ ] Consistent keyboard shortcuts across flows
- [ ] Respects NO_COLOR environment variable

**Error Handling:**

- [ ] Graceful handling of missing staged changes
- [ ] Clear guidance when Ollama not running
- [ ] Model download and setup for first-time users
- [ ] Retry mechanism for failed generation attempts

---

## Future Extensibility Considerations

### Multi-Command Framework Design

**Current Scope:** `ollatool commit` command only
**Future Commands:** `ollatool pr`, `ollatool screenshot`, `ollatool daemon`

**Design Patterns for Extension:**

- **Consistent Progress Feedback:** All commands use same `[INFO]`/`[ERROR]` format
- **Unified Keyboard Shortcuts:** [A]pprove, [E]dit, [R]egenerate, [C]ancel where applicable
- **Shared Color Theme:** Same visual design across all commands
- **Common Error Handling:** Consistent remediation message style

### Optional Features (Post-MVP)

**Configuration System:**

- Custom commit types and templates
- Model selection and management
- Default behavior flags (--auto, --dry-run, --all)

**Enhanced Feedback:**

- Model confidence indicators
- Context-aware suggestions
- Advanced error diagnostics

---

## Deliverables

### Design Artifacts Created

1. **UX Design Specification:** This document (complete design decisions and rationale)
2. **Color Theme Visualizer:** `dev/ux-color-themes.html` - Interactive terminal design showcase
3. **Implementation Guidelines:** Technical specifications for developers

### Ready for Implementation

All UX decisions documented with:

- **Clear implementation requirements** for each interaction pattern
- **Technical specifications** for performance and accessibility
- **Visual design guidelines** with exact color codes and formatting
- **User journey flows** with step-by-step examples
- **Error handling patterns** with remediation strategies

This specification provides everything needed to implement ollatool with exceptional user experience that achieves sub-1s response times while maintaining privacy and simplicity.

---

**Status:** ✅ Complete
**Next Recommended Step:** Technical Architecture workflow
**Alternative:** Run validation with \*validate-design for additional quality assurance
