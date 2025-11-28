# Brainstorming Session Results

**Session Date:** 2025-11-11
**Facilitator:** Elite Brainstorming Specialist Carson
**Participant:** Dr Joe

## Executive Summary

**Topic:** App ideas for a locally-run Small Language Model (SLM) focused on productivity for software developers. Exploring how an SLM running on a laptop could provide value through a web app interface, specifically targeting productivity boosts for developers who juggle tasks, meetings, notes, and various tools (Jira, Confluence, Google Docs, etc.).

**Session Goals:**

1. **Identify areas requiring deep research** (to be done with Gemini) - CRITICAL: Do this first to understand SLM capabilities/constraints
2. Explore SLM capabilities and constraints (what it's good/bad at) - Define the "aesthetic" of SLMs
3. Identify developer daily activities and pain points - Map common developer workflows
4. Focus on productivity use cases (vs. agentic or decision support)
5. Consider web app interface advantages over chat-only interfaces (like Gemini 2.5 Flash)
6. Account for technical constraints: web app with backend running command-line tools, potential login/data persistence for project notes
7. Keep scope small, deliverable, and valuable (think "small atom" that can scale later)
8. **Generate 5 really good app ideas** - Final output after research and exploration

**Workflow Approach:**

- **Phase 1 (Current Session):** Use Question Storming to identify research questions/areas
- **Phase 2 (Research Break):** Take research questions to Gemini, conduct deep research on SLM capabilities, constraints, and developer workflows
- **Phase 3 (Return Session):** Return with research findings, then use brainstorming techniques (First Principles Thinking, Mind Mapping, What If Scenarios) to generate app ideas based on actual SLM capabilities and constraints
- **Note:** Cannot explore SLM constraints or generate app ideas until research is complete - we need to know what we don't know first

**Techniques Used:** Question Storming (Phase 1) ✅ | Research Complete (Phase 2) ✅ | Brainstorming (Phase 3) 🔄

**Research Findings:** Deep research completed - see `.bmad-ephemeral/SLM Research for Developer Productivity.md`

**Total Ideas Generated:** {{total_ideas}}

## Research Questions Identified (Phase 1)

Generated comprehensive research questions across 6 categories:

- SLM Capabilities & Limitations
- Context Management
- Characteristics & Performance
- Practical Implementation
- Training & Knowledge
- Ecosystem & Tools

_Full list of questions available in the Research Prompt section below._

### Key Themes Identified:

{{key_themes}}

## Technique Sessions

### Question Storming Session

**Technique:** Question Storming (deep category)
**Duration:** ~15 minutes
**Goal:** Identify research questions about SLM capabilities, constraints, and characteristics before brainstorming app ideas

**Process:** Generated comprehensive list of research questions across multiple categories:

- SLM capabilities & limitations
- Context management strategies
- Performance characteristics
- Practical implementation considerations
- Training & knowledge constraints
- Ecosystem & tooling landscape

**Outcome:** Comprehensive research question list ready for deep research phase with Gemini

---

## Research Prompts (Phase 2)

**Copy the research prompts below and paste them into Gemini for deep research:**

### 📋 Research Prompt 1: SLM Capabilities & Constraints

📁 **File:** `docs/research-prompts/01-slm-capabilities-and-constraints.md`

**Status:** ✅ Research Complete (findings in `.bmad-ephemeral/SLM Research for Developer Productivity.md`)

### 📋 Research Prompt 2: SLM Capabilities for CLI Apps

📁 **File:** `docs/research-prompts/02-slm-capabilities-and-constraints-cli.md`

**Status:** 🔄 Ready for Research (CLI-focused version of Prompt 1)

**Rationale:** During our brainstorming follow-up, Dr Joe identified that CLI interfaces might be more suitable for developer productivity tools than the originally assumed web app interface. This prompt mirrors the structure of Prompt 1 but focuses specifically on:

- SLM capabilities and limitations in CLI environments
- CLI-specific implementation considerations
- Terminal workflow integration patterns
- CLI-focused productivity use cases

### 📋 Research Prompt 3: Comprehensive Developer Activities Audit

📁 **File:** `docs/research-prompts/03-comprehensive-developer-activities-audit.md`

**Status:** ✅ Research Complete (findings in `.bmad-ephemeral/Developer Activity Audit Research.md`)

**Rationale:** Dr Joe identified that we need a complete inventory of what developers actually do before we can identify meaningful productivity opportunities. This prompt uses open-ended discovery (no preconceived categories) to:

- Build comprehensive daily activity inventory across all developer contexts
- Identify hidden work and invisible labor
- Map workflows and patterns without imposing current assumptions
- Discover pain points and opportunities we don't know to ask about
- Provide foundation for identifying where SLM assistance could add real value

### 📋 Research Prompt 4: SLM-Compatible Micro-Task Inventory

📁 **File:** `docs/research-prompts/04-slm-compatible-micro-tasks.md`

**Status:** 🔄 Ready for Research (NEW - targeted discovery of SLM-appropriate micro-tasks)

**Rationale:** Following Phase 3 brainstorming attempt, Dr Joe identified a critical research gap: while we understand broad developer activities and SLM capabilities separately, we haven't specifically identified the bounded, high-frequency tasks that fit SLM constraints perfectly. This prompt targets:

- Specific tasks (not broad categories) that developers perform frequently
- Clear input/output boundaries (like batch of screenshots → filenames, or set of files → organized structure)
- Can be batch operations (10-20 items) as long as total context fits within SLM window
- Tasks tedious enough to want automation but too small for most tools
- Must fit SLM constraints: limited context window, instant processing, pattern matching
- Focus on "unsexy" tasks that are unexplored territory
- Privacy-sensitive tasks that benefit from local-only processing

**Important clarification:** "Bounded" doesn't mean "one item per session" - it means manageable scope within context limits. An SLM can process multiple items in a batch.

**Context from brainstorming:** The "Screenshot Autopilot" idea demonstrated the fit pattern - this research aims to discover 20-30 similar opportunities.

---

{{technique_sessions}}

## Idea Categorization

### Immediate Opportunities

_Ideas ready to implement now_

{{immediate_opportunities}}

### Future Innovations

_Ideas requiring development/research_

{{future_innovations}}

### Moonshots

_Ambitious, transformative concepts_

{{moonshots}}

### Insights and Learnings

_Key realizations from the session_

{{insights_learnings}}

## Action Planning

### Top 3 Priority Ideas

#### #1 Priority: {{priority_1_name}}

- Rationale: {{priority_1_rationale}}
- Next steps: {{priority_1_steps}}
- Resources needed: {{priority_1_resources}}
- Timeline: {{priority_1_timeline}}

#### #2 Priority: {{priority_2_name}}

- Rationale: {{priority_2_rationale}}
- Next steps: {{priority_2_steps}}
- Resources needed: {{priority_2_resources}}
- Timeline: {{priority_2_timeline}}

#### #3 Priority: {{priority_3_name}}

- Rationale: {{priority_3_rationale}}
- Next steps: {{priority_3_steps}}
- Resources needed: {{priority_3_resources}}
- Timeline: {{priority_3_timeline}}

## Reflection and Follow-up

### What Worked Well

{{what_worked}}

### Areas for Further Exploration

{{areas_exploration}}

### Recommended Follow-up Techniques

{{recommended_techniques}}

### Questions That Emerged

{{questions_emerged}}

### Next Session Planning

- **Suggested topics:** {{followup_topics}}
- **Recommended timeframe:** {{timeframe}}
- **Preparation needed:** {{preparation}}

## Appendix: Pre-Research Ideas Capture

### 📝 Dr Joe's Initial Ideas

📁 **File:** `docs/IDEAS.md`

**Note:** These are raw ideas captured by Dr Joe before completing the deep research phase. They represent initial thinking and intuition about potential productivity tools and may evolve significantly after research findings are incorporated.

**Ideas captured:**

- CLI tool for intelligent screenshot organization and naming with configurable patterns
- Web app task manager with work escalation and automated communication features (Slack messages, status updates)

**Purpose:** This file serves as:

- Capture point for spontaneous ideas during the research phase
- Reference for understanding initial thought patterns before research influence
- Potential source of insights during final idea generation phase
- Context for how research findings may validate or challenge initial assumptions

---

_Session facilitated using the BMAD CIS brainstorming framework_
