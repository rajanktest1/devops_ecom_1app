import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <span className="emoji">{product.emoji}</span>
      <span className="name">{product.name}</span>
      <span className="category-tag">{product.category}</span>
      <span className="price">${Number(product.price).toFixed(2)}</span>
      <Link to={`/product/${product.id}`} className="btn btn-primary" style={{ marginTop: '0.4rem' }}>
        View Details
      </Link>
    </div>
  );
}
