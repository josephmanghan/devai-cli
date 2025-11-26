# Unit Test Structure Patterns

**Generated:** 2025-01-27  
**Source:** Analysis of ~147 test files from 5 best-practice libraries  
**Libraries:** web-auth, user-management, identity-auth, shared/public/ui, fraud-prevention

---

## Executive Summary

This document captures naming conventions, organizational patterns, and structural approaches observed in unit test files across the monorepo's highest-quality test suites.

**Key Findings:**
- 100% adherence to component name in top-level describe block
- 100% adherence to "should" phrasing in it blocks
- Consistent nested describe block patterns for scenario grouping
- Organized selector definitions at describe block level

---

## 1. Describe Block Organization

### 1.1 Component-Level Describe Blocks

**Pattern:** Component name as the top-level describe block

```typescript
describe('ComponentName', () => {
  // test suite
});
```

**Examples Found:**
- `describe('WebAuthVerifyEmailViewComponent', () => {`
- `describe('UserManagementLayoutComponent', () => {`
- `describe('StepUpOtpEntryComponent', () => {`
- `describe('TwoFactorEntryComponent', () => {`
- `describe('IdentityActionStatusComponent', () => {`

**Adherence:** 100% - All test files follow this pattern

**Consistency:** Exact component class name used, matching TypeScript class name

### 1.2 Nested Describe Blocks for Scenarios

#### Lifecycle/State-Based Grouping

**Pattern:** Group tests by component lifecycle or state

```typescript
describe('on load', () => {
  it('should render page header', () => {});
  it('should display initial state', () => {});
});

describe('when channel type is SMS', () => {
  it('should display SMS oriented text', () => {});
});

describe('when channel type is EMAIL', () => {
  it('should display email oriented text', () => {});
});
```

**Common Phrases:**
- `'on load'` / `'On component load'` - Initial render tests
- `'when [condition]'` - Conditional rendering/behavior tests
- `'when [user action]'` - User interaction tests

#### User Action Grouping

**Pattern:** Group tests by user actions or interactions

```typescript
describe('When a user performs an action', () => {
  it('should emit backToList when navigate back link is clicked', () => {});
  
  describe('when dropdown action is selected', () => {
    it('should emit actionSelected when LOCK action is selected', () => {});
    it('should emit actionSelected when UNLOCK action is selected', () => {});
  });
});
```

**Nesting Depth:** Typically 2-3 levels, rarely exceeding 4 levels

#### Method-Based Grouping

**Pattern:** Group tests by public method being tested

```typescript
describe('#onComplete', () => {
  it('should call facade to respond to challenge with a valid OTP', () => {});
});

describe('#resend', () => {
  it('should call facade to respond to challenge with a resend request', () => {});
});

describe('#tryAnotherMethod', () => {
  it('should call facade to respond to challenge with a return to channel selection request', () => {});
});
```

**Convention:** Use `#methodName` format for method-focused describe blocks

#### Child Component Testing Pattern

**Pattern:** Use asterisk prefix for child component testing

```typescript
describe('*WebAuthViewLayoutComponent', () => {
  describe('Output: selectLocale', () => {
    it('should emit selected locale', () => {});
  });
});

describe('*WebAuthLoginViewComponent', () => {
  describe('Input: passwordResetUrl', () => {
    it('should set passwordResetUrl input to loginResetCredentialsUrl value from view model', () => {});
  });
  describe('Output: submitted', () => {
    it('should submit form', () => {});
  });
});
```

**Convention:** 
- Asterisk (`*`) prefix indicates child component testing
- Nested describe blocks for Input/Output testing
- Tests verify parent-child component integration

### 1.3 Describe Block Naming Conventions

**Patterns Observed:**

1. **Scenario-Based:**
   - `'on load'`
   - `'when [condition]'`
   - `'when [user action]'`

2. **Method-Based:**
   - `'#methodName'` - Public method testing
   - `'#onTrackNavigation'` - Event handler testing

3. **State-Based:**
   - `'when the user has # attempt(s) remaining'`
   - `'when remainingTime > 1'`
   - `'when remainingTime = 0'`

4. **Component-Based:**
   - `'*ChildComponentName'` - Child component testing

**Consistency:** High - Clear, descriptive names that indicate test scope

---

## 2. It Block Naming Conventions

### 2.1 Phrasing Style

**Pattern:** "should [action/state/behavior]"

**Examples:**
- `it('should render page header with user\'s full name', () => {`
- `it('should display users email address', () => {`
- `it('should emit selected locale', () => {`
- `it('should call facade to respond to challenge with a valid OTP', () => {`
- `it('should not render locked status badge when user is ENABLED', () => {`

**Adherence:** 100% - All it blocks use "should" phrasing

**Tense:** Present tense, third person ("should render", not "renders" or "will render")

### 2.2 Level of Detail

**Pattern:** Tests describe both the action and expected outcome

**Good Examples:**
- `it('should display the try another way button by default', () => {`
- `it('should display SMS oriented text', () => {`
- `it('should emit OTP value', () => {`
- `it('should not display resend control when user has 0 resend attempts remaining', () => {`
- `it('should display the countdown text in plural form', () => {`

**Characteristics:**
- **High detail:** Tests describe both action and expected outcome
- **User-focused:** Tests describe what the user sees/experiences
- **Behavior-focused:** Tests describe component behavior, not implementation
- **Context-aware:** Include context when necessary (e.g., "when remainingTime > 1")

### 2.3 Negative Test Naming

**Pattern:** Use "should not" for negative assertions

**Examples:**
- `it('should not render locked status badge when user is ENABLED', () => {`
- `it('should not display resend control', () => {`
- `it('should not emit OTP value', () => {`

**Convention:** Clear negative phrasing, not "should fail to" or "should avoid"

---

## 3. Selector Organization

### 3.1 Selectors Object Pattern

**Pattern:** Selectors object defined at describe block level

```typescript
describe('ComponentName', () => {
  const selectors = {
    header: '[data-role="component-header"]',
    dropdown: '[data-role="component-dropdown"]',
    modal: '[data-role="component-modal"]',
    tabGroup: '[data-role="component-tab-group"]',
  };
});
```

**Adherence:** 95%+ - Nearly all component tests follow this pattern

### 3.2 Nested Selector Organization

**Pattern:** Nested objects for grouped/related selectors

```typescript
const selectors = {
  header: '[data-role="identity-user-management-page-header"]',
  dropdown: '[data-role="identity-user-management-dropdown"]',
  tabGroup: '[data-role="identity-user-management-tab-group"]',
  awaitingApprovalAlert: {
    heading: '[data-role="identity-user-management-approval-pending-alert"]',
  },
  modal: '[data-role="identity-user-management-confirmation-modal"]',
  support: {
    subtitle: '[data-role="two-factor-entry-view-support-subtitle"]',
    channelIcon: '[data-role="two-factor-entry-view-channel-icon"]',
    channelValue: '[data-role="two-factor-entry-view-channel-value"]',
    helpButton: '[data-role="two-factor-entry-view-help-button"]',
  },
  otpInput: {
    input: '[data-role="two-factor-entry-view-otp-input"] input',
    submitButton: '[data-role="two-factor-entry-view-otp-input-submit-button"] button',
    error: '[data-role="two-factor-entry-view-otp-input-error"]',
  },
};
```

**Organization Principles:**
- Flat structure for simple, unrelated selectors
- Nested objects for grouped/related selectors (e.g., `support.*`, `otpInput.*`)
- Logical grouping by UI area or feature

### 3.3 Selector Naming Conventions

**Pattern:** Descriptive names matching element purpose

**Examples:**
- `header` - Page header element
- `dropdown` - Dropdown component
- `modal` - Modal component
- `awaitingApprovalAlert.heading` - Alert heading within approval section
- `otpInput.input` - Input field within OTP input section
- `otpInput.submitButton` - Submit button within OTP input section

**Convention:** Names reflect element purpose, not implementation details

---

## 4. Test File Organization

### 4.1 Test File Naming

**Pattern:** `*.component.spec.ts` or `*.service.spec.ts`

**Examples:**
- `verify-email-view.component.spec.ts`
- `user-management-layout.component.spec.ts`
- `otp-entry.component.spec.ts`
- `auth.service.spec.ts`
- `user-management-store.service.spec.ts`

**Adherence:** 100% - All test files follow this pattern

**Convention:** 
- Component tests: `[component-name].component.spec.ts`
- Service tests: `[service-name].service.spec.ts`
- Pipe/utility tests: `[name].pipe.spec.ts` or `[name].spec.ts`

### 4.2 Test File Location

**Pattern:** Test files co-located with source files

**Structure:**
```
libs/web-auth/
  internal/
    ui/
      verify-email/
        src/
          lib/
            verify-email-view.component.ts
            verify-email-view.component.spec.ts
```

**Adherence:** 100% - All test files are co-located with source

**Benefits:**
- Easy to find related test files
- Clear component-test relationship
- Maintains project structure

### 4.3 Import Organization

**Pattern:** Grouped imports by source

```typescript
// Angular core/testing
import { TestBed } from '@angular/core/testing';

// Internal utilities/types
import { VerifyEmailPageViewModel } from '@backbase/identity-web-auth-journey/internal/util';

// Test utilities
import { getChildComponentInstance, getElementByCss } from '@backbase/private-identity-test-util';

// Component under test
import { WebAuthVerifyEmailViewComponent } from './verify-email-view.component';
```

**Convention:** 
- Angular imports first
- Internal library imports
- Test utility imports
- Component/service under test last

---

## 5. Patterns Summary

### 5.1 Mandatory Patterns (100% Adherence)

1. ✅ **Component name in describe block** - Top-level describe uses exact component class name
2. ✅ **"should" phrasing** - All it blocks use "should [action/state]"
3. ✅ **Co-located test files** - Test files next to source files
4. ✅ **Standard file naming** - `*.component.spec.ts` or `*.service.spec.ts`

### 5.2 Standard Patterns (90%+ Adherence)

1. ✅ **Selectors object** - Organized selector definitions at describe block level
2. ✅ **Nested describe blocks** - Used for organizing related tests
3. ✅ **Scenario-based grouping** - "on load", "when X", etc.

### 5.3 Common Patterns (50-90% Adherence)

1. ⚠️ **Method-based grouping** - `#methodName` pattern (common in service tests)
2. ⚠️ **Child component testing** - `*ComponentName` pattern (when applicable)
3. ⚠️ **Nested selectors** - Grouped selector objects (for complex components)

---

## 6. Recommendations

### 6.1 For Standards Updates

**Current test-structure.yaml:** Captures describe/it naming patterns  
**Recommendation:** Add examples of:
- Child component testing pattern (`*ComponentName`)
- Method-based grouping (`#methodName`)
- Lifecycle grouping patterns (`on load`, `when X`)
- Selector organization patterns

### 6.2 For New Tests

**Follow these patterns:**
1. Use exact component class name in top-level describe
2. Use "should" phrasing for all it blocks
3. Organize selectors in an object at describe block level
4. Group related tests with nested describe blocks
5. Use descriptive, user-focused test names

---

**Related Documentation:**
- [Test Setup Patterns](./unit-test-setup-patterns.md)
- [Test Logic Patterns](./unit-test-logic-patterns.md)
- [Test Philosophy Patterns](./unit-test-philosophy-patterns.md)

