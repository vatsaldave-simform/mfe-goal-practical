## ADDED Requirements

### Requirement: Shell layout renders `<Toaster>` component
The host shell layout (or `App.tsx`) SHALL render exactly one `<Toaster>` component from `@mfe/ui` at the root level of the React tree, outside the route outlet.

#### Scenario: Toaster is present in the host DOM
- **WHEN** the host application initialises
- **THEN** a single `<Toaster>` portal element is present in the document

### Requirement: Logout action triggers toast notification
The logout action in the host navigation SHALL call `toast.success("Logged out")` after the logout mutation completes.

#### Scenario: Logout shows confirmation toast
- **WHEN** the user clicks the logout button and the logout mutation succeeds
- **THEN** a `toast.success` notification with a logout confirmation message is displayed
