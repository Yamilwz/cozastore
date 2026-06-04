import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import productService from '../services/productService';
import requestService from '../services/requestService';
import messageService from '../services/messageService';
import axios from 'axios';
import API_BASE from '../config/api';
import { resolveImage } from '../utils/resolveImage';

// ── Star Rating Component ─────────────────────────────────────────────────────
const Stars = ({ rating, count, interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            color: i <= (hovered || rating) ? '#f59e0b' : '#d1d5db',
            fontSize: interactive ? '1.2rem' : '0.85rem',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'color .1s'
          }}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate && onRate(i)}
        >★</span>
      ))}
      {!interactive && (
        <span className="text-muted ms-1">{rating > 0 ? `${rating} (${count})` : 'Sin reseñas'}</span>
      )}
    </span>
  );
};

// ── Review Modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ seller, token, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Selecciona una calificación');
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/products/seller/${seller.id}/review`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('¡Calificación enviada!');
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al enviar calificación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1040 }} />
      <div className="modal d-block" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">⭐ Calificar a {seller.name}</h5>
                <button type="button" className="btn-close" onClick={onClose} />
              </div>
              <div className="modal-body text-center">
                <p className="text-muted small mb-3">¿Cómo fue tu experiencia con este vendedor?</p>
                <div className="mb-3 d-flex justify-content-center">
                  <Stars rating={rating} interactive onRate={setRating} />
                </div>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Comentario opcional..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-warning fw-bold" disabled={submitting || rating === 0}>
                  {submitting ? 'Enviando...' : 'Enviar Calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Request + Chat Modal ──────────────────────────────────────────────────────
const RequestModal = ({ product, onClose, onOpenChat }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestService.createRequest({ productId: product.id, message });
      // Send initial message to seller
      await messageService.sendMessage({
        receiverId: product.sellerId,
        message: `Hola, me interesa tu producto "${product.name}". ${message}`,
        productId: product.id
      });
      onClose();
      onOpenChat(product.seller, product);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al enviar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1040 }} />
      <div className="modal d-block" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">✉ Solicitar: {product.name}</h5>
                <button type="button" className="btn-close" onClick={onClose} />
              </div>
              <div className="modal-body">
                <div className="d-flex gap-3 align-items-center mb-3 p-2 bg-light rounded-3">
                  <img src={resolveImage(product.imageUrl)} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div>
                    <div className="fw-bold">{product.name}</div>
                    <div className="small text-muted">Ofertante: {product.seller?.name}</div>
                    <div className="fw-bold text-primary">${product.price?.toFixed(2)}</div>
                  </div>
                </div>
                <p className="small text-muted mb-2">Escribe tu mensaje al ofertante. Se abrirá un chat directo al enviar.</p>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Ej: ¿Está disponible? ¿Puede enviar a mi ciudad?"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary fw-bold" disabled={submitting}>
                  {submitting ? 'Enviando...' : '📨 Solicitar y Chatear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main Products page ────────────────────────────────────────────────────────
const Products = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'requests', 'chat'

  // Catalog State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('recent');

  // Sent Requests State
  const [sentRequests, setSentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Embedded Chat State
  const [conversations, setConversations] = useState([]);
  const [selectedChatConv, setSelectedChatConv] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);

  const messagesEndRef = useRef(null);
  const chatPollRef = useRef(null);

  // Modals
  const [requestModal, setRequestModal] = useState(null);   // product object
  const [reviewModal, setReviewModal] = useState(null);     // seller object

  const CATEGORIES = ['Todos', 'Ropa', 'Calzado', 'Accesorios', 'Tecnología', 'Servicios', 'General'];

  // Load products catalog
  useEffect(() => {
    if (activeTab === 'catalog') {
      (async () => {
        setLoading(true);
        try {
          const data = await productService.getProducts(null, sortOrder);
          setProducts(data);
        } catch (err) {
          console.error('Error al cargar productos', err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [sortOrder, activeTab]);

  // Load sent requests
  const fetchSentRequests = async () => {
    if (!token) return;
    setRequestsLoading(true);
    try {
      const data = await requestService.getSentRequests();
      setSentRequests(data);
    } catch (err) {
      console.error('Error al cargar solicitudes enviadas', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchSentRequests();
    }
  }, [activeTab, token]);

  // Load conversations list
  const fetchConversations = async () => {
    if (!token) return;
    setChatLoading(true);
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error cargando conversaciones', err);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchConversations();
    }
  }, [activeTab, token]);

  // Load messages for selected conversation in chat tab + polling
  const fetchChatMessages = async (conv) => {
    if (!conv || !token) return;
    try {
      const data = await messageService.getMessages(conv.otherUser.id, conv.product?.id || null);
      setChatMessages(data);
    } catch (err) {
      console.error('Error cargando mensajes', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'chat' && selectedChatConv) {
      fetchChatMessages(selectedChatConv);
      chatPollRef.current = setInterval(() => fetchChatMessages(selectedChatConv), 3000);
    }
    return () => clearInterval(chatPollRef.current);
  }, [activeTab, selectedChatConv, token]);

  // Scroll chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleOpenChat = (seller, product) => {
    setSelectedChatConv({ otherUser: seller, product });
    setActiveTab('chat');
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !selectedChatConv || !token) return;
    setChatSending(true);
    try {
      const sent = await messageService.sendMessage({
        receiverId: selectedChatConv.otherUser.id,
        message: newChatMessage.trim(),
        productId: selectedChatConv.product?.id || null
      });
      setChatMessages(prev => [...prev, sent]);
      setNewChatMessage('');
      fetchConversations(); // refresh conversations list
    } catch (err) {
      alert('Error al enviar mensaje');
    } finally {
      setChatSending(false);
    }
  };

  // Filtering products
  const visible = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'Todos' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <>
      {/* Modals */}
      {requestModal && (
        <RequestModal
          product={requestModal}
          onClose={() => setRequestModal(null)}
          onOpenChat={handleOpenChat}
        />
      )}
      {reviewModal && (
        <ReviewModal
          seller={reviewModal}
          token={token}
          onClose={() => setReviewModal(null)}
        />
      )}

      <div className="container mt-5 pb-5">
        
        {/* Comprador/Buyer Header Navigation Tabs */}
        {user && user.role === 'comprador' && (
          <div className="d-flex border-bottom border-light mb-4 gap-2">
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${activeTab === 'catalog' ? 'btn-primary bg-primary text-white shadow-sm' : 'btn-light text-muted'}`}
            >
              🛍️ Catálogo de Ofertas
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${activeTab === 'requests' ? 'btn-primary bg-primary text-white shadow-sm' : 'btn-light text-muted'}`}
            >
              📋 Mis Solicitudes Enviadas
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${activeTab === 'chat' ? 'btn-primary bg-primary text-white shadow-sm' : 'btn-light text-muted'}`}
            >
              💬 Chat con Ofertantes
            </button>
          </div>
        )}

        {/* ─── TAB 1: CATALOG ─── */}
        {activeTab === 'catalog' && (
          <>
            {/* Catalog Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <h2 className="fw-bold mb-1">Catálogo de Productos</h2>
                <p className="text-muted mb-0">{visible.length} oferta{visible.length !== 1 ? 's' : ''} disponible{visible.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control py-2 shadow-sm"
                  placeholder="🔍  Buscar productos o servicios..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-6 d-flex gap-2 flex-wrap align-items-center">
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: '180px', borderRadius: '10px' }}
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                >
                  <option value="recent">⏱ Más recientes</option>
                  <option value="requested">🔥 Más solicitados</option>
                  <option value="rated">⭐ Mejor calificados</option>
                </select>
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

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3 text-muted">Cargando catálogo...</p>
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <span style={{ fontSize: '3rem' }}>🔎</span>
                <h5 className="mt-3">No se encontraron productos</h5>
              </div>
            ) : (
              <div className="row g-4">
                {visible.map((p) => {
                  const avgRating = p.seller?.avgRating || 0;
                  const reviewCount = p.seller?.reviewsCount || 0;
                  const isOwnProduct = user && p.sellerId === user.id;

                  return (
                    <div key={p.id} className="col-sm-6 col-lg-4 col-xl-3">
                      <div
                        className="card h-100 border-0 shadow-sm"
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
                          <span
                            className="badge bg-dark text-white px-2 py-1"
                            style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.7rem', borderRadius: '8px', opacity: 0.85 }}
                          >
                            {p.category}
                          </span>
                        </div>

                        <div className="card-body d-flex flex-column p-3">
                          <h6 className="card-title fw-bold text-dark mb-1 text-truncate" title={p.name}>{p.name}</h6>
                          <p className="card-text text-muted small mb-2" style={{
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden'
                          }}>
                            {p.description}
                          </p>

                          {/* Seller info */}
                          {p.seller && (
                            <div className="d-flex align-items-center gap-2 mb-2 p-2 rounded-2" style={{ background: '#f8f9fa' }}>
                              <img
                                src={resolveImage(p.seller.avatarUrl)}
                                alt={p.seller.name}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.seller.name); }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.8rem' }}>{p.seller.name}</div>
                                <Stars rating={avgRating} count={reviewCount} />
                              </div>
                            </div>
                          )}

                          {/* Price + Location */}
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold text-primary" style={{ fontSize: '1.15rem' }}>${p.price.toFixed(2)}</span>
                              {p.location && (
                                <span className="text-muted" style={{ fontSize: '0.72rem' }}>📍 {p.location}</span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {isOwnProduct ? (
                              <div className="text-center text-muted small py-2 bg-light rounded-3">Tu publicación</div>
                            ) : user ? (
                              <div className="d-flex flex-column gap-2">
                                <button
                                  className="btn btn-primary fw-semibold py-2 w-100"
                                  style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                                  onClick={() => setRequestModal(p)}
                                >
                                  ✉ Solicitar y Chatear
                                </button>
                                <button
                                  className="btn btn-outline-warning fw-semibold py-1 w-100"
                                  style={{ borderRadius: '10px', fontSize: '0.82rem' }}
                                  onClick={() => setReviewModal(p.seller)}
                                >
                                  ⭐ Calificar Vendedor
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-outline-secondary w-100 py-2"
                                style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                                onClick={() => navigate('/login')}
                              >
                                Inicia sesión para solicitar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── TAB 2: SENT REQUESTS ─── */}
        {activeTab === 'requests' && (
          <div>
            <h3 className="fw-bold mb-4">Mis Solicitudes Enviadas</h3>
            {requestsLoading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : sentRequests.length === 0 ? (
              <div className="alert alert-info border-0 shadow-sm">No has enviado ninguna solicitud aún.</div>
            ) : (
              <div className="list-group shadow-sm">
                {sentRequests.map((req) => (
                  <div key={req.id} className="list-group-item list-group-item-action p-4 border-light flex-column align-items-start">
                    <div className="d-flex w-100 justify-content-between mb-2">
                      <h5 className="mb-1 fw-bold">Producto: {req.product?.name}</h5>
                      <small className="text-muted">{new Date(req.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-2"><strong>Mensaje:</strong> {req.message || 'Sin mensaje'}</p>
                    <div className="d-flex gap-3 align-items-center mb-3">
                      <span className="small text-muted">Vendedor: <strong>{req.seller?.name}</strong></span>
                      <span className={`badge ${req.status === 'pendiente' ? 'bg-warning text-dark' : req.status === 'aceptado' ? 'bg-success' : 'bg-danger'}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-primary fw-semibold"
                      onClick={() => handleOpenChat(req.seller, req.product)}
                    >
                      💬 Chatear con Vendedor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: EMBEDDED CHAT ─── */}
        {activeTab === 'chat' && (
          <div className="row g-0 border rounded-3 overflow-hidden shadow" style={{ height: '65vh' }}>
            {/* Sidebar Conversations */}
            <div className="col-md-4 border-end bg-light d-flex flex-column" style={{ overflowY: 'auto' }}>
              <div className="p-3 border-bottom bg-white fw-semibold text-muted small text-uppercase">
                Conversaciones
              </div>
              {chatLoading ? (
                <div className="p-4 text-center"><div className="spinner-border spinner-border-sm text-primary" /></div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <span style={{ fontSize: '2rem' }}>💬</span>
                  <p className="mt-2 small">Sin conversaciones aún.</p>
                </div>
              ) : (
                conversations.map((conv, i) => {
                  const isActive = selectedChatConv?.otherUser?.id === conv.otherUser?.id &&
                    selectedChatConv?.product?.id === conv.product?.id;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedChatConv(conv)}
                      className={`d-flex align-items-center gap-3 p-3 border-bottom text-start w-100 border-0 ${isActive ? 'bg-primary-subtle' : 'bg-white'}`}
                      style={{ transition: 'background .15s' }}
                    >
                      <img
                        src={resolveImage(conv.otherUser?.avatarUrl)}
                        alt={conv.otherUser?.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(conv.otherUser?.name || 'U'); }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-dark text-truncate">{conv.otherUser?.name}</div>
                        {conv.product && <div className="small text-primary text-truncate">📦 {conv.product.name}</div>}
                        <div className="small text-muted text-truncate">{conv.lastMessage}</div>
                      </div>
                      {!conv.isRead && <span className="ms-auto badge bg-primary rounded-pill">●</span>}
                    </button>
                  );
                })
              )}
            </div>

            {/* Chat Messages Panel */}
            <div className="col-md-8 d-flex flex-column bg-white">
              {!selectedChatConv ? (
                <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted">
                  <span style={{ fontSize: '3rem' }}>💬</span>
                  <p className="mt-3 fw-semibold">Selecciona un chat para ver mensajes</p>
                </div>
              ) : (
                <>
                  <div className="p-3 border-bottom d-flex align-items-center gap-3 bg-light">
                    <img
                      src={resolveImage(selectedChatConv.otherUser?.avatarUrl)}
                      alt=""
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedChatConv.otherUser?.name || 'U'); }}
                    />
                    <div>
                      <div className="fw-bold text-dark">{selectedChatConv.otherUser?.name}</div>
                      {selectedChatConv.product && <div className="small text-muted">Sobre: {selectedChatConv.product.name}</div>}
                    </div>
                  </div>

                  <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-2" style={{ background: '#f8f9fa' }}>
                    {chatMessages.map((msg, i) => {
                      const isMe = msg.senderId === user.id;
                      return (
                        <div key={i} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                          <div className={`px-3 py-2 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'}`} style={{ maxWidth: '70%', fontSize: '0.9rem' }}>
                            {msg.message}
                            <div style={{ fontSize: '0.65rem', opacity: 0.65, marginTop: '2px', textAlign: isMe ? 'right' : 'left' }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendChatMessage} className="p-3 border-top d-flex gap-2 bg-white">
                    <input
                      type="text"
                      className="form-control rounded-pill"
                      placeholder="Escribe tu mensaje..."
                      value={newChatMessage}
                      onChange={e => setNewChatMessage(e.target.value)}
                      disabled={chatSending}
                    />
                    <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={chatSending || !newChatMessage.trim()}>
                      {chatSending ? '...' : 'Enviar'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Products;
