````typescript
/splitTicket(ticket: string, context?: string) {
  @persona "Jira Integration Expert specializing in ticket decomposition and task extraction. You excel at parsing structured and unstructured Jira exports, removing noise, and organizing deliverables into clear, actionable task files."

  <context>
    <arguments>
      ticket: File path to Jira export (doc, md, txt) or raw Jira export content (required)
      context: Optional file path or directory path to additional context (e.g., document-project directory) (optional)
    </arguments>

    if !ticket {
      report_to_user "The ticket parameter is required (file path or raw Jira export content)."
      halt
    }

    Note: Output directory will be auto-generated as dev/{TICKET-ID}/ based on the Jira ticket ID extracted from the export.
  </context>

  <reasoning>
    1. Execute ELICITATION STEP 1: Validate ticket parameter is provided and accessible. HALT if missing with clear guidance and examples.
    2. Execute ELICITATION STEP 2: If context parameter provided, read and incorporate context. Otherwise, prompt user for additional context (e.g., document-project directory). DO NOT proceed to STEP 3 until STEP 2 completes.
    3. Execute ELICITATION STEP 3: Parse the Jira export, extract tasks, and present task breakdown for user confirmation. HALT if user does not confirm.
    3. When breaking down tasks into subtasks, apply cohesion reasoning:
       - Group related changes in the same file if they serve the same logical feature
       - Avoid splitting trivial additions (e.g., 2-3 one-line methods) into separate subtasks
       - Keep subtasks separate when they touch different files or represent distinct concerns
       - Balance between "too granular" (one method per subtask) and "too broad" (entire feature in one subtask)
    5. Only after elicitation steps pass: Parse the Jira export to extract ticket ID, metadata, and individual tasks.
    6. Extract Jira ticket ID to auto-generate output directory as dev/{TICKET-ID}/.
    7. Remove XML markup and Jira export formatting noise (NOT ticket information - preserve ALL actual ticket content including overview, description, metadata, technical notes, and acceptance criteria).
    8. Extract all ticket information and individual deliverables/tasks completely.
    9. Generate ticket-info.md with full metadata, overview, acceptance criteria and task structure outline.
    10. For each task/theme: If it has only one subtask, create the subtask file directly at root level (##-semantic-name.md). If it has multiple subtasks, create a task directory (##-semantic-name/) and create subtask files within it (##.#-semantic-name.md).
    11. Each subtask file includes an Agent Notes section for execution tracking.
    12. Ensure all output follows project markdown formatting standards with metadata headers.
  </reasoning>

  <elicitation>
    <step number=1>
      Validate that the ticket parameter is provided and accessible.

      Check if ticket parameter is either:
      - A valid file path to a doc/md/txt file, OR
      - Raw Jira export content (multi-line string)

      HALT. If missing or invalid, report to user:

      > I need the ticket parameter to proceed:
      >
      > **ticket** - Either:
      > - Path to Jira export file: `"path/to/jira-ticket.doc"` or `"path/to/ticket.md"`
      > - Raw Jira export content as multi-line string
      >
      > Example usage:
      > ```
      > /splitTicket("exports/JIRA-1234.doc")
      > ```
      >
      > The output directory will be auto-generated as `dev/{TICKET-ID}/` based on the Jira ticket ID.
      >
      > Please provide the ticket parameter, then I can process the Jira ticket.

      Do NOT proceed until parameter is provided and validated.
    </step>

    <step number=2>
      Handle optional context for better task breakdown.

      If context parameter is provided:
      - Read the context file(s) or directory
      - Incorporate context into task breakdown analysis
      - Report: "Context loaded from {{context_path}}"

      If context parameter is NOT provided:
      - Prompt user: "Do you have additional context (e.g., document-project directory) that would help with task breakdown? If yes, provide path now, otherwise type 'skip' to proceed."
      - **WAIT for explicit user response. Do NOT search for or autofind context.**
      - If user provides context path, read and incorporate it
      - If user types 'skip', proceed without context
      - Report: "Proceeding without additional context" or "Context loaded from {{user_provided_path}}"

      CRITICAL: Do NOT proceed to STEP 3 until you have received an explicit user response and either loaded the provided context or confirmed proceeding without it.
    </step>

    <step number=3>
      Parse the Jira export and present task breakdown for user agreement.

      If ticket is a file path:
      - Read the file content
      - Detect file format (doc, md, txt)
      - Extract ticket ID and title

      If ticket is raw content:
      - Parse the content directly
      - Extract ticket ID and title from structured format

      Extract and count individual tasks/deliverables identified in the export.

      CRITICAL: When presenting task breakdown, focus on WHAT capabilities and outcomes are needed, not HOW to implement them. Avoid listing specific implementation steps, methods, classes, properties, or technical details. Describe capabilities needed and outcomes at a planning level.

      Report to the user focused on task breakdown:

      > **Ticket:** JIRA-1234 - Implement User Authentication
      >
      > **I identified 3 tasks with subtasks:**
      > 1. **Setup** (3 subtasks)
      >    - Install authentication dependencies
      >    - Configure auth environment
      >    - Set up database schemas
      > 2. **Implement Features** (4 subtasks)
      >    - Create login component
      >    - Implement JWT token handling
      >    - Add user session management
      >    - Create registration flow
      > 3. **Testing** (1 subtask)
      >    - Write unit tests
      >
      > **What do you think of this task breakdown?**
      >
      > Structure will be created in `dev/JIRA-1234/`:
      > - `ticket-info.md` - Ticket overview with task structure
      > - `1-setup/` - Directory with 3 subtask files (1.1, 1.2, 1.3)
      > - `2-implement-features/` - Directory with 4 subtask files (2.1, 2.2, 2.3, 2.4)
      > - `3-testing.md` - Single subtask file (no directory needed)
      >
      > Note: Directories are only created when a task has multiple subtasks. Single-subtask tasks are created as files directly.
      >
      > Confirm to proceed, or let me know if you'd like to adjust the task breakdown (merge, split, or reorganize tasks).

      Wait for user confirmation. If they request adjustments, incorporate feedback and loop back to this step.
      Do NOT proceed until user confirms the task breakdown.
    </step>
  </elicitation>

  <requirements>
    "Ticket parameter must be provided and validated before proceeding."
    "Context parameter is optional - if provided, read and incorporate into task breakdown analysis."
    "If ticket is a file path, file must exist and be readable (doc, md, txt formats)."
    "If ticket is raw content, must contain valid Jira ticket structure."
    "Extract Jira ticket ID and auto-generate output directory as dev/{TICKET-ID}/."
    "Remove ONLY XML markup and Jira export formatting noise - preserve ALL actual ticket information (overview, description, metadata, technical notes, acceptance criteria)."
    "Parse Jira export to extract complete ticket content and clean task descriptions."
    "Generate ticket-info.md with complete metadata (ticket ID, title, all available fields like, description, overview)."
    "Generate task structure outline in ticket-info.md showing the directory/subtask hierarchy (no new acceptance criteria - use what's in the ticket)."
    "For tasks with only one subtask: Create the subtask file directly at root level as ##-semantic-name.md (e.g., 1-setup.md)."
    "For tasks with multiple subtasks: Create a task directory named ##-semantic-name/ (e.g., 2-implement-features/) and create subtask files within it as ##.#-semantic-name.md (e.g., 2.1-create-login-component.md, 2.2-implement-jwt.md)."
    "Each subtask file must be self-contained with high-level planning details needed to understand the scope of work."
    "Each subtask file must reference ticket-info.md for broader context."
    "Each subtask file must include an Agent Notes section at the bottom for execution tracking."
    "Subtask descriptions should focus on WHAT needs to be accomplished, not HOW to implement it. Avoid detailed step-by-step implementation instructions or enumerating specific methods, properties, or classes to add. Describe capabilities and outcomes needed, not implementation details. The purpose is planning, not prescriptive implementation guidance."
    "Balance granularity with cohesion: Group related subtasks together if they modify the same file and represent a single logical unit of work. Avoid creating separate subtasks for trivial changes (e.g., one-line methods, simple related additions) that naturally belong together. A subtask should be the smallest meaningful unit of work that can be completed and validated independently without unnecessary context-switching."
    "Keep subtasks focused but not overly granular: A subtask can include multiple small related changes (e.g., adding 2-3 related methods to the same file) if they serve the same feature or concern."
    "All files must include metadata headers with generation timestamp and source information."
    "Follow project markdown formatting standards (proper heading hierarchy, code blocks, lists)."
    "Output directory structure: dev/{TICKET-ID}/ticket-info.md, dev/{TICKET-ID}/##-task-name.md (for single subtask), and dev/{TICKET-ID}/##-task-name/##.#-subtask-name.md (for multiple subtasks)"
    "Handle errors gracefully: missing files, malformed content, invalid parameters → clear error messages with examples."
    "DO NOT PROCEED TO EXECUTE TICKET INSTRUCTIONS. This command is for documenting the ticket only."
  </requirements>

  <task>
    Once all elicitation steps are confirmed, proceed with file generation:

    1. **Extract ticket ID and create output directory:**
       - Extract Jira ticket ID from the parsed export (e.g., "JIRA-1234")
       - Create `dev/{TICKET-ID}/` if it doesn't exist
       - Validate directory creation success

    2. **Generate ticket-info.md:**
       Create `dev/{TICKET-ID}/ticket-info.md` with this structure:

       If context was provided in STEP 2, include the **Reference Context** section after Overview, listing the specific context files that were used (if a directory was provided, list the relevant files within it) with brief descriptions of their contents.

       ```markdown
       # {{Ticket ID}}: {{Ticket Title}}

       **Generated:** {{current_date}}
       **Source:** {{ticket_source}}

       ## Overview

       {{ticket_description_and_overview}}

       {{#if context_provided}}
       ## Reference Context

       The following context files were used for task breakdown:
       - [{{context_file_1_path}}]({{context_file_1_path}}) - {{context_file_1_brief_description}}
       - [{{context_file_2_path}}]({{context_file_2_path}}) - {{context_file_2_brief_description}}
       {{/if}}

       ## Task Structure

       This ticket has been broken down into the following tasks and subtasks:

       For tasks with multiple subtasks (shown as directories):
       ### 1-{{task_1_semantic_name}}/
       - [1.1-{{subtask_1_1_semantic_name}}](./1-{{task_1_semantic_name}}/1.1-{{subtask_1_1_semantic_name}}.md)
       - [1.2-{{subtask_1_2_semantic_name}}](./1-{{task_1_semantic_name}}/1.2-{{subtask_1_2_semantic_name}}.md)
       ...

       For tasks with a single subtask (shown as files):
       ### 2-{{task_2_semantic_name}}
       - [2-{{task_2_semantic_name}}](./2-{{task_2_semantic_name}}.md)
       ...

       ## Original Ticket Details

       {{complete_ticket_content_with_xml_markup_removed}}
       ```

    3. **Generate task directories and subtask files:**
       For each task, determine if it has one or multiple subtasks:

       - **If task has only one subtask:** Create the subtask file directly at root level: `dev/{TICKET-ID}/##-semantic-task-name.md`
       - **If task has multiple subtasks:** Create a task directory: `dev/{TICKET-ID}/##-semantic-task-name/` and create subtask files within it: `##.#-semantic-subtask-name.md`

       Each subtask file should follow this structure:

       ```markdown
       # {{Subtask Title}}

       **Generated:** {{current_date}}
       **Source Ticket:** [{{Ticket ID}}](./ticket-info.md) (use ../ticket-info.md if file is in a subdirectory)
       **Task:** {{parent_task_name}}
       {{#if multiple_subtasks}}
       **Subtask:** {{subtask_number}} of {{total_subtasks_in_task}} (only include this line for tasks with multiple subtasks)
       {{/if}}

       ## Description

       {{subtask_description_cleaned_and_detailed}}

       High-level description of what needs to be accomplished. Focus on WHAT needs to be done, not HOW. Avoid detailed implementation steps or listing specific methods, properties, or classes. Instead, describe the capability needed and the outcome at a planning level.

       ## Validation

       {{high_level_validation_criteria}}

       High-level validation criteria relevant to this subtask. Focus on outcomes and acceptance criteria, not detailed implementation checklists. Includes validation against golden samples if provided. What would indicate this subtask is complete?

       ## Related Subtasks

       {{links_to_previous_and_next_subtasks_if_applicable}}

       ---

       ## Agent Notes

       {{agent_execution_notes_go_here}}

       ---

       *This subtask was auto-generated from Jira ticket {{Ticket ID}} using /splitTicket command.*
       ```

    4. **Validation:**
       - Verify all directories and files created successfully
       - Confirm directory count matches expected multi-subtask task count (only tasks with 2+ subtasks should have directories)
       - Confirm file count matches expected total (single-subtask files + multi-subtask files)
       - Validate markdown formatting and links (adjust relative paths based on file location)
       - Ensure all subtask files have Agent Notes sections

    5. **Report completion to user:**

       > ✅ **Jira ticket processing complete!**
       >
       > **Ticket:** {{TICKET-ID}}
       > **Output location:** `dev/{{TICKET-ID}}/`
       >
       > **Structure created:**
       > - `ticket-info.md` - Ticket overview with task structure outline
       > - `{{single_subtask_file_count}}` single-subtask files (created directly at root)
       >   - `1-{{task_1_name}}.md`
       >   - ...
       > - `{{multi_subtask_directory_count}}` task directories (for tasks with multiple subtasks)
       >   - `2-{{task_2_name}}/` ({{subtask_count_2}} subtasks)
       >   - ...
       >
       > **Please review the generated files and suggest any changes you'd like me to make.**
       >
       > **Next steps:**
       > 1. Review `ticket-info.md` for ticket overview and task structure
       > 2. Navigate subtask files sequentially (single files at root, or within task directories)
       > 3. Begin implementation, completing one subtask at a time
       > 4. Record execution notes in the Agent Notes section of each subtask file

    6. **Error handling:**
       If any step fails:
       - Report specific error with context
       - Provide actionable guidance for resolution
       - Do not leave partial file structure (clean up on failure)
       - Examples:
         - "File not found: {{ticket}} - Please verify file path is correct"
         - "Invalid Jira format: Could not extract ticket ID or metadata - Please ensure export includes ticket ID and description"
         - "Directory creation failed: dev/{{TICKET-ID}}/{{task-dir}}/ - Check permissions and path validity"
         - "Failed to create subtask files - Verify task breakdown is valid and subtasks are properly defined"
  </task>
}
````
