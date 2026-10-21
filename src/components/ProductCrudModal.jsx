import React, { useState, useEffect } from "react";
import { addProductApi, updateProductApi } from "../api";

export default function ProductCrudModal({ product, isOpen, onClose, onSave, categories = [], onNotify }) {
  const isEditing = Boolean(product && product.id);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "electronics",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        price: product.price || "",
        description: product.description || "",
        category: product.category || "electronics",
        image: product.image || "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
      });
    } else {
      setFormData({
        title: "",
        price: "",
        description: "",
        category: categories.find((c) => c !== "all") || "electronics",
        image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
      });
    }
    setApiResponse(null);
    setError("");
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    setApiResponse(null);

    const payload = {
      title: formData.title.trim(),
      price: parseFloat(formData.price),
      description: formData.description.trim(),
      category: formData.category,
      image: formData.image.trim() || "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
    };

    try {
      if (isEditing) {
        // Exp 3 c: Update product details using PUT
        const responseData = await updateProductApi(product.id, payload);
        setApiResponse({
          type: "PUT",
          endpoint: `/products/${product.id}`,
          status: 200,
          data: responseData
        });
        onNotify?.(`Product #${product.id} updated successfully via PUT request!`);
        // Notify parent state
        onSave?.({
          ...product,
          ...payload
        }, "update");
      } else {
        // Exp 3 b: Add products using POST
        const responseData = await addProductApi(payload);
        const newProduct = {
          ...payload,
          id: responseData.id || Date.now(),
          rating: { rate: 5.0, count: 1 }
        };
        setApiResponse({
          type: "POST",
          endpoint: "/products",
          status: 201,
          data: responseData
        });
        onNotify?.(`Product "${payload.title.slice(0, 20)}..." created via POST request! (New ID: ${newProduct.id})`);
        onSave?.(newProduct, "create");
      }

      // Close modal after brief feedback
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      // Exp 3 g: Handle API errors and display suitable messages
      setError(
        err.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} product via REST API. Check network and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card crud-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        <div className="crud-header">
          <p className="eyebrow">
            EXPERIMENT 3 · {isEditing ? "UPDATE PRODUCT (PUT)" : "ADD PRODUCT (POST)"}
          </p>
          <h2>{isEditing ? `Edit Product #${product.id}` : "Create New Product"}</h2>
          <p className="muted">
            {isEditing
              ? "Sends an HTTP PUT request to update the product resource on the REST API."
              : "Sends an HTTP POST request with JSON payload to add a new product."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="crud-form">
          <div className="form-group">
            <label htmlFor="title">Product Title *</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Ergonomic Mechanical Keyboard"
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="price">Price ($ USD) *</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="49.99"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
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
            <label htmlFor="image">Image URL</label>
            <input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product specifications, features, and warranty details..."
            />
          </div>

          {error && <div className="message error" role="alert">{error}</div>}

          {apiResponse && (
            <div className="message info">
              ✓ API Success: <strong>{apiResponse.type} {apiResponse.endpoint}</strong> (Status: {apiResponse.status})
            </div>
          )}

          <div className="crud-modal-actions">
            <button type="button" className="button button-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-inline" /> {isEditing ? "Sending PUT..." : "Sending POST..."}
                </>
              ) : (
                isEditing ? "Save Changes (PUT)" : "Create Product (POST)"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
