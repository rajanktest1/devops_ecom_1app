import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  // Poll cart item count so the badge stays in sync across pages
  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const { data } = await axios.get('/api/cart');
        if (!cancelled) {
          setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
        }
      } catch {
        // silently ignore
      }
    }

    fetchCount();
    const timer = setInterval(fetchCount, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🛍️ ShopEmoji</Link>
      <div className="navbar-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/cart" className="cart-badge">
          🛒 Cart {cartCount > 0 && <span>({cartCount})</span>}
        </NavLink>
      </div>
    </nav>
  );
}
