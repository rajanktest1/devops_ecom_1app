import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    axios.get('/api/products')
      .then(({ data }) => setProducts(data))
      .catch(() => setError('Failed to load products. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading products…</div>;
  if (error)   return <div className="error-msg">{error}</div>;

  return (
    <main className="page">
      <h1 className="page-title">Our Products <span style={{ fontWeight: 400, fontSize: '1rem', color: '#888' }}>({products.length} items)</span></h1>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
}
