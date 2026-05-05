## ADDED Requirements

### Requirement: ProfilePage fetches current user via useMe query hook
The account MFE SHALL provide a `ProfilePage` component at `apps/account/src/pages/ProfilePage.tsx` that displays the authenticated user's profile information by calling `useMe()` from `@mfe/api`.

#### Scenario: ProfilePage fetches user on mount
- **WHEN** the `ProfilePage` component mounts
- **THEN** it SHALL call `useMe()` from `@mfe/api` to fetch the current user's data
- **AND** it SHALL NOT read user data from the Zustand store for display (per ADR-002: server data in TanStack Query)

#### Scenario: ProfilePage displays user information
- **WHEN** the `useMe` query resolves successfully with `{ user: { id, email, name, createdAt } }`
- **THEN** the page SHALL display the user's name
- **AND** the page SHALL display the user's email
- **AND** the page SHALL display the user's member-since date (formatted from `createdAt`)

### Requirement: ProfilePage shows loading state while fetching
The `ProfilePage` SHALL display a loading indicator while the `useMe` query is in a pending state.

#### Scenario: Loading spinner during fetch
- **WHEN** the `useMe` query is pending (loading)
- **THEN** the page SHALL render a `Spinner` component from `@mfe/ui`
- **AND** the page SHALL NOT render the user profile content

### Requirement: ProfilePage handles error state
The `ProfilePage` SHALL display an error message if the `useMe` query fails.

#### Scenario: Error state displays alert
- **WHEN** the `useMe` query fails (e.g., 401 Unauthorized)
- **THEN** the page SHALL render an `Alert` component from `@mfe/ui` with a descriptive error message
- **AND** the page SHALL NOT render stale user profile content

### Requirement: ProfilePage uses Card layout from @mfe/ui
The `ProfilePage` SHALL render user information inside a `Card` component from `@mfe/ui` for consistent visual styling.

#### Scenario: Profile card structure
- **WHEN** the `useMe` query has resolved successfully
- **THEN** the page SHALL render a `<Card>` containing `<CardHeader>` with `<CardTitle>` and `<CardContent>` with user details
- **AND** the card SHALL use semantic color tokens (e.g., `text-muted-foreground` for secondary info)

### Requirement: ProfilePage does not import axios or apiClient directly
The `ProfilePage` SHALL use only the `useMe` hook from `@mfe/api` for data fetching. It SHALL NOT import `axios` or `apiClient` directly.

#### Scenario: No direct API client usage
- **WHEN** inspecting `ProfilePage.tsx` imports
- **THEN** it SHALL import `useMe` from `@mfe/api`
- **AND** it SHALL NOT import `axios`, `apiClient`, or any HTTP client
