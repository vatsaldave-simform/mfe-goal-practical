## ADDED Requirements

### Requirement: GET /api/cart returns the authenticated user's cart with items and totals
The `GET /api/cart` endpoint SHALL require authentication. It SHALL return the current user's cart including all items with joined product data, a computed `total` (in cents), and an `itemCount`. If the user has no cart yet, it SHALL return an empty cart structure.

#### Scenario: Authenticated user with items in cart
- **WHEN** an authenticated GET request is made to `/api/cart`
- **THEN** the response status is 200
- **THEN** the response body contains `id` (cart UUID), `items` (array of cart items), `total` (number in cents), and `itemCount` (sum of quantities)
- **THEN** each item in `items` contains `id`, `productId`, `quantity`, and a `product` object with `id`, `name`, `price`, and `image`
- **THEN** `total` equals the sum of `quantity * product.price` for all items
- **THEN** `itemCount` equals the sum of all item quantities

#### Scenario: Authenticated user with no cart
- **WHEN** an authenticated GET request is made to `/api/cart` and the user has never added items
- **THEN** the response status is 200
- **THEN** the response body contains `id` as `null`, `items` as an empty array, `total` as 0, and `itemCount` as 0

#### Scenario: Unauthenticated request
- **WHEN** a GET request is made to `/api/cart` without a valid auth cookie
- **THEN** the response status is 401
- **THEN** the response body contains `{ "error": "Not authenticated" }`

### Requirement: POST /api/cart/items adds a product to the user's cart
The `POST /api/cart/items` endpoint SHALL require authentication. It SHALL accept `productId` (string, required) and `quantity` (integer, min 1, default 1) in the request body. It SHALL create the user's cart if it does not exist. If the product already exists in the cart, it SHALL increment the quantity by the provided amount.

#### Scenario: Add new product to cart (cart does not exist)
- **WHEN** an authenticated POST request is made to `/api/cart/items` with `{ "productId": "<valid-product-id>", "quantity": 2 }`
- **THEN** the response status is 201
- **THEN** a new Cart is created for the user
- **THEN** a CartItem is created with the specified productId and quantity 2
- **THEN** the response body contains the created cart item with `id`, `productId`, `quantity`, and joined `product` data

#### Scenario: Add new product to existing cart
- **WHEN** an authenticated POST request is made to `/api/cart/items` with `{ "productId": "<valid-product-id>" }` (no quantity specified)
- **THEN** the response status is 201
- **THEN** a CartItem is created with quantity defaulting to 1
- **THEN** the response body contains the created cart item

#### Scenario: Add product that already exists in cart (upsert)
- **WHEN** an authenticated POST request is made to `/api/cart/items` with a productId that already exists in the user's cart and `{ "quantity": 3 }`
- **THEN** the response status is 200
- **THEN** the existing CartItem's quantity is incremented by 3
- **THEN** the response body contains the updated cart item with the new total quantity

#### Scenario: Invalid productId (product does not exist)
- **WHEN** an authenticated POST request is made to `/api/cart/items` with a productId that does not exist in the database
- **THEN** the response status is 404
- **THEN** the response body contains `{ "error": "Product not found" }`

#### Scenario: Invalid request body (validation error)
- **WHEN** an authenticated POST request is made to `/api/cart/items` with missing `productId` or `quantity` less than 1
- **THEN** the response status is 400
- **THEN** the response body contains a validation error message

#### Scenario: Unauthenticated request
- **WHEN** a POST request is made to `/api/cart/items` without a valid auth cookie
- **THEN** the response status is 401

### Requirement: PATCH /api/cart/items/:id updates item quantity
The `PATCH /api/cart/items/:id` endpoint SHALL require authentication. It SHALL accept `quantity` (integer, min 1) in the request body. It SHALL only allow updating items that belong to the authenticated user's cart.

#### Scenario: Update quantity of own cart item
- **WHEN** an authenticated PATCH request is made to `/api/cart/items/<item-id>` with `{ "quantity": 5 }`
- **THEN** the response status is 200
- **THEN** the CartItem's quantity is set to 5
- **THEN** the response body contains the updated cart item with `id`, `productId`, `quantity`, and joined `product` data

#### Scenario: Item does not exist
- **WHEN** an authenticated PATCH request is made to `/api/cart/items/<non-existent-id>` with `{ "quantity": 2 }`
- **THEN** the response status is 404
- **THEN** the response body contains `{ "error": "Cart item not found" }`

#### Scenario: Item belongs to another user
- **WHEN** an authenticated PATCH request is made to `/api/cart/items/<item-id>` where the item belongs to a different user's cart
- **THEN** the response status is 404
- **THEN** the response body contains `{ "error": "Cart item not found" }`

#### Scenario: Invalid quantity (validation error)
- **WHEN** an authenticated PATCH request is made to `/api/cart/items/<item-id>` with `{ "quantity": 0 }` or `{ "quantity": -1 }`
- **THEN** the response status is 400
- **THEN** the response body contains a validation error message

#### Scenario: Unauthenticated request
- **WHEN** a PATCH request is made to `/api/cart/items/<item-id>` without a valid auth cookie
- **THEN** the response status is 401

### Requirement: DELETE /api/cart/items/:id removes an item from the cart
The `DELETE /api/cart/items/:id` endpoint SHALL require authentication. It SHALL only allow deleting items belonging to the authenticated user's cart. It SHALL return `{ "message": "Item removed" }` on success.

#### Scenario: Delete own cart item
- **WHEN** an authenticated DELETE request is made to `/api/cart/items/<item-id>`
- **THEN** the response status is 200
- **THEN** the CartItem is removed from the database
- **THEN** the response body contains `{ "message": "Item removed" }`

#### Scenario: Item does not exist
- **WHEN** an authenticated DELETE request is made to `/api/cart/items/<non-existent-id>`
- **THEN** the response status is 404
- **THEN** the response body contains `{ "error": "Cart item not found" }`

#### Scenario: Item belongs to another user
- **WHEN** an authenticated DELETE request is made to `/api/cart/items/<item-id>` where the item belongs to a different user's cart
- **THEN** the response status is 404
- **THEN** the response body contains `{ "error": "Cart item not found" }`

#### Scenario: Unauthenticated request
- **WHEN** a DELETE request is made to `/api/cart/items/<item-id>` without a valid auth cookie
- **THEN** the response status is 401

### Requirement: Cart and CartItem data models exist in Prisma schema
The database SHALL have `Cart` and `CartItem` models. Cart SHALL have a unique constraint on `userId` (one cart per user). CartItem SHALL have a unique constraint on `[cartId, productId]` (one item per product per cart). CartItem SHALL cascade delete when its Cart is deleted.

#### Scenario: Schema defines Cart model
- **WHEN** the Prisma schema is inspected
- **THEN** a `Cart` model exists with fields: `id` (uuid, PK), `userId` (string, unique), `items` (CartItem relation), `createdAt`, `updatedAt`
- **THEN** Cart has a relation to User via `userId`

#### Scenario: Schema defines CartItem model
- **WHEN** the Prisma schema is inspected
- **THEN** a `CartItem` model exists with fields: `id` (uuid, PK), `cartId` (string), `productId` (string), `quantity` (int, default 1), `createdAt`, `updatedAt`
- **THEN** CartItem has a relation to Cart via `cartId` with `onDelete: Cascade`
- **THEN** CartItem has a relation to Product via `productId`
- **THEN** CartItem has a `@@unique([cartId, productId])` compound constraint
