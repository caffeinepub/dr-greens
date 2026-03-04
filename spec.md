# Verdant Greens

## Current State
The app has a customer storefront and an admin panel. Customers can add products to a cart (CartDrawer), then click "Checkout" to open a CartCheckoutModal (dialog) where they fill in their details, choose a delivery date/slot, and place the order. Orders are saved in the backend and visible in the admin panel.

The CartDrawer shows cart items, quantity controls, pricing, and a "Checkout" button. The CartCheckoutModal handles the multi-step form: form → OTP → success.

## Requested Changes (Diff)

### Add
- A "Place Order" tab/step directly inside the CartDrawer (as an inline second panel/step), so the checkout flow is contained within the cart side panel rather than opening a separate modal dialog.
- The "Place Order" step should show: order summary, customer detail fields (pre-filled from profile), delivery date and time slot selectors, notes, Cash on Delivery badge, and a "Place Order" button.
- After successful order placement, show a confirmation step inside the drawer with order number(s), OTP code, and a "Done" button that clears the cart.

### Modify
- CartDrawer: add a two-step view — "Cart" view and "Place Order" view — toggled via a tab or a "Proceed to Place Order" button replacing the existing "Checkout" button.
- The existing CartCheckoutModal component can be kept but is no longer triggered from the cart drawer; instead the inline flow handles it.
- Ensure orders placed via the drawer are still submitted to the backend via `placeOrder` mutation and appear in the admin panel.

### Remove
- The separate CartCheckoutModal dialog flow triggered from the CartDrawer (replace with inline drawer step).

## Implementation Plan
1. Refactor `CartDrawer.tsx` to support two views: `"cart"` (existing) and `"order"` (new Place Order step).
2. In the `"order"` view, embed the form fields, delivery date/slot, notes, and Cash on Delivery badge inline in the drawer's scroll area.
3. Wire the `usePlaceOrder` mutation inside CartDrawer for the inline order step.
4. On success, show a confirmation panel inside the drawer with order numbers and OTP code.
5. Replace the "Checkout" button with "Proceed to Place Order" (or similar) that switches to the order step.
6. Add a back button in the order step to return to the cart.
7. Remove or disconnect the CartCheckoutModal trigger from the CartDrawer (keep the component file in case it's used elsewhere).
8. Ensure `onCheckout` prop is no longer needed or update callers accordingly.
