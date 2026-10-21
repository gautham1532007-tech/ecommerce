# JexoCart — Scenario 2: E-Commerce Shopping Web Application
### Comprehensive Multi-Experiment Lab Suite (Experiments 1, 2, 3 & 4)

Built with **React**, **Vite**, **Axios**, and **Zustand**.

---

## 🚀 How to Run on Windows

1. Open PowerShell or Command Prompt in the `ecommerce-exp4-auth` directory:
   ```bash
   cd c:\Users\mardi\Downloads\JexoCart_Experiment4_Authentication\ecommerce-exp4-auth
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the localhost URL in your browser:
   `http://localhost:5173`

---

## 🔐 Demo Credentials (FakeStoreAPI)
- **Username:** `mor_2314`
- **Password:** `83r5^_`
*(You can also click the **"⚡ Auto-fill Demo Credentials"** button on the Login page)*

---

## 📋 Comprehensive Experiment Mapping Matrix

### 🛒 Experiment 1: Product REST API, Async Data & Reusable UI
- **a) Fetch product information using Axios:** `src/api.js (fetchProductsApi)` initiates `GET https://fakestoreapi.com/products`.
- **b) Reusable ProductCard component:** `src/components/ProductCard.jsx` modularly displays image, category, title, rating, and actions.
- **c) Search & Category Filtering:** `src/components/ShopView.jsx` provides instant search input and category select dropdown.
- **d) Dynamic product details request:** Clicking **"👁 Quick View"** on any card triggers dynamic API fetch `GET /products/:id` in `src/components/ProductDetailModal.jsx`.
- **e) Async/await operations:** All API requests use structured `async/await` with clean `try/catch/finally` blocks.
- **f) Loading & error states:** Dedicated spinners, retry buttons, and toast banners display during network activity or errors.
- **g) Pagination / Limited loading:** Configurable page size (4, 8, 12, 20) with interactive Previous/Next and page number controls.

---

### 📦 Experiment 2: Global Cart State Management with Zustand & Middleware
- **a) Zustand Global Store:** Implemented in `src/store/useCartStore.js`.
- **b) Store operations:**
  - `addToCart(product, quantity)`
  - `removeFromCart(productId)`
  - `updateQuantity(productId, delta)`
  - `clearCart()`
- **c) Cross-component state sync:** Cart state reflects synchronously across `ProductCard`, `ProductDetailModal`, `CartView`, `Header` count badge, and `CheckoutView`.
- **d) Calculated amounts:**
  - **Subtotal:** Item sum `price * quantity`
  - **Discount:** Promo codes `SAVE10` (10% off) and `SUPER20` (20% off)
  - **Delivery Charge:** `$4.99`, or **FREE** on orders over `$50.00`
  - **Final Amount:** `subtotal - discount + delivery`
- **e) Action monitoring middleware:** Custom Zustand middleware (`cartActionLoggerMiddleware`) intercepts all mutations, logs state transitions to the console, and exposes a live in-app inspection drawer (**"⚡ Middleware"** in top bar).
- **f) Browser storage persistence:** Uses Zustand `persist` middleware with `localStorage` key `jexocart_cart_zustand`.
- **g) Loading & Error Handling:** Real-time feedback for coupon validation and cart state changes.

---

### 🛠️ Experiment 3: Product CRUD Operations using APIs
- **a) Retrieve products using GET:** `GET /products` loads catalog on application mount.
- **b) Add products using POST:** Click **"+ Add Product (POST)"** in the catalog header to open modal and send `POST /products` with JSON payload.
- **c) Update product using PUT:** Click the ✏️ icon on any product card to open edit modal and submit `PUT /products/:id`.
- **d) Delete products using DELETE:** Click the 🗑️ icon on any product card to trigger `DELETE /products/:id` with confirmation.
- **e) Asynchronous API response handling:** Processes HTTP status codes (200, 201) and reflects created/updated items in live UI.
- **f) Loading indicators:** Spinners shown inside modal buttons and deletion prompts.
- **g) API error feedback:** Inline error banners and slide-up toast notifications.

---

### 🔒 Experiment 4: E-Commerce Authentication and Token Management
- **a) Login component:** `src/components/LoginView.jsx` sends credentials to `POST /auth/login`.
- **b) Token storage:** Successfully returned JWT token is stored in `localStorage` under `jexocart_auth_token`.
- **c) Authenticated API requests:** Token attached in outgoing HTTP headers as `Authorization: Bearer <token>`.
- **d) Axios request interceptor:** Configured in `src/api.js` (`api.interceptors.request.use`) to automatically attach tokens.
- **e) Protected cart & checkout:** Adding to cart, checkout, and order completion require an active authenticated session.
- **f) Logout & token removal:** Clicking **"Logout"** deletes the token and username from `localStorage` and resets session state.
- **g) Invalid/expired token handling:** Axios response interceptor (`api.interceptors.response.use`) intercepts HTTP 401, clears the token, dispatches an `auth-expired` event, and prompts the user to log in again.

---

## 📁 Key File Structure
```
ecommerce-exp4-auth/
├── src/
│   ├── api.js                           # Axios client, interceptors, CRUD & Auth endpoints
│   ├── store/
│   │   └── useCartStore.js              # Zustand store, custom middleware, persist, calculations
│   ├── components/
│   │   ├── Header.jsx                   # Navigation, badges, auth buttons
│   │   ├── ProductCard.jsx              # Reusable product card (Exp 1 b, Exp 3 triggers)
│   │   ├── ProductDetailModal.jsx       # Dynamic GET /products/:id modal (Exp 1 d)
│   │   ├── ProductCrudModal.jsx         # Add/Edit POST & PUT modal (Exp 3 b, c)
│   │   ├── MiddlewareLogDrawer.jsx      # Live middleware monitor drawer (Exp 2 e)
│   │   ├── ExperimentOverviewModal.jsx  # Syllabus matrix verification modal
│   │   ├── ShopView.jsx                 # Catalog, search, category filter, pagination
│   │   ├── CartView.jsx                 # Cart layout, quantity controls, coupons, totals
│   │   ├── CheckoutView.jsx             # Protected checkout with token verification
│   │   ├── LoginView.jsx                # API authentication form with demo creds
│   │   └── SuccessView.jsx              # Order receipt and confirmation
│   ├── App.jsx                          # Main coordinator, state, and routing
│   ├── App.css                          # Modern responsive design & design tokens
│   └── main.jsx                         # React entrypoint
├── package.json
└── vite.config.js
```

## ⚡ Performance, Accessibility & Offline Support
- Checkout and product-detail views are loaded on demand with React lazy loading, while Vite splits framework and API libraries into separate chunks.
- Catalog images use lazy loading, asynchronous decoding, fixed dimensions, and a local fallback image. Product cards are memoized to reduce avoidable rerenders.
- Product and checkout inputs are length-limited and validated before submission. API responses and product IDs are checked, and product image URLs are restricted to safe protocols.
- The product-detail dialog supports Escape and Tab keyboard navigation, visible controls have accessible labels, and focused controls receive focus when the dialog opens.
- A web app manifest and production service worker provide an installable app shell with offline navigation fallback. API responses are intentionally not cached.
