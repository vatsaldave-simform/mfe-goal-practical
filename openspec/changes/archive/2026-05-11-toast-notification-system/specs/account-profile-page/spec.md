## ADDED Requirements

### Requirement: Profile fetch error uses toast instead of inline error
The profile page SHALL NOT render an inline error message when the `/me` query fails. The error SHALL be communicated via `toast.error(…)`.

#### Scenario: Inline error is removed from profile page
- **WHEN** the `/me` API query fails
- **THEN** no inline error text is rendered on the profile page
- **THEN** a `toast.error` notification is displayed with the error message or fallback
