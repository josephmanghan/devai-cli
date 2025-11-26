# Joe's Ollama CLI Application Project Brief

## Project Goal

Build a working **Git Commit Message Generator CLI** that uses Ollama and `llama3.2` (1B) to automatically generate high-quality Conventional Commit messages from staged git changes. The tool should be completable end-to-end, provide genuine developer utility, and serve as a GitHub-ready demonstration of local SLM integration.

## Application Decision

### Primary Application: Git Commit Message Generator

**Selected Tool:** `ollacli commit` - An intelligent git commit assistant

**Core Functionality:**

1. Analyzes staged git changes (`git diff --cached`)
2. Reads git status and repository context
3. Generates Conventional Commit format messages via `llama3.2` (1B)
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

- **Deliverability**: Must be achievable as a complete, working project
- **Simplicity**: Prioritize straightforward implementation over complex features
- **Technical Preference**: CLI approach (easiest path for Ollama integration)
- **Learning Focus**: Complete understanding of how each module works
- **GitHub Ready**: Project should be shareable and demonstrate full development process
- **Performance**: Sub-1-second response time for commit message generation

## Development Standards

**Context7 Integration:** Leverages Context7 MCP for Node.js best practices and architectural patterns.

**Style Guides:** Project follows documented style guides for Node.js CLI, clean code principles, unit testing, and Ollama integration patterns (see `dev/styleguides/`).

## Technical Architecture

### Platform Stack

- **Model**: `llama3.2:1b` (600-900MB RAM, sub-50ms latency)
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
- **Model Choice**: `llama3.2` (1B) - optimal balance of size/performance
- **Target Environment**: Standard developer laptops (8GB-16GB RAM)
- **Expected Performance**:
  - Model load time: 500ms-1.5s (cold start)
  - Inference time: <1s (warm start)
  - Total UX: ~1-2 seconds from command to preview

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

1. **Pre-commit validation**: Check for staged changes, warn if none
2. **Context gathering**: Execute `git diff --cached` and `git status --short`
3. **Prompt construction**: Build context-rich prompt for Conventional Commits
4. **Model inference**: Send to `llama3.2:1b` via Ollama API
5. **Interactive preview**: Display generated commit message
6. **User confirmation**: Prompt user to approve/edit/reject
7. **Commit execution**: Run `git commit -m "..."` on approval

**Conventional Commit Support:**

- Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`
- Format: `<type>(<optional-scope>): <description>`
- Body and footer support (for breaking changes, issue references)

### Nice-to-Have Features (Future)

- `ollacli commit --auto` - Skip preview, auto-commit
- `ollacli commit --dry-run` - Generate message only, don't commit
- `ollacli config` - Set preferences (commit style, model choice)
- Custom commit templates
- Multi-line commit body generation

## Future Expansion Ideas

### Potential Suite Extension

The architecture supports future expansion into a multi-tool suite:

**Future Commands:**

1. **`ollacli pr`** - PR Description Generator
   - Analyzes branch diff vs main
   - Parses JIRA ticket from branch name
   - Generates markdown PR template
   - Copies to clipboard

2. **`ollacli screenshot`** - Screenshot Assistant
   - Watches for new screenshots
   - Prompts user for description
   - Generates intelligent filename
   - Organizes into project folders
   - **Note**: Uses text-only approach (user describes screenshot, model suggests name)

**Shared Infrastructure:**

- Ollama connection management
- Configuration system
- Prompt templates
- User interaction patterns

**Decision**: Focus on Git Commit tool for MVP. Expand to suite only after successful completion and validation.

## 🚨 OPEN RESEARCH QUESTIONS: Competitive Analysis & Use Case Validation

### Critical Questions to Resolve Before Implementation

#### **Question 1: Are we reinventing the wheel in the local SLM + Ollama context?**

Existing tools identified in research:

- `aicommits` (uses cloud LLMs or local models)
- `commitron` (similar approach)
- Various other git commit generators

**Sub-questions to answer:**

1. What do existing tools do well/poorly?
2. What is our unique value proposition?
3. Are there gaps in the current solutions for local SLM + Ollama specifically?
4. Is our differentiator strong enough?

**Potential Unique Value Angles:**

- **Privacy-first**: 100% local, no data leaves machine
- **Speed**: Optimized for `llama3.2` (1B) with sub-1s responses
- **Company-specific**: Fine-tuned for company's Conventional Commit patterns
- **Extensibility**: Foundation for future dev productivity suite
- **Learning**: Educational value in building complete SLM integration

#### **Question 2: Conventional Commits Appropriateness for Mid-Development Use Case**

**Critical Assumption to Validate:**

Conventional Commits specification is typically designed for "high-level," polished, final commits (e.g., squash commits before merge). However, your use case is **individual commits during active development** on a ticket.

**Research questions:**

1. **Is Conventional Commits the right format for mid-ticket commits?**
   - Do developers actually need/want type classifications (feat, fix, chore) for work-in-progress commits?
   - Or is a simpler format more appropriate (e.g., "WIP: description" or just "description")?

2. **What's the difference between conventions for:**
   - Individual commits during development (many commits, may be WIP)
   - Final commits before merge/squash (polished, public-facing)

3. **Should we support both patterns?**
   - Development mode: Simpler, more permissive
   - Final mode: Strict Conventional Commits enforcement

4. **Existing tool alignment:**
   - Do existing commit generators assume final commits or individual commits?
   - Is there a tool already optimized for mid-development workflow?

#### **Question 3: Context Management & Ticket Integration**

**Design question: How much context should we provide the model?**

**Current minimal approach:**

```
Input: git diff --cached + git status
→ Model generates commit message
```

**Extended approach:**

```
Input: git diff --cached + git status + JIRA ticket info (title, description, acceptance criteria)
→ Model generates more semantically-aware commit message
```

**Research questions:**

1. **Is ticket context valuable?**
   - Does it improve commit message quality?
   - Does it help the model understand the "why" behind the changes?

2. **Complexity vs. benefit trade-off:**
   - How complex is JIRA/ticket integration? (CLI tool would need to detect branch name → lookup ticket ID → fetch from API)
   - Is the quality improvement worth the architectural complexity?

3. **Scope creep risk:**
   - Does adding ticket context turn this into a more complex tool?
   - Does it break the "simple MVP" requirement?

4. **Feasibility:**
   - Can we reasonably parse branch names to infer ticket IDs? (e.g., `feature/JIRA-123-description`)
   - Should ticket context be optional? (user provides it, or tool auto-detects)
   - How do we handle repos with different ticket systems or no tickets?

5. **Model capability:**
   - Can `llama3.2` (1B) effectively reason about both code changes AND ticket context?
   - Or does it exceed the model's reasoning capability?

**Potential solution patterns:**

- **Option A**: Minimal (just git diff) - simpler, faster, works everywhere
- **Option B**: Optional context (user can provide ticket info) - user decides
- **Option C**: Auto-detected context (parse branch name for ticket ID) - more intelligent but fragile
- **Option D**: Full context (optional + auto-detected) - most powerful but most complex

### Next Actions Required

**For Competitive Analysis:**

- Research existing tools (feature comparison, architecture, limitations)
- Identify specific gaps or improvements our tool could provide
- Determine if the value is primarily:
  - **Functional**: Genuinely better/different tool
  - **Educational**: Learning exercise in SLM integration
  - **Company-specific**: Tailored to organization needs

**For Use Case Validation:**

- Investigate Conventional Commits appropriateness for mid-development commits
- Research developer workflow patterns (individual vs. final commits)
- Validate whether ticket context integration is worth the complexity

**Decision Criteria:**

- If existing tools solve this well → Consider pivoting to different application
- If Conventional Commits doesn't fit mid-dev use case → Adapt format or acknowledge limitation
- If ticket context adds significant value → Plan for integration; if not → keep it minimal
- If gaps exist → Define our specific differentiation strategy
- If primarily educational → Acknowledge and proceed with learning focus

## Success Definition

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

## Next Steps

1. **Competitive Analysis** (PRIORITY)
   - Research existing git commit generators
   - Identify unique value proposition or gaps
   - Decide: proceed, pivot, or acknowledge learning focus

2. **Project Structure & Best Practices Research**
   - Break down the project into logical sections/modules
   - Define research tasks for each section:
     - Node.js CLI architecture best practices
     - Ollama integration patterns
     - Git command-line interaction patterns
     - Prompt engineering for commit messages
     - User interaction/UX for CLI tools
     - Testing strategies for CLI applications
     - Distribution and packaging (npm, binary)
   - Send off deep research to identify best practices for each area

3. **Technical Architecture Design** (if proceeding)
   - Define project structure
   - Design Ollama integration layer
   - Plan prompt engineering strategy
   - Define configuration approach

4. **MVP Implementation Plan**
   - Break down into sprints/phases
   - Define success metrics
   - Create testing strategy

## References

- Ollama docs - https://docs.ollama.com/
- Ollama github - https://github.com/ollama/ollama
- Conventional Commits spec - https://www.conventionalcommits.org/
