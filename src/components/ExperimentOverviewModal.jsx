import React from "react";

export default function ExperimentOverviewModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card syllabus-modal" onClick={(e) => e.stopPropagation()}>
        <div className="syllabus-header">
          <div>
            <span className="eyebrow">LAB VERIFICATION MATRIX</span>
            <h2>Scenario 2: E-Commerce Shopping Web Application</h2>
            <p className="muted">All 4 Experiments fully implemented and interactive in this single application.</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <div className="syllabus-body">
          {/* Experiment 1 */}
          <section className="exp-block">
            <div className="exp-block-header">
              <span className="exp-pill exp-1">Experiment 1</span>
              <h3>Develop E-Commerce Application with Product REST API</h3>
            </div>
            <p className="exp-topics">Topics: REST API, Axios, Fetch API, Async Data</p>
            <ul className="checklist">
              <li><span className="check">✓</span> <strong>a) Fetch product information from REST API:</strong> Implemented via Axios in <code>src/api.js (fetchProductsApi)</code>.</li>
              <li><span className="check">✓</span> <strong>b) Reusable ProductCard component:</strong> Rendered in <code>src/components/ProductCard.jsx</code>.</li>
              <li><span className="check">✓</span> <strong>c) Product search and category filtering:</strong> Interactive live search bar + category dropdown filter.</li>
              <li><span className="check">✓</span> <strong>d) Dynamic product details request:</strong> Click "👁 Quick View" on any card to invoke <code>GET /products/:id</code> modal dynamically.</li>
              <li><span className="check">✓</span> <strong>e) Async/await handling:</strong> Clean <code>async/await</code> and Promise handling across all network operations.</li>
              <li><span className="check">✓</span> <strong>f) Loading and error states:</strong> Dedicated spinners and error recovery UI for product loading and details.</li>
              <li><span className="check">✓</span> <strong>g) Pagination or limited product loading:</strong> Configurable items per page (4, 8, 12, All) with Previous/Next pagination controls.</li>
            </ul>
          </section>

          {/* Experiment 2 */}
          <section className="exp-block">
            <div className="exp-block-header">
              <span className="exp-pill exp-2">Experiment 2</span>
              <h3>Implement Global Product and Cart State Management</h3>
            </div>
            <p className="exp-topics">Topics: Redux Toolkit, Zustand, Middleware, State Management</p>
            <ul className="checklist">
              <li><span className="check">✓</span> <strong>a) Zustand Global Store:</strong> Created in <code>src/store/useCartStore.js</code> managing unified cart state.</li>
              <li><span className="check">✓</span> <strong>b) Store methods:</strong> Fully implemented <code>addToCart()</code>, <code>removeFromCart()</code>, <code>updateQuantity()</code>, and <code>clearCart()</code>.</li>
              <li><span className="check">✓</span> <strong>c) Cross-component state:</strong> Synchronized across Product List, Product Detail Modal, Cart view, and Checkout view.</li>
              <li><span className="check">✓</span> <strong>d) Price calculations:</strong> Subtotal, Coupon Discounts (e.g. <code>SAVE10</code>, <code>SUPER20</code>), Delivery Charge ($4.99 or Free over $50), and Final Total.</li>
              <li><span className="check">✓</span> <strong>e) Action monitoring middleware:</strong> Custom Zustand middleware logs each cart mutation and displays it in the live "⚡ Middleware Logs" drawer.</li>
              <li><span className="check">✓</span> <strong>f) Browser storage persistence:</strong> Powered by Zustand's <code>persist</code> middleware storing cart in <code>localStorage</code>.</li>
              <li><span className="check">✓</span> <strong>g) Loading and error states:</strong> Handled seamlessly during store updates and checkout submissions.</li>
            </ul>
          </section>

          {/* Experiment 3 */}
          <section className="exp-block">
            <div className="exp-block-header">
              <span className="exp-pill exp-3">Experiment 3</span>
              <h3>Implement Product CRUD Operations using APIs</h3>
            </div>
            <p className="exp-topics">Topics: REST API, Axios/Fetch, CRUD Operations</p>
            <ul className="checklist">
              <li><span className="check">✓</span> <strong>a) Retrieve products using GET:</strong> Loads catalog via <code>GET /products</code>.</li>
              <li><span className="check">✓</span> <strong>b) Add products using POST:</strong> Click "+ Add Product" button to open modal and send <code>POST /products</code> with JSON payload.</li>
              <li><span className="check">✓</span> <strong>c) Update product using PUT/PATCH:</strong> Click the ✏️ Edit icon on any product to send <code>PUT /products/:id</code>.</li>
              <li><span className="check">✓</span> <strong>d) Delete products using DELETE:</strong> Click the 🗑️ Trash icon to send <code>DELETE /products/:id</code> with confirmation dialog.</li>
              <li><span className="check">✓</span> <strong>e) Handle asynchronous API responses:</strong> Captures response status codes (200, 201) and updates local state.</li>
              <li><span className="check">✓</span> <strong>f) Loading indicators during operations:</strong> Inline spinners on form submission and deletion.</li>
              <li><span className="check">✓</span> <strong>g) Error handling:</strong> Toast notifications and inline error alert banners.</li>
            </ul>
          </section>

          {/* Experiment 4 */}
          <section className="exp-block">
            <div className="exp-block-header">
              <span className="exp-pill exp-4">Experiment 4</span>
              <h3>Implement E-Commerce Authentication and Token Management</h3>
            </div>
            <p className="exp-topics">Topics: Authentication, Token Management, Protected API, Middleware</p>
            <ul className="checklist">
              <li><span className="check">✓</span> <strong>a) Login component using API authentication:</strong> Login form with credentials (<code>mor_2314</code> / <code>83r5^_</code>) submitting to <code>POST /auth/login</code>.</li>
              <li><span className="check">✓</span> <strong>b) Store authentication token:</strong> Stored under <code>jexocart_auth_token</code> in <code>localStorage</code>.</li>
              <li><span className="check">✓</span> <strong>c) Use token for authenticated API requests:</strong> Injected into HTTP headers as <code>Authorization: Bearer &lt;token&gt;</code>.</li>
              <li><span className="check">✓</span> <strong>d) Axios request interceptor:</strong> Configured in <code>src/api.js</code> to auto-attach tokens to every outgoing API request.</li>
              <li><span className="check">✓</span> <strong>e) Protected operations:</strong> Add to cart, Cart Checkout, and Order placement require active login.</li>
              <li><span className="check">✓</span> <strong>f) Logout and token removal:</strong> Clears token, username, and active session upon clicking "Logout".</li>
              <li><span className="check">✓</span> <strong>g) Invalid/expired token handling:</strong> Axios response interceptor intercepts HTTP 401, clears stored token, and dispatches <code>auth-expired</code> event with alert.</li>
            </ul>
          </section>
        </div>

        <div className="syllabus-footer">
          <button className="button button-wide" onClick={onClose}>Close Roadmap & Continue Testing</button>
        </div>
      </div>
    </div>
  );
}
