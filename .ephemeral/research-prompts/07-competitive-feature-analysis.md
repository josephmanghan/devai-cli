# Deep Research Prompt: Competitive Feature Analysis

## AI-Powered Git Commit Generators (Features, NOT Code)

**Date Created:** November 25, 2025
**Research Scope:** Feature comparison and capability analysis of existing tools
**Goal:** Define MVP vs. post-MVP features for our `ollacli commit` tool
**Important:** Focus on features and user-facing capabilities ONLY. Do not review implementation code.

---

## Executive Context

We're building an Ollama-based CLI commit generator and need to understand:

1. What features do existing commit generation tools actually provide?
2. What's considered "table stakes" (MVP) vs. "nice-to-have" (post-MVP)?
3. How do mature tools approach the feature space?
4. What could differentiate our tool at each maturity level?

This research is **feature-focused** (user experience, capabilities, workflows) and explicitly avoids implementation details or code review.

---

## Part 1: Competitor Landscape & Feature Inventory

### 1.1 Primary Competitors to Analyze

**Research the following tools thoroughly (features only):**

#### **aicommits**

- **Source:** https://github.com/Nutlope/aicommits
- **Focus:** What features does the tool advertise/document?
- **Features to catalog:**
  - How does the user invoke it? (CLI command, git hook, interactive mode?)
  - What customization options exist? (model selection, tone, style preferences?)
  - Does it support different commit types/conventions?
  - Configuration/settings capabilities?
  - Integration patterns? (git hooks, commit-msg hook, standalone command?)
  - Does it handle multiple languages or special formats?
  - Any batch processing capabilities?
  - Rollback or "undo" features?
  - Does it work with different VCS systems or just Git?

#### **commitron**

- **Source:** Search GitHub for "commitron"
- **Similar feature inventory as above**

#### **Other Git Commit Generators**

- Search for: "AI git commit message generator", "LLM commit generator"
- Identify at least 3-5 other tools
- Catalog their feature sets

#### **Related Tools (Not Direct Competitors)**

- GitHub Copilot's commit message suggestions (how does it work?)
- Git commit linting tools (commitlint, conventional-commits-lint)
- Manual commit message templates
- AI-assisted tools in IDEs (VS Code, JetBrains)

### 1.2 Feature Catalog Template

For EACH tool, document:

**Basic Information:**

- Tool name
- GitHub/homepage link
- Last active/maintained?
- Community size (stars, forks)?
- Language/platform

**Core Features (Must-Have in MVP):**

1. **Invocation Model**
   - How do users run it? (standalone command, git hook, interactive)
   - Does it require staging changes first?
   - Does it run before or after creating a commit?

2. **Input Processing**
   - What does it analyze? (just git diff? git status? file contents?)
   - Does it support custom context/instructions?
   - Can users provide additional information (issue #, ticket, description)?

3. **Output Quality**
   - What commit format does it produce? (Conventional Commits? Custom?)
   - Does it support multi-line commit bodies?
   - Can it include issue references/links?

4. **User Interaction**
   - Does it show a preview before committing?
   - Can users edit the generated message?
   - Can users reject and regenerate?
   - Is there a "dry-run" mode?

5. **Configuration & Customization**
   - Can users set preferences? (tone, style, language?)
   - Custom instructions/prompts?
   - Can it learn user patterns?
   - Configuration file format (.commitrc, etc.)?

**Advanced Features (Post-MVP Candidates):**

1. **Model/Provider Support**
   - Which models does it support?
   - Cloud providers, local models, or both?
   - Can users switch models?
   - Does it fall back if one provider is unavailable?

2. **Integration Depth**
   - Git hook integration (prepare-commit-msg, commit-msg)?
   - IDE plugins?
   - Shell aliases or functions?
   - Batch processing across multiple commits?

3. **Context & Intelligence**
   - Does it understand project structure?
   - Can it parse issue/ticket information?
   - Does it recognize common patterns?
   - Multi-repository support?

4. **Workflow Features**
   - Undo/rollback capabilities?
   - Commit message history/suggestions?
   - Batch commit generation?
   - Integration with CI/CD pipelines?

5. **Quality Assurance**
   - Validation/linting of generated messages?
   - Consistency checking across commits?
   - Error handling & fallbacks?

6. **Extensibility & Customization**
   - Custom templates?
   - Plugin/extension system?
   - Fine-tuning capabilities?
   - Company-specific patterns?

---

## Part 2: Feature Maturity Levels

### Research & Categorize Features by Maturity Level

**Level 1: MVP (Minimum Viable Product)**

- What are the absolute table-stakes features?
- What must work for the tool to be useful at all?
- What do ALL tools implement?

**Level 2: Polished MVP (Version 1.0)**

- What features make it production-ready?
- What improves quality/UX significantly?
- What do most mature tools include?

**Level 3: Differentiation (Version 2.0+)**

- What features set tools apart?
- What do only some tools offer?
- What creates "stickiness" or loyalty?

**Level 4: Advanced (Enterprise/Specialized)**

- What features enable advanced workflows?
- What requires significant engineering?
- What is nice-to-have but rarely used?

---

## Part 3: Our Tool's Feature Space

### 3.1 MVP Feature Definition

**Based on competitor analysis, what should `ollacli commit` MINIMALLY include?**

Research questions:

1. **Is the core loop sufficient?**
   - User runs `ollacli commit`
   - Tool shows preview
   - User confirms
   - Commit executes
   - Is this enough, or are additional features expected?

2. **What about configuration?**
   - Do tools require setup, or work out-of-the-box?
   - Should we support `.commitrc` or similar?
   - How much customization is needed for MVP?

3. **What about error handling?**
   - What happens if Ollama is unavailable?
   - What if the model fails?
   - How do competitors handle this?

4. **What about editing?**
   - Should users be able to edit the generated message?
   - Is this expected?
   - How much friction is acceptable?

### 3.2 Post-MVP Feature Candidates

**What would make sense to add after MVP?**

Research questions:

1. **Which "advanced" features would complement our tool well?**
   - Do they fit our local SLM + Ollama focus?
   - Would they add disproportionate complexity?

2. **What about the three-tool suite (commit → PR → screenshot)?**
   - Would features generalize across tools?
   - Could we share infrastructure/config?

3. **What about company-specific features?**
   - Ticket/JIRA integration (from earlier discussion)?
   - Custom templates for Conventional Commits?
   - Fine-tuning for company style?
   - Team-level configuration?

4. **What would differentiate us post-MVP?**
   - Unique features competitors lack?
   - Better UX in specific areas?
   - Ollama-specific optimizations?

---

## Part 4: Conventional Commits in the Wild

### 4.1 How Do Competitors Handle Conventional Commits?

Research questions:

1. **Do all tools support Conventional Commits?**
   - Is it the default format?
   - Is it optional?
   - Do they enforce it strictly or loosely?

2. **For mid-development commits (your use case):**
   - How do competitors approach individual commits vs. final commits?
   - Do they handle WIP commits differently?
   - Can users configure strictness level?

3. **Scope/type handling:**
   - Do tools help users choose the right type? (feat, fix, chore, etc.)
   - Do they offer suggestions or guidance?
   - Can companies customize types?

4. **Advanced commit formats:**
   - Footer support (breaking changes, closes issues)?
   - Multi-line body support?
   - Can tools generate structured commits with context?

---

## Part 5: Context Management in Practice

### 5.1 How Do Competitors Handle Additional Context?

**Key research question:** How much beyond `git diff` do existing tools use?

Research questions:

1. **What context do tools actually utilize?**
   - Just git diff?
   - Git status?
   - File metadata?
   - Branch name/history?
   - Ticket/issue information?

2. **How do they access additional context?**
   - Do users provide it manually?
   - Auto-detected from branch names?
   - API integration (JIRA, GitHub, etc.)?
   - Configuration file references?

3. **For our specific question (ticket integration):**
   - Do any existing tools integrate with JIRA or similar?
   - If so, how complex is the integration?
   - Is it optional or required?
   - What's the user experience?

4. **Quality impact:**
   - Does additional context noticeably improve commit message quality?
   - Is the complexity worth it?
   - Do users find it valuable?

---

## Part 6: User Experience & Workflow Patterns

### 6.1 How Do Developers Actually Use These Tools?

Research questions:

1. **Invocation patterns:**
   - How do users typically invoke commit generators?
   - Git hook (automatic)?
   - Manual command?
   - Interactive prompt?
   - IDE integration?
   - What's most popular?

2. **Editing workflow:**
   - How often do users accept generated messages as-is?
   - How often do they edit?
   - Is the editing UX important?
   - Should there be a mode to skip preview?

3. **Error handling expectations:**
   - What happens if generation fails?
   - Do users retry? Skip? Manual fallback?
   - How is this communicated?
   - Should there be a fallback strategy?

4. **Performance expectations:**
   - How fast do tools need to be?
   - Is 1-2 seconds acceptable for commit generation?
   - Do users expect instant responses?
   - Is there patience for "thinking time"?

---

## Part 7: Differentiation & Competitive Positioning

### 7.1 What Could Make Our Tool Stand Out?

Based on competitor feature analysis:

1. **Gaps in existing tools:**
   - What features are missing from all/most competitors?
   - What user frustrations exist?
   - What could we do better?

2. **Local SLM + Ollama advantages:**
   - Are there features only possible with local models?
   - What's unique about sub-1s latency?
   - Privacy guarantees as a feature?

3. **Company-specific angle:**
   - Could our tool be positioned for companies adopting Conventional Commits?
   - Could fine-tuning be a differentiator?
   - Could we support company-specific commit patterns?

4. **Suite positioning:**
   - Could commit + PR + screenshot be a unique combination?
   - Would other tools try this?
   - Is there synergy across the suite?

---

## Part 8: MVP Scoping Framework

### Based on Feature Analysis, Define MVP Boundaries

**MVP Must Include:**

- ✅ List the absolute essential features (based on analysis)
- ✅ What % of competitors have this? (If 100%, it's table-stakes)
- ✅ How critical is it to tool utility?

**MVP Should Include:**

- ✅ Features that 80%+ of competitors have
- ✅ Features that significantly improve UX
- ✅ Features that enable the core use case

**Post-MVP Nice-to-Have:**

- ✅ Features that differentiate but aren't essential
- ✅ Advanced workflows or integrations
- ✅ Company-specific customization
- ✅ Suite features (PR, screenshot)

**Explicitly NOT in MVP:**

- ❌ Features that add complexity without commensurate value
- ❌ Rare use cases or edge cases
- ❌ Features that don't fit our local SLM focus
- ❌ Features requiring external API dependencies

---

## Delivery Format

Please provide:

### 1. **Feature Inventory** (by tool)

- Table of tools and their key features
- Quick reference for comparison
- Maturity indicators (MVP, v1.0, v2.0+)

### 2. **Feature Maturity Analysis**

- What's table-stakes for MVP?
- What makes tools feel "polished"?
- What creates differentiation?
- Feature distribution across tools (% of tools with each feature)

### 3. **Conventional Commits & Context Findings**

- How do competitors approach Conventional Commits?
- How sophisticated is context management?
- What's realistic for `llama3.2` (1B)?

### 4. **Recommended MVP Feature Set**

- Essential features for `ollacli commit` v1.0
- Why each feature is necessary
- How this compares to competitors

### 5. **Post-MVP Roadmap Candidates**

- Features that could differentiate v2.0+
- Estimated complexity/effort for each
- Which align with Ollama/local SLM focus
- Which support the three-tool suite

### 6. **Gaps & Opportunities**

- What competitors are missing?
- What frustrates users?
- Where could our tool excel?
- What's unique about our focus (local, privacy, small models)?

### 7. **MVP Definition Summary**

- Clear list: "Our MVP includes X, Y, Z features"
- Not included: "We explicitly skip A, B, C in MVP"
- Rationale: Why this scope makes sense

---

## Research Constraints & Approach

### What to DO:

- ✅ Read tool documentation, READMEs, feature lists
- ✅ Review user discussions, issues, feature requests
- ✅ Analyze tool websites and marketing materials
- ✅ Compare feature matrices
- ✅ Look at user feedback (GitHub issues, Reddit, forums)
- ✅ Understand workflow patterns from documentation

### What NOT to DO:

- ❌ Do NOT review implementation code
- ❌ Do NOT analyze architecture or technical details
- ❌ Do NOT reproduce code patterns or logic
- ❌ Avoid any code similarity/licensing concerns

---

## Context for Your Research

**Our tool's specifics:**

- **Stack:** Node.js CLI, Ollama, `llama3.2:1b`
- **Architecture:** Orchestrator pattern (CLI manages git commands, Ollama API)
- **Use case:** Individual commits during development (not final/squash commits)
- **Company context:** Conventional Commits adoption initiative
- **Success metric:** End-to-end deliverable in 2-4 sprints

**Key questions this research answers:**

1. What features are absolutely necessary?
2. What would make our tool feel "complete"?
3. What could differentiate us in v2.0+?
4. How should we approach MVP scoping?
5. What's unique about our local SLM approach?

---

## Research Quality Indicators

Excellent research will:

- ✅ Clearly categorize features by maturity level
- ✅ Show percentage of competitors supporting each feature
- ✅ Explain why certain features matter for user experience
- ✅ Identify gaps or frustrations in existing tools
- ✅ Provide clear MVP recommendations with rationale
- ✅ Suggest post-MVP features aligned with our focus
- ✅ Be specific and actionable (not vague)
