# Dr. Greens

## Current State

Full-stack microgreens e-commerce app with:
- Customer storefront: product grid, local-auth login (name/email/phone/location), order modal with OTP confirmation, "My Orders" tab, Contact Us form
- Admin panel at `/#/admin`: email+password login, dashboard with stats, orders management, products CRUD, customers view, contact messages
- Backend: products, orders, customerProfiles, contactSubmissions; admin role-gating; export CSV
- All product images are client-side mapped by product name
- Currency: ₹ INR; Cash on Delivery only

## Requested Changes (Diff)

### Add
1. **Product reviews & ratings** -- Customers can rate a product (1-5 stars) and leave a short text review after ordering. Ratings shown on product cards and a reviews section per product. Admin can see all reviews.
2. **Promotional banners** -- Admin can create/delete banner announcements (title, description, optional badge text, active flag). Customer storefront shows active banners in a dismissible strip above the hero.
3. **Inventory low-stock alerts** -- Admin dashboard "Needs Attention" card shows a red warning for any product with stock <= 5, with product name and current stock count.
4. **Order scheduling** -- Customers can pick a preferred delivery date (today+1 to today+14 days) and time slot (Morning 7–11am, Afternoon 12–4pm, Evening 5–8pm) in the order form. Saved on order. Visible in admin orders table.
5. **Bulk discount** -- Backend: tiered pricing logic. Orders >= 3 trays: 10% off; >= 5 trays: 15% off. Discount shown in order modal total. Applied before saving totalPrice.
6. **"Order Again" shortcut** -- In My Orders, each order card shows an "Order Again" button that reopens the order modal pre-filled with the same product.
7. **About Us / Story page** -- Dedicated `/about` hash route with brand story, team photo placeholder, certifications, farm stats, and CTA. Nav link added.
8. **WhatsApp floating button** -- Fixed bottom-right floating button on storefront linking to WhatsApp (wa.me/+91XXXXXXXXXX placeholder). Admin can set their WhatsApp number in a settings page.
9. **SEO metadata** -- index.html updated with proper title, meta description, keywords, og:title, og:description, og:image for Dr. Greens microgreens India. Canonical tag.
10. **Admin Settings page** -- New "Settings" nav item in admin sidebar. Admin can set WhatsApp number, business address, delivery zone pin codes (comma-separated), store open/closed toggle, and low-stock threshold. Stored in backend.

### Modify
- `Order` type: add `deliveryDate: Text`, `deliverySlot: Text`, `discount: Float` fields
- `placeOrder` function: accept deliveryDate, deliverySlot; compute discount based on quantity tiers; apply to totalPrice
- `getOrderStats` / `exportOrdersCSV`: include delivery slot and discount in CSV
- Admin Orders table: show delivery date, time slot columns
- Admin Dashboard: low-stock alert cards showing products at or below threshold
- ProductCard: show average star rating if reviews exist
- My Orders: "Order Again" button on each card

### Remove
- Nothing removed

## Implementation Plan

### Backend
1. Add `Review` type: id, productId, productName, customerEmail, customerName, rating (Nat 1-5), comment, createdAt
2. Add `Banner` type: id, title, description, badgeText, isActive, createdAt
3. Add `StoreSettings` type: whatsappNumber, businessAddress, deliveryZones, isStoreOpen, lowStockThreshold
4. Add `nextReviewId`, `nextBannerId`, `reviews` map, `banners` map, `storeSettings` mutable var
5. Extend `Order` with `deliveryDate: Text`, `deliverySlot: Text`, `discount: Float`
6. Update `placeOrder` to accept deliveryDate, deliverySlot; compute discount (>=3: 10%, >=5: 15%); store discount on order
7. Add `submitReview(productId, productName, rating, comment)` - caller must not be anonymous
8. Add `getProductReviews(productId)` - public query
9. Add `getAllReviews()` - admin only
10. Add `createBanner(title, description, badgeText)` - admin only, returns id
11. Add `updateBanner(id, title, description, badgeText, isActive)` - admin only
12. Add `deleteBanner(id)` - admin only
13. Add `getActiveBanners()` - public query
14. Add `getAllBanners()` - admin query
15. Add `getStoreSettings()` - public query (for WhatsApp number, isStoreOpen)
16. Add `updateStoreSettings(whatsappNumber, businessAddress, deliveryZones, isStoreOpen, lowStockThreshold)` - admin only
17. Update `exportOrdersCSV` to include deliveryDate, deliverySlot, discount columns

### Frontend
1. Update `backend.d.ts` after backend generation
2. Update `useQueries.ts`: add hooks for reviews (submit, get by product, get all), banners (get active, CRUD admin), store settings (get, update admin), updated placeOrder signature
3. Update `OrderModal`: add delivery date picker + time slot selector; compute and display discount/total
4. Update `ProductCard`: show average star rating badge
5. Add `ReviewsSection` component: shows ratings breakdown and review list per product (expandable under each product card or in a drawer)
6. Update `Storefront`: add promotional banner strip (dismissible), About nav link, floating WhatsApp button
7. Add `AboutPage` component for `/#/about` hash route
8. Update `MyOrders`: add "Order Again" button per card
9. Update admin `AdminDashboard`: low-stock alert cards from backend stock vs threshold
10. Update admin `AdminProducts`: show stock warning badge for low-stock items
11. Add admin `AdminBanners` page: create, toggle, delete banners
12. Add admin `AdminReviews` page: view all reviews
13. Add admin `AdminSettings` page: WhatsApp number, address, delivery zones, store open toggle, low-stock threshold
14. Update `AdminApp`: add Banners, Reviews, Settings nav items
15. Update `index.html`: add SEO meta tags
