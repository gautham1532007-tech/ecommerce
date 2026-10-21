import React, { useState, useMemo } from "react";
import {
  fetchProductsApi,
  addProductApi,
  updateProductApi,
  deleteProductApi
} from "../api";

const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export default function ProductCrudManager({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onViewDetails,
  onNotify
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "create" | "edit" | null

  // CRUD Form state
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "electronics",
    description: "",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
  });

  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Live API Inspector state (Shows the latest API operation details for viva/lab demonstration)
  const [apiLog, setApiLog] = useState({
    method: "GET",
    endpoint: "/products",
    status: "200 OK",
    timestamp: new Date().toLocaleTimeString(),
    payload: null,
    response: { message: "Products loaded from REST API", count: products.length }
  });

  const categories = useMemo(() => {
    return ["all", ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchText = (p.title || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchText && matchCat;
    });
  }, [products, search, categoryFilter]);

  // Open Create Modal (POST)
  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setFormData({
      title: "",
      price: "",
      category: "electronics",
      description: "",
      image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
    });
    setActionError("");
    setModalMode("create");
  };

  // Open Edit Modal (PUT)
  const handleOpenEdit = (p) => {
    setSelectedProduct(p);
    setFormData({
      title: p.title || "",
      price: p.price || "",
      category: p.category || "electronics",
      description: p.description || "",
      image: p.image || "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
    });
    setActionError("");
    setModalMode("edit");
  };

  // Submit Handler for POST / PUT
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price) {
      setActionError("Please provide both product title and price.");
      return;
    }

    setLoading(true);
    setActionError("");

    const payload = {
      title: formData.title.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description.trim(),
      image: formData.image.trim() || "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
    };

    try {
      if (modalMode === "create") {
        // Exp 3 b: Add products using POST
        const result = await addProductApi(payload);
        const newProduct = {
          ...payload,
          id: result?.id || Date.now(),
          rating: { rate: 5.0, count: 1 }
        };

        setApiLog({
          method: "POST",
          endpoint: "/products",
          status: "201 Created",
          timestamp: new Date().toLocaleTimeString(),
          payload,
          response: result
        });

        onAddProduct(newProduct);
        onNotify?.(`Product created via POST /products! New ID: #${newProduct.id}`);
      } else if (modalMode === "edit" && selectedProduct) {
        // Exp 3 c: Update product details using PUT
        const result = await updateProductApi(selectedProduct.id, payload);
        const updatedProduct = {
          ...selectedProduct,
          ...payload
        };

        setApiLog({
          method: "PUT",
          endpoint: `/products/${selectedProduct.id}`,
          status: "200 OK",
          timestamp: new Date().toLocaleTimeString(),
          payload,
          response: result
        });

        onUpdateProduct(updatedProduct);
        onNotify?.(`Product #${selectedProduct.id} updated via PUT /products/${selectedProduct.id}!`);
      }

      setModalMode(null);
    } catch (err) {
      // Exp 3 g: Handle API errors
      setActionError(err.response?.data?.message || err.message || "Failed to process API request.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Handler (DELETE)
  const handleDelete = async (p) => {
    const confirmDelete = window.confirm(
      `Confirm Deletion (Exp 3 d):\n\nDo you want to send HTTP DELETE /products/${p.id} for "${p.title}"?`
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      // Exp 3 d: Delete products using DELETE
      const result = await deleteProductApi(p.id);

      setApiLog({
        method: "DELETE",
        endpoint: `/products/${p.id}`,
        status: "200 OK",
        timestamp: new Date().toLocaleTimeString(),
        payload: { id: p.id },
        response: result || { message: `Product #${p.id} successfully deleted.` }
      });

      onDeleteProduct(p);
      onNotify?.(`Product #${p.id} deleted via DELETE /products/${p.id}!`);
    } catch (err) {
      onNotify?.(`Delete error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page compact-page">
      {/* Header Row */}
      <div className="crud-dashboard-header">
        <div>
          <span className="eyebrow">EXPERIMENT 3 · REST API CRUD MANAGEMENT</span>
          <h1 className="page-title">Product CRUD Dashboard</h1>
          <p className="muted">
            Directly test HTTP <strong>GET</strong> (Retrieve), <strong>POST</strong> (Add), <strong>PUT</strong> (Update), and <strong>DELETE</strong> operations with live API response auditing.
          </p>
        </div>

        <button
          className="button button-small add-btn-crud"
          onClick={handleOpenCreate}
        >
          + Add New Product (POST)
        </button>
      </div>

      {/* Live API Inspector Panel */}
      <div className="api-inspector-card">
        <div className="inspector-top">
          <div className="inspector-title-group">
            <span className="live-indicator-dot" />
            <strong>Live REST API Inspector</strong>
            <span className="api-timestamp">{apiLog.timestamp}</span>
          </div>

          <div className="inspector-badges">
            <span className={`method-badge method-${apiLog.method.toLowerCase()}`}>
              {apiLog.method}
            </span>
            <span className="endpoint-tag">https://fakestoreapi.com{apiLog.endpoint}</span>
            <span className="status-badge">{apiLog.status}</span>
          </div>
        </div>

        <div className="inspector-grid">
          {apiLog.payload && (
            <div className="inspector-col">
              <span className="json-label">Request Payload (JSON):</span>
              <pre>{JSON.stringify(apiLog.payload, null, 2)}</pre>
            </div>
          )}
          <div className="inspector-col">
            <span className="json-label">API Response Output:</span>
            <pre>{JSON.stringify(apiLog.response, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="crud-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search products by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c.toUpperCase()}
            </option>
          ))}
        </select>

        <span className="crud-stats-chip">
          {filteredProducts.length} Products Found
        </span>
      </div>

      {/* CRUD Table View */}
      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead>
            <tr>
              <th style={{ width: "70px" }}>ID</th>
              <th style={{ width: "90px" }}>Image</th>
              <th>Product Details</th>
              <th style={{ width: "140px" }}>Category</th>
              <th style={{ width: "100px" }}>Price</th>
              <th style={{ width: "90px" }}>Rating</th>
              <th style={{ width: "180px", textAlign: "right" }}>REST API Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty-cell">
                  No products matched your search.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="id-badge">#{p.id}</span>
                  </td>
                  <td>
                    <img
                      src={p.image}
                      alt={p.title}
                      className="table-product-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80";
                      }}
                    />
                  </td>
                  <td>
                    <div className="table-product-info">
                      <strong className="table-product-title" title={p.title}>
                        {p.title}
                      </strong>
                      <p className="table-product-desc">
                        {p.description ? p.description.slice(0, 75) + "..." : "No description"}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className="table-cat-pill">{p.category}</span>
                  </td>
                  <td>
                    <strong className="table-price">{money(p.price)}</strong>
                  </td>
                  <td>
                    <span className="table-rating">★ {p.rating?.rate ?? "5.0"}</span>
                  </td>
                  <td>
                    <div className="table-actions-cell">
                      <button
                        className="table-action-btn view"
                        onClick={() => onViewDetails(p.id)}
                        title="View details (GET /products/:id)"
                      >
                        👁 View
                      </button>
                      <button
                        className="table-action-btn edit"
                        onClick={() => handleOpenEdit(p)}
                        title="Edit product (PUT /products/:id)"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="table-action-btn delete"
                        onClick={() => handleDelete(p)}
                        title="Delete product (DELETE /products/:id)"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Create (POST) / Edit (PUT) */}
      {modalMode && (
        <div className="modal-backdrop" onClick={() => setModalMode(null)} role="dialog" aria-modal="true">
          <div className="modal-card crud-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setModalMode(null)} aria-label="Close modal">✕</button>

            <div className="crud-header">
              <p className="eyebrow">
                EXPERIMENT 3 · {modalMode === "create" ? "HTTP POST REQUEST" : "HTTP PUT REQUEST"}
              </p>
              <h2>{modalMode === "create" ? "Add New Product" : `Update Product #${selectedProduct?.id}`}</h2>
              <p className="muted">
                {modalMode === "create"
                  ? "Sends a POST request with JSON payload to /products to insert a new item."
                  : `Sends a PUT request to /products/${selectedProduct?.id} to update properties.`}
              </p>
            </div>

            <form onSubmit={handleSubmitForm} className="crud-form">
              <div className="form-group">
                <label htmlFor="crud-title">Title *</label>
                <input
                  id="crud-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="crud-price">Price ($ USD) *</label>
                  <input
                    id="crud-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="79.99"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="crud-category">Category *</label>
                  <select
                    id="crud-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="electronics">electronics</option>
                    <option value="jewelery">jewelery</option>
                    <option value="men's clothing">men's clothing</option>
                    <option value="women's clothing">women's clothing</option>
                    <option value="accessories">accessories</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="crud-image">Image URL</label>
                <input
                  id="crud-image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/product.jpg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="crud-desc">Description</label>
                <textarea
                  id="crud-desc"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description, technical specifications, and warranty..."
                />
              </div>

              {actionError && <div className="message error" role="alert">{actionError}</div>}

              <div className="crud-modal-actions">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setModalMode(null)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-inline" /> Sending {modalMode === "create" ? "POST..." : "PUT..."}
                    </>
                  ) : (
                    modalMode === "create" ? "Submit POST /products" : `Submit PUT /products/${selectedProduct?.id}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
