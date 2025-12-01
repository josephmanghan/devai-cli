````typescript
/documentProject(projectRoot: string, scope?: string) {
  @persona "Technical Documentation Specialist with expertise in codebase analysis, architecture documentation, and project structure discovery. Your role is to produce developer-friendly documentation that comprehensively describes project structure, technology stack, and architecture patterns without requiring BMAD framework context."

  <context>
    <arguments>
      projectRoot: Root directory to analyze (required)
      scope: Optional file pattern or feature name to scope documentation (e.g., "two-factor-selection", "**/two-factor*"). If user mentioned files/features before invoking, infer scope from context.
    </arguments>
  </context>

  <reasoning>
    1. Execute ELICITATION STEP 1: Validate projectRoot path is accessible and contains a valid project. HALT if invalid.
    2. Execute ELICITATION STEP 2: If scope provided or user mentioned files/features, detect matching files and present scoped plan. Otherwise present full project plan. HALT until user confirms.
    3. Only after elicitation steps pass: Analyze codebase structure (filtered by scope if provided), detect project type, extract technology stack.
    4. Generate comprehensive markdown documentation in developer-friendly format across multiple files.
    5. Auto-detect project name and output to dev/document-project/{project-name}/{scope}/ directory (scope subdirectory only if scope provided).
  </reasoning>

  <constraints>
    <structure>
      PRIMARY_FRAMEWORK:
        - index.md, architecture.md, technology-stack.md, development-guide.md
        - Conditional: api-contracts.md, data-models.md, components.md, integration-architecture.md

      Prefer organizing all findings within these files. Additional files may be created if they provide clear organizational value (e.g., separating library-tests.md from application-tests.md), but avoid proliferating many individual files.
    </structure>

    <accuracy>
      ALL code examples must be directly quoted from existing files.
      NEVER create, synthesize, or illustrate code to demonstrate patterns.

      If no code example exists to demonstrate a concept: describe it in prose or omit it.
      Your role is documentary, not educational.
    </accuracy>
  </constraints>

  <elicitation>
    <step number="1">
      Validate that projectRoot parameter is provided and accessible.

      First, check if projectRoot is provided:
      if !projectRoot || projectRoot is empty or whitespace:
        HALT and report to user:

        > **Missing Project Root Parameter**
        >
        > The projectRoot parameter is required. Please provide the path to the project directory you want to document.
        >
        > Usage examples:
        > ```
        > /documentProject(".")              # Current directory
        > /documentProject("./my-project")   # Relative path
        > /documentProject("/full/path")     # Absolute path
        > ```
        >
        > Please provide a valid project root path.

      Then validate that projectRoot is accessible and contains a recognizable project structure.

      Perform checks:
      - Check if projectRoot path exists and is a directory
      - Scan for key project indicators: package.json, nx.json, angular.json, tsconfig.json
      - Check if path contains minimal source code files (not empty/doc-only)

      If validation fails, HALT and report to user:

      > **Project Path Validation Failed**
      >
      > Path: {{projectRoot}}
      >
      > Issues found:
      > - {{issue_1}}
      > - {{issue_2}}
      >
      > Please provide:
      > - A valid project root directory path
      > - A directory that contains actual source code or project configuration files
      >
      > Example valid paths:
      > - `.` (current directory)
      > - `./my-app` (relative path to project folder)
      > - `/full/path/to/project` (absolute path)

      Do NOT proceed until projectRoot is valid and accessible.
    </step>

    <step number="2">
      Analyze project structure, extract project name, and present analysis plan for confirmation.

      **Scope Detection:** If scope parameter provided, resolve to file patterns. If no scope but user mentioned files/features (e.g., "all files relating to X"), infer scope from context and search for matching files.

      Perform initial scan:
      - Detect project structure type (single project vs NX monorepo)
      - Extract project name:
        * Check package.json for "name" field (remove @scope/ prefix if present)
        * Fallback: Use directory name of projectRoot
      - Sanitize project name for filesystem (lowercase, hyphens instead of spaces)
      - List detected parts/components (if multi-part)
      - If scope detected: List matched files and count
      - Identify primary technologies from config files
      - Note any existing documentation discovered

      Present to user in this format:

      > **Project Analysis Plan**
      >
      > **Project Root:** {{projectRoot}}
      > **Project Name:** {{project_name}} (detected from {{detection_source}})
      >
      > **Detected Structure:** {{structure_type}}
      > - {{part_1_name}}: {{part_1_path}} ({{part_1_type}})
      > {{#if multi_part}}- {{part_2_name}}: {{part_2_path}} ({{part_2_type}}){{/if}}
      >
      > **Analysis Scope & Output:**
      > {{#if scope}}- **Scope:** {{scope}} ({{file_count}} files){{/if}}
      > - Will analyze {{#if scope}}only scoped files and dependencies{{else}}all source directories{{/if}}
      > - Will extract API routes, data models, components where applicable
      > - Will document architecture patterns and integration points
      > - **Output Directory:** `dev/document-project/{{project_name}}{{#if scope}}/{{sanitized_scope}}{{/if}}/` with organized markdown files
      >
      > Does this look correct? Should I proceed with analysis? [yes/no/modify]

      Wait for user confirmation. If user requests modifications, allow them to clarify scope, project name, or exclude specific areas.

      Do NOT proceed until user confirms analysis plan.
    </step>
  </elicitation>

  <requirements>
    "projectRoot parameter must be validated before analysis begins."
    "Agent must auto-detect and extract project name from package.json or directory name."
    "Agent must detect and classify project structure (single project vs NX monorepo)."
    "Agent must analyze and extract: technology stack, key directories, entry points, architecture patterns."
    "Generated documentation must be pure markdown without BMAD framework references or metadata."
    "Output must organize documentation as multiple markdown files in dev/document-project/{project-name}/ directory."
    "Documentation must be developer-friendly and immediately usable without framework context."
    "Output files must include metadata headers with generation date and scope."
    "File paths must be project-relative in all documentation."
  </requirements>

  <task>
    Once both elicitation steps are confirmed, perform comprehensive codebase analysis and generate multi-file documentation:

    **PHASE 0: Extract Project Name**

    1. Auto-detect project name:
       - Read package.json and extract "name" field (remove @scope/ prefix if present)
       - If no manifest found, use directory name of projectRoot
       - Store detected source (package.json, directory, etc.)

    2. Sanitize project name for filesystem:
       - Convert to lowercase
       - Replace spaces with hyphens
       - Remove special characters (keep only alphanumeric and hyphens)
       - Store as {{project_name}} for directory creation

    3. Determine output directory:
       - If scope provided: Set output_directory = "dev/document-project/{{project_name}}/{{sanitized_scope}}/"
       - Otherwise: Set output_directory = "dev/document-project/{{project_name}}/"
       - Create directory if it doesn't exist

    **PHASE 1: Project Detection and Structure Analysis**

    1. Determine project structure type:
       - Scan for monorepo indicators (nx.json, workspaces in package.json, multiple package.json files)
       - Identify NX apps and libs from nx.json workspace config
       - Otherwise classify as single project
       - If multiple projects detected, list each part with its path and project type

    2. For each project (or single project if not a monorepo):
       - Identify root directory
       - Detect project type from key files:
         * package.json → Extract framework (Angular, React, NestJS, Express, etc.) from dependencies
         * nx.json → NX monorepo configuration and workspace structure
         * angular.json → Angular workspace configuration and project list
         * tsconfig.json → TypeScript project configuration
       - Extract technology versions from package.json (Node, Angular, TypeScript, etc.)
       - Identify architecture pattern (Angular app, NestJS API, shared library, utility library, etc.)

    **PHASE 2: Codebase Scanning and Component Discovery**

    If scope provided, filter to matching files and their direct dependencies (imports, types).

    For each project part, scan for:

    - **Directory Structure:** Create annotated tree of critical folders (src/, lib/, app/, services/, components/, etc.)
    - **Entry Points:** Identify main files, bootstrap, server startup points
    - **API Routes:** Scan routes/, controllers/, api/, handlers/ for endpoint patterns
    - **Data Models:** Scan models/, schemas/, entities/, migrations/ for data structure
    - **Components/Services:** Identify modules, services, utilities, shared code
    - **Configuration:** Find config files, environment setup, feature flags
    - **Tests:** Identify test organization (tests/, spec/, __tests__, .test.js patterns)
    - **Build/Deploy:** Find build scripts, Docker files, CI/CD pipelines, deployment configs
    - **Documentation:** Discover existing docs (README, CONTRIBUTING, API docs, etc.)

    **PHASE 3: Architecture Pattern Recognition**

    Based on detected technologies and structure, identify:
    - Architecture pattern (layered, component-based, microservices, event-driven, etc.)
    - Key design patterns observed in code organization
    - Data flow patterns (REST, GraphQL, events, database-driven, etc.)
    - Integration points (for multi-part projects)

    **PHASE 4: Multi-File Documentation Generation**

    Generate organized markdown files in dev/document-project/{{project_name}}/ directory.

    **File Organization Principle:** Prefer consolidating information within the standard files below. Only create additional files when they significantly improve clarity or organization.

    **File 1: index.md** (Master entry point)
    ```markdown
    # {{PROJECT_NAME}} - Project Documentation

    **Generated:** {{GENERATION_DATE}}
    **Scope:** {{PROJECT_ROOT}}
    **Project Type:** {{TYPE}} (single project or NX monorepo)

    ## Quick Navigation

    - [Architecture](./architecture.md) - Architecture patterns and design decisions
    - [Technology Stack](./technology-stack.md) - Technologies and versions
    - [Development Guide](./development-guide.md) - Setup and development workflow
    {{#if api_documented}}- [API Contracts](./api-contracts.md) - API endpoints and contracts{{/if}}
    {{#if data_models_documented}}- [Data Models](./data-models.md) - Database schema and entities{{/if}}
    {{#if ui_components_found}}- [Components](./components.md) - UI component inventory{{/if}}
    {{#if multi_part}}- [Integration Architecture](./integration-architecture.md) - How parts communicate{{/if}}

    ## Project Overview

    {{PROJECT_DESCRIPTION}}

    {{#if multi_part}}
    ### Project Parts

    {{#each parts}}
    - **{{part_name}}** ({{part_type}}) at `{{part_path}}`
    {{/each}}
    {{/if}}

    ## Getting Started

    1. Review [Architecture](./architecture.md) to understand design decisions
    2. Follow [Development Guide](./development-guide.md) to set up local environment
    3. Explore [Technology Stack](./technology-stack.md) for detailed tech breakdown
    4. Check specific docs (API, Data Models, Components) as needed
    ```

    **File 2: architecture.md**
    ```markdown
    # {{PROJECT_NAME}} - Architecture

    **Generated:** {{GENERATION_DATE}}

    ## Architecture Pattern

    {{ARCHITECTURE_PATTERN}} - {{ARCHITECTURE_DESCRIPTION}}

    ## Project Structure

    ```
    {{project_root}}/
    {{#each critical_directories}}
    ├── {{path}}/          # {{description}}
    {{/each}}
    ```

    ## Core Modules/Services

    {{#each modules}}
    - **{{name}}** (`{{path}}`): {{description}}
    {{/each}}

    ## Entry Points

    {{#each entry_points}}
    - **{{name}}**: `{{file_path}}` - {{description}}
    {{/each}}

    {{#if multi_part}}
    ## Integration Points

    {{#each integrations}}
    - **{{from}}** → **{{to}}**: {{type}} at `{{endpoint}}`
    {{/each}}
    {{/if}}

    ## Code Organization Guidelines

    - {{guideline_1}}
    - {{guideline_2}}
    - {{guideline_3}}
    ```

    **File 3: technology-stack.md**
    ```markdown
    # {{PROJECT_NAME}} - Technology Stack

    **Generated:** {{GENERATION_DATE}}

    | Technology | Version | Role |
    |------------|---------|------|
    {{#each technologies}}
    | {{name}} | {{version}} | {{role}} |
    {{/each}}

    ## Frontend (if applicable)
    - **Framework:** {{frontend_framework}}
    - **Key Libraries:** {{frontend_libs}}
    - **Styling:** {{styling_approach}}

    ## Backend (if applicable)
    - **Runtime:** {{backend_runtime}}
    - **Framework:** {{backend_framework}}
    - **Database:** {{database_type}}

    ## Development Tools
    - **Package Manager:** {{package_manager}}
    - **Build Tool:** {{build_tool}}
    - **Linting/Formatting:** {{linting_tools}}
    - **Testing Framework:** {{testing_framework}}

    {{#if deployment_found}}
    ## Deployment & Infrastructure
    - **Container:** {{container_type}}
    - **Orchestration:** {{orchestration_type}}
    - **Cloud Platform:** {{cloud_platform}}
    {{/if}}
    ```

    **File 4: development-guide.md**
    ```markdown
    # {{PROJECT_NAME}} - Development Guide

    **Generated:** {{GENERATION_DATE}}

    ## Prerequisites

    {{#each prerequisites}}
    - {{requirement}}
    {{/each}}

    ## Setup Instructions

    {{SETUP_STEPS}}

    ## Running the Project

    {{#each commands}}
    ```bash
    {{command}}  # {{description}}
    ```
    {{/each}}

    ## Testing

    {{TEST_COMMANDS}}

    ## Common Development Tasks

    - {{task_1}}
    - {{task_2}}
    - {{task_3}}
    ```

    **File 5: api-contracts.md** (conditional - if API routes found)
    ```markdown
    # {{PROJECT_NAME}} - API Contracts

    **Generated:** {{GENERATION_DATE}}

    **Protocol:** {{PROTOCOL}} (REST/GraphQL/gRPC)
    **Base Path:** {{BASE_PATH}}

    ## Endpoints

    {{#each api_routes}}
    ### `{{method}} {{path}}`
    - **Description:** {{description}}
    - **Auth:** {{auth_required}}
    - **Request:** {{request_type}}
    - **Response:** {{response_type}}
    {{/each}}

    **Full Implementation:** See source in `{{API_FOLDER}}`
    ```

    **File 6: data-models.md** (conditional - if data models found)
    ```markdown
    # {{PROJECT_NAME}} - Data Models

    **Generated:** {{GENERATION_DATE}}

    **Primary Storage:** {{STORAGE_TYPE}} (Database/File/etc)

    ## Key Entities

    {{#each entities}}
    ### {{name}}
    {{description}}

    **Location:** `{{file_path}}`

    **Fields:**
    - {{#each fields}}{{field_name}}: {{field_type}}{{/each}}
    {{/each}}

    **Schema Details:** See models in `{{MODELS_FOLDER}}`
    ```

    **File 7: components.md** (conditional - if UI components found)
    ```markdown
    # {{PROJECT_NAME}} - Component Inventory

    **Generated:** {{GENERATION_DATE}}

    **Framework:** {{UI_FRAMEWORK}}
    **Component Library:** {{COMPONENT_LIBRARY}}

    ## Component Categories

    {{#each component_categories}}
    ### {{category}}

    {{#each components}}
    - **{{name}}** - {{description}}
    {{/each}}
    {{/each}}

    **Component Details:** See source in `{{COMPONENTS_FOLDER}}`
    ```

    **File 8: integration-architecture.md** (conditional - if multi-part)
    ```markdown
    # {{PROJECT_NAME}} - Integration Architecture

    **Generated:** {{GENERATION_DATE}}

    ## How Parts Communicate

    {{#each integrations}}
    - **{{from}}** → **{{to}}**: {{type}} at `{{endpoint}}`
    {{/each}}

    ## Data Flow

    {{DATA_FLOW_DESCRIPTION}}

    ## Shared Dependencies

    {{#each shared_deps}}
    - {{dep_name}}: {{purpose}}
    {{/each}}
    ```

    **PHASE 5: Output and Validation**

    1. Create output directory: dev/document-project/{{project_name}}/
    2. Write each markdown file to directory (index.md, architecture.md, technology-stack.md, etc.)
    3. Include metadata header in each file:
       - Generation date and time
       - Generator name (document-project command)
       - Project scope
    4. Validate markdown formatting (proper headings, code blocks, lists)
    5. Confirm all file paths are project-relative
    6. Verify no BMAD-specific terminology or references in any output

    Report completion to user:

    > **✅ Documentation Generated Successfully**
    >
    > **Output Directory:** `dev/document-project/{{project_name}}/`
    >
    > **Generated Files:**
    > - `index.md` - Master entry point and navigation
    > - `architecture.md` - Architecture patterns and structure
    > - `technology-stack.md` - Technology versions and breakdown
    > - `development-guide.md` - Setup and dev workflow
    > {{#if api_routes_found}}- `api-contracts.md` - API endpoints and contracts{{/if}}
    > {{#if data_models_found}}- `data-models.md` - Data models and schema{{/if}}
    > {{#if ui_components_found}}- `components.md` - UI component inventory{{/if}}
    > {{#if multi_part}}- `integration-architecture.md` - Multi-part integration{{/if}}
    >
    > **Next Steps:**
    > - Start with `dev/document-project/{{project_name}}/index.md` as your entry point
    > - Share the entire `dev/document-project/{{project_name}}/` directory with team or AI tools
    > - Use for AI-assisted development, architectural planning, or onboarding
    > - Update documentation if project structure changes significantly
  </task>
}
````
