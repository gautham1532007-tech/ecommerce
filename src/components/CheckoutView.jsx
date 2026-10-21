import React, { useState } from "react";
import { getToken, api } from "../api";
import { useCartStore, calculateCartTotals } from "../store/useCartStore";

const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export default function CheckoutView({ onBack, onFinish, onNotify, onRequireLogin }) {
  const cart = useCartStore((state) => state.cart || []);
  const discountPercent = useCartStore((state) => state.discountPercent);
  const discountCode = useCartStore((state) => state.discountCode);

  const { subtotal, discount, deliveryCharge, finalAmount, totalQuantity } =
    calculateCartTotals(cart, discountPercent);

  const [shippingData, setShippingData] = useState({
    name: "Alex Morgan",
    email: "mor_2314@fakestoreapi.com",
    address: "742 Evergreen Terrace, Springfield, OR",
    phone: "+1 555-0199"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setShippingData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customer = {
      ...shippingData,
      name: shippingData.name.trim(),
      email: shippingData.email.trim(),
      address: shippingData.address.trim()
    };
    if (!customer.name || !customer.email || !customer.address) {
      setError("Please enter your name, a valid email address, and delivery address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (customer.name.length > 100 || customer.email.length > 254 || customer.address.length > 300) {
      setError("One or more shipping fields exceed the allowed length.");
      return;
    }
    const token = getToken();

    // Experiment 4 e: Protected checkout operation
    if (!token) {
      setError("Authentication required: No bearer token found. Please sign in.");
      onRequireLogin();
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Experiment 4 c & d: Use token for authenticated API request via Axios interceptor
      // We perform an authenticated test probe or cart submission
      const sampleHeader = `Authorization: Bearer ${token.slice(0, 15)}...${token.slice(-6)}`;

      // Probe API with token attached by interceptor
      await api.get("/users/1");

      const newOrder = {
        id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toLocaleString(),
        customer,
        items: [...cart],
        subtotal,
        discount,
        discountCode,
        deliveryCharge,
        total: finalAmount
      };

      onNotify?.(`Order #${newOrder.id} placed successfully with Authenticated Token!`);
      onFinish(newOrder);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session is invalid or has expired (HTTP 401). Please re-authenticate.");
        onRequireLogin();
      } else {
        setError("Unable to verify your session with the checkout service. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page compact-page">
      <p className="eyebrow">EXPERIMENT 4 · AUTHENTICATED CHECKOUT FLOW</p>
      <h1 className="page-title">Secure Checkout</h1>

      <div className="checkout-layout">
        {/* Shipping Form */}
        <form className="checkout-card" onSubmit={handleSubmit}>
          <h2>Shipping & Delivery Address</h2>
          <p className="muted">
            This operation is protected. Outgoing requests automatically inject the stored JWT token via Axios Request Interceptors.
          </p>

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              value={shippingData.name}
              onChange={handleChange}
              maxLength={100}
              autoComplete="name"
              aria-label="Full Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={shippingData.email}
              onChange={handleChange}
              maxLength={254}
              autoComplete="email"
              aria-label="Email Address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Delivery Address *</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              value={shippingData.address}
              onChange={handleChange}
              maxLength={300}
              autoComplete="street-address"
              aria-label="Delivery Address"
              required
            />
          </div>

          <div className="token-status-box">
            <div className="token-status-badge">
              <span className="dot active" />
              <span>Token Active in LocalStorage</span>
            </div>
            <code>Headers: Authorization: Bearer {getToken()?.slice(0, 18)}...</code>
          </div>

          {error && <div className="message error" role="alert">{error}</div>}

          <button
            className="button button-wide"
            type="submit"
            disabled={loading || cart.length === 0}
          >
            {loading ? "Authorizing & Placing Order..." : `Place Order · ${money(finalAmount)}`}
          </button>

          <button className="back-link" type="button" onClick={onBack}>
            ← Return to Cart
          </button>
        </form>

        {/* Order Review */}
        <aside className="summary-card">
          <h2>Order Items ({totalQuantity})</h2>
          <div className="checkout-items-list">
            {cart.map((item) => (
              <div className="summary-line" key={item.id}>
                <span>
                  {item.title.slice(0, 26)}{item.title.length > 26 ? "…" : ""} × {item.quantity}
                </span>
                <span>{money(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="summary-breakdown">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-line discount-line">
                <span>Discount ({discountCode})</span>
                <span>− {money(discount)}</span>
              </div>
            )}
            <div className="summary-line">
              <span>Delivery</span>
              <span>{deliveryCharge === 0 ? "Free" : money(deliveryCharge)}</span>
            </div>
            <div className="summary-line total">
              <span>Final Total</span>
              <strong>{money(finalAmount)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
