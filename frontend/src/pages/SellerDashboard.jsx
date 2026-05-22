import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import productService from '../services/productService';
import { Link } from 'react-router-dom';
import { resolveImage } from '../utils/resolveImage';

const SellerDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    location: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await productService.getProducts(token);
      // Filter products belonging to this seller
      const filtered = allProducts.filter(p => p.sellerId === user?.id);
      setMyProducts(filtered);
    } catch (err) {
      console.error('Error loading seller products', err);
      setError('No se pudieron cargar tus ofertas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchMyProducts();
    }
  }, [user, token]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto/servicio permanentemente?')) {
      try {
        await productService.deleteProduct(id, token);
        setMyProducts(myProducts.filter(p => p.id !== id));
        alert('Producto eliminado correctamente.');
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar el producto');
      }
    }
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || 'General',
      stock: product.stock,
      location: product.location || ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const updatedData = {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price),
        category: editForm.category,
        stock: parseInt(editForm.stock, 10),
        location: editForm.location
      };

      await productService.updateProduct(selectedProduct.id, updatedData, token);
      
      // Reload products
      await fetchMyProducts();
      setShowEditModal(false);
      alert('Cambios guardados con éxito.');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar el producto');
    } finally {
      setSaveLoading(false);
    }
  };

  // Badges helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente':
        return <span className="badge bg-warning text-dark px-3 py-2 shadow-sm rounded-pill">⏳ Pendiente</span>;
      case 'aprobado':
        return <span className="badge bg-success px-3 py-2 shadow-sm rounded-pill">✓ Aprobado</span>;
      case 'rechazado':
        return <span className="badge bg-danger px-3 py-2 shadow-sm rounded-pill">✗ Rechazado</span>;
      default:
        return <span className="badge bg-secondary px-3 py-2 shadow-sm rounded-pill">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando tu inventario de ofertas...</p>
      </div>
    );
  }

  // Count summaries
  const pendingCount = myProducts.filter(p => p.approvalStatus === 'pendiente').length;
  const approvedCount = myProducts.filter(p => p.approvalStatus === 'aprobado').length;
  const rejectedCount = myProducts.filter(p => p.approvalStatus === 'rechazado').length;

  return (
    <div className="container mt-5 pb-5">
      {/* Header and Publish button */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Mi Catálogo de Ofertas</h2>
          <p className="text-muted mb-0">Gestiona y publica tus productos o servicios en la plataforma</p>
        </div>
        <Link to="/publish" className="btn btn-primary btn-lg fw-bold px-4 shadow">
          + Publicar Nuevo
        </Link>
      </div>

      {error && <div className="alert alert-danger border-0 shadow-sm mb-4">{error}</div>}

      {/* Summary Stats Cards */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 rounded-3 p-3 text-center bg-light">
            <span className="display-6 fw-bold text-dark d-block">{myProducts.length}</span>
            <span className="small text-muted fw-semibold">Total Ofertas</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 rounded-3 p-3 text-center bg-success-subtle text-success-emphasis">
            <span className="display-6 fw-bold d-block">{approvedCount}</span>
            <span className="small fw-semibold">Aprobadas</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 rounded-3 p-3 text-center bg-warning-subtle text-warning-emphasis">
            <span className="display-6 fw-bold d-block">{pendingCount}</span>
            <span className="small fw-semibold">Pendientes</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 rounded-3 p-3 text-center bg-danger-subtle text-danger-emphasis">
            <span className="display-6 fw-bold d-block">{rejectedCount}</span>
            <span className="small fw-semibold">Rechazadas</span>
          </div>
        </div>
      </div>

      {myProducts.length === 0 ? (
        <div className="card shadow-sm border-0 text-center py-5 rounded-3">
          <div className="py-4">
            <span className="display-1 text-muted">🛍️</span>
            <h4 className="fw-bold mt-3">No tienes ofertas registradas</h4>
            <p className="text-muted mb-4">Comienza publicando tu primer producto o servicio para conectar con demandantes.</p>
            <Link to="/publish" className="btn btn-primary fw-bold">
              Publicar Ahora
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {myProducts.map(p => (
            <div key={p.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow border-0 rounded-3 overflow-hidden position-relative">
                {/* Status Badge in Card corner */}
                <div className="position-absolute top-0 start-0 m-3 z-1">
                  {getStatusBadge(p.approvalStatus)}
                </div>

                <img 
                  src={resolveImage(p.imageUrl)} 
                  className="card-img-top" 
                  alt={p.name} 
                  style={{ height: '220px', objectFit: 'cover' }} 
                />
                
                <div className="card-body d-flex flex-column p-4">
                  <div className="mb-2">
                    <span className="badge bg-secondary-subtle text-secondary px-2.5 py-1 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                      {p.category}
                    </span>
                  </div>
                  <h4 className="card-title fw-bold text-dark mb-2 text-truncate" title={p.name}>
                    {p.name}
                  </h4>
                  <p className="card-text text-muted small flex-grow-1 mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top border-light">
                    <span className="h4 fw-bold text-primary mb-0">${p.price.toFixed(2)}</span>
                    <span className="small text-muted">Stock: <strong>{p.stock}</strong></span>
                  </div>

                  <div className="d-flex gap-2 w-100">
                    <button 
                      className="btn btn-outline-dark flex-grow-1 fw-semibold py-2"
                      onClick={() => handleOpenEdit(p)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-outline-danger fw-semibold py-2"
                      onClick={() => handleDelete(p.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal (Glassmorphic Backdrop Overlay) */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-light p-4">
                <h4 className="modal-title fw-bold">Editar Oferta</h4>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  {/* Warning on Spec Rule */}
                  <div className="alert alert-warning border-0 d-flex align-items-start mb-4" style={{ borderRadius: '10px' }}>
                    <span className="me-2 fs-5">⚠️</span>
                    <div className="small">
                      <strong>Aviso de Edición Crítica:</strong> Modificar los campos 
                      <strong> Nombre, Descripción, Precio o Categoría</strong> restablecerá automáticamente el producto al estado 
                      <strong className="text-warning-emphasis"> "Pendiente de Validación"</strong> para que el administrador vuelva a revisar la calidad.
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">Nombre o Título</label>
                      <input 
                        type="text" 
                        name="name" 
                        className="form-control" 
                        value={editForm.name} 
                        onChange={handleEditChange} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descripción</label>
                    <textarea 
                      name="description" 
                      rows="3" 
                      className="form-control" 
                      value={editForm.description} 
                      onChange={handleEditChange} 
                      required 
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Precio ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        name="price" 
                        className="form-control" 
                        value={editForm.price} 
                        onChange={handleEditChange} 
                        required 
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Stock</label>
                      <input 
                        type="number" 
                        name="stock" 
                        className="form-control" 
                        value={editForm.stock} 
                        onChange={handleEditChange} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Categoría</label>
                      <select 
                        name="category" 
                        className="form-select" 
                        value={editForm.category} 
                        onChange={handleEditChange}
                      >
                        <option value="Ropa">Ropa</option>
                        <option value="Calzado">Calzado</option>
                        <option value="Accesorios">Accesorios</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Servicios">Servicios</option>
                        <option value="General">Otros</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Ubicación</label>
                      <input 
                        type="text" 
                        name="location" 
                        className="form-control" 
                        value={editForm.location} 
                        onChange={handleEditChange} 
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-light p-4">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </button>
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
