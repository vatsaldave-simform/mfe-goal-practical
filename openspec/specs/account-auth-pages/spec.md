## ADDED Requirements

### Requirement: LoginPage renders a login form with email and password fields
The account MFE SHALL provide a `LoginPage` component at `apps/account/src/pages/LoginPage.tsx` that renders a form with email and password inputs.

#### Scenario: Login form renders all required fields
- **WHEN** the `LoginPage` component mounts
- **THEN** it SHALL render an email input field with type `email`
- **AND** it SHALL render a password input field with type `password`
- **AND** it SHALL render a submit button with text "Log in"
- **AND** it SHALL render a link to the register page

#### Scenario: Login form uses shadcn Field pattern
- **WHEN** inspecting the login form markup
- **THEN** each form field SHALL be wrapped in `<Field>` with `<FieldLabel>` and `<FieldError>` components from `@mfe/ui`
- **AND** the form SHALL be wrapped in `<FieldGroup>` from `@mfe/ui`

### Requirement: LoginPage validates input with loginSchema via zodResolver
The `LoginPage` SHALL use React Hook Form with `zodResolver(loginSchema)` where `loginSchema` is imported from `@mfe/shared`.

#### Scenario: Login form prevents submission with invalid email
- **WHEN** a user enters "not-an-email" in the email field and submits
- **THEN** the form SHALL display a validation error on the email field
- **AND** the form SHALL NOT call the login mutation

#### Scenario: Login form prevents submission with empty password
- **WHEN** a user submits the form with an empty password field
- **THEN** the form SHALL display a validation error on the password field
- **AND** the form SHALL NOT call the login mutation

#### Scenario: Login form accepts valid input
- **WHEN** a user enters a valid email and non-empty password and submits
- **THEN** the form SHALL call the login mutation with the form data

### Requirement: LoginPage calls useLogin mutation on valid submission
The `LoginPage` SHALL use the `useLogin` hook from `@mfe/api` to authenticate the user.

#### Scenario: Successful login updates store and navigates
- **WHEN** the login mutation succeeds with a response containing `{ user: SafeUser }`
- **THEN** the page SHALL call `setAuth(response.user)` from `@mfe/store`
- **AND** the page SHALL call `navigate("/")` to redirect to the home page

#### Scenario: Failed login displays server error
- **WHEN** the login mutation fails with an error response
- **THEN** the page SHALL display the error message in an `Alert` component from `@mfe/ui`
- **AND** the form SHALL remain editable for retry

#### Scenario: Login button shows loading state during submission
- **WHEN** the login mutation is pending
- **THEN** the submit button SHALL be disabled
- **AND** the submit button SHALL display a loading indicator

### Requirement: RegisterPage renders a registration form with email, password, and name fields
The account MFE SHALL provide a `RegisterPage` component at `apps/account/src/pages/RegisterPage.tsx` that renders a form with name, email, and password inputs.

#### Scenario: Register form renders all required fields
- **WHEN** the `RegisterPage` component mounts
- **THEN** it SHALL render a name input field
- **AND** it SHALL render an email input field with type `email`
- **AND** it SHALL render a password input field with type `password`
- **AND** it SHALL render a submit button with text "Create account"
- **AND** it SHALL render a link to the login page

#### Scenario: Register form uses shadcn Field pattern
- **WHEN** inspecting the register form markup
- **THEN** each form field SHALL be wrapped in `<Field>` with `<FieldLabel>` and `<FieldError>` components from `@mfe/ui`
- **AND** the form SHALL be wrapped in `<FieldGroup>` from `@mfe/ui`

### Requirement: RegisterPage validates input with registerSchema via zodResolver
The `RegisterPage` SHALL use React Hook Form with `zodResolver(registerSchema)` where `registerSchema` is imported from `@mfe/shared`.

#### Scenario: Register form rejects short password
- **WHEN** a user enters a password shorter than 6 characters and submits
- **THEN** the form SHALL display a validation error on the password field
- **AND** the form SHALL NOT call the register mutation

#### Scenario: Register form rejects empty name
- **WHEN** a user submits the form with an empty name field
- **THEN** the form SHALL display a validation error on the name field

#### Scenario: Register form rejects invalid email
- **WHEN** a user enters "not-an-email" in the email field and submits
- **THEN** the form SHALL display a validation error on the email field

#### Scenario: Register form accepts valid input
- **WHEN** a user enters a valid name, valid email, and password of 6+ characters and submits
- **THEN** the form SHALL call the register mutation with the form data

### Requirement: RegisterPage calls useRegister mutation on valid submission
The `RegisterPage` SHALL use the `useRegister` hook from `@mfe/api` to create a new account.

#### Scenario: Successful registration updates store and navigates
- **WHEN** the register mutation succeeds with a response containing `{ user: SafeUser }`
- **THEN** the page SHALL call `setAuth(response.user)` from `@mfe/store`
- **AND** the page SHALL call `navigate("/")` to redirect to the home page

#### Scenario: Failed registration displays server error
- **WHEN** the register mutation fails (e.g., email already exists)
- **THEN** the page SHALL display the error message in an `Alert` component from `@mfe/ui`
- **AND** the form SHALL remain editable for retry

#### Scenario: Register button shows loading state during submission
- **WHEN** the register mutation is pending
- **THEN** the submit button SHALL be disabled
- **AND** the submit button SHALL display a loading indicator

### Requirement: Auth pages use only @mfe/api hooks for HTTP requests
Both `LoginPage` and `RegisterPage` SHALL use mutation hooks from `@mfe/api` (`useLogin`, `useRegister`) for all HTTP requests. They SHALL NOT import `axios` or `apiClient` directly.

#### Scenario: LoginPage imports useLogin from @mfe/api
- **WHEN** inspecting `LoginPage.tsx` imports
- **THEN** it SHALL import `useLogin` from `@mfe/api`
- **AND** it SHALL NOT import `axios` or `apiClient`

#### Scenario: RegisterPage imports useRegister from @mfe/api
- **WHEN** inspecting `RegisterPage.tsx` imports
- **THEN** it SHALL import `useRegister` from `@mfe/api`
- **AND** it SHALL NOT import `axios` or `apiClient`

### Requirement: Auth pages use Zustand store for auth state only via useStore
Both `LoginPage` and `RegisterPage` SHALL access the `setAuth` action via `useStore` from `@mfe/store`. They SHALL NOT store server response data, tokens, or form state in Zustand.

#### Scenario: LoginPage accesses setAuth from useStore
- **WHEN** inspecting `LoginPage.tsx`
- **THEN** it SHALL use `useStore((s) => s.setAuth)` or equivalent selector
- **AND** it SHALL NOT put form values or API response data into the store (only the `user` object via `setAuth`)

#### Scenario: RegisterPage accesses setAuth from useStore
- **WHEN** inspecting `RegisterPage.tsx`
- **THEN** it SHALL use `useStore((s) => s.setAuth)` or equivalent selector

### Requirement: Auth pages extract error messages from AxiosError responses
Both `LoginPage` and `RegisterPage` SHALL extract the error message from the API error response body (`error.response.data.error`) for display, falling back to a generic message when the response shape is unexpected.

#### Scenario: Known API error is displayed
- **WHEN** the mutation fails with an Axios error containing `response.data.error` of `"Email already exists"`
- **THEN** the page SHALL display `"Email already exists"` in the error alert

#### Scenario: Unknown error falls back to generic message
- **WHEN** the mutation fails with an error that has no `response.data.error`
- **THEN** the page SHALL display a generic fallback message like `"Something went wrong. Please try again."`
