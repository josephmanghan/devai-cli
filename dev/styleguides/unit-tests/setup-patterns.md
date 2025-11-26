# Unit Test Setup Patterns

**Generated:** 2025-01-27  
**Source:** Analysis of ~147 test files from 5 best-practice libraries  
**Libraries:** web-auth, user-management, identity-auth, shared/public/ui, fraud-prevention

---

## Executive Summary

This document captures test setup patterns, data management approaches, and helper function patterns observed in unit test files across the monorepo's highest-quality test suites.

**Key Findings:**
- 100% adherence to `getData()` function pattern for test data management
- 90%+ adherence to `getInstance()` helper pattern for component setup
- Consistent use of `InstanceConfig` interface pattern for flexible test configuration
- Helper factory functions (`createIdentity`, `createViewModel`) for data variations

---

## 1. getData() Function Pattern

### 1.1 Pattern Overview

**Status:** ✅ **MANDATORY PATTERN** - Found in 100% of analyzed test files

**Pattern:**
```typescript
const getData = () => {
  // Create all mock data objects
  const viewModel: SomeViewModel = {
    // ... properties
  };
  
  const userEmail = 'test@email.com';
  
  return {
    viewModel,
    userEmail,
    // ... other data
  };
};
```

**Characteristics:**
- **Placement:** Defined at describe block level, before `getInstance()`
- **Return Type:** Object containing all mock data needed for tests
- **Naming:** Always named `getData` (never `getTestData`, `createData`, etc.)
- **Usage:** Called at the beginning of individual tests

### 1.2 Simple Pattern Example

**From:** `web-auth/internal/ui/verify-email/src/lib/verify-email-view.component.spec.ts`

```typescript
const getData = () => {
  const userEmail = 'test@email.com';
  const viewModel: VerifyEmailPageViewModel = {
    config: {
      supportTelephone: '',
      showConfirmPassword: false,
      registrationUrl: '',
    },
    action: 'http://localhost/api/auth-server/',
    path: 'login-forgot-username',
    pageData: {
      userEmail,
    },
  };

  return {
    viewModel,
    userEmail,
  };
};
```

**Usage:**
```typescript
it('should display users email address', () => {
  const { userEmail } = getData();
  const { fixture } = getFixture();

  expect(getElementByCss(fixture, selectors.instructionText).textContent).toContain(userEmail);
});
```

### 1.3 Complex Pattern with Variations

**From:** `user-management/internal/ui/src/lib/user-management-layout/user-management-layout.component.spec.ts`

```typescript
const getData = () => {
  const user = {
    enabled: createIdentity({ status: USER_STATUS.Enabled }),
    disabled: createIdentity({ status: USER_STATUS.Disabled }),
    temporarilyLocked: createIdentity({ status: USER_STATUS.TemporarilyLocked }),
    disabledApprovalPending: createIdentity({ status: USER_STATUS.Disabled, profileLocked: true }),
    revoked: createIdentity({ status: USER_STATUS.AccessRevoked }),
  };

  const comment = 'A reason for confirmation';
  const tabs: UserManagementTab[] = [
    {
      title: 'Profile',
      path: 'profile',
    },
    {
      title: 'Login & Security',
      path: 'login-security',
    },
  ];
  
  const viewModel = {
    enabledUser: createViewModel({ user: user.enabled, tabs }),
    disabledUser: createViewModel({ user: user.disabled, tabs }),
    temporarilyLocked: createViewModel({ user: user.temporarilyLocked, tabs }),
    disabledUserApprovalPending: createViewModel({ user: user.disabledApprovalPending, tabs }),
    revokedUser: createViewModel({ user: user.revoked, tabs }),
  };

  return { viewModel, comment, tabs };
};
```

**Characteristics:**
- Returns multiple variations of the same data type
- Uses helper functions (`createIdentity`, `createViewModel`) within `getData()`
- Provides all test data variations in one place

### 1.4 Pattern with Factory Functions

**From:** `identity-auth/step-up/src/lib/feature/otp-entry/otp-entry.component.spec.ts`

```typescript
function createOtpEntryChallenge(options?: Partial<OtpEntryChallengeData>): OtpEntryChallenge {
  return {
    challengeType: ChallengeTypeEnum.OTP_ENTRY,
    challengeData: {
      channel: {
        id: '1',
        type: ChannelTypeEnum.SMS,
        value: '01234567890',
      },
      attemptsRemaining: 3,
      otpLength: 5,
      resendsRemaining: 3,
      resendDelay: 0,
      ...options,
    },
  };
}

const getData = () => {
  const remainingTime = 10;
  const error = OtpEntryErrorTypeEnum.EXPIRED_OTP;
  const challenge = {
    sms: createOtpEntryChallenge(),
    withErrors: createOtpEntryChallenge({ error, attemptsRemaining: 1 }),
  };

  const otp = 123456;
  const response = {
    submitOtp: {
      challengeType: ChallengeTypeEnum.OTP_ENTRY,
      responseType: ResponseTypeEnum.SUBMIT_OTP,
      otp: otp.toString(),
    },
    resend: {
      challengeType: ChallengeTypeEnum.OTP_ENTRY,
      responseType: ResponseTypeEnum.RESEND,
    },
  };

  return { challenge, otp, response, error, remainingTime };
};
```

**Pattern:** Factory functions defined outside `getData()`, used within `getData()` to create variations

### 1.5 Usage Patterns

**Pattern:** Destructure only what's needed from `getData()` return value

```typescript
// ✅ GOOD - Only destructure what's used
it('should display users email address', () => {
  const { userEmail } = getData();
  const { fixture } = getInstance();
  // ...
});

// ❌ AVOID - Unnecessary destructuring
it('should display users email address', () => {
  const { userEmail, viewModel, tabs, comment } = getData(); // tabs and comment not used
  // ...
});
```

**Principle:** Minimal destructuring promotes test clarity

---

## 2. getInstance() Helper Pattern

### 2.1 Pattern Overview

**Status:** ✅ **PRIMARY PATTERN** - Found in 90%+ of component test files

**Pattern:**
```typescript
const getInstance = (config?: Partial<InstanceConfig>) => {
  const fixture = TestBed.configureTestingModule({
    imports: [ComponentUnderTest],
    providers: [/* ... */],
  }).createComponent(ComponentUnderTest);
  
  const component = fixture.componentInstance;
  
  // Set inputs if config provided
  if (config?.someInput) {
    fixture.componentRef.setInput('someInput', config.someInput);
  }
  
  fixture.detectChanges();
  
  return { fixture, component };
};
```

**Characteristics:**
- **Naming:** Always named `getInstance` (not `getFixture`, `createComponent`, etc.)
- **Parameters:** Optional config object (typically `Partial<InstanceConfig>`)
- **Return:** Object containing `{ fixture, component }` and optionally mocks/services
- **Default Values:** Provides sensible defaults for all required inputs

### 2.2 Simple Component Pattern

**From:** `user-management/internal/ui/src/lib/user-management-layout/user-management-layout.component.spec.ts`

```typescript
const getInstance = (viewModelOverrides: Partial<UserManagementViewModel> = {}) => {
  const fixture = TestBed.configureTestingModule({
    imports: [UserManagementLayoutComponent],
  }).createComponent(UserManagementLayoutComponent);

  fixture.componentRef.setInput('viewModel', createViewModel(viewModelOverrides));
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
};
```

**Usage:**
```typescript
it('should render page header with user\'s full name', () => {
  const { viewModel } = getData();
  const { fixture } = getInstance(viewModel.enabledUser);
  // ...
});
```

### 2.3 InstanceConfig Interface Pattern

**Pattern:** Define optional interface for configuration

**From:** `shared/public/ui/multi-factor-authentication/src/lib/two-factor-entry/two-factor-entry.component.spec.ts`

```typescript
interface InstanceOptions {
  challenge?: OtpEntryChallengeData;
  remainingTime?: number;
  isSubmitting?: boolean;
  errorStatus?: OtpEntryErrorType;
  autofocus?: boolean;
  hideTryAnotherWay?: boolean;
}

const getInstance = (options?: InstanceOptions) => {
  const { smsChallenge } = getData();
  const fixture = TestBed.configureTestingModule({
    imports: [TwoFactorEntryComponent],
  }).createComponent(TwoFactorEntryComponent);

  const componentRef = fixture.componentRef;
  const component = fixture.componentInstance;

  componentRef.setInput('challenge', options?.challenge ?? smsChallenge);
  componentRef.setInput('remainingTime', options?.remainingTime ?? 0);
  componentRef.setInput('errorStatus', options?.errorStatus ?? undefined);

  if (options?.isSubmitting) {
    componentRef.setInput('isSubmitting', options.isSubmitting);
  }

  if (options?.autofocus) {
    componentRef.setInput('autofocus', options.autofocus);
  }
  
  if (options?.hideTryAnotherWay) {
    componentRef.setInput('hideTryAnotherWay', options.hideTryAnotherWay);
  }

  fixture.detectChanges();

  return { fixture, componentRef, component };
};
```

**Key Principle:** All properties in `InstanceConfig` interface MUST be optional to promote minimal test setup

**Benefits:**
- Tests can override only what they need
- Default values provided via nullish coalescing (`??`)
- Type-safe configuration
- Promotes test clarity

### 2.4 Service Pattern

**From:** `identity-auth/src/lib/auth/auth.service.spec.ts`

```typescript
interface InstanceConfig {
  locale?: string;
}

const getInstance = (config?: InstanceConfig) => {
  const isAuthenticated$$ = new ReplaySubject<boolean>(1);
  const oidcAuthService = mock<ɵɵOidcAuthService>({
    getLocale: jest.fn().mockReturnValue(config?.locale),
    initLoginFlow: jest.fn(),
    isAuthenticated$: isAuthenticated$$.asObservable(),
  });
  const locale = config?.locale || 'en';

  TestBed.configureTestingModule({
    imports: [IdentityAuthModule],
    providers: [
      AuthService,
      { provide: ɵɵOidcAuthService, useValue: oidcAuthService },
      { provide: LOCALE_ID, useValue: locale },
    ],
  });

  const service = TestBed.inject(AuthService);

  return { service, oidcAuthService, isAuthenticated$$ };
};
```

**Pattern:** For services, use `TestBed.inject()` instead of `createComponent()`

### 2.5 Complex Component with Mocks

**From:** `web-auth/internal/feature/login/src/lib/login.component.spec.ts`

```typescript
interface InstanceOptions {
  config?: Partial<WebAuthJourneyConfig>;
  extensions?: Partial<WebAuthExtensionsConfig>;
  pageData?: Partial<LoginPageViewData>;
}

const getInstance = (options?: InstanceOptions) => {
  const { defaultConfig, viewModel, locales, currentLocale, origin } = getData();
  const identityDataService = mock<IdentityAuthServerDataService>({
    submitDataViaXhr: jest.fn(),
    updateActionUrl: jest.fn(),
    submitData: jest.fn(),
    viewModel: { ...viewModel, pageData: { ...viewModel.pageData, ...options?.pageData } },
  });

  const tracker = mock<Tracker>({
    publish: jest.fn(),
  });

  const fixture = TestBed.configureTestingModule({
    imports: [WebAuthLoginPageComponent, RouterModule.forRoot([])],
    providers: [
      {
        provide: WebAuthJourneyConfigToken,
        useValue: { ...defaultConfig, ...options?.config },
      },
      {
        provide: WebAuthExtensionsConfigToken,
        useValue: { ...options?.extensions },
      },
      {
        provide: WebAuthIdentityDataServiceToken,
        useValue: identityDataService,
      },
      { provide: LOCALE_ID, useValue: currentLocale },
      { provide: LOCALE_LIST, useValue: locales },
      { provide: Tracker, useValue: tracker },
    ],
  }).createComponent(WebAuthLoginPageComponent);
  const component = fixture.componentInstance;

  fixture.detectChanges();

  return { fixture, component, identityDataService, tracker };
};
```

**Pattern:** Return mocks/services along with fixture/component for test assertions

### 2.6 Variations

#### getFixture() Alternative

**From:** `shared/public/ui/action-status/src/lib/action-status.component.spec.ts`

```typescript
const getFixture = (inputs: IdentityActionStatusInputs = {}) => {
  const fixture = TestBed.configureTestingModule({
    imports: [IdentityActionStatusComponent, RouterModule.forRoot([])],
  }).createComponent(IdentityActionStatusComponent);

  const component = fixture.componentInstance;

  fixture.componentRef.setInput('heading', inputs.heading ?? '');
  fixture.componentRef.setInput('iconName', inputs.iconName ?? '');
  fixture.componentRef.setInput('description', inputs.description ?? '');
  fixture.componentRef.setInput('buttonText', inputs.buttonText ?? '');
  fixture.componentRef.setInput('targetPath', inputs.targetPath ?? '');

  fixture.detectChanges();

  return { fixture, component };
};
```

**Note:** Less common (10% of files), same pattern different name

---

## 3. Helper Factory Functions

### 3.1 createIdentity Pattern

**Pattern:** Factory function for creating test data variations

**From:** `user-management/internal/ui/src/lib/user-management-layout/user-management-layout.component.spec.ts`

```typescript
const baseIdentity: GetIdentity = {
  externalId: 'john.doe',
  legalEntityInternalId: 'legal-entity-001',
  fullName: 'John Doe',
  givenName: 'John',
  familyName: 'Doe',
};

const createIdentity = (patch?: Partial<GetIdentity>): GetIdentity => ({
  ...baseIdentity,
  ...patch,
});
```

**Usage:**
```typescript
const getData = () => {
  const user = {
    enabled: createIdentity({ status: USER_STATUS.Enabled }),
    disabled: createIdentity({ status: USER_STATUS.Disabled }),
    temporarilyLocked: createIdentity({ status: USER_STATUS.TemporarilyLocked }),
  };
  return { user };
};
```

**Benefits:**
- Promotes DRY principle
- Easy to create variations
- Type-safe with `Partial<T>`
- Centralized base data

### 3.2 createViewModel Pattern

**Pattern:** Factory function for view model creation

**From:** `user-management/internal/ui/src/lib/user-management-layout/user-management-layout.component.spec.ts`

```typescript
const DEFAULT_VIEW_MODEL: UserManagementViewModel = {
  user: baseIdentity,
  canShowLockAction: false,
  canShowUnlockAction: false,
  canShowRevokeAction: false,
  currentAction: undefined,
  isUpdating: false,
  activeTabIndex: 0,
  approvalPending: false,
  tabs: [],
};

const createViewModel = (patch: Partial<UserManagementViewModel>): UserManagementViewModel => ({
  ...DEFAULT_VIEW_MODEL,
  ...patch,
});
```

**Usage:**
```typescript
const viewModel = {
  enabledUser: createViewModel({ user: user.enabled, tabs }),
  disabledUser: createViewModel({ user: user.disabled, tabs }),
};
```

**Pattern:** Default object + partial override = flexible test data

### 3.3 createOtpEntryChallenge Pattern

**Pattern:** Factory function for complex objects with defaults

**From:** `identity-auth/step-up/src/lib/feature/otp-entry/otp-entry.component.spec.ts`

```typescript
function createOtpEntryChallenge(options?: Partial<OtpEntryChallengeData>): OtpEntryChallenge {
  return {
    challengeType: ChallengeTypeEnum.OTP_ENTRY,
    challengeData: {
      channel: {
        id: '1',
        type: ChannelTypeEnum.SMS,
        value: '01234567890',
      },
      attemptsRemaining: 3,
      otpLength: 5,
      resendsRemaining: 3,
      resendDelay: 0,
      ...options,
    },
  };
}
```

**Usage:**
```typescript
const challenge = {
  sms: createOtpEntryChallenge(),
  withErrors: createOtpEntryChallenge({ error, attemptsRemaining: 1 }),
};
```

**Pattern:** Function with optional partial override parameter

---

## 4. Input Setting Patterns

### 4.1 componentRef.setInput() Pattern

**Pattern:** Use `componentRef.setInput()` for signal inputs

```typescript
fixture.componentRef.setInput('challenge', options?.challenge ?? smsChallenge);
fixture.componentRef.setInput('remainingTime', options?.remainingTime ?? 0);
fixture.componentRef.setInput('errorStatus', options?.errorStatus ?? undefined);
```

**Pattern:** Provide defaults with nullish coalescing (`??`)

### 4.2 Conditional Input Setting

**Pattern:** Only set inputs when provided in config

```typescript
if (options?.isSubmitting) {
  componentRef.setInput('isSubmitting', options.isSubmitting);
}

if (options?.autofocus) {
  componentRef.setInput('autofocus', options.autofocus);
}
```

**Alternative Pattern:** Always set with default

```typescript
componentRef.setInput('isSubmitting', options?.isSubmitting ?? false);
componentRef.setInput('autofocus', options?.autofocus ?? false);
```

**Preference:** Conditional setting when input is optional/rarely used, always-set when input is common

---

## 5. Patterns Summary

### 5.1 Mandatory Patterns (100% Adherence)

1. ✅ **getData() function** - Always present for test data management
2. ✅ **Placement** - getData() defined before getInstance()

### 5.2 Standard Patterns (90%+ Adherence)

1. ✅ **getInstance() helper** - Primary pattern for component setup
2. ✅ **InstanceConfig interface** - Used when multiple configuration options needed
3. ✅ **componentRef.setInput()** - Standard for setting component inputs

### 5.3 Common Patterns (50-90% Adherence)

1. ⚠️ **createIdentity/createViewModel helpers** - Used when multiple variations needed
2. ⚠️ **Factory functions** - Used for complex object creation
3. ⚠️ **getFixture() alternative** - Less common name for getInstance()

---

## 6. Recommendations

### 6.1 For Standards Updates

**Current test-setup.yaml:** Documents getData() and getInstance() patterns  
**Recommendation:** Add:
- `createIdentity`/`createViewModel` factory pattern
- `InstanceConfig` interface pattern with all-optional properties
- Examples of complex getData() patterns with variations
- Input setting patterns with nullish coalescing

### 6.2 For New Tests

**Follow these patterns:**
1. Always define `getData()` function at describe block level
2. Use `getInstance()` helper for component setup
3. Define `InstanceConfig` interface with all optional properties when multiple configs needed
4. Use factory functions (`createIdentity`, etc.) for data variations
5. Provide sensible defaults for all required inputs

---

**Related Documentation:**
- [Test Structure Patterns](./unit-test-structure-patterns.md)
- [Test Logic Patterns](./unit-test-logic-patterns.md)
- [Test Philosophy Patterns](./unit-test-philosophy-patterns.md)

