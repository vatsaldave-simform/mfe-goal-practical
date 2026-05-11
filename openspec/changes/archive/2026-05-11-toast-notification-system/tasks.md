## 1. Verify & Complete `@mfe/ui` Toast Exports

- [x] 1.1 Open `packages/ui/src/index.ts` and confirm `toast` and `Toaster` are exported from the barrel; add exports if missing
- [x] 1.2 Verify `sonner` is listed as a dependency in `packages/ui/package.json`

## 2. Mount Toaster in Host Shell

- [x] 2.1 Import `{ Toaster }` from `@mfe/ui` in `apps/host/src/App.tsx`
- [x] 2.2 Render `<Toaster />` at the root level of the host component tree, outside the route `<Outlet>`

## 3. Auth Pages — Remove Inline Errors, Add Toasts

- [x] 3.1 In `apps/account/src/pages/LoginPage.tsx`, remove the `{error && <div>…</div>}` inline error block
- [x] 3.2 Add `onError` callback to the `useLogin` mutation call: `toast.error(extractedMessage)` using the existing AxiosError extraction pattern
- [x] 3.3 In `apps/account/src/pages/RegisterPage.tsx`, remove the `{error && <div>…</div>}` inline error block
- [x] 3.4 Add `onError` callback to the `useRegister` mutation call: `toast.error(extractedMessage)`
- [x] 3.5 Add `onSuccess` callback to the `useRegister` mutation call: `toast.success("Account created!")`

## 4. Profile Page — Remove Inline Error, Add Toast

- [x] 4.1 In `apps/account/src/pages/ProfilePage.tsx`, remove the inline `{(error as Error).message …}` error display
- [x] 4.2 Add a `useEffect` (or use `isError` in JSX guard) to call `toast.error(…)` when `isError` is true for the `useMe` query

## 5. Cart — Add Toast Feedback

- [x] 5.1 In the product detail page / add-to-cart call site (`apps/storefront/src/pages/ProductDetailPage.tsx` or `ProductListPage.tsx`), add `onSuccess: () => toast.success("Added to cart")` and `onError: () => toast.error("Failed to add to cart")` to the `useAddToCart` mutation call
- [x] 5.2 In the cart page (`apps/storefront/src/pages/CartPage.tsx` or cart item components), add `onSuccess: () => toast.success("Item removed")` and `onError: () => toast.error("Failed to remove item")` to the `useRemoveFromCart` mutation call
- [x] 5.3 Check `QuantityControl.tsx` for quantity update mutations — add `onError: () => toast.error("Failed to update quantity")` if a mutation exists

## 6. Checkout — Add Toast Feedback

- [x] 6.1 In `apps/storefront/src/pages/CheckoutPage.tsx`, add `onSuccess: () => toast.success("Order placed!")` to the `useCreateOrder` mutation call
- [x] 6.2 Add `onError: (err) => toast.error(…)` to the `useCreateOrder` mutation call, replacing or complementing the existing inline error display

## 7. Logout — Add Toast

- [x] 7.1 Locate the logout call site in host nav or account MFE (search for `useLogout` or logout action)
- [x] 7.2 Add `onSuccess: () => toast.success("Logged out")` to the logout mutation call

## 8. Verify All Imports

- [x] 8.1 Ensure all new `toast` imports across MFEs use `import { toast } from "@mfe/ui"` (not direct `sonner` imports)
- [x] 8.2 Run `pnpm build` (or `turbo run build`) to confirm no TypeScript errors
