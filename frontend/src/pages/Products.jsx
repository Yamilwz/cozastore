import { useState, useEffect } from 'react';
import productService from '../services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar productos');
        setLoading(false);
      }
    };

    fetchProducts();
    
    // Cargar carrito desde localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  const addToCart = (product) => {
    const newCart = [...cart, { ...product, cartId: Date.now() }];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert(`${product.name} agregado al carrito`);
  };

  if (loading) return <div className="container mt-5 text-center">Cargando productos...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Catálogo de Productos</h2>
        <div className="position-relative">
          <span className="btn btn-outline-dark">
            🛒 Carrito <span className="badge bg-dark ms-1">{cart.length}</span>
          </span>
        </div>
      </div>

      <div className="row g-4">
        {products.map((p) => (
          <div key={p.id} className="col-md-3">
            <div className="card h-100 shadow-sm border-0 product-card">
              <img
                src={p.imageUrl || 'https://via.placeholder.com/300'}
                className="card-img-top"
                alt={p.name}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text text-muted small">{p.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5 mb-0 text-primary">${p.price.toFixed(2)}</span>
                  <button
                    className="btn btn-sm btn-dark"
                    onClick={() => addToCart(p)}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
