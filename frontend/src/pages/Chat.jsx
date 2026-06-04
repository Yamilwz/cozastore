import { useContext, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import messageService from '../services/messageService';
import { resolveImage } from '../utils/resolveImage';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null); // { otherUser, product }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Auto-open chat from navigation state (when coming from "Solicitar")
  useEffect(() => {
    if (location.state?.openChatWith) {
      setSelectedConv({
        otherUser: location.state.openChatWith,
        product: location.state.product || null
      });
    }
  }, [location.state]);

  // Load conversation list
  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error cargando conversaciones', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  // Load messages for selected conversation + polling every 3s
  const fetchMessages = async (conv) => {
    if (!conv) return;
    try {
      const data = await messageService.getMessages(
        conv.otherUser.id,
        conv.product?.id || null
      );
      setMessages(data);
    } catch (err) {
      console.error('Error cargando mensajes', err);
    }
  };

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv);
      pollingRef.current = setInterval(() => fetchMessages(selectedConv), 3000);
    }
    return () => clearInterval(pollingRef.current);
  }, [selectedConv]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    setSending(true);
    try {
      const sent = await messageService.sendMessage({
        receiverId: selectedConv.otherUser.id,
        message: newMessage.trim(),
        productId: selectedConv.product?.id || null
      });
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
      // Refresh conversation list
      fetchConversations();
    } catch (err) {
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mt-5 pb-5">
      <h2 className="fw-bold mb-4">💬 Mensajes</h2>

      <div className="row g-0 border rounded-3 overflow-hidden shadow" style={{ height: '70vh' }}>

        {/* ── Conversations sidebar ── */}
        <div className="col-md-4 border-end bg-light d-flex flex-column" style={{ overflowY: 'auto' }}>
          <div className="p-3 border-bottom bg-white fw-semibold text-muted small text-uppercase">
            Conversaciones
          </div>

          {loading ? (
            <div className="p-4 text-center">
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <span style={{ fontSize: '2.5rem' }}>💬</span>
              <p className="mt-2 small">Sin conversaciones aún.<br />Solicita un producto para iniciar un chat.</p>
            </div>
          ) : (
            conversations.map((conv, i) => {
              const isActive = selectedConv?.otherUser?.id === conv.otherUser?.id &&
                selectedConv?.product?.id === conv.product?.id;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedConv(conv)}
                  className={`d-flex align-items-center gap-3 p-3 border-bottom text-start w-100 border-0 ${isActive ? 'bg-primary-subtle' : 'bg-white'}`}
                  style={{ transition: 'background .15s' }}
                >
                  <img
                    src={resolveImage(conv.otherUser?.avatarUrl)}
                    alt={conv.otherUser?.name}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(conv.otherUser?.name || 'U'); }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-dark text-truncate">{conv.otherUser?.name}</div>
                    {conv.product && (
                      <div className="small text-primary text-truncate">📦 {conv.product.name}</div>
                    )}
                    <div className="small text-muted text-truncate">{conv.lastMessage}</div>
                  </div>
                  {!conv.isRead && (
                    <span className="ms-auto badge bg-primary rounded-pill" style={{ flexShrink: 0 }}>●</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* ── Chat area ── */}
        <div className="col-md-8 d-flex flex-column bg-white">
          {!selectedConv ? (
            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted">
              <span style={{ fontSize: '3.5rem' }}>💬</span>
              <p className="mt-3 fw-semibold">Selecciona una conversación</p>
              <p className="small">o solicita un producto para iniciar un chat con el ofertante.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-3 border-bottom d-flex align-items-center gap-3 bg-light">
                <img
                  src={resolveImage(selectedConv.otherUser?.avatarUrl)}
                  alt={selectedConv.otherUser?.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedConv.otherUser?.name || 'U'); }}
                />
                <div>
                  <div className="fw-bold text-dark">{selectedConv.otherUser?.name}</div>
                  {selectedConv.product && (
                    <div className="small text-muted">Sobre: <strong>{selectedConv.product.name}</strong></div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-2" style={{ background: '#f8f9fa' }}>
                {messages.length === 0 && (
                  <div className="text-center text-muted mt-4 small">Inicia la conversación enviando un mensaje.</div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={i} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                      {!isMe && (
                        <img
                          src={resolveImage(msg.sender?.avatarUrl)}
                          alt=""
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px', alignSelf: 'flex-end' }}
                          onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=U'; }}
                        />
                      )}
                      <div
                        className={`px-3 py-2 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                        style={{ maxWidth: '70%', fontSize: '0.92rem', wordBreak: 'break-word' }}
                      >
                        {msg.message}
                        <div style={{ fontSize: '0.68rem', opacity: 0.65, marginTop: '2px', textAlign: isMe ? 'right' : 'left' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3 border-top d-flex gap-2 bg-white">
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={sending}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 fw-semibold"
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? '...' : 'Enviar'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
