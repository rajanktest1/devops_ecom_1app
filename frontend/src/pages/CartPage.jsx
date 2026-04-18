import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Toast({ message, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 2500);
    return () => clearTimeout(t);
  }, [onHide]);
  return <div className="toast">{message}</div>;
}

export default function CartPage() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [toast, setToast]   = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/cart');
      setItems(data);
    } catch {
      setError('Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function updateQty(itemId, newQty) {
    if (newQty < 1) return;
    try {
      await axios.put(`/api/cart/${itemId}`, { quantity: newQty });
      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it))
      );
    } catch {
      setToast('❌ Could not update quantity.');
    }
  }

  async function removeItem(itemId, name) {
    try {
      await axios.delete(`/api/cart/${itemId}`);
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      setToast(`🗑️ ${name} removed from cart.`);
    } catch {
      setToast('❌ Could not remove item.');
    }
  }

  async function clearCart() {
    try {
      await Promise.all(items.map((it) => axios.delete(`/api/cart/${it.id}`)));
      setItems([]);
      setToast('🗑️ Cart cleared.');
    } catch {
      setToast('❌ Could not clear cart.');
    }
  }

  if (loading) return <div className="loading">Loading cart…</div>;
  if (error)   return <div className="error-msg">{error}</div>;

  const subtotal  = items.reduce((s, it) => s + Number(it.price) * it.quantity, 0);
  const itemCount = items.reduce((s, it) => s + it.quantity, 0);
  const shipping  = subtotal > 0 && subtotal < 50 ? 5.99 : 0;
  const total     = subtotal + shipping;

  if (items.length === 0) {
    return (
      <main className="page">
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary">Browse Products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <h1 className="page-title">Your Cart</h1>

      <div className="cart-table-wrapper">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="cart-item-name">
                    <span className="cart-item-emoji">{item.emoji}</span>
                    <Link to={`/product/${item.product_id}`} style={{ color: '#1a1a2e' }}>
                      {item.name}
                    </Link>
                  </div>
                </td>
                <td>${Number(item.price).toFixed(2)}</td>
                <td>
                  <div className="qty-control">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} aria-label="Decrease">−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} aria-label="Increase">+</button>
                  </div>
                </td>
                <td><strong>${(Number(item.price) * item.quantity).toFixed(2)}</strong></td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => removeItem(item.id, item.name)}
                    style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }}
                  >
                    🗑️ Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div className="cart-actions">
          <Link to="/" className="btn btn-outline">← Continue Shopping</Link>
          <button className="btn btn-secondary" onClick={clearCart}>🗑️ Clear Cart</button>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Items ({itemCount})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping {shipping === 0 ? '(Free over $50)' : ''}</span>
            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="cart-summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '1rem' }}
            onClick={() => setToast('🚧 Checkout coming soon!')}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>

      {toast && <Toast message={toast} onHide={() => setToast(null)} />}
    </main>
  );
}
