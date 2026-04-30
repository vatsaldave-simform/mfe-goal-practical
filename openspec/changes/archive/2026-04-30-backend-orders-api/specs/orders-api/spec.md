## ADDED Requirements

### Requirement: GET /api/orders returns the authenticated user's orders sorted by newest first
The `GET /api/orders` endpoint SHALL require authentication (JWT httpOnly cookie). It SHALL return all orders belonging to the authenticated user, sorted by `createdAt` descending. Each order in the list SHALL include its `id`, `status`, `total`, `itemCount` (sum of item quantities), and `createdAt`. The response SHALL NOT include the full `items` array in the list view (use detail endpoint for that).

#### Scenario: Authenticated user with orders
- **WHEN** an authenticated GET request is made to `/api/orders`
- **THEN** the response status is 200
- **THEN** the response body contains `{ "orders": [...] }` with an array of order summaries
- **THEN** each order contains `id` (UUID string), `status` (OrderStatus string), `total` (number in cents), `itemCount` (number), and `createdAt` (ISO 8601 string)
- **THEN** orders are sorted by `createdAt` descending (newest first)

#### Scenario: Authenticated user with no orders
- **WHEN** an authenticated GET request is made to `/api/orders` and the user has never placed an order
- **THEN** the response status is 200
- **THEN** the response body contains `{ "orders": [] }`

#### Scenario: Unauthenticated request
- **WHEN** a GET request is made to `/api/orders` without a valid auth cookie
- **THEN** the response status is 401
- **THEN** the response body contains `{ "error": "Not authenticated" }`

### Requirement: GET /api/orders/:id returns a single order with full item details
The `GET /api/orders/:id` endpoint SHALL require authentication. It SHALL return the order only if it belongs to the authenticated user. The response SHALL include the full order object with all `items` and their snapshotted `name` and `price`.

#### Scenario: Fetch own order by ID
- **WHEN** an authenticated GET request is made to `/api/orders/:id` with a valid order ID belonging to the user
- **THEN** the response status is 200
- **THEN** the response body contains `id`, `userId`, `status`, `total` (number in cents), `createdAt`, and `items` (array)
- **THEN** each item in `items` contains `id`, `productId`, `name` (snapshotted string), `price` (snapshotted number in cents), and `quantity` (number)
- **THEN** `total` equals the sum of `price * quantity` for all items

#### Scenario: Order belongs to another user
- **WHEN** an authenticated GET request is made to `/api/orders/:id` with an order ID that belongs to a different user
- **THEN** the response status is 404
- **THEN** the response body contains `{ "error": "Order not found" }`

#### Scenario: Order ID does not exist
- **WHEN** an authenticated GET request is made to `/api/orders/:id` with a UUID that does not match any order
- **THEN** the response status is 404
- **THEN** the response body contains `{ "error": "Order not found" }`

#### Scenario: Invalid order ID format
- **WHEN** an authenticated GET request is made to `/api/orders/:id` where `:id` is not a valid UUID
- **THEN** the response status is 400
- **THEN** the response body contains a validation error

### Requirement: POST /api/orders creates an order from the user's cart with snapshotted item data
The `POST /api/orders` endpoint SHALL require authentication. It SHALL read the user's current cart, create an Order with OrderItems that snapshot each product's `name` and `price` at the time of order creation, compute `total` as the sum of `price * quantity` across all items, and clear the user's cart items. The entire operation SHALL execute inside a database transaction. The new order SHALL have status `pending`.

#### Scenario: Successful order creation from cart
- **WHEN** an authenticated POST request is made to `/api/orders` and the user's cart contains items
- **THEN** the response status is 201
- **THEN** a new Order is created with `status` set to `"pending"`
- **THEN** OrderItems are created for each cart item, with `name` and `price` copied from the Product at order time
- **THEN** the order's `total` equals the sum of `snapshotted price * quantity` for all items
- **THEN** all CartItems in the user's cart are deleted
- **THEN** the response body contains the created order with `id`, `status`, `total`, `createdAt`, and `items` array

#### Scenario: Cart is empty
- **WHEN** an authenticated POST request is made to `/api/orders` and the user's cart has no items (or no cart exists)
- **THEN** the response status is 400
- **THEN** the response body contains `{ "error": "Cart is empty" }`
- **THEN** no Order is created

#### Scenario: Atomicity — cart cleared only on successful order creation
- **WHEN** an authenticated POST request is made to `/api/orders`
- **THEN** the order creation and cart clearing happen inside a single database transaction
- **THEN** if any step fails, neither the order is created nor the cart items are removed

### Requirement: Order and OrderItem Prisma models with status tracking
The Prisma schema SHALL define `Order` and `OrderItem` models. `Order` SHALL have a `status` field defaulting to `"pending"` with valid values `pending`, `confirmed`, `shipped`, `delivered`. `OrderItem` SHALL store snapshotted `name` (string) and `price` (integer, cents) columns that are immutable after creation.

#### Scenario: Order model fields
- **WHEN** an Order record is created
- **THEN** it SHALL have fields: `id` (UUID, auto-generated), `userId` (string, FK to User), `status` (string, default `"pending"`), `total` (integer, cents), `createdAt` (DateTime, auto-generated)
- **THEN** the `userId` + ordering establishes a one-to-many relationship (User has many Orders)

#### Scenario: OrderItem model fields
- **WHEN** an OrderItem record is created
- **THEN** it SHALL have fields: `id` (UUID, auto-generated), `orderId` (string, FK to Order), `productId` (string, FK to Product), `name` (string, snapshotted product name), `price` (integer, snapshotted product price in cents), `quantity` (integer, min 1)
- **THEN** deleting an Order SHALL cascade-delete its OrderItems

#### Scenario: OrderStatus valid values
- **WHEN** an Order's `status` field is set
- **THEN** it SHALL only accept the values: `"pending"`, `"confirmed"`, `"shipped"`, `"delivered"`
- **THEN** new orders default to `"pending"`
