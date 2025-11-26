# Unit Test Patterns Index

**Generated:** 2025-01-27  
**Scope:** Analysis of unit test patterns from 5 best-practice libraries  
**Total Test Files Analyzed:** ~147 files

---

## Overview

This documentation captures unit testing patterns, conventions, and best practices observed across the five highest-quality test suites in the monorepo:

- `libs/web-auth` (51 test files)
- `libs/user-management` (14 test files)
- `libs/identity-auth` (42 test files)
- `libs/shared/public/ui` (33 test files)
- `libs/fraud-prevention` (7 test files)

---

## Documentation Structure

### [Test Structure Patterns](./unit-test-structure-patterns.md)

Covers naming conventions, organizational patterns, and structural approaches:
- Describe block organization (component-level, nested scenarios)
- It block naming conventions ("should" phrasing)
- Selector organization patterns
- Test file naming and location

**Key Patterns:**
- Component name in top-level describe (100% adherence)
- "should" phrasing in it blocks (100% adherence)
- Selectors object at describe block level (95%+ adherence)

### [Test Setup Patterns](./unit-test-setup-patterns.md)

Covers test data management and component setup:
- `getData()` function pattern (100% adherence)
- `getInstance()` helper pattern (90%+ adherence)
- `InstanceConfig` interface pattern
- Helper factory functions (`createIdentity`, `createViewModel`)

**Key Patterns:**
- `getData()` function mandatory for all tests
- `getInstance()` helper for component setup
- Optional `InstanceConfig` interface for flexible configuration

### [Test Logic Patterns](./unit-test-logic-patterns.md)

Covers test execution logic:
- Dependency mocking with `mock<>` helper
- DOM querying with `getElementByCss` and `getChildComponentInstance`
- RxJS testing with `jest-marbles`
- Async handling with `fakeAsync`/`tick`
- Spying patterns with `jest.spyOn`

**Key Patterns:**
- `getElementByCss` with `data-role` selectors (100% usage)
- `mock<>` helper for service mocking (standard pattern)
- `jest-marbles` for RxJS testing (extensive usage)

### [Test Philosophy Patterns](./unit-test-philosophy-patterns.md)

Covers testing principles and coverage:
- User-visible outcomes focus (100% adherence)
- Public API testing (inputs, outputs, behaviors)
- Coverage patterns (what gets tested vs. what doesn't)
- Clarity principles (no comments, descriptive names)

**Key Patterns:**
- Focus on user-visible outcomes
- Test only public API
- Verify text content, not just element presence
- No comments in tests (adheres to clarity principles)

---

## Key Findings Summary

### Mandatory Patterns (100% Adherence)

1. ✅ **getData() function** - Always present for test data management
2. ✅ **Component name in describe block** - Top-level describe uses exact component class name
3. ✅ **"should" phrasing** - All it blocks use "should [action/state]"
4. ✅ **getElementByCss for DOM querying** - Primary method for finding elements
5. ✅ **data-role selectors** - Used for all DOM queries
6. ✅ **User-visible outcomes focus** - Tests verify what users see/experience
7. ✅ **No comments in tests** - Self-documenting test names and structure

### Standard Patterns (90%+ Adherence)

1. ✅ **getInstance() helper** - Primary pattern for component setup
2. ✅ **InstanceConfig interface** - Used when multiple configuration options needed
3. ✅ **Selectors object** - Organized selector definitions at describe block level
4. ✅ **jest.spyOn for spying** - Standard spying pattern
5. ✅ **mock<> helper** - Standard service mocking pattern
6. ✅ **Nested describe blocks** - Used for organizing related tests

### Common Patterns (50-90% Adherence)

1. ⚠️ **getFixture() alternative** - Less common name for getInstance()
2. ⚠️ **createIdentity/createViewModel helpers** - Used when multiple variations needed
3. ⚠️ **jest-marbles for RxJS** - Used extensively in service/observable tests
4. ⚠️ **fakeAsync/tick** - Used for time-based and form validation tests

### Patterns Not Found

1. ❌ **Comments in tests** - No comments found (adheres to philosophy)
2. ❌ **ARIA attribute selectors** - Not used despite being Priority 1 in standards
3. ❌ **Text-based locators** - Not used despite being Priority 2 in standards
4. ❌ **Semantic HTML selectors** - Not used despite being Priority 3 in standards
5. ❌ **ID selectors** - Not used despite being Priority 4 in standards

**Note:** The actual practice (data-role selectors) differs from the documented selector priority hierarchy. This suggests the standards may need updating to reflect actual best practices.

---

## Recommendations for Standards Updates

### Test Structure Standards

**Current:** Captures describe/it naming patterns  
**Recommendation:** Add examples of:
- Child component testing pattern (`*ComponentName`)
- Method-based grouping (`#methodName`)
- Lifecycle grouping patterns (`on load`, `when X`)
- Selector organization patterns

### Test Setup Standards

**Current:** Documents getData() and getInstance() patterns  
**Recommendation:** Add:
- `createIdentity`/`createViewModel` factory pattern
- `InstanceConfig` interface pattern with all-optional properties
- Examples of complex getData() patterns with variations

### Test Logic Standards

**Current:** Documents dependency mocking, DOM querying, async handling  
**Recommendation:** Add:
- `mock<>` helper usage patterns
- `getElementByCss` and `getChildComponentInstance` patterns
- `jest-marbles` patterns for RxJS testing
- `typeInInput` helper pattern
- `fakeAsync`/`tick` patterns

### Test Philosophy Standards

**Current:** Documents selector priority and coverage scope  
**Recommendation:** Update:
- **Selector Priority:** Reflect actual practice (data-role is primary, not last resort)
- **Coverage Patterns:** Add examples of what gets tested vs. what doesn't
- **User-Visible Outcomes:** Add examples of text content verification patterns

---

## Library-Specific Observations

### web-auth Library

**Characteristics:**
- Extensive use of view/feature component separation
- Strong focus on form submission testing
- Comprehensive locale/navigation testing
- Social provider extension testing patterns

**Notable Patterns:**
- `*ComponentName` pattern for child component testing
- View model testing patterns
- Form payload testing

### user-management Library

**Characteristics:**
- Strong use of `createIdentity`/`createViewModel` helpers
- Comprehensive state variation testing (enabled/disabled/locked)
- Modal confirmation testing patterns
- Tab navigation testing

**Notable Patterns:**
- Multiple user state variations in getData()
- Entitlement-based conditional rendering tests
- Store/service integration testing

### identity-auth Library

**Characteristics:**
- Heavy RxJS/observable testing
- Facade pattern testing
- Challenge/response pattern testing
- Screen tracking/testing patterns

**Notable Patterns:**
- `ReplaySubject` usage for controllable observables
- `jest-marbles` for observable assertions
- Service facade testing patterns

### shared/public/ui Library

**Characteristics:**
- Pure component testing (minimal dependencies)
- Form validation testing
- Input transformation testing
- Accessibility considerations (screen reader components)

**Notable Patterns:**
- `InstanceOptions` interface pattern
- Form control testing with `fakeAsync`
- Input sanitization testing

### fraud-prevention Library

**Characteristics:**
- Provider pattern testing
- Configuration testing
- Service injection testing
- Minimal component testing (mostly services)

**Notable Patterns:**
- Provider function testing
- Configuration token testing
- Error condition testing

---

## Next Steps

1. **Review Documentation** - Review all pattern documents
2. **Update Standards** - Update coding standards YAML files with documented patterns
3. **Update Selector Priority** - Reflect actual practice in test-philosophy.yaml
4. **Add Examples** - Add real-world examples to standards files
5. **Use as Reference** - Use this documentation when generating new tests

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-27  
**Maintained By:** BMAD Business Analyst Agent

