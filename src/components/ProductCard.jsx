import React from "react";
import { getSafeProductImageUrl } from "../utils/productImage";

const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;
const ProductCard = React.memo(function ProductCard({
  product,
  onAdd,
  onViewDetails,
  onEdit,
  onDelete,
  isLoggedIn
}) {
  return (
    <article className="product-card" id={`product-${product.id}`}>
      <div className="product-image-wrap">
        <img
          src={getSafeProductImageUrl(product.image)}
          alt={product.title}
          loading="lazy"
          decoding="async"
          width="300"
          height="220"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/product-placeholder.svg";
          }}
        />
        <button
          className="quick-view-btn"
          type="button"
          aria-label={`Quick view ${product.title}`}
          onClick={() => onViewDetails(product.id)}
          title="Quick View Details (Exp 1)"
        >
          👁 Quick View
        </button>
      </div>

      <div className="product-info">
        <div className="product-meta-header">
          <span className="category">{product.category}</span>
          <span className="crud-badge">ID #{product.id}</span>
        </div>

        <h3>
          <button
            type="button"
            title={product.title}
            onClick={() => onViewDetails(product.id)}
            className="clickable-title"
            aria-label={`View details for ${product.title}`}
          >
            {product.title}
          </button>
        </h3>

        <div className="product-bottom">
          <strong className="price">{money(product.price)}</strong>
          <span className="rating" title={`${product.rating?.rate ?? 0} out of 5 stars`}>
            ★ {product.rating?.rate ?? "—"} <small>({product.rating?.count ?? 0})</small>
          </span>
        </div>

        <div className="card-actions-row">
          <button
            className="button button-wide"
            onClick={() => onAdd(product)}
            type="button"
          >
            {isLoggedIn ? "Add to cart" : "Login to add"}
          </button>

          <div className="crud-icon-group">
            <button
              className="icon-btn edit-btn"
              onClick={() => onEdit(product)}
              title="Edit Product (Exp 3 PUT)"
              aria-label={`Edit ${product.title}`}
              type="button"
            >
              ✏️
            </button>
            <button
              className="icon-btn delete-btn"
              onClick={() => onDelete(product)}
              title="Delete Product (Exp 3 DELETE)"
              aria-label={`Delete ${product.title}`}
              type="button"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

export default ProductCard;
