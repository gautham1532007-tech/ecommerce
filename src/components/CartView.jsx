import React, { useState } from "react";
import { useCartStore, calculateCartTotals } from "../store/useCartStore";

const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export default function CartView({ onCheckout, onShop, isLoggedIn, onOpenLogs, onNotify }) {
  const cart = useCartStore((state) => state.cart || []);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const discountCode = useCartStore((state) => state.discountCode);
  const discountPercent = useCartStore((state) => state.discountPercent);
  const discountMessage = useCartStore((state) => state.discountMessage);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  // Exp 2 d: Calculate subtotal, discount, delivery charge, and final amount
  const { subtotal, discount, deliveryCharge, finalAmount, totalQuantity } =
    calculateCartTotals(cart, discountPercent);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const result = applyCoupon(inputCoupon);
    if (result.success) {
      setInputCoupon("");
      onNotify?.(result.message);
    } else {
      setCouponError(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    onNotify?.("Coupon removed.");
  };

  return (
    <main className="page compact-page">
      <div className="cart-header-row">
        <div>
          <p className="eyebrow">EXPERIMENT 2 · ZUSTAND GLOBAL CART STATE</p>
          <h1 className="page-title">Shopping Cart ({totalQuantity} items)</h1>
        </div>

        <button
          className="button button-outline button-small middleware-log-btn"
          onClick={onOpenLogs}
          title="Inspect live Zustand action middleware monitor (Exp 2 e)"
        >
          ⚡ View Middleware Logs
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛍️</div>
          <h2>Your cart is currently empty</h2>
          <p className="muted">
            Explore our collection and add some products to verify global state management!
          </p>
          <button className="button" onClick={onShop}>
            Explore Products
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart items list */}
          <section className="cart-items">
            <div className="cart-items-header">
              <span>Item Description</span>
              <button
                className="text-button remove"
                onClick={() => {
                  clearCart();
                  onNotify?.("Cart cleared.");
                }}
                title="Empty entire cart (Exp 2 b)"
              >
                Clear Entire Cart
              </button>
            </div>

            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <img
                  src={item.image}
                  alt={item.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";
                  }}
                />
                <div className="cart-item-main">
                  <h3>{item.title}</h3>
                  <p className="item-category-tag">{item.category}</p>
                  <p className="price">{money(item.price)} each</p>
                  <button
                    className="text-button remove"
                    onClick={() => {
                      removeFromCart(item.id);
                      onNotify?.(`Removed "${item.title.slice(0, 20)}..." from cart`);
                    }}
                  >
                    Remove item
                  </button>
                </div>

                {/* Exp 2 b: updateQuantity() with increment/decrement buttons */}
                <div className="quantity">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(item.id, -1)}
                    title="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(item.id, 1)}
                    title="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-subtotal">
                  <span>{money(item.price * item.quantity)}</span>
                </div>
              </article>
            ))}
          </section>

          {/* Exp 2 d: Order summary and price calculations */}
          <aside className="summary-card">
            <h2>Order Summary</h2>

            {/* Coupon Code Input */}
            <div className="coupon-box">
              <label htmlFor="coupon-input">Promo / Coupon Code</label>
              {!discountCode ? (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    id="coupon-input"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Enter SAVE10 or SUPER20"
                  />
                  <button type="submit" className="button button-small">Apply</button>
                </form>
              ) : (
                <div className="applied-coupon-pill">
                  <span>🏷️ <strong>{discountCode}</strong> ({discountPercent}% OFF)</span>
                  <button type="button" onClick={handleRemoveCoupon} className="remove-coupon-btn">✕</button>
                </div>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}
              {discountMessage && <p className="coupon-success">{discountMessage}</p>}
              <p className="coupon-hint">Tip: Try code <code>SAVE10</code> or <code>SUPER20</code></p>
            </div>

            <div className="summary-breakdown">
              <div className="summary-line">
                <span>Subtotal ({totalQuantity} items)</span>
                <span>{money(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="summary-line discount-line">
                  <span>Discount ({discountPercent}%)</span>
                  <span>− {money(discount)}</span>
                </div>
              )}

              <div className="summary-line">
                <span>Delivery Charge</span>
                <span>{deliveryCharge === 0 ? <strong className="free-badge">FREE</strong> : money(deliveryCharge)}</span>
              </div>

              <div className="summary-line delivery-note">
                <small>
                  {deliveryCharge === 0
                    ? "✓ Free delivery applied (orders over $50)"
                    : "Add $ " + (50 - (subtotal - discount)).toFixed(2) + " more for FREE delivery"}
                </small>
              </div>

              {/* Exp 2 d: Final Amount */}
              <div className="summary-line total">
                <span>Final Amount</span>
                <strong>{money(finalAmount)}</strong>
              </div>
            </div>

            {!isLoggedIn && (
              <div className="auth-alert-pill">
                🔒 Sign in required before checkout (Experiment 4 e)
              </div>
            )}

            <button
              className="button button-wide"
              onClick={onCheckout}
              disabled={cart.length === 0}
            >
              {isLoggedIn ? `Proceed to Checkout · ${money(finalAmount)}` : "Login to Checkout"}
            </button>

            <button className="back-link" onClick={onShop}>
              ← Continue Shopping
            </button>

            <div className="state-persistence-badge">
              <span>💾 Persisted in browser localStorage (Exp 2 f)</span>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
