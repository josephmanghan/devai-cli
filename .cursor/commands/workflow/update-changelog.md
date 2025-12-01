```typescript
/updateChangelog(changelogFile: string, workDescription: string) {
  @persona "Documentation Standards Expert specializing in changelog maintenance and semantic versioning"

  <context>
    <arguments>
      changelogFile: changelogFile (required) - Path to the changelog file to update
      workDescription: workDescription (required) - Description of work completed to be added to changelog
    </arguments>

    if !changelogFile || !workDescription {
      report_to_user "Both changelogFile and workDescription are required to proceed."
      halt
    }

    <rule_reference>
      Refer to changelog-guidance.mdc for format standards and heading hierarchy
    </rule_reference>
  </context>

  <reasoning>
    1. Execute ELICITATION STEP 1: Validate both changelogFile and workDescription are provided. HALT if either is missing.
    2. Execute ELICITATION STEP 2: Confirm understanding of work description and categorization. HALT if user does not confirm.
    3. Parse work description to determine appropriate category (Breaking, Security, Removed, Deprecated, Added, Fixed, Changed, Internal)
    4. Format changelog entry according to changelog-guidance.mdc standards
    5. Identify correct insertion point in changelog (Unreleased section or latest version)
    6. Insert formatted entry while preserving existing structure
  </reasoning>

  <elicitation>
    <step number=1>

        Validate that both required parameters are provided.

        HALT. If either parameter is missing, report to user:

        > Both parameters are required to proceed:
        >
        > - **changelogFile**: Path to the changelog file to update (e.g., "CHANGELOG.md")
        > - **workDescription**: Description of work completed for the changelog entry
        >
        > Please provide both parameters and try again.

    </step>

    <step number=2>

        Confirm understanding of the work description and intended categorization.

        HALT. Report to user:

        > I will add this entry to your changelog:
        >
        > **Work Description:** {workDescription}
        > **Target File:** {changelogFile}
        >
        > Based on your description, I will categorize this under: [CATEGORY]
        >
        > Does this categorization look correct? Continue [c] or specify different category.

    </step>
  </elicitation>

  <requirements>
    - Both changelogFile and workDescription parameters must be provided
    - changelogFile must exist and be a valid changelog file
    - Generated entries must follow changelog-guidance.mdc format standards
    - Proper heading hierarchy must be maintained
    - Documentation links must use correct format: [ComponentName](path/to/component.html)
    - Insertion must preserve existing changelog structure
  </requirements>

  <task>
    Once both elicitation steps are confirmed, proceed with changelog update:

    1. **Validate changelog file exists and is readable:**
       - Check that changelogFile parameter points to an existing file
       - Verify file is a valid changelog (CHANGELOG.md or changelog.md format)
       - HALT with clear error message if file not found or inaccessible

    2. **Read and analyze existing changelog structure:**
       - Read complete changelog file content
       - Identify existing sections (Unreleased, version sections)
       - Understand current heading hierarchy and formatting

    3. **Analyze work description and determine category:**
       - Parse workDescription for keywords indicating change type
       - Apply heading hierarchy priority: Breaking Changes → Security → Removed → Deprecated → Added → Fixed → Changed → Internal
       - Select most appropriate category based on content analysis

    4. **Generate properly formatted changelog entry:**
       - Create entry following changelog-guidance.mdc format standards
       - Apply proper heading structure (### for category, #### for item title)
       - Format description with clear explanation and documentation links if mentioned
       - Ensure spacing and markdown formatting compliance

    5. **Identify correct insertion point:**
       - Look for existing "## [unreleased]" section
       - If found, plan insertion after this section header
       - If not found, plan to create new "## [unreleased]" section at top
       - Preserve existing changelog structure and version ordering

    6. **Insert entry and update file:**
       - Insert formatted entry at correct position
       - Maintain proper spacing and section separation
       - Preserve all existing changelog content and structure
       - Write updated content back to changelog file

    7. **Validate output and report success:**
       - Verify entry follows changelog-guidance.mdc format standards
       - Confirm changelog structure remains intact
       - Report successful update with category information
       - Provide clear confirmation to user
  </task>
}
```
