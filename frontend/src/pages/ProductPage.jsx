import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function StarRating({ rating }) {
  return (
    <span className="stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < rating ? '★' : '☆'}</span>
      ))}
    </span>
  );
}

function Toast({ message, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 2500);
    return () => clearTimeout(t);
  }, [onHide]);
  return <div className="toast">{message}</div>;
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [qty, setQty]         = useState(1);
  const [toast, setToast]     = useState(null);
  const [adding, setAdding]   = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError('Product not found or server error.'))
      .finally(() => setLoading(false));
  }, [id]);

  function decQty() { setQty((q) => Math.max(1, q - 1)); }
  function incQty() { setQty((q) => Math.min(product?.stock ?? 99, q + 1)); }

  async function addToCart() {
    setAdding(true);
    try {
      await axios.post('/api/cart', { product_id: product.id, quantity: qty });
      setToast(`✅ ${product.name} added to cart!`);
    } catch {
      setToast('❌ Could not add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="loading">Loading product…</div>;
  if (error)   return <div className="error-msg">{error}</div>;

  const avgRating = product.reviews.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <main className="page">
      <Link to="/" className="back-link">← Back to Products</Link>

      <div className="product-detail">
        {/* Left — big emoji */}
        <div className="product-detail-left">
          <span className="emoji-large">{product.emoji}</span>
        </div>

        {/* Right — info + actions */}
        <div className="product-detail-right">
          <h1>{product.name}</h1>
          <span className="detail-category">{product.category}</span>
          <div className="detail-price">${Number(product.price).toFixed(2)}</div>
          <p className="detail-description">{product.description}</p>
          <p className="detail-stock">
            {product.stock > 0
              ? `✅ In Stock (${product.stock} available)`
              : '❌ Out of Stock'}
          </p>

          {product.stock > 0 && (
            <>
              <div className="qty-row">
                <label style={{ fontWeight: 600, fontSize: '0.92rem' }}>Qty:</label>
                <div className="qty-control">
                  <button onClick={decQty} aria-label="Decrease quantity">−</button>
                  <span>{qty}</span>
                  <button onClick={incQty} aria-label="Increase quantity">+</button>
                </div>
              </div>
              <button className="btn btn-primary" onClick={addToCart} disabled={adding} style={{ fontSize: '1rem', padding: '0.65rem 1.6rem' }}>
                {adding ? 'Adding…' : '🛒 Add to Cart'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2>
          Customer Reviews
          {avgRating && (
            <span style={{ marginLeft: '0.75rem', color: '#f5a623', fontSize: '1rem', fontWeight: 500 }}>
              ★ {avgRating} ({product.reviews.length})
            </span>
          )}
        </h2>

        {product.reviews.length === 0 ? (
          <p style={{ color: '#888' }}>No reviews yet.</p>
        ) : (
          product.reviews.map((r) => (
            <div className="review-card" key={r.id}>
              <div className="review-header">
                <span className="review-author">{r.reviewer_name}</span>
                <StarRating rating={r.rating} />
              </div>
              <p className="review-comment">{r.comment}</p>
            </div>
          ))
        )}
      </div>

      {toast && <Toast message={toast} onHide={() => setToast(null)} />}
    </main>
  );
}
