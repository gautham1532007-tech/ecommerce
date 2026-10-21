import React from "react";
import { useCartStore } from "../store/useCartStore";

export default function Header({
  page,
  setPage,
  user,
  token,
  onLogout,
  onOpenLogs,
  onOpenMatrix
}) {
  const cart = useCartStore((state) => state.cart || []);
  const cartCount = (cart || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <header className="topbar">
      <div className="topbar-brand-group">
        <button className="brand" onClick={() => setPage("shop")} aria-label="Go to shop">
          <span className="brand-mark">J</span>
          <span>jexo<span className="brand-light">cart</span></span>
        </button>
        <span className="brand-scenario-badge">Scenario 2 · Exps 1–4</span>
      </div>

      <nav className="topbar-nav">
        <button
          className={page === "shop" ? "nav-link active" : "nav-link"}
          onClick={() => setPage("shop")}
        >
          Shop Catalog
        </button>

        <button
          className={page === "crud" ? "nav-link active" : "nav-link"}
          onClick={() => setPage("crud")}
          title="Product CRUD Dashboard (Exp 3: GET, POST, PUT, DELETE)"
        >
          📦 Product CRUD
        </button>

        <button
          className={page === "cart" ? "nav-link active" : "nav-link"}
          onClick={() => setPage("cart")}
        >
          Cart <span className="count">{cartCount}</span>
        </button>

        <button
          className="nav-link nav-btn-outline"
          onClick={onOpenLogs}
          title="Inspect live Zustand action middleware monitor (Exp 2 e)"
        >
          ⚡ Middleware
        </button>

        <button
          className="nav-link nav-btn-matrix"
          onClick={onOpenMatrix}
          title="View full lab verification matrix across Experiments 1 to 4"
        >
          📋 Lab Matrix
        </button>

        <div className="nav-auth-section">
          {token && user ? (
            <div className="user-profile-badge">
              <span className="user-name">Hi, <strong>{user}</strong></span>
              <button
                className="button button-small button-outline logout-btn"
                onClick={onLogout}
                title="Logout and delete stored token (Exp 4 f)"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="button button-small login-nav-btn"
              onClick={() => setPage("login")}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
