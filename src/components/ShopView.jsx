import React, { useState, useMemo } from "react";
import ProductCard from "./ProductCard";

export default function ShopView({
  products,
  loading,
  error,
  search,
  setSearch,
  category,
  setCategory,
  onAdd,
  onViewDetails,
  onOpenCreate,
  onEditProduct,
  onDeleteProduct,
  isLoggedIn,
  onRetry
}) {
  // Pagination State (Experiment 1 g: Pagination or limited product loading)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const categories = useMemo(() => ["all", ...new Set(products.map((p) => p.category))], [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesText = (p.title || "").toLowerCase().includes((search || "").toLowerCase());
      const matchesCategory = category === "all" || p.category === category;
      return matchesText && matchesCategory;
    });
  }, [products, search, category]);

  // Calculate paginated slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, validCurrentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 350, behavior: "smooth" });
    }
  };

  return (
    <main className="page">
      {/* Hero Banner */}
      <section className="hero">
        <div>
          <p className="eyebrow">SCENARIO 2 · FULL E-COMMERCE SUITE</p>
          <h1>
            Modern shopping.<br />
            <span>Built with APIs & State.</span>
          </h1>
          <p className="hero-copy">
            Explore REST API product fetching, dynamic modal details, Zustand global cart with middleware, full CRUD management, and protected token authentication.
          </p>
          <div className="hero-pills">
            <span>✓ Exp 1: REST API & Details</span>
            <span>✓ Exp 2: Zustand & Middleware</span>
            <span>✓ Exp 3: Product CRUD</span>
            <span>✓ Exp 4: Auth & Interceptor</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-circle">J</div>
          <div className="art-tag">
            SCENARIO 2<br />ALL 4 EXPS
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXPERIMENT 1 & 3 · PRODUCT CATALOG</p>
            <h2>Product Collection</h2>
          </div>
          <div className="heading-actions">
            <button
              className="button button-small add-product-btn"
              onClick={onOpenCreate}
              title="Add a new product via POST request (Exp 3 b)"
            >
              + Add Product (POST)
            </button>
          </div>
        </div>

        {/* Filter Controls (Exp 1 c: search and category filtering) */}
        <div className="filters">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              aria-label="Search products"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products by title..."
            />
          </div>

          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Exp 1 g: Pagination size selector */}
          <div className="per-page-select">
            <label htmlFor="per-page-select">Show:</label>
            <select
              id="per-page-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={4}>4 per page</option>
              <option value={8}>8 per page</option>
              <option value={12}>12 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>

        {/* Exp 1 f: Loading state */}
        {loading && (
          <div className="state-panel">
            <div className="spinner" />
            <p>Fetching products from FakeStore REST API (Axios GET /products)...</p>
          </div>
        )}

        {/* Exp 1 f: Error state */}
        {!loading && error && (
          <div className="state-panel error-panel">
            <p className="error-text">⚠️ {error}</p>
            <button className="button button-small" onClick={onRetry}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="state-panel">
            <div className="empty-icon">🔎</div>
            <h3>No products found</h3>
            <p className="muted">Try adjusting your search query or category filter.</p>
          </div>
        )}

        {/* Exp 1 b: Reusable ProductCard components list */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="catalog-meta-info">
              <span>Showing {paginatedProducts.length} of {filtered.length} products</span>
              <span>Page {validCurrentPage} of {totalPages}</span>
            </div>

            <div className="product-grid">
              {paginatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={onAdd}
                  onViewDetails={onViewDetails}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>

            {/* Exp 1 g: Pagination controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="page-nav-btn"
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage === 1}
                >
                  ← Previous
                </button>

                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      className={`page-num-btn ${pg === validCurrentPage ? "active" : ""}`}
                      onClick={() => handlePageChange(pg)}
                    >
                      {pg}
                    </button>
                  ))}
                </div>

                <button
                  className="page-nav-btn"
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
