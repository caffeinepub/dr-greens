# Verdant Greens

## Current State

The app has two parts on a single frontend:
- **Customer app** (default route): form-based login stored in localStorage, cart + checkout places orders via `placeOrder` backend call using an anonymous actor.
- **Admin app** (`#/admin`): email/password login stored in localStorage (`useAdminAuth`), with all backend calls going through `useActor` which uses Internet Identity for identity.

**Root problem**: The admin email/password login (`useAdminAuth`) only sets a localStorage flag. It does NOT authenticate with Internet Identity. So the `useActor` hook always creates an anonymous actor for the admin panel. All admin backend calls (`getAllOrders`, `updateProduct`, `updateStoreSettings`, `getOrderStats`, etc.) require admin role and silently fail because the caller is anonymous.

Customer orders DO save to the blockchain, but the admin cannot see them because it lacks an authenticated + admin-initialized actor.

## Requested Changes (Diff)

### Add
- A dedicated admin actor hook (`useAdminActor`) that is initialized with the Caffeine admin token (from URL params) regardless of Internet Identity, giving admin-level access. This bypasses the need for Internet Identity in the admin panel.

### Modify
- `useActor.ts`: extract the admin token initialization logic so it can be reused.
- All admin page hooks (`useGetAllOrders`, `useGetOrderStats`, `useUpdateOrderStatus`, `useUpdateProduct`, `useAddProduct`, `useDeactivateProduct`, `useGetAllCustomerProfiles`, `useGetContactSubmissions`, `useExportOrdersCSV`, `useGetAllBanners`, `useGetAllReviews`, `useUpdateStoreSettings`, `useCreateBanner`, `useUpdateBanner`, `useDeleteBanner`) need to use an admin-authenticated actor.
- The `AdminApp` context should provide an admin actor and all admin queries should use it.

### Remove
- Nothing removed from backend.

## Implementation Plan

1. Create `useAdminActor.ts` hook that creates an actor initialized with the admin token (from `caffeineAdminToken` URL param), giving it admin permissions. This actor is created once and cached.
2. Create a separate `useAdminQueries.ts` (or modify `useQueries.ts`) with admin-specific versions of hooks that use the admin actor instead of the regular user actor.
3. Update all admin pages to use the admin-specific hooks.
4. Ensure customer `placeOrder` continues to use the anonymous actor (no auth required since backend allows anonymous orders).
