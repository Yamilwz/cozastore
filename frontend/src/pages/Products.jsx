import { useState, useEffect, useRef } from 'react';
import productService from '../services/productService';


import { resolveImage } from '../utils/resolveImage';

// Star rating component
const Stars = ({ rating, count }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= full ? '#f59e0b' : (i === full + 1 && half ? '#f59e0b' : '#d1d5db'), fontSize: '0.85rem' }}>
          {i <= full ? '★' : (i === full + 1 && half ? '⯨' : '☆')}
        </span>
      ))}
      <span className="text-muted ms-1">{rating > 0 ? `${rating} (${count})` : 'Sin reseñas'}</span>
    </span>
  );
};

// ── Cart sidebar component ──────────────────────────────────────────────────
const CartSidebar = ({ cart, onRemove, onClose, visible }) => {
  const total = cart.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 1040, backdropFilter: 'blur(3px)'
          }}
        />
      )}
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '380px',
        maxWidth: '95vw', background: '#fff', zIndex: 1050,
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
        boxShadow: '-4px 0 30px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-dark text-white">
          <h5 className="mb-0 fw-bold">🛒 Mi Carrito <span className="badge bg-primary ms-2">{cart.length}</span></h5>
          <button className="btn btn-sm btn-outline-light" onClick={onClose}>✕</button>
        </div>

        {/* Items */}
        <div className="flex-grow-1 overflow-auto p-3">
          {cart.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <span style={{ fontSize: '3rem' }}>🛒</span>
              <p className="mt-3">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="d-flex align-items-center gap-3 mb-3 p-2 rounded-3 bg-light border">
                <img
                  src={resolveImage(item.imageUrl)}
                  alt={item.name}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                />
                <div className="flex-grow-1 min-width-0">
                  <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>{item.name}</div>
                  <div className="small text-muted">{item.seller?.name || 'Ofertante'}</div>
                  <div className="fw-bold text-primary">${item.price.toFixed(2)}</div>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger flex-shrink-0"
                  onClick={() => onRemove(item.cartId)}
                >✕</button>
              </div>
            ))
          )}
        </div>

        {/* Footer total */}
        {cart.length > 0 && (
          <div className="p-4 border-top bg-light">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-semibold">Total ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
              <span className="fw-bold h5 text-primary mb-0">${total.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary w-100 fw-bold py-2">
              Proceder al Pago →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ── Main Products page ──────────────────────────────────────────────────────
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState(null); // track which product just got added
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const addedTimerRef = useRef(null);

  const CATEGORIES = ['Todos', 'Ropa', 'Calzado', 'Accesorios', 'Tecnología', 'Servicios', 'General'];

  useEffect(() => {
    (async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error al cargar productos', err);
      } finally {
        setLoading(false);
      }
    })();

    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  const addToCart = (product) => {
    const newCart = [...cart, { ...product, cartId: Date.now(), qty: 1 }];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));

    // Brief "added" animation on the button
    setAddedId(product.id);
    clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAddedId(null), 1500);

    // Open cart sidebar after short delay
    setTimeout(() => setCartOpen(true), 200);
  };

  const removeFromCart = (cartId) => {
    const newCart = cart.filter(i => i.cartId !== cartId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Filtering
  const visible = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'Todos' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  if (loading) return (
    <div className="container mt-5 py-5 text-center">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-3 text-muted">Cargando catálogo...</p>
    </div>
  );

  return (
    <>
      <CartSidebar
        cart={cart}
        onRemove={removeFromCart}
        onClose={() => setCartOpen(false)}
        visible={cartOpen}
      />

      <div className="container mt-5 pb-5">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">Catálogo de Productos</h2>
            <p className="text-muted mb-0">{visible.length} oferta{visible.length !== 1 ? 's' : ''} disponible{visible.length !== 1 ? 's' : ''}</p>
          </div>
          {/* Cart button */}
          <button
            className="btn btn-dark fw-semibold d-flex align-items-center gap-2 position-relative px-4"
            onClick={() => setCartOpen(true)}
          >
            🛒 Ver Carrito
            {cart.length > 0 && (
              <span className="badge bg-primary rounded-pill">{cart.length}</span>
            )}
          </button>
        </div>

        {/* Search + Category Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-7">
            <input
              type="text"
              className="form-control py-2 shadow-sm"
              placeholder="🔍  Buscar productos o servicios..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-5">
            <div className="d-flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`btn btn-sm fw-semibold px-3 ${categoryFilter === cat ? 'btn-dark' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: '20px' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {visible.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <span style={{ fontSize: '3rem' }}>🔎</span>
            <h5 className="mt-3">No se encontraron productos</h5>
          </div>
        ) : (
          <div className="row g-4">
            {visible.map((p) => {
              const isAdded = addedId === p.id;
              const avgRating = p.seller?.avgRating || 0;
              const reviewCount = p.seller?.reviewsCount || 0;

              return (
                <div key={p.id} className="col-sm-6 col-lg-4 col-xl-3">
                  <div
                    className="card h-100 border-0 shadow-sm product-card"
                    style={{ borderRadius: '14px', overflow: 'hidden', transition: 'transform .2s, box-shadow .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    {/* Product image */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={resolveImage(p.imageUrl)}
                        className="card-img-top"
                        alt={p.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800'; }}
                      />
                      {/* Category badge */}
                      <span
                        className="badge bg-dark text-white px-2 py-1"
                        style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.7rem', borderRadius: '8px', opacity: 0.85 }}
                      >
                        {p.category}
                      </span>
                    </div>

                    <div className="card-body d-flex flex-column p-3">
                      {/* Product name & description */}
                      <h6 className="card-title fw-bold text-dark mb-1 text-truncate" title={p.name}>{p.name}</h6>
                      <p className="card-text text-muted small mb-2" style={{
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {p.description}
                      </p>

                      {/* ── Seller info block ── */}
                      {p.seller && (
                        <div className="d-flex align-items-center gap-2 mb-2 p-2 rounded-2" style={{ background: '#f8f9fa' }}>
                          <img
                            src={resolveImage(p.seller.avatarUrl)}
                            alt={p.seller.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'; }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.8rem' }}>
                              {p.seller.name}
                            </div>
                            <Stars rating={avgRating} count={reviewCount} />
                          </div>
                        </div>
                      )}

                      {/* Price + Location */}
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold text-primary" style={{ fontSize: '1.15rem' }}>${p.price.toFixed(2)}</span>
                          {p.location && (
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>📍 {p.location}</span>
                          )}
                        </div>

                        {/* Add to cart button */}
                        <button
                          className={`btn w-100 fw-semibold py-2 ${isAdded ? 'btn-success' : 'btn-dark'}`}
                          style={{ borderRadius: '10px', transition: 'background .3s, transform .1s' }}
                          onClick={() => addToCart(p)}
                          disabled={isAdded}
                        >
                          {isAdded ? '✓ Agregado' : '🛒 Agregar al carrito'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
