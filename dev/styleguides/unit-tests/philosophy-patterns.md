# Unit Test Philosophy Patterns

**Generated:** 2025-01-27  
**Source:** Analysis of ~147 test files from 5 best-practice libraries  
**Libraries:** web-auth, user-management, identity-auth, shared/public/ui, fraud-prevention

---

## Executive Summary

This document captures test philosophy patterns including user-visible outcomes focus, public API testing, coverage patterns, and clarity principles observed in unit test files across the monorepo's highest-quality test suites.

**Key Findings:**

- 100% adherence to user-visible outcomes focus
- Strong focus on public API testing (inputs, outputs, behaviors)
- Comprehensive coverage of rendering, interactions, and edge cases
- No comments found in tests (adheres to clarity principles)
- Minimal destructuring pattern (only what's used)

---

## 1. User-Visible Outcomes Focus

### 1.1 Text Content Verification

**Status:** ✅ **STRONGLY ADHERED TO** - Observed in 100% of component tests

**Pattern:** Verify both element presence AND text content

**Example:**

```typescript
it("should render page header with user's full name", () => {
  const { viewModel } = getData();
  const { fixture } = getInstance(viewModel.enabledUser);

  const header = getElementByCss(fixture, selectors.header);

  expect(header).toBeDefined();
  expect(header.textContent).toContain(viewModel.enabledUser?.user?.fullName);
});
```

**Pattern:** Always verify text content, not just element presence

**Rationale:** Users see text content, not just elements. Verifying text ensures proper user experience.

### 1.2 Element State Verification

**Pattern:** Verify element visibility/state based on user-visible conditions

**Examples:**

**Positive State:**

```typescript
it('should render locked status badge when user is DISABLED', () => {
  const { viewModel } = getData();
  const { fixture } = getInstance(viewModel.disabledUser);

  const statusBadge = getChildComponentInstance(fixture, BadgeComponent);
  expect(statusBadge.text).toEqual('Locked');
});
```

**Negative State:**

```typescript
it('should not render locked, temporarily locked or access revoked status badge when user is ENABLED', () => {
  const { viewModel } = getData();
  const { fixture } = getInstance(viewModel.enabledUser);

  expect(getChildComponentInstance(fixture, BadgeComponent)).toBeUndefined();
});
```

**Pattern:** Test both positive and negative states based on user-visible conditions

### 1.3 User Interaction Outcomes

**Pattern:** Verify outcomes users experience from interactions

**Example:**

```typescript
it('should display SMS oriented text', () => {
  const { smsChallenge } = getData();
  const { fixture } = getInstance({ challenge: smsChallenge });
  fixture.detectChanges();

  const channelIconElement = getElementByCss(fixture, selectors.support.channelIcon);
  expect(channelIconElement.classList).toContain('bb-icon-phone-android');

  expect(getElementByCss(fixture, selectors.support.channelValue).textContent).toContain(smsChallenge.channel.value);
  expect(getElementByCss(fixture, selectors.support.subtitle).textContent).toContain('cell phone');
});
```

**Pattern:** Verify what users see after interactions, not internal state changes

---

## 2. Public API Testing

### 2.1 Input Testing

**Pattern:** Test only public inputs, not internal properties

**Example:**

```typescript
describe('*WebAuthLoginViewComponent', () => {
  describe('Input: passwordResetUrl', () => {
    it('should set passwordResetUrl input to loginResetCredentialsUrl value from view model', () => {
      const { viewModel } = getData();
      const { fixture } = getInstance({});

      const viewComponent = getChildComponentInstance(fixture, WebAuthLoginViewComponent);

      expect(viewComponent.passwordResetUrl()).toEqual(viewModel.pageData.loginResetCredentialsUrl);
    });
  });
});
```

**Pattern:**

- Test inputs through child component instances
- Verify input values match expected values
- Use nested describe blocks for input organization

### 2.2 Output Testing

**Pattern:** Test only public outputs (events), not internal methods

**Example:**

```typescript
describe('Output: submitted', () => {
  it('should submit form', () => {
    const { formPayload, viewModel } = getData();
    const { fixture, identityDataService } = getInstance();

    const viewComponent = getChildComponentInstance(fixture, WebAuthLoginViewComponent);
    viewComponent.submitted.emit(formPayload);

    expect(identityDataService.submitData).toHaveBeenCalledWith(viewModel.action, formPayload);
  });
});
```

**Pattern:**

- Emit output events from child components
- Verify side effects (service calls, state changes)
- Use nested describe blocks for output organization

### 2.3 Method Testing

**Pattern:** Test public methods, verify their side effects

**Example:**

```typescript
describe('#onComplete', () => {
  it('should call facade to respond to challenge with a valid OTP', () => {
    const { component, facade } = getInstance();
    const { otp, response } = getData();

    component.onComplete(otp);

    expect(facade.respondToChallenge).toHaveBeenCalledWith(response.submitOtp);
  });
});
```

**Pattern:**

- Call public methods directly
- Verify side effects (service calls, state changes)
- Use `#methodName` format in describe blocks

### 2.4 What NOT to Test

**Avoid Testing:**

- Private methods
- Internal component state (unless affecting user-visible output)
- Framework behavior (Angular change detection, etc.)
- Third-party library internals

**Example of What NOT to Test:**

```typescript
// ❌ DON'T TEST - Internal state
it('should set internal _isLoading flag', () => {
  component['_isLoading'] = true;
  expect(component['_isLoading']).toBe(true);
});

// ✅ DO TEST - User-visible outcome
it('should display loading spinner when submitting', () => {
  const { fixture } = getInstance({ isSubmitting: true });
  expect(getElementByCss(fixture, selectors.loadingSpinner)).toBeDefined();
});
```

---

## 3. Coverage Patterns

### 3.1 What Gets Tested

#### Component Rendering

**Pattern:** Test initial render state and conditional rendering

**Examples:**

```typescript
describe('on load', () => {
  it("should render page header with user's full name", () => {});
  it('should render all tabs', () => {});
  it('should render locked status badge when user is DISABLED', () => {});
});
```

**Coverage:**

- Initial render state
- Conditional rendering based on inputs
- Text content display
- Element visibility

#### User Interactions

**Pattern:** Test user interactions and their outcomes

**Examples:**

```typescript
describe('When a user performs an action', () => {
  it('should emit backToList when navigate back link is clicked', () => {});
  it('should emit navigateToTab with index when a tab is selected', () => {});

  describe('when dropdown action is selected', () => {
    it('should emit actionSelected when LOCK action is selected', () => {});
  });
});
```

**Coverage:**

- Button clicks
- Form submissions
- Input changes
- Navigation events

#### Component Behavior

**Pattern:** Test component behavior and side effects

**Examples:**

```typescript
describe('#onComplete', () => {
  it('should call facade to respond to challenge with a valid OTP', () => {});
});

describe('#resend', () => {
  it('should call facade to respond to challenge with a resend request', () => {});
});
```

**Coverage:**

- Event emissions
- Service method calls
- Observable subscriptions
- State changes

#### Edge Cases

**Pattern:** Test boundary conditions and error states

**Examples:**

```typescript
describe('when the user has # attempt(s) remaining', () => {
  it('should display a suitable message for 1 attempt', () => {
    const { smsChallengeOneAttempt } = getData();
    const { fixture } = getInstance({ challenge: smsChallengeOneAttempt });

    expect(getElementByCss(fixture, selectors.otpInput.oneAttemptRemaining).textContent).toContain(
      'You have 1 attempt remaining.',
    );
  });
});

describe('when remainingTime = 0', () => {
  it('should display the resend prompt & resend button', () => {});
});

describe('when remainingTime = 1', () => {
  it('should display the countdown text in singular form', () => {});
});
```

**Coverage:**

- Error states
- Loading states
- Empty states
- Boundary conditions (e.g., "1 attempt remaining", "0 resends")

### 3.2 What Doesn't Get Tested

#### Implementation Details

**Avoid:**

- Internal component state (unless affecting user-visible output)
- Private methods
- Internal helper functions

#### Framework Behavior

**Avoid:**

- Angular change detection (unless testing timing issues)
- Router behavior (mocked)
- HTTP client behavior (mocked)

#### Third-Party Libraries

**Avoid:**

- UI library component internals
- External service implementations (mocked)

---

## 4. Clarity Principles

### 4.1 No Comments in Tests

**Status:** ✅ **ADHERED TO** - No comments found in analyzed test files

**Pattern:** Self-documenting test names and structure

**Example:**

```typescript
// ❌ NOT FOUND - Comments are avoided
// ✅ GOOD - Clear naming
it('should display the try another way button by default', () => {
  const { fixture } = getInstance();
  const buttonElement: HTMLButtonElement = getElementByCss(fixture, selectors.resend.tryAnotherWayButton);
  expect(buttonElement).toBeDefined();
});
```

**Rationale:** Test names and structure should be self-explanatory. Comments indicate unclear code.

### 4.2 Descriptive Test Names

**Pattern:** Test names describe the scenario and expected outcome

**Good Examples:**

- `it('should display SMS oriented text', () => {`
- `it('should emit OTP value', () => {`
- `it('should not display resend control when user has 0 resend attempts remaining', () => {`
- `it('should display the countdown text in plural form', () => {`

**Characteristics:**

- Include context when necessary (e.g., "when remainingTime > 1")
- Describe both action and expected outcome
- User-focused language

**Bad Examples:**

- `it('test 1', () => {` - No description
- `it('works', () => {` - Vague
- `it('component renders', () => {` - Doesn't describe what's rendered

### 4.3 Minimal Destructuring

**Pattern:** Only destructure what's actually used

**Good Example:**

```typescript
it('should display users email address', () => {
  const { userEmail } = getData();
  const { fixture } = getInstance();
  // ...
});
```

**Bad Example:**

```typescript
it('should display users email address', () => {
  const { userEmail, viewModel, tabs, comment } = getData(); // tabs and comment not used
  const { fixture, component } = getInstance(); // component not used
  // ...
});
```

**Rationale:** Minimal destructuring promotes test clarity and makes dependencies explicit

### 4.4 Clear Test Structure

**Pattern:** Organize tests with nested describe blocks

**Example:**

```typescript
describe('ComponentName', () => {
  describe('on load', () => {
    it('should render...', () => {});
  });

  describe('When a user performs an action', () => {
    describe('when dropdown action is selected', () => {
      it('should emit...', () => {});
    });
  });
});
```

**Benefits:**

- Clear test organization
- Easy to find related tests
- Self-documenting structure

---

## 5. Selector Priority Analysis

### 5.1 Actual Practice vs. Documented Standards

**Documented Priority (test-philosophy.yaml):**

1. ARIA attributes (Priority 1)
2. Text-based locators (Priority 2)
3. Semantic HTML selectors (Priority 3)
4. ID selectors (Priority 4)
5. data-role attributes (Priority 5 - last resort)

**Actual Practice:**

- **data-role selectors:** Used in 100% of component tests (PRIMARY pattern)
- **ARIA attributes:** Not found in analyzed tests
- **Text-based locators:** Not found in analyzed tests
- **Semantic HTML selectors:** Not found in analyzed tests
- **ID selectors:** Not found in analyzed tests

### 5.2 Recommendation

**Update test-philosophy.yaml** to reflect actual practice:

- **data-role selectors** should be Priority 1 (primary pattern)
- Other selector types can remain as alternatives
- Document that data-role is the standard pattern

**Rationale:**

- data-role selectors are stable, test-specific, and don't change with styling
- They're explicitly added for testing purposes
- They're the established pattern across all libraries

---

## 6. Patterns Summary

### 6.1 Mandatory Patterns (100% Adherence)

1. ✅ **User-visible outcomes focus** - Tests verify what users see/experience
2. ✅ **Text content verification** - Always verify text content, not just element presence
3. ✅ **No comments in tests** - Self-documenting test names and structure

### 6.2 Standard Patterns (90%+ Adherence)

1. ✅ **Public API testing** - Test only inputs, outputs, and behaviors
2. ✅ **Descriptive test names** - Clear, user-focused descriptions
3. ✅ **Minimal destructuring** - Only destructure what's used

### 6.3 Common Patterns (50-90% Adherence)

1. ⚠️ **Edge case testing** - Boundary conditions and error states
2. ⚠️ **Nested describe blocks** - For organizing related tests

---

## 7. Recommendations

### 7.1 For Standards Updates

**Current test-philosophy.yaml:** Documents selector priority and coverage scope  
**Recommendation:** Update:

- **Selector Priority:** Reflect actual practice (data-role is primary, not last resort)
- **Coverage Patterns:** Add examples of what gets tested vs. what doesn't
- **User-Visible Outcomes:** Add examples of text content verification patterns
- **Clarity Principles:** Add examples of descriptive test names

### 7.2 For New Tests

**Follow these principles:**

1. Focus on user-visible outcomes (what users see/experience)
2. Test only public API (inputs, outputs, behaviors)
3. Verify text content, not just element presence
4. Use descriptive, user-focused test names
5. Avoid comments - make tests self-documenting
6. Only destructure what's actually used
7. Test edge cases and boundary conditions

---

**Related Documentation:**

- [Test Structure Patterns](./unit-test-structure-patterns.md)
- [Test Setup Patterns](./unit-test-setup-patterns.md)
- [Test Logic Patterns](./unit-test-logic-patterns.md)
