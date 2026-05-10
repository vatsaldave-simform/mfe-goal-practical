## ADDED Requirements

### Requirement: Product list page displays paginated product grid

The storefront SHALL render a `ProductListPage` at the index route that displays products in a responsive grid layout with pagination controls.

#### Scenario: Initial load shows first page of products
- **WHEN** user navigates to the storefront root route
- **THEN** the system SHALL display up to 12 products (DEFAULT_PAGE_SIZE) in a grid of cards showing name, price, image, and category

#### Scenario: Pagination navigation
- **WHEN** user clicks a pagination control (next/previous/page number)
- **THEN** the URL search params SHALL update with the new page number and the product grid SHALL display the corresponding page of results

### Requirement: Product list supports text search

The storefront SHALL provide a search input on the product list page that filters products by name.

#### Scenario: Search filters products
- **WHEN** user types a search term in the search input
- **THEN** after a 300ms debounce, the product list SHALL refetch with the search parameter and display only matching products

#### Scenario: Empty search resets to all products
- **WHEN** user clears the search input
- **THEN** the product list SHALL display all products (unfiltered) for the current page

### Requirement: Product list supports category filter

The storefront SHALL provide a category filter (dropdown or button group) that filters products by category.

#### Scenario: Category filter applied
- **WHEN** user selects a category from the filter
- **THEN** the URL search params SHALL update with the category and the product grid SHALL show only products in that category

#### Scenario: Clear category filter
- **WHEN** user deselects or clears the category filter
- **THEN** all products SHALL be displayed regardless of category

### Requirement: Product detail page shows full product information

The storefront SHALL render a `ProductDetailPage` at the `/:id` route that displays comprehensive product information.

#### Scenario: Product detail loads by ID
- **WHEN** user navigates to `/:id` (e.g., by clicking a product card)
- **THEN** the system SHALL fetch and display the product's name, description, price, image, category, and stock status

#### Scenario: Product not found
- **WHEN** user navigates to a product ID that does not exist
- **THEN** the system SHALL display an appropriate error state (not a blank page)

### Requirement: Product detail has add-to-cart action

The `ProductDetailPage` SHALL include an "Add to Cart" button that adds the product to the user's cart.

#### Scenario: Add to cart succeeds
- **WHEN** user clicks "Add to Cart" on a product detail page
- **THEN** the system SHALL call the add-to-cart mutation and display a success indicator (e.g., button state change or toast)

#### Scenario: Add to cart while not authenticated
- **WHEN** an unauthenticated user clicks "Add to Cart"
- **THEN** the system SHALL attempt the mutation (backend handles auth requirement) and if a 401 is returned, the API interceptor SHALL redirect to login

### Requirement: Product card component

The storefront SHALL implement a `ProductCard` component used in the product grid that displays product summary information and links to the detail page.

#### Scenario: Card displays product info
- **WHEN** a ProductCard renders with product data
- **THEN** it SHALL display the product image, name, price (formatted as currency), and category badge

#### Scenario: Card links to detail
- **WHEN** user clicks a ProductCard
- **THEN** the app SHALL navigate to the product detail route (`/:id`)

### Requirement: Loading and empty states

The product list and detail pages SHALL display appropriate loading and empty states.

#### Scenario: Loading skeleton on initial fetch
- **WHEN** product data is being fetched (isLoading)
- **THEN** the system SHALL display a loading skeleton or spinner (not a blank page)

#### Scenario: Empty state when no products match
- **WHEN** a search or filter yields zero results
- **THEN** the system SHALL display an empty state message indicating no products were found
