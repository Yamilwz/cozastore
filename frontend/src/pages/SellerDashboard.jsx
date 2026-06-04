import { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import productService from '../services/productService';
import requestService from '../services/requestService';
import messageService from '../services/messageService';
import { Link } from 'react-router-dom';
import { resolveImage } from '../utils/resolveImage';

const SellerDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('products');

  // ── Products state ──
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name:'', description:'', price:'', category:'', stock:'', location:'' });
  const [saveLoading, setSaveLoading] = useState(false);

  // ── Requests state ──
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);

  // ── Chat state ──
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const pollRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Load products ──
  const fetchMyProducts = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const all = await productService.getProducts(token);
      setMyProducts(all.filter(p => p.sellerId === user.id));
    } catch { setError('Error al cargar tus ofertas.'); }
    finally { setLoading(false); }
  };

  // ── Load received requests ──
  const fetchRequests = async () => {
    setReqLoading(true);
    try {
      const data = await requestService.getReceivedRequests();
      setRequests(data);
    } catch (e) { console.error('Error solicitudes', e); }
    finally { setReqLoading(false); }
  };

  // ── Load conversations ──
  const fetchConversations = async () => {
    setChatLoading(true);
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (e) { console.error('Error conversaciones', e); }
    finally { setChatLoading(false); }
  };

  // ── Load messages for selected conv ──
  const fetchMessages = async (conv) => {
    if (!conv) return;
    try {
      const data = await messageService.getMessages(conv.otherUser.id, conv.product?.id || null);
      setMessages(data);
    } catch (e) { console.error('Error mensajes', e); }
  };

  // Tab switching effects
  useEffect(() => {
    if (activeTab === 'products' && user && token) fetchMyProducts();
  }, [activeTab, user, token]);

  useEffect(() => {
    if (activeTab === 'requests' && token) fetchRequests();
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === 'chat' && token) fetchConversations();
  }, [activeTab, token]);

  // Polling for messages
  useEffect(() => {
    if (activeTab === 'chat' && selectedConv) {
      fetchMessages(selectedConv);
      pollRef.current = setInterval(() => fetchMessages(selectedConv), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeTab, selectedConv]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Handlers ──
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta oferta?')) return;
    try {
      await productService.deleteProduct(id, token);
      setMyProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) { alert(e.response?.data?.error || 'Error al eliminar'); }
  };

  const handleOpenEdit = (p) => {
    setSelectedProduct(p);
    setEditForm({ name: p.name, description: p.description || '', price: p.price, category: p.category || 'General', stock: p.stock, location: p.location || '' });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await productService.updateProduct(selectedProduct.id, {
        ...editForm, price: parseFloat(editForm.price), stock: parseInt(editForm.stock, 10)
      }, token);
      await fetchMyProducts();
      setShowEditModal(false);
    } catch (e) { alert(e.response?.data?.error || 'Error al guardar'); }
    finally { setSaveLoading(false); }
  };

  const handleRequestResponse = async (id, status) => {
    try {
      await requestService.respondToRequest(id, status);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) { alert(e.response?.data?.error || 'Error al responder'); }
  };

  const handleOpenChat = (conv) => {
    setSelectedConv(conv);
    setActiveTab('chat');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedConv) return;
    setSending(true);
    try {
      const sent = await messageService.sendMessage({
        receiverId: selectedConv.otherUser.id,
        message: newMsg.trim(),
        productId: selectedConv.product?.id || null
      });
      setMessages(prev => [...prev, sent]);
      setNewMsg('');
      fetchConversations();
    } catch { alert('Error al enviar mensaje'); }
    finally { setSending(false); }
  };

  // Helpers
  const pendingReqCount = requests.filter(r => r.status === 'pendiente').length;
  const pendingProdCount = myProducts.filter(p => p.approvalStatus === 'pendiente').length;
  const approvedCount = myProducts.filter(p => p.approvalStatus === 'aprobado').length;
  const rejectedCount = myProducts.filter(p => p.approvalStatus === 'rechazado').length;

  const StatusBadge = ({ s }) => {
    const map = { pendiente: 'bg-warning text-dark', aprobado: 'bg-success', rechazado: 'bg-danger', aceptado: 'bg-success' };
    const labels = { pendiente: '⏳ Pendiente', aprobado: '✓ Aprobado', rechazado: '✗ Rechazado', aceptado: '✓ Aceptado' };
    return <span className={`badge ${map[s] || 'bg-secondary'} px-3 py-2 rounded-pill`}>{labels[s] || s}</span>;
  };

  return (
    <div className="container mt-5 pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Panel del Ofertante</h2>
          <p className="text-muted mb-0">Gestiona tus ofertas, solicitudes y conversaciones</p>
        </div>
        <Link to="/publish" className="btn btn-primary btn-lg fw-bold px-4 shadow">+ Publicar Nuevo</Link>
      </div>

      {error && <div className="alert alert-danger border-0 shadow-sm mb-4">{error}</div>}

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Ofertas', val: myProducts.length, cls: 'bg-light text-dark' },
          { label: 'Aprobadas', val: approvedCount, cls: 'bg-success-subtle text-success-emphasis' },
          { label: 'Pendientes', val: pendingProdCount, cls: 'bg-warning-subtle text-warning-emphasis' },
          { label: 'Solicitudes nuevas', val: pendingReqCount, cls: 'bg-info-subtle text-info-emphasis' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className={`card shadow-sm border-0 rounded-3 p-3 text-center ${s.cls}`}>
              <span className="display-6 fw-bold d-block">{s.val}</span>
              <span className="small fw-semibold">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex border-bottom border-light mb-4 gap-2 flex-wrap">
        {[
          { id: 'products', label: '🛍️ Mis Ofertas' },
          { id: 'requests', label: `📋 Solicitudes Recibidas${pendingReqCount > 0 ? ` (${pendingReqCount})` : ''}` },
          { id: 'chat', label: '💬 Chat con Compradores' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn px-4 py-2 fw-bold rounded-top-3 border-0 ${activeTab === tab.id ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: PRODUCTS ─── */}
      {activeTab === 'products' && (
        loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> :
        myProducts.length === 0 ? (
          <div className="card shadow-sm border-0 text-center py-5 rounded-3">
            <div className="py-4">
              <span className="display-1 text-muted">🛍️</span>
              <h4 className="fw-bold mt-3">No tienes ofertas registradas</h4>
              <Link to="/publish" className="btn btn-primary fw-bold mt-3">Publicar Ahora</Link>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {myProducts.map(p => (
              <div key={p.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow border-0 rounded-3 overflow-hidden position-relative">
                  <div className="position-absolute top-0 start-0 m-3 z-1">
                    <StatusBadge s={p.approvalStatus} />
                  </div>
                  <img src={resolveImage(p.imageUrl)} className="card-img-top" alt={p.name} style={{ height: '200px', objectFit: 'cover' }} />
                  <div className="card-body d-flex flex-column p-4">
                    <span className="badge bg-secondary-subtle text-secondary text-uppercase mb-2" style={{ fontSize: '0.72rem' }}>{p.category}</span>
                    <h5 className="fw-bold text-dark mb-2 text-truncate">{p.name}</h5>
                    <p className="text-muted small flex-grow-1 mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                    <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
                      <span className="h5 fw-bold text-primary mb-0">${p.price.toFixed(2)}</span>
                      <span className="small text-muted">Stock: <strong>{p.stock}</strong></span>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-dark flex-grow-1 fw-semibold" onClick={() => handleOpenEdit(p)}>Editar</button>
                      <button className="btn btn-outline-danger fw-semibold" onClick={() => handleDelete(p.id)}>Eliminar</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ─── TAB 2: RECEIVED REQUESTS ─── */}
      {activeTab === 'requests' && (
        reqLoading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> :
        requests.length === 0 ? (
          <div className="alert alert-info border-0 shadow-sm">No has recibido solicitudes aún.</div>
        ) : (
          <div className="list-group shadow-sm">
            {requests.map(req => (
              <div key={req.id} className="list-group-item p-4 border-light">
                <div className="d-flex flex-column flex-md-row gap-3">
                  {/* Product thumbnail */}
                  <img src={resolveImage(req.product?.imageUrl)} alt={req.product?.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h5 className="fw-bold mb-0">{req.product?.name}</h5>
                      <StatusBadge s={req.status} />
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <img src={resolveImage(req.requester?.avatarUrl)} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(req.requester?.name || 'U'); }} />
                      <span className="fw-semibold small">{req.requester?.name}</span>
                      <span className="text-muted small">• {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mb-3 text-muted small"><strong>Mensaje:</strong> {req.message || 'Sin mensaje'}</p>
                    <div className="d-flex gap-2 flex-wrap">
                      {req.status === 'pendiente' && (
                        <>
                          <button className="btn btn-sm btn-success fw-semibold px-3" onClick={() => handleRequestResponse(req.id, 'aceptado')}>✓ Aceptar</button>
                          <button className="btn btn-sm btn-danger fw-semibold px-3" onClick={() => handleRequestResponse(req.id, 'rechazado')}>✗ Rechazar</button>
                        </>
                      )}
                      <button
                        className="btn btn-sm btn-outline-primary fw-semibold px-3"
                        onClick={() => handleOpenChat({ otherUser: req.requester, product: req.product })}
                      >
                        💬 Chatear con Comprador
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ─── TAB 3: CHAT ─── */}
      {activeTab === 'chat' && (
        <div className="chat-container row g-0 border rounded-3 overflow-hidden shadow">
          {/* Conversation sidebar */}
          <div className="chat-sidebar col-md-4 border-end bg-light d-flex flex-column">
            <div className="p-3 border-bottom bg-white text-muted small fw-semibold text-uppercase">Conversaciones</div>
            {chatLoading ? (
              <div className="p-4 text-center"><div className="spinner-border spinner-border-sm text-primary" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted small"><span style={{ fontSize: '2rem' }}>💬</span><p className="mt-2">Sin mensajes aún.</p></div>
            ) : (
              conversations.map((conv, i) => {
                const isActive = selectedConv?.otherUser?.id === conv.otherUser?.id && selectedConv?.product?.id === conv.product?.id;
                return (
                  <button key={i} onClick={() => setSelectedConv(conv)}
                    className={`d-flex align-items-center gap-3 p-3 border-bottom text-start w-100 border-0 ${isActive ? 'bg-primary-subtle' : 'bg-white'}`}
                    style={{ transition: 'background .15s' }}
                  >
                    <img src={resolveImage(conv.otherUser?.avatarUrl)} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(conv.otherUser?.name || 'U'); }} />
                    <div style={{ minWidth: 0 }}>
                      <div className="fw-semibold text-dark text-truncate">{conv.otherUser?.name}</div>
                      {conv.product && <div className="small text-primary text-truncate">📦 {conv.product.name}</div>}
                      <div className="small text-muted text-truncate">{conv.lastMessage}</div>
                    </div>
                    {!conv.isRead && <span className="ms-auto badge bg-danger rounded-pill">●</span>}
                  </button>
                );
              })
            )}
          </div>

          {/* Messages panel */}
          <div className="chat-main col-md-8 bg-white">
            {!selectedConv ? (
              <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted">
                <span style={{ fontSize: '3rem' }}>💬</span>
                <p className="mt-3 fw-semibold">Selecciona una conversación</p>
                <p className="small text-center px-3">O acepta una solicitud y haz clic en "Chatear con Comprador" para iniciar.</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="p-3 border-bottom d-flex align-items-center gap-3 bg-light">
                  <img src={resolveImage(selectedConv.otherUser?.avatarUrl)} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedConv.otherUser?.name || 'U'); }} />
                  <div>
                    <div className="fw-bold text-dark">{selectedConv.otherUser?.name}</div>
                    {selectedConv.product && <div className="small text-muted">Sobre: <strong>{selectedConv.product.name}</strong></div>}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-2" style={{ background: '#f8f9fa' }}>
                  {messages.length === 0 && <div className="text-center text-muted small mt-4">Inicia la conversación.</div>}
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div key={i} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                        {!isMe && (
                          <img src={resolveImage(msg.sender?.avatarUrl)} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', marginRight: '6px', alignSelf: 'flex-end' }}
                            onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=U'; }} />
                        )}
                        <div className={`px-3 py-2 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                          style={{ maxWidth: '70%', fontSize: '0.9rem', wordBreak: 'break-word' }}>
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

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-top d-flex gap-2 bg-white">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Escribe tu respuesta..."
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    disabled={sending}
                    autoFocus
                  />
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold" disabled={sending || !newMsg.trim()}>
                    {sending ? '...' : 'Enviar'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── EDIT MODAL ─── */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header p-4">
                <h4 className="modal-title fw-bold">Editar Oferta</h4>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  <div className="alert alert-warning border-0 small mb-4">
                    ⚠️ <strong>Aviso:</strong> Modificar datos clave restablecerá el producto a estado <strong>Pendiente de Validación</strong>.
                  </div>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Nombre o Título</label>
                      <input type="text" name="name" className="form-control" value={editForm.name} onChange={e => setEditForm({...editForm, [e.target.name]: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Descripción</label>
                      <textarea name="description" rows="3" className="form-control" value={editForm.description} onChange={e => setEditForm({...editForm, [e.target.name]: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Precio ($)</label>
                      <input type="number" step="0.01" name="price" className="form-control" value={editForm.price} onChange={e => setEditForm({...editForm, [e.target.name]: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Stock</label>
                      <input type="number" name="stock" className="form-control" value={editForm.stock} onChange={e => setEditForm({...editForm, [e.target.name]: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Categoría</label>
                      <select name="category" className="form-select" value={editForm.category} onChange={e => setEditForm({...editForm, [e.target.name]: e.target.value})}>
                        {['Ropa','Calzado','Accesorios','Tecnología','Servicios','General'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Ubicación</label>
                      <input type="text" name="location" className="form-control" value={editForm.location} onChange={e => setEditForm({...editForm, [e.target.name]: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer p-4">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary fw-semibold px-4" disabled={saveLoading}>
                    {saveLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
