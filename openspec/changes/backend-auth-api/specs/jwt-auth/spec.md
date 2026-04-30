## ADDED Requirements

### Requirement: Auth route module registers under /api/auth
The backend SHALL expose an Express Router mounted at `/api/auth` that handles all authentication endpoints.

#### Scenario: Auth router is mounted on the Express app
- **WHEN** inspecting `apps/backend/src/index.ts`
- **THEN** the auth router from `src/routes/auth.ts` is registered at the `/api/auth` path

#### Scenario: Unknown auth sub-routes return 404
- **WHEN** a client sends `GET /api/auth/unknown`
- **THEN** the server responds with HTTP 404

### Requirement: Users can register with email, name, and password
The system SHALL allow new users to create an account by sending a POST request to `/api/auth/register` with a JSON body containing `email`, `name`, and `password`. On success the server creates the user, returns the user object (without password), and sets a JWT httpOnly cookie.

#### Scenario: Successful registration
- **WHEN** a client sends `POST /api/auth/register` with `{ "email": "alice@example.com", "name": "Alice", "password": "securepass1" }`
- **THEN** the server responds with HTTP 201 and body `{ "user": { "id": "<uuid>", "email": "alice@example.com", "name": "Alice", "createdAt": "<iso>", "updatedAt": "<iso>" } }`
- **THEN** the response sets a `token` cookie that is httpOnly, has path `/`, sameSite `lax`, and maxAge of 7 days

#### Scenario: Registration fails when email already exists
- **WHEN** a user with email `alice@example.com` already exists in the database
- **WHEN** a client sends `POST /api/auth/register` with `{ "email": "alice@example.com", "name": "Alice2", "password": "pass1234" }`
- **THEN** the server responds with HTTP 409 and body `{ "error": "Email already exists" }`

#### Scenario: Registration fails with invalid body
- **WHEN** a client sends `POST /api/auth/register` with `{ "email": "not-an-email" }`
- **THEN** the server responds with HTTP 400 and body `{ "error": "Validation failed", "details": { ... } }` containing field-level errors from Zod

### Requirement: Users can log in with email and password
The system SHALL allow existing users to authenticate by sending a POST request to `/api/auth/login` with `email` and `password`. On success the server returns the user object (without password) and sets a JWT httpOnly cookie.

#### Scenario: Successful login
- **WHEN** a client sends `POST /api/auth/login` with `{ "email": "test@example.com", "password": "password123" }` and the user exists with a matching password hash
- **THEN** the server responds with HTTP 200 and body `{ "user": { "id": "<uuid>", "email": "test@example.com", "name": "Test User", "createdAt": "<iso>", "updatedAt": "<iso>" } }`
- **THEN** the response sets a `token` httpOnly cookie with the same attributes as registration

#### Scenario: Login fails with wrong password
- **WHEN** a client sends `POST /api/auth/login` with `{ "email": "test@example.com", "password": "wrongpass" }`
- **THEN** the server responds with HTTP 401 and body `{ "error": "Invalid credentials" }`

#### Scenario: Login fails with non-existent email
- **WHEN** a client sends `POST /api/auth/login` with `{ "email": "nobody@example.com", "password": "any" }`
- **THEN** the server responds with HTTP 401 and body `{ "error": "Invalid credentials" }`

#### Scenario: Login fails with invalid body
- **WHEN** a client sends `POST /api/auth/login` with `{}` (empty body)
- **THEN** the server responds with HTTP 400 and body `{ "error": "Validation failed", "details": { ... } }`

### Requirement: Users can log out
The system SHALL allow users to log out by sending a POST request to `/api/auth/logout`. The server clears the `token` cookie.

#### Scenario: Successful logout
- **WHEN** a client sends `POST /api/auth/logout`
- **THEN** the server responds with HTTP 200 and body `{ "message": "Logged out" }`
- **THEN** the response clears the `token` cookie (sets maxAge to 0 or uses `clearCookie`)

#### Scenario: Logout succeeds even without an existing cookie
- **WHEN** a client sends `POST /api/auth/logout` with no `token` cookie present
- **THEN** the server still responds with HTTP 200 and body `{ "message": "Logged out" }`

### Requirement: Authenticated users can retrieve their profile
The system SHALL allow authenticated users to retrieve their current user data by sending a GET request to `/api/auth/me`. The auth middleware verifies the JWT from the `token` cookie and attaches the user to the request.

#### Scenario: Successful profile retrieval
- **WHEN** a client sends `GET /api/auth/me` with a valid `token` cookie
- **THEN** the server responds with HTTP 200 and body `{ "user": { "id": "<uuid>", "email": "...", "name": "...", "createdAt": "<iso>", "updatedAt": "<iso>" } }`

#### Scenario: Profile request fails without cookie
- **WHEN** a client sends `GET /api/auth/me` with no `token` cookie
- **THEN** the server responds with HTTP 401 and body `{ "error": "Not authenticated" }`

#### Scenario: Profile request fails with expired or invalid JWT
- **WHEN** a client sends `GET /api/auth/me` with a `token` cookie containing an expired or tampered JWT
- **THEN** the server responds with HTTP 401 and body `{ "error": "Not authenticated" }`

### Requirement: Auth middleware verifies JWT from httpOnly cookie
The auth middleware SHALL read the `token` cookie, verify it using the JWT secret, look up the user in the database, and attach `{ id, email, name }` to `req.user`. If verification fails the middleware SHALL respond with 401 without calling the next handler.

#### Scenario: Valid token attaches user to request
- **WHEN** a request with a valid `token` cookie reaches the auth middleware
- **THEN** the middleware fetches the user from the database using the `sub` claim from the JWT
- **THEN** `req.user` is set to `{ id, email, name }` and the next handler is called

#### Scenario: Missing token returns 401
- **WHEN** a request without a `token` cookie reaches the auth middleware
- **THEN** the middleware responds with HTTP 401 and body `{ "error": "Not authenticated" }` and does NOT call next

#### Scenario: Token with deleted user returns 401
- **WHEN** a request has a valid JWT whose `sub` no longer exists in the database
- **THEN** the middleware responds with HTTP 401 and body `{ "error": "Not authenticated" }`

### Requirement: JWT helper signs and verifies tokens
The `src/lib/jwt.ts` module SHALL export `signToken(userId: string): string` and `verifyToken(token: string): { sub: string }` functions. Tokens are signed with `process.env.JWT_SECRET` (falling back to a dev default) and expire in 7 days. The JWT payload uses the standard `sub` claim to carry the user ID.

#### Scenario: signToken produces a valid JWT
- **WHEN** `signToken("user-123")` is called
- **THEN** it returns a JWT string whose payload contains `{ sub: "user-123" }` and whose expiry is 7 days from now

#### Scenario: verifyToken decodes a valid token
- **WHEN** `verifyToken` is called with a token produced by `signToken`
- **THEN** it returns `{ sub: "user-123" }` matching the original claim

#### Scenario: verifyToken throws on invalid token
- **WHEN** `verifyToken` is called with a malformed or tampered string
- **THEN** it throws an error

### Requirement: Zod validation middleware rejects invalid request bodies
The `src/middleware/validate.ts` module SHALL export a `validate(schema)` middleware factory. When the request body does not conform to the given Zod schema, the middleware responds with HTTP 400 and a structured error; otherwise it parses the body and calls next.

#### Scenario: Valid body passes through
- **WHEN** a request body matches the provided Zod schema
- **THEN** `req.body` is replaced with the parsed (typed) data and the next handler is called

#### Scenario: Invalid body returns 400 with field errors
- **WHEN** a request body does NOT match the provided Zod schema
- **THEN** the middleware responds with HTTP 400 and body `{ "error": "Validation failed", "details": { "<field>": ["<message>", ...] } }`

### Requirement: User responses never include the password field
ALL auth endpoints that return a user object SHALL exclude the `password` field from the response body.

#### Scenario: Register response omits password
- **WHEN** a successful registration response is returned
- **THEN** the `user` object does NOT contain a `password` property

#### Scenario: Login response omits password
- **WHEN** a successful login response is returned
- **THEN** the `user` object does NOT contain a `password` property

#### Scenario: Me response omits password
- **WHEN** a successful `/api/auth/me` response is returned
- **THEN** the `user` object does NOT contain a `password` property

### Requirement: Passwords are hashed with bcrypt before storage
The system SHALL hash passwords using bcryptjs with a cost factor of 10 before storing them in the database. Plain-text passwords SHALL never be persisted.

#### Scenario: Registration stores hashed password
- **WHEN** a user registers with password `"securepass1"`
- **THEN** the database `User.password` field contains a bcrypt hash (starting with `$2a$` or `$2b$`), not the plain text

#### Scenario: Login compares against stored hash
- **WHEN** a user logs in with the correct plain-text password
- **THEN** the system uses `bcryptjs.compare` to verify it against the stored hash

### Requirement: CORS allows MFE origins with credentials
The Express app SHALL configure CORS to allow origins `http://localhost:3000`, `http://localhost:3001`, and `http://localhost:3002` with `credentials: true` so that browsers send cookies cross-origin.

#### Scenario: Preflight request from host app is allowed
- **WHEN** a browser sends an OPTIONS preflight request from `http://localhost:3000`
- **THEN** the server responds with `Access-Control-Allow-Origin: http://localhost:3000` and `Access-Control-Allow-Credentials: true`

#### Scenario: Request from unknown origin is rejected
- **WHEN** a browser sends a request with `Origin: http://evil.com`
- **THEN** the CORS middleware does NOT set `Access-Control-Allow-Origin` for that origin

### Requirement: Cookie-parser middleware is registered globally
The Express app SHALL use the `cookie-parser` middleware so that `req.cookies` is populated on every request before route handlers execute.

#### Scenario: Cookies are parsed on incoming requests
- **WHEN** a request with a `Cookie` header containing `token=abc123` reaches a route handler
- **THEN** `req.cookies.token` equals `"abc123"`

### Requirement: Error responses follow a consistent shape
All error responses from auth endpoints SHALL use the shape `{ "error": "<message>" }` for simple errors and `{ "error": "<message>", "details": { ... } }` for validation errors.

#### Scenario: Validation error shape
- **WHEN** any auth endpoint returns a 400 validation error
- **THEN** the response body contains `{ "error": "Validation failed", "details": { "<field>": ["<message>"] } }`

#### Scenario: Domain error shape
- **WHEN** any auth endpoint returns a 401, 409, or other domain error
- **THEN** the response body contains `{ "error": "<human-readable message>" }` with no `details` field

### Requirement: Middleware pipeline is applied in correct order
The Express app SHALL apply global middleware in this order: cookie-parser → cors → express.json → routes → error handler. Auth middleware is applied per-route, not globally.

#### Scenario: Middleware order in index.ts
- **WHEN** inspecting `apps/backend/src/index.ts`
- **THEN** `cookieParser()` is registered before `cors()`, which is registered before `express.json()`, which is registered before route mounting

#### Scenario: Auth middleware is not global
- **WHEN** inspecting `apps/backend/src/index.ts`
- **THEN** the auth middleware is NOT applied via `app.use()` at the global level; it is used selectively on individual routes within the auth router
