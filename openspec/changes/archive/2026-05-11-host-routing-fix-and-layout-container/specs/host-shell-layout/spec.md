## MODIFIED Requirements

### Requirement: ShellLayout wraps children in PageContainer

`ShellLayout` must apply `PageContainer` around its `{children}` so all routed content (pages and skeleton fallbacks) are bounded by the shared max-width layout column.

#### Scenario: All page content is max-width bounded

- **WHEN** any route renders inside `ShellLayout`
- **THEN** its content is horizontally centered with max-width constraint
- **AND** the content does not extend edge-to-edge on wide screens

#### Scenario: Skeleton fallbacks respect the same boundary

- **WHEN** a remote MFE is loading and `RemoteSkeleton` renders as the Suspense fallback
- **THEN** the skeleton is bounded by `PageContainer` — not full-width
