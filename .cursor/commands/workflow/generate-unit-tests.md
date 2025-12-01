```typescript
/generateUnitTests(target: Path, reference?: Path) {
  @persona "Expert Angular developer specialising in clean, maintainable, and pragmatic automated testing"

  <context>
    <arguments>
      target: target.content
      reference: reference.content (optional)
    </arguments>

    if !target.content {
      report_to_user "No target content provided"
      halt
    }

    const testingStandards = {
      structure: load('.codegen/coding-standards/unit-tests/test-structure.yaml'),
      setup: load('.codegen/coding-standards/unit-tests/test-setup.yaml'),
      logic: load('.codegen/coding-standards/unit-tests/test-logic.yaml'),
      philosophy: load('.codegen/coding-standards/unit-tests/test-philosophy.yaml')
    }

    // When a reference file is provided, analyze it to extract patterns matching the
    // structure defined in testingStandards. This creates a style guide derived from
    // real examples while maintaining consistency with our standard categories.
    // Without a reference, use testingStandards as-is for default best practices.
    $appliedTestingStandards = reference.exists
      ? deriveFrom(reference, testingStandards)
      : testingStandards
  </context>

  <thinking>
    1. Systematically analyze reference patterns and hold them in mind
    2. Extract exact naming conventions from reference (describe blocks, it blocks)
    3. Identify what the reference tests vs what it doesn't test
    4. Understand the reference's approach to DOM testing, mocking, data setup
    5. Generate test plan that matches these patterns exactly
    6. Present analysis findings to validate understanding before proceeding
    7. STOP and wait for user approval - do not implement without confirmation
  </thinking>

  <execution_pipeline>
    $proposedTestPlan = generate testPlan(target.content) {
      component: componentName,
      format: "brief, nested list of 'describe' and 'it' block titles",
      style: $appliedTestingStandards
    }

    <state>
      userFeedback: modifiesTestPlan OR userConfirmation
    </state>

    <user_approval_flow>
      report_to_user "Planned test structure generated. Please confirm to proceed:"
      output $proposedTestPlan
      halt until userFeedback is userConfirmation

      while userFeedback is modifiesTestPlan {
        <thinking>
          1. Analyse suggestions.
          2. Derive changes to testPlan.
        </thinking>

        $proposedTestPlan = revise testPlan($proposedTestPlan) {
          incorporating: userFeedback,
          style: $appliedTestingStandards
        }

        report_to_user "Revised test plan based on your feedback:"
        output $proposedTestPlan
        halt until userFeedback is userConfirmation
      }
    </user_approval_flow>

    <file_generation>
      $expectedTestFilePath = determineTestFilePath(target, reference)

      if $expectedTestFilePath.exists {
        update_file($expectedTestFilePath) {
          generate missingTests(target.content) {
            based_on: $expectedTestFilePath.content,
            plan: $proposedTestPlan,
            style: $appliedTestingStandards
          }
        }
      } else {
        create_file($expectedTestFilePath) {
          generate comprehensiveTests(target.content) {
            plan: $proposedTestPlan,
            style: $appliedTestingStandards
          }
        }
      }
    </file_generation>
  </execution_pipeline>

  <constraints>
    "Final file must strictly follow $appliedTestingStandards."
    "Implementation must exactly match user-approved $proposedTestPlan."
    "Output must be valid, clean, and well-formatted code."
    "Only run tests on generated test file."
    "Do not proceed to implementation without user approval of the test plan."
  </constraints>

  <task>
    Generate or update the test file for target.content,
    following $proposedTestPlan and $appliedTestingStandards.
  </task>
}
```
