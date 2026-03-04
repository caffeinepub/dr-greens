# Dr. Greens

## Current State

- Single-page React app with state-based routing (no URL-based routing)
- Storefront page at conceptual "/" and Admin panel at conceptual "/admin"
- Authorization component already installed (Internet Identity login)
- Users can browse products and place orders without logging in
- Admin panel requires login and checks isCallerAdmin()
- Orders and products stored permanently in Motoko backend
- No contact form
- No email notifications
- No user-facing login wall before ordering

## Requested Changes (Diff)

### Add
- URL-based routing: `/` for storefront, `/admin` for admin panel (using React Router or hash routing)
- Login requirement before placing an order: users must log in with Internet Identity before the order modal opens
- Contact Us form at the bottom of the storefront page with fields: name, email, phone, message
- Backend: `submitContactForm` function to store contact submissions permanently
- Backend: `getContactSubmissions` admin-only query to view contact submissions
- Admin panel: "Contact Messages" section showing all contact form submissions
- Email notification to Dr.Greens2026@gmail.com when a new order is placed and when a contact form is submitted (email component - note: currently on free plan, will be wired but may require upgrade)
- User login state shown in storefront header (login/logout button for customers)

### Modify
- Storefront: "Order" button now checks if user is logged in; if not, shows a login prompt/modal before proceeding to the order modal
- App routing changed from state-based to URL hash-based (`/#/` and `/#/admin`) so each section has a distinct shareable URL
- Admin panel header: back button navigates to `/#/` instead of state change
- Order placement: requires authenticated caller (backend `placeOrder` updated to require login)

### Remove
- Nothing removed; existing features all preserved

## Implementation Plan

1. **Backend (main.mo)**:
   - Add `ContactSubmission` type: id, name, email, phone, message, createdAt
   - Add `contactSubmissions` map and `nextContactId` counter
   - Add `submitContactForm(name, email, phone, message)` public shared func (stores submission, sends email notification to admin)
   - Add `getContactSubmissions()` admin-only query
   - Update `placeOrder` to require authenticated caller (non-anonymous)
   - Add email notification calls on new order and new contact submission (using email component)

2. **Frontend routing**:
   - Implement hash-based routing in App.tsx: `/#/` = storefront, `/#/admin` = admin
   - Navigation links and buttons updated to use hash routes

3. **Frontend - Storefront**:
   - Add login/logout button in header for customers
   - "Order Now" button: if not logged in, show login prompt; if logged in, open order modal
   - Add ContactUs section at bottom of page (above footer) with form
   - Contact form calls `submitContactForm` backend function

4. **Frontend - Admin**:
   - Add "Contact Messages" tab/section in AdminDashboard
   - Calls `getContactSubmissions` to display submissions

5. **Frontend - useQueries.ts**:
   - Add `useSubmitContactForm` mutation
   - Add `useGetContactSubmissions` query

6. **Data types/mappers**: Add contact submission type and mapper
