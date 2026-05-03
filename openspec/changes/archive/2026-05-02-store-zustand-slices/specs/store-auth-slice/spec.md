## ADDED Requirements

### Requirement: Auth slice exposes isAuthenticated boolean
The auth slice SHALL expose an `isAuthenticated` field of type `boolean` that defaults to `false`.

#### Scenario: Default unauthenticated state
- **WHEN** the store is created without any prior actions
- **THEN** `isAuthenticated` SHALL be `false`

#### Scenario: Authenticated after setAuth
- **WHEN** `setAuth` is called with a valid `SafeUser` object
- **THEN** `isAuthenticated` SHALL be `true`

### Requirement: Auth slice exposes user object
The auth slice SHALL expose a `user` field of type `SafeUser | null` (where `SafeUser` is imported from `@mfe/shared`) that defaults to `null`.

#### Scenario: Default null user
- **WHEN** the store is created without any prior actions
- **THEN** `user` SHALL be `null`

#### Scenario: User populated after setAuth
- **WHEN** `setAuth` is called with `{ id: "1", email: "a@b.com", name: "Alice", createdAt: "2026-01-01" }`
- **THEN** `user` SHALL equal that exact object

### Requirement: setAuth action sets authenticated state
The auth slice SHALL expose a `setAuth(user: SafeUser)` action that sets `isAuthenticated` to `true` and `user` to the provided `SafeUser`.

#### Scenario: Login flow sets auth
- **WHEN** `setAuth({ id: "1", email: "a@b.com", name: "Alice", createdAt: "2026-01-01" })` is called
- **THEN** `isAuthenticated` SHALL be `true` AND `user` SHALL be `{ id: "1", email: "a@b.com", name: "Alice", createdAt: "2026-01-01" }`

### Requirement: clearAuth action resets to unauthenticated
The auth slice SHALL expose a `clearAuth()` action that sets `isAuthenticated` to `false` and `user` to `null`.

#### Scenario: Logout flow clears auth
- **WHEN** `setAuth(someUser)` has been called, then `clearAuth()` is called
- **THEN** `isAuthenticated` SHALL be `false` AND `user` SHALL be `null`

### Requirement: Auth slice does not store JWT tokens
The auth slice SHALL NOT include any field for storing JWT tokens, refresh tokens, or any authentication credential. Per ADR-003, tokens are managed via httpOnly cookies.

#### Scenario: No token fields in auth state
- **WHEN** inspecting the `AuthSlice` type definition
- **THEN** there SHALL be no `token`, `accessToken`, `refreshToken`, or similar credential field
