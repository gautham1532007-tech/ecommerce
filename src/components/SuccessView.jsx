import React from "react";

const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export default function SuccessView({ order, onShop }) {
  if (!order) return null;

  return (
    <main className="page compact-page">
      <div className="success-card">
        <div className="success-check">✓</div>
        <p className="eyebrow">EXPERIMENT 4 · AUTHENTICATED ORDER PLACED</p>
        <h1>Thank you, {order.customer?.name || "Customer"}!</h1>
        <p>
          Your order <strong>#{order.id}</strong> has been authorized and confirmed.
        </p>
        <p className="muted">
          Authorization Token validated via Axios interceptor.
        </p>

        <div className="receipt-box">
          <div className="receipt-line">
            <span>Customer Email:</span>
            <strong>{order.customer?.email}</strong>
          </div>
          <div className="receipt-line">
            <span>Shipping Address:</span>
            <span>{order.customer?.address}</span>
          </div>
          <div className="receipt-line">
            <span>Subtotal:</span>
            <span>{money(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="receipt-line discount">
              <span>Coupon Discount ({order.discountCode}):</span>
              <span>− {money(order.discount)}</span>
            </div>
          )}
          <div className="receipt-line">
            <span>Delivery:</span>
            <span>{order.deliveryCharge === 0 ? "FREE" : money(order.deliveryCharge)}</span>
          </div>
          <div className="receipt-line total">
            <span>Total Paid:</span>
            <strong>{money(order.total)}</strong>
          </div>
        </div>

        <button className="button button-wide" onClick={onShop}>
          Continue Shopping
        </button>
      </div>
    </main>
  );
}
