import React, { lazy, Suspense, useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import ShopView from "./components/ShopView";
import CartView from "./components/CartView";
import LoginView from "./components/LoginView";
import SuccessView from "./components/SuccessView";
import ProductCrudModal from "./components/ProductCrudModal";
import MiddlewareLogDrawer from "./components/MiddlewareLogDrawer";
import ExperimentOverviewModal from "./components/ExperimentOverviewModal";
import ProductCrudManager from "./components/ProductCrudManager";
import {
  fetchProductsApi,
  deleteProductApi,
  getToken,
  getStoredUsername,
  removeToken
} from "./api";
import { useCartStore } from "./store/useCartStore";

const CheckoutView = lazy(() => import("./components/CheckoutView"));
const ProductDetailModal = lazy(() => import("./components/ProductDetailModal"));

const LazyPageFallback = () => (
  <div className="state-panel" role="status" aria-live="polite">
    <div className="spinner" aria-hidden="true" />
    <p>Loading page…</p>
  </div>
);

export default function App() {
  const [page, setPage] = useState("shop");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Authentication State (Experiment 4)
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUsername());

  // Modal / Drawer States
  const [detailProductId, setDetailProductId] = useState(null);
  const [crudModalOpen, setCrudModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  // Notifications & Checkout
  const [toast, setToast] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  // Cart actions from Zustand store (Experiment 2)
  const addToCart = useCartStore((state) => state.addToCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const isLoggedIn = Boolean(token);

  // Toast Notification helper
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Experiment 1 a & e: Fetch products from REST API using Axios and async/await
  const loadProducts = useCallback(async (signal) => {
    setLoadingProducts(true);
    setProductError("");
    try {
      const data = await fetchProductsApi(undefined, { signal });
      setProducts(data);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setProductError("Failed to fetch products from REST API. Please check your internet connection.");
      }
    } finally {
      if (!signal?.aborted) setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal);
    return () => controller.abort();
  }, [loadProducts]);

  // Experiment 4 g: Handle invalid or expired tokens (triggered by Axios response interceptor on 401)
  useEffect(() => {
    const handleAuthExpired = () => {
      removeToken();
      setToken(null);
      setUser("");
      showToast("Your session has expired or is invalid (HTTP 401). Please sign in again.", "error");
      setPage("login");
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, [showToast]);

  // Authentication Handlers (Experiment 4 a, b, f)
  const handleLoginSuccess = (newToken, newUsername) => {
    setToken(newToken);
    setUser(newUsername);
    setPage("shop");
    showToast(`Successfully logged in as ${newUsername}`, "success");
  };

  const handleLogout = () => {
    // Experiment 4 f: Implement logout and token removal
    removeToken();
    setToken(null);
    setUser("");
    showToast("Logged out successfully. Authentication token removed.", "info");
    setPage("shop");
  };

  const handleRequireLogin = useCallback(() => {
    showToast("Please sign in with your credentials to access this feature.", "info");
    setPage("login");
  }, [showToast]);

  // Experiment 2 b & Experiment 4 e: Add to cart with authentication verification
  const handleAddToCart = useCallback((product) => {
    if (!isLoggedIn) {
      handleRequireLogin();
      return;
    }
    addToCart(product, 1);
    showToast(`Added "${product.title.slice(0, 22)}..." to cart!`, "success");
  }, [addToCart, handleRequireLogin, isLoggedIn, showToast]);

  // Experiment 3 b & c: Add / Update Product handler
  const handleSaveProduct = (savedProduct, actionType) => {
    if (actionType === "create") {
      setProducts((prev) => [savedProduct, ...prev]);
    } else if (actionType === "update") {
      setProducts((prev) =>
        prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );
    }
  };

  // Experiment 3 d: Delete products using DELETE API
  const handleDeleteProduct = useCallback(async (product) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete:\n"${product.title}" (ID #${product.id})?\n\nThis will send an HTTP DELETE request to /products/${product.id}.`
    );
    if (!confirmDelete) return;

    try {
      showToast(`Sending DELETE /products/${product.id}...`, "info");
      await deleteProductApi(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`Product #${product.id} deleted successfully via DELETE API!`, "success");
    } catch (err) {
      showToast(`Failed to delete product #${product.id}: ${err.message}`, "error");
    }
  }, [showToast]);

  const handleOpenEdit = useCallback((product) => {
    setEditingProduct(product);
    setCrudModalOpen(true);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingProduct(null);
    setCrudModalOpen(true);
  }, []);

  const handleFinishCheckout = (order) => {
    setLastOrder(order);
    clearCart();
    setPage("success");
  };

  return (
    <div className="app-shell">
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`} role="alert">
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === "success" ? "✓" : toast.type === "error" ? "⚠️" : "ℹ️"}
            </span>
            <span>{toast.message}</span>
          </div>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Global Header */}
      <Header
        page={page}
        setPage={setPage}
        user={user}
        token={token}
        onLogout={handleLogout}
        onOpenLogs={() => setIsLogsOpen(true)}
        onOpenMatrix={() => setIsMatrixOpen(true)}
      />

      {/* Page Routing */}
      {page === "shop" && (
        <ShopView
          products={products}
          loading={loadingProducts}
          error={productError}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          onAdd={handleAddToCart}
          onViewDetails={setDetailProductId}
          onOpenCreate={handleOpenCreate}
          onEditProduct={handleOpenEdit}
          onDeleteProduct={handleDeleteProduct}
          isLoggedIn={isLoggedIn}
          onRetry={() => loadProducts()}
        />
      )}

      {page === "crud" && (
        <ProductCrudManager
          products={products}
          onAddProduct={(newP) => handleSaveProduct(newP, "create")}
          onUpdateProduct={(updP) => handleSaveProduct(updP, "update")}
          onDeleteProduct={handleDeleteProduct}
          onViewDetails={setDetailProductId}
          onNotify={showToast}
        />
      )}

      {page === "cart" && (
        <CartView
          onCheckout={() => {
            if (!isLoggedIn) {
              handleRequireLogin();
            } else {
              setPage("checkout");
            }
          }}
          onShop={() => setPage("shop")}
          isLoggedIn={isLoggedIn}
          onOpenLogs={() => setIsLogsOpen(true)}
          onNotify={showToast}
        />
      )}

      {page === "login" && (
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setPage("shop")}
          onNotify={showToast}
        />
      )}

      {page === "checkout" && (
        <Suspense fallback={<LazyPageFallback />}>
          <CheckoutView
            onBack={() => setPage("cart")}
            onFinish={handleFinishCheckout}
            onNotify={showToast}
            onRequireLogin={handleRequireLogin}
          />
        </Suspense>
      )}

      {page === "success" && (
        <SuccessView
          order={lastOrder}
          onShop={() => setPage("shop")}
        />
      )}

      {/* Experiment 1 d: Dynamic Product Detail Modal */}
      {detailProductId && (
        <Suspense fallback={<LazyPageFallback />}>
          <ProductDetailModal
            productId={detailProductId}
            onClose={() => setDetailProductId(null)}
            isLoggedIn={isLoggedIn}
            onRequireLogin={handleRequireLogin}
            onNotify={showToast}
          />
        </Suspense>
      )}

      {/* Experiment 3 b & c: Product CRUD Modal (Add / Edit) */}
      <ProductCrudModal
        isOpen={crudModalOpen}
        product={editingProduct}
        onClose={() => {
          setCrudModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        categories={["all", ...new Set(products.map((p) => p.category))]}
        onNotify={showToast}
      />

      {/* Experiment 2 e: Middleware Monitoring Drawer */}
      <MiddlewareLogDrawer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />

      {/* Experiments 1–4 Verification Roadmap Modal */}
      <ExperimentOverviewModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
      />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-meta">
          <strong>JexoCart</strong> — Scenario 2 Comprehensive Lab Suite
          <div className="footer-chips">
            <span>Exp 1: REST API & Async Data</span>
            <span>Exp 2: Zustand & Middleware</span>
            <span>Exp 3: Product CRUD (GET/POST/PUT/DELETE)</span>
            <span>Exp 4: Auth & Token Interceptors</span>
          </div>
        </div>
        <div className="footer-links">
          <button className="text-button" onClick={() => setIsMatrixOpen(true)}>
            View Syllabus Matrix
          </button>
          <span>© 2026 JexoCart · Vite + React</span>
        </div>
      </footer>
    </div>
  );
}