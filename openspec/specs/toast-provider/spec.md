## ADDED Requirements

### Requirement: Toaster is mounted once in host shell
The host application SHALL mount exactly one `<Toaster>` component in its root render tree, outside the route `<Outlet>`, so that toast notifications are available across all MFE remotes loaded at runtime.

#### Scenario: Host renders without duplicate toasters
- **WHEN** the host application renders
- **THEN** exactly one `<Toaster>` element is present in the DOM

#### Scenario: Remote MFE can trigger toasts
- **WHEN** a remote MFE calls `toast.success("…")` or `toast.error("…")`
- **THEN** the toast is displayed via the host-mounted `<Toaster>`
