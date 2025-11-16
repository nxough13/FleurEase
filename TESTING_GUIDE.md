# 🌸 FleurEase - Complete System Testing Guide

## 📋 Pre-Testing Setup

### Start the Application
1. **Backend:**
   ```bash
   cd backend
   npm start
   ```
   ✅ Should show: `Server started on PORT: 4001` and `MongoDB Database connected`

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   ✅ Should show: `Local: http://localhost:5173/`

3. Open browser: `http://localhost:5173/`

---

## 1️⃣ USER REGISTRATION & AUTHENTICATION

### Test 1.1: Manual Registration with Email Verification - WORKING
1. Click **Register** in navigation
2. Fill in the form:
   - Name: `Test User`
   - Email: `testuser@gmail.com` (use a real email you can access)
   - Password: `password123`
   - Confirm Password: `password123`
   - Upload a profile picture
3. Click **Register**
4. ✅ Should show success message: "Please check your email to verify your account"
5. ✅ Should redirect to Login page after 3 seconds
6. Check your email inbox
7. ✅ Should receive verification email with subject "Email Verification"
8. Click the verification link in the email
9. ✅ Should see "Email verified successfully!" page
10. Try to login BEFORE verifying
    - ✅ Should show error: "Please verify your email to login"
11. After verification, login with the credentials
    - ✅ Should successfully login and redirect to homepage

### Test 1.2: Form Validation on Registration - WORKING
1. Go to Register page
2. Try submitting with:
   - Empty name → ✅ Should show "Name is required"
   - Name with 1 character → ✅ Should show "Name must be at least 2 characters"
   - Invalid email → ✅ Should show "Invalid email address"
   - Password less than 6 chars → ✅ Should show "Password must be at least 6 characters"
   - Mismatched passwords → ✅ Should show "Passwords must match"
   - No avatar → ✅ Should show "Please upload an avatar"

### Test 1.3: Google Login - WORKING
1. Click **Register** or **Login**
2. Click **Sign in with Google** button
3. Select your Google account
4. ✅ Should automatically create account and login
5. ✅ Should redirect to homepage
6. ✅ User should be auto-verified (no email verification needed)
7. Check profile → ✅ Should show Google profile picture and name

### Test 1.4: Login Form Validation - WORKING
1. Go to Login page
2. Try submitting with:
   - Empty email → ✅ Should show "Email is required"
   - Invalid email format → ✅ Should show "Invalid email address"
   - Empty password → ✅ Should show "Password is required"
   - Short password → ✅ Should show "Password must be at least 6 characters"

### Test 1.5: Password Reset - NOT IMPLEMENTED
1. Click **Forgot Password?** on login page
2. Enter your email
3. ✅ Should receive password reset email
4. Click the reset link
5. Enter new password
6. ✅ Should show success message
7. Login with new password
8. ✅ Should successfully login

---

## 2️⃣ PRODUCT BROWSING & FILTERING

### Test 2.1: View Products - WORKING
1. Go to homepage
2. ✅ Should see product cards with:
   - Product image
   - Product name
   - Price
   - Rating (stars)
   - Stock status
3. ✅ Should show 4 products per page (pagination)

### Test 2.2: Search Products - WORKING
1. Use search bar at top
2. Search for "Rose"
3. ✅ Should show only products with "Rose" in name or description
4. Search for non-existent product
5. ✅ Should show "No products found"

### Test 2.3: Price Filter - WORKING
1. Use the price slider on the left sidebar
2. Set min price to ₱500 and max to ₱1000
3. ✅ Should show only products within that price range
4. ✅ Price should update in real-time as you drag slider

### Test 2.4: Category Filter - WORKING
1. Click on the Category dropdown (Autocomplete)
2. Type to search for a category (e.g., "Bouquet")
3. Select a category
4. ✅ Should show only products in that category
5. Clear the category filter
6. ✅ Should show all products again

### Test 2.5: Rating Filter (Multi-Select) - WORKING
1. Click on rating buttons (5★, 4★, 3★, etc.)
2. Select multiple ratings (e.g., 5★ and 4★)
3. ✅ Should show products with either rating
4. ✅ Selected ratings should be highlighted
5. ✅ Products should be sorted by highest rating first
6. Click **Clear All Filters**
7. ✅ Should reset all filters

### Test 2.6: Pagination - NOT YET TESTED
1. Scroll to bottom of product list
2. ✅ Should see page numbers
3. Click page 2
4. ✅ Should load next 4 products
5. ✅ URL should update with page number
6. Click **Previous** and **Next** buttons
7. ✅ Should navigate between pages

---

## 3️⃣ PRODUCT DETAILS & REVIEWS

### Test 3.1: View Product Details - WORKING
1. Click on any product card
2. ✅ Should show:
   - Large product images (carousel)
   - Product name, price, description
   - Stock availability
   - Average rating with exact decimal (e.g., 4.67)
   - Number of reviews
   - Add to Cart button
   - Quantity selector

### Test 3.2: Image Carousel - WORKING
1. On product details page
2. Click on thumbnail images
3. ✅ Should change main image
4. Click left/right arrows
5. ✅ Should navigate through images

### Test 3.3: Add to Cart - WORKING
1. Select quantity (e.g., 2)
2. Click **Add to Cart**
3. ✅ Should show success toast
4. ✅ Cart icon in header should update count
5. Try adding more than available stock
6. ✅ Should show error: "Not enough stock"

### Test 3.4: Write Review (After Purchase) - WORKING
1. **First, complete a purchase** (see Order Testing section)
2. Go to product you purchased
3. Scroll to Reviews section
4. Click **Write a Review**
5. Select rating (1-5 stars)
6. Write a comment with bad words (e.g., "This is shit")
7. Submit review
8. ✅ Bad words should be filtered/masked (e.g., "This is ****")
9. ✅ Review should appear in reviews list
10. ✅ Product rating should update

### Test 3.5: Update Review - WORKING
1. Find your review on the product page
2. Click **Edit** button
3. Change rating and comment
4. Submit
5. ✅ Review should update
6. ✅ Product rating should recalculate

### Test 3.6: Review Restrictions - WORKING
1. Try to review a product you HAVEN'T purchased
2. ✅ Should show: "You must purchase this product to review it"
3. Try to submit review without rating
4. ✅ Should show validation error

---

## 4️⃣ SHOPPING CART

### Test 4.1: View Cart - WORKING
1. Click cart icon in header
2. ✅ Should show all items added
3. ✅ Should show:
   - Product image, name, price
   - Quantity selector
   - Subtotal per item
   - Total price
   - Remove button

### Test 4.2: Update Quantity - WORKING
1. In cart, increase quantity using + button
2. ✅ Should update subtotal
3. ✅ Should update total price
4. Try to increase beyond stock
5. ✅ Should show error or disable button
6. Decrease quantity using - button
7. ✅ Should update prices

### Test 4.3: Remove from Cart - WORKING
1. Click **Remove** button on an item
2. ✅ Should remove item from cart
3. ✅ Should update total
4. ✅ Cart count in header should decrease

### Test 4.4: Empty Cart - WORKING
1. Remove all items
2. ✅ Should show "Your cart is empty"
3. ✅ Should show button to continue shopping

---

## 5️⃣ CHECKOUT & ORDERS

### Test 5.1: Checkout Process - WORKING
1. Add items to cart
2. Click **Proceed to Checkout**
3. ✅ Should redirect to login if not logged in
4. After login, fill shipping information:
   - Address: `123 Test Street`
   - City: `Taguig City`
   - Postal Code: `1630`
   - Phone: `09123456789`
   - Country: `Philippines`
5. Click **Continue**
6. ✅ Should show order summary
7. ✅ Should show:
   - Items price
   - Tax (12%)
   - Shipping fee
   - Total amount

### Test 5.2: Payment  - WORKING
1. On payment page, enter card details:
   - Card Number: `4242 4242 4242 4242` (test card)
   - Expiry: `12/25`
   - CVC: `123`
2. Click **Pay**
3. ✅ Should process payment
4. ✅ Should show "Order Success" page
5. ✅ Should receive email with order details and PDF receipt

### Test 5.3: View Orders - WORKING
1. Go to **Profile → My Orders**
2. ✅ Should show list of all your orders
3. ✅ Should show:
   - Order ID
   - Date
   - Total amount
   - Status (Processing/Delivered)
   - View Details button

### Test 5.4: Order Details - WORKING
1. Click **View Details** on an order
2. ✅ Should show:
   - Order info (ID, date, status)
   - Shipping address
   - Payment info
   - Order items with images
   - Price breakdown
   - Track Order button (if not delivered)

---

## 6️⃣ USER PROFILE

### Test 6.1: View Profile - WORKING
1. Click on your name in header → **Profile**
2. ✅ Should show:
   - Profile picture
   - Name
   - Email
   - Address, city, postal code, phone
   - Joined date

### Test 6.2: Update Profile with Validation 
1. Click **Edit Profile**
2. Try updating with:
   - Name with 1 character → ✅ Should show "Name must be at least 2 characters"
   - Invalid email → ✅ Should show "Invalid email address"
   - Phone with letters → ✅ Should show "Phone number must be 10-15 digits"
3. Fill valid data:
   - Name: `Updated Name`
   - Address: `New Address`
   - City: `Manila`
   - Phone: `09987654321`
   - Upload new avatar
4. Click **Update**
5. ✅ Should show success message
6. ✅ Profile should update
7. ✅ Header should show new name and avatar

### Test 6.3: Change Password - NOT IMPLEMENTED
1. Go to **Profile → Change Password**
2. Enter:
   - Old Password
   - New Password (min 6 chars)
   - Confirm New Password
3. Click **Update Password**
4. ✅ Should show success
5. Logout and login with new password
6. ✅ Should work

### Test 6.4: Wishlist - WORKING
1. On any product page, click **♥ Add to Wishlist**
2. ✅ Should show success toast
3. Go to **Profile → My Wishlist**
4. ✅ Should show wishlisted products
5. Click **Remove from Wishlist**
6. ✅ Should remove item

---

## 7️⃣ ADMIN - PRODUCT MANAGEMENT

### Test 7.1: Access Admin Dashboard - WORKING
1. Login as admin (create admin user in database or use existing)
2. ✅ Header should show **Dashboard** link
3. Click **Dashboard**
4. ✅ Should show admin dashboard with:
   - Total sales
   - Total orders
   - Total products
   - Total users
   - Sales charts

### Test 7.2: View All Products (Admin) - WORKING
1. In admin sidebar, click **Products**
2. ✅ Should show DataGrid with all products
3. ✅ Should show:
   - ID, Name, Price, Stock, Category
   - Actions (Edit, Delete)
4. ✅ Should have search/filter functionality
5. ✅ Should have pagination

### Test 7.3: Create New Product with Validation - WORKING
1. Click **New Product**
2. Try submitting with:
   - Name less than 3 chars → ✅ Should show "Name must be at least 3 characters"
   - Price = 0 → ✅ Should show "Price must be positive"
   - No description → ✅ Should show "Description is required"
   - Negative stock → ✅ Should show "Stock cannot be negative"
3. Fill valid data:
   - Name: `Beautiful Red Roses`
   - Price: `1200`
   - Description: `Fresh red roses perfect for any occasion`
   - Category: `Bouquet`
   - Stock: `50`
   - Upload 2-3 images
4. Click **Create**
5. ✅ Should show success
6. ✅ Product should appear in products list
7. ✅ Images should be uploaded to Cloudinary

### Test 7.4: Update Product - working
1. Click **Edit** on a product
2. Change name, price, stock
3. Upload new images
4. Click **Update**
5. ✅ Should update successfully
6. ✅ Changes should reflect on frontend

### Test 7.5: Delete Product - WORKING
1. Click **Delete** on a product
2. ✅ Should show confirmation dialog
3. Confirm deletion
4. ✅ Product should be removed
5. ✅ Should disappear from frontend

### Test 7.6: Bulk Delete Products - WORKING
1. Select multiple products using checkboxes
2. Click **Delete Selected**
3. ✅ Should delete all selected products

---

## 8️⃣ ADMIN - ORDER MANAGEMENT

### Test 8.1: View All Orders - working
1. Admin sidebar → **Orders**
2. ✅ Should show all orders from all users
3. ✅ Should show:
   - Order ID, User, Amount, Status, Date
   - Actions (View, Update Status)

### Test 8.2: Update Order Status - working
1. Click **View Details** on an order
2. Change status from **Processing** to **Shipped**
3. Click **Update Status**
4. ✅ Should update
5. Change to **Delivered**
6. ✅ Should send email to customer
7. ✅ Customer should receive email notification

### Test 8.3: View Order Details (Admin) - working
1. Click on any order
2. ✅ Should show complete order information
3. ✅ Should show customer details
4. ✅ Should show all items ordered

---

## 9️⃣ ADMIN - USER MANAGEMENT

### Test 9.1: View All Users - working
1. Admin sidebar → **Users**
2. ✅ Should show all registered users
3. ✅ Should show:
   - ID, Name, Email, Role, Joined Date
   - Actions (Edit, Delete, Suspend)

### Test 9.2: Update User Role - working
1. Click **Edit** on a user
2. Change role from **user** to **admin**
3. Click **Update**
4. ✅ Should update role
5. ✅ User should now have admin access

### Test 9.3: Suspend User
1. Click **Suspend** on a user
2. Enter suspension reason
3. ✅ User should be suspended
4. ✅ User cannot login (should show "Account suspended")
5. Click **Unsuspend**
6. ✅ User can login again

### Test 9.4: Delete User - working
1. Click **Delete** on a user
2. Confirm deletion
3. ✅ User should be removed
4. ✅ User cannot login anymore

---

## 🔟 ADMIN - REVIEWS MANAGEMENT

### Test 10.1: View All Reviews - working
1. Admin sidebar → **Reviews**
2. Enter a product ID
3. ✅ Should show all reviews for that product
4. ✅ Should show:
   - User name, Rating, Comment, Date
   - Delete button

### Test 10.2: Delete Review (Admin) - working
1. Click **Delete** on any review
2. ✅ Should remove review
3. ✅ Product rating should recalculate
4. ✅ Review should disappear from product page

---

## 1️⃣1️⃣ SALES ANALYTICS & CHARTS

### Test 11.1: Dashboard Charts - working
1. Go to Admin Dashboard
2. ✅ Should show:
   - Monthly sales line chart (all 12 months)
   - Sales by product (bar chart)
   - Sales by customer
   - Recent orders table

### Test 11.2: Sales Charts with Date Range - 
1. In dashboard, use date range picker
2. Select date range (e.g., Last 30 days)
3. ✅ Charts should update to show data for that range
4. ✅ Should show sales trend

### Test 11.3: Product Sales Report 
1. Admin sidebar → **Product Sales**
2. ✅ Should show table with:
   - Product name
   - Units sold
   - Total revenue
   - Percentage of total sales

---

## 1️⃣2️⃣ EMAIL NOTIFICATIONS

### Test 12.1: Registration Email - working
1. Register new account
2. ✅ Should receive verification email
3. ✅ Email should have:
   - Verification link
   - Professional formatting
   - FleurEase branding

### Test 12.2: Order Confirmation Email - working
1. Complete an order
2. ✅ Should receive order confirmation email
3. ✅ Email should include:
   - Order details (items, quantities, prices)
   - Subtotal, tax, shipping, total
   - PDF receipt attachment
   - Shipping address

### Test 12.3: Order Status Update Email - working
1. Admin updates order status to "Delivered"
2. ✅ Customer should receive email notification
3. ✅ Email should show new status

### Test 12.4: Password Reset Email - not implemented
1. Request password reset
2. ✅ Should receive reset link via email
3. ✅ Link should expire after 30 minutes

---

## 1️⃣3️⃣ BAD WORDS FILTER

### Test 13.1: Review Comment Filter - working
1. Write a review with profanity
2. Examples: "This is shit", "Damn good", "Fucking amazing"
3. Submit review
4. ✅ Bad words should be masked: "This is ****", "D**n good", "F*****g amazing"
5. ✅ Review should still be saved

### Test 13.2: Update Review with Bad Words - working
1. Edit an existing review
2. Add bad words
3. ✅ Should be filtered on update too

---

## 1️⃣5️⃣ ERROR HANDLING

### Test 15.1: Network Errors
1. Stop backend server
2. Try to login
3. ✅ Should show error toast
4. Try to load products
5. ✅ Should show error message

### Test 15.2: Invalid Routes
1. Navigate to `/invalid-route`
2. ✅ Should show 404 page or redirect

### Test 15.3: Unauthorized Access - working
1. Logout
2. Try to access `/admin/dashboard`
3. ✅ Should redirect to login
4. Login as regular user
5. Try to access admin routes
6. ✅ Should show "Access denied" or redirect

---

## 1️⃣6️⃣ PERFORMANCE & LOADING

### Test 16.1: Loading States
1. Refresh homepage
2. ✅ Should show loader while fetching products
3. Navigate to product details
4. ✅ Should show loader while loading

### Test 16.2: Image Loading
1. Check product images
2. ✅ Should load from Cloudinary
3. ✅ Should have proper alt text
4. ✅ Should handle broken images gracefully

---

## ✅ FINAL CHECKLIST

### All Features Working:
- [ ] User registration with email verification
- [ ] Form validation (Login, Register, Profile, Products)
- [ ] Google Login (auto-verified)
- [ ] Email verification system
- [ ] Login/Logout
- [ ] Password reset
- [ ] Product browsing with pagination
- [ ] Search functionality
- [ ] Price filter (slider)
- [ ] Category filter (autocomplete dropdown)
- [ ] Rating filter (multi-select with sorting)
- [ ] Product details with image carousel
- [ ] Reviews & ratings (with bad words filter)
- [ ] Update own review
- [ ] Shopping cart (add, update, remove)
- [ ] Checkout process
- [ ] Payment integration
- [ ] Order history
- [ ] Order details with PDF receipt
- [ ] User profile view/update with validation
- [ ] Change password
- [ ] Wishlist
- [ ] Admin dashboard with charts
- [ ] Product CRUD with validation (admin)
- [ ] Bulk delete products
- [ ] Order management (admin)
- [ ] Update order status with email notification
- [ ] User management (admin)
- [ ] Suspend/unsuspend users
- [ ] Review management (admin)
- [ ] Sales analytics with charts
- [ ] Monthly sales chart
- [ ] Email notifications (all types)
- [ ] PDF receipt generation
- [ ] Bad words filter in reviews
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states

---

## 🐛 Bug Reporting Template

If you find any bugs during testing, document them like this:

**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:** What should happen

**Actual Result:** What actually happened

**Screenshot:** (if applicable)

**Browser:** Chrome/Firefox/Safari

**User Role:** Admin/User/Guest

---

## 📊 Testing Summary Report Template

After completing all tests, fill this out:

**Total Tests:** [Number]
**Passed:** [Number]
**Failed:** [Number]
**Pass Rate:** [Percentage]

**Critical Issues Found:**
- Issue 1
- Issue 2

**Minor Issues Found:**
- Issue 1
- Issue 2

**Recommendations:**
- Recommendation 1
- Recommendation 2

---

**Good luck with testing! 🌸**
