import React, { useEffect, useRef, useState } from "react";
import { fetchProductByIdApi } from "../api";
import { useCartStore } from "../store/useCartStore";
import { getSafeProductImageUrl } from "../utils/productImage";

const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export default function ProductDetailModal({ productId, onClose, isLoggedIn, onRequireLogin, onNotify }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    async function loadDetail() {
      if (!productId) return;
      setLoading(true);
      setError("");
      try {
        // Experiment 1 d & e: Dynamic API request using async/await
        const data = await fetchProductByIdApi(productId, { signal: controller.signal });
        setProduct(data);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError("Failed to fetch product details from REST API. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadDetail();
    return () => {
      controller.abort();
      previousFocus?.focus?.();
    };
  }, [productId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = event.currentTarget;
      const focusable = dialog.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const dialog = document.querySelector('[role="dialog"][aria-label="Product details"]');
    dialog?.addEventListener("keydown", handleKeyDown);
    return () => dialog?.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleAdd = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (product) {
      addToCart(product, qty);
      onNotify?.(`${qty}x "${product.title.slice(0, 24)}..." added to cart!`);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Product details">
      <div className="modal-card detail-modal" onClick={(e) => e.stopPropagation()}>
        <button ref={closeButtonRef} className="modal-close-btn" onClick={onClose} aria-label="Close product details">✕</button>

        {loading && (
          <div className="modal-loading-state">
            <div className="spinner" />
            <p>Fetching dynamic product data (GET /products/{productId})...</p>
          </div>
        )}

        {!loading && error && (
          <div className="modal-error-state">
            <div className="message error">{error}</div>
            <button className="button button-small" onClick={() => setProduct(null)}>Retry</button>
          </div>
        )}

        {!loading && !error && product && (
          <div className="detail-content">
            <div className="detail-media">
              <img
                src={getSafeProductImageUrl(product.image)}
                alt={product.title}
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/product-placeholder.svg";
                }}
              />
              <div className="detail-badge-pill">
                <span>API ID: #{product.id}</span>
                <span>{product.category}</span>
              </div>
            </div>

            <div className="detail-info">
              <div className="detail-header">
                <span className="eyebrow">EXPERIMENT 1 · DYNAMIC PRODUCT DETAIL</span>
                <h2 id="product-detail-title">{product.title}</h2>
                <div className="detail-meta-row">
                  <span className="detail-price">{money(product.price)}</span>
                  <span className="rating-pill">★ {product.rating?.rate ?? "—"} ({product.rating?.count ?? 0} reviews)</span>
                </div>
              </div>

              <div className="detail-description">
                <h4>Product Description</h4>
                <p>{product.description}</p>
              </div>

              <div className="detail-actions">
                <div className="qty-picker">
                  <label htmlFor="modal-qty">Quantity:</label>
                  <div className="qty-controls">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                    <span id="modal-qty" aria-live="polite">{qty}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>+</button>
                  </div>
                </div>

                <button className="button button-wide" onClick={handleAdd}>
                  {isLoggedIn ? `Add to Cart · ${money(product.price * qty)}` : "Login to Add to Cart"}
                </button>
              </div>

              <div className="detail-footer-api-tag">
                <code>Endpoint: GET https://fakestoreapi.com/products/{productId}</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
