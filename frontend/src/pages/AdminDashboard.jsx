import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import adminService from '../services/adminService';
import { resolveImage } from '../utils/resolveImage';

const AdminDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'products'

  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'comprador'
  });

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [productFilter, setProductFilter] = useState('todos'); // 'todos', 'pendiente', 'aprobado', 'rechazado'

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchProducts();
    }
  }, [token]);

  // --- USER HANDLERS ---
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await adminService.getUsers(token);
      setUsers(data);
    } catch (err) {
      setUsersError('Error al cargar usuarios');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update user
        const updated = await adminService.updateUser(editingId, formData, token);
        setUsers(users.map(u => u.id === editingId ? updated : u));
        alert('Usuario actualizado');
      } else {
        // Create user
        if (!formData.password) return alert('La contraseña es obligatoria para nuevos usuarios');
        const newUser = await adminService.createUser(formData, token);
        setUsers([...users, newUser]);
        alert('Usuario creado');
      }
      resetUserForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Error en la operación');
    }
  };

  const handleEditUser = (u) => {
    setEditingId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role
    });
  };

  const resetUserForm = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'comprador' });
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await adminService.deleteUser(id, token);
        setUsers(users.filter((u) => u.id !== id));
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar usuario');
      }
    }
  };

  // --- PRODUCT VALIDATION HANDLERS ---
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await adminService.getProducts(token);
      setProducts(data);
    } catch (err) {
      setProductsError('Error al cargar productos');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleValidateProduct = async (id, status) => {
    try {
      const updated = await adminService.validateProduct(id, status, token);
      // Update local state
      setProducts(products.map(p => p.id === id ? { ...p, approvalStatus: status } : p));
      alert(`Producto marcado como ${status.toUpperCase()} exitosamente.`);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al validar el producto');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta oferta permanentemente?')) {
      try {
        await adminService.deleteProduct(id, token);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar la oferta');
      }
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    if (productFilter === 'todos') return true;
    return p.approvalStatus === productFilter;
  });

  // Get validation status count helper
  const getProductsCountByStatus = (status) => {
    return products.filter(p => p.approvalStatus === status).length;
  };

  return (
    <div className="container mt-5 pb-5">
      {/* Upper Welcome Header */}
      <div className="bg-dark text-white rounded-3 p-4 mb-4 shadow-lg d-flex justify-content-between align-items-center">
        <div>
          <span className="badge bg-danger mb-2 text-uppercase fw-bold">Panel de Administración</span>
          <h2 className="fw-bold mb-0">Centro de Control de Calidad</h2>
        </div>
        <div className="text-end d-none d-md-block">
          <p className="mb-0 text-white-50">Bienvenido, <strong>{user?.name}</strong></p>
          <span className="small text-muted">Sesión de Administrador activa</span>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="d-flex border-bottom border-light mb-4 gap-2">
        <button 
          onClick={() => setActiveTab('users')}
          className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${activeTab === 'users' ? 'btn-primary bg-primary text-white shadow-sm' : 'btn-light text-muted'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          👥 Gestión de Usuarios
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${activeTab === 'products' ? 'btn-primary bg-primary text-white shadow-sm' : 'btn-light text-muted'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          🛡️ Validación de Contenido
          {getProductsCountByStatus('pendiente') > 0 && (
            <span className="badge bg-warning text-dark ms-2 shadow-sm rounded-pill fw-bold">
              {getProductsCountByStatus('pendiente')}
            </span>
          )}
        </button>
      </div>

      {/* --- TAB 1: USER MANAGEMENT --- */}
      {activeTab === 'users' && (
        <div className="row">
          {/* User Form Card */}
          <div className="col-lg-4 mb-4">
            <div className="card shadow border-0 rounded-3 p-4">
              <h4 className="fw-bold text-dark mb-4">{editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h4>
              
              <form onSubmit={handleUserSubmit}>
                <div className="form-group mb-3">
                  <label className="form-label fw-semibold">Nombre Completo</label>
                  <input type="text" name="name" className="form-control" value={formData.name} onChange={handleUserInputChange} required placeholder="Ej: Diego Silva" />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" name="email" className="form-control" value={formData.email} onChange={handleUserInputChange} required placeholder="email@cozastore.com" />
                </div>
                {!editingId && (
                  <div className="form-group mb-3">
                    <label className="form-label fw-semibold">Contraseña</label>
                    <input type="password" name="password" className="form-control" value={formData.password} onChange={handleUserInputChange} required placeholder="Mínimo 6 caracteres" />
                  </div>
                )}
                <div className="form-group mb-4">
                  <label className="form-label fw-semibold">Rol del Sistema</label>
                  <select name="role" className="form-select" value={formData.role} onChange={handleUserInputChange}>
                    <option value="comprador">Comprador (Demandante)</option>
                    <option value="vendedor">Vendedor (Ofertante)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
                  {editingId ? 'Guardar Cambios' : 'Registrar Usuario'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-link w-100 mt-2 text-muted" onClick={resetUserForm}>
                    Cancelar Edición
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Users Table Card */}
          <div className="col-lg-8">
            <div className="card shadow border-0 rounded-3 overflow-hidden">
              <div className="card-header bg-transparent border-0 p-4 pb-2">
                <h4 className="fw-bold text-dark mb-0">Base de Usuarios Registrados</h4>
              </div>
              
              {usersLoading ? (
                <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>
              ) : usersError ? (
                <div className="p-4 text-danger text-center">{usersError}</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-uppercase small fw-bold">
                      <tr>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="py-3">Rol</th>
                        <th className="py-3">Fecha Registro</th>
                        <th className="px-4 py-3 text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="px-4 py-3">
                            <div className="fw-bold text-dark">{u.name}</div>
                            <div className="small text-muted">{u.email}</div>
                          </td>
                          <td className="py-3">
                            <span className={`badge px-2.5 py-1.5 rounded-pill ${
                              u.role === 'admin' ? 'bg-danger-subtle text-danger' : 
                              u.role === 'vendedor' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : u.role === 'vendedor' ? 'Ofertante' : 'Demandante'}
                            </span>
                          </td>
                          <td className="py-3 small text-muted">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-end">
                            <button className="btn btn-sm btn-outline-dark me-2" onClick={() => handleEditUser(u)}>
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.id === user.id}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: PRODUCT VALIDATION PANEL --- */}
      {activeTab === 'products' && (
        <div>
          {/* Counters Summary */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <button 
                onClick={() => setProductFilter('todos')}
                className={`card border-0 shadow-sm rounded-3 p-3 text-center w-100 transition-all ${productFilter === 'todos' ? 'bg-dark text-white' : 'bg-light text-dark'}`}
              >
                <h4 className="fw-bold mb-1">{products.length}</h4>
                <span className="small text-muted fw-semibold">Todos los Productos</span>
              </button>
            </div>
            <div className="col-md-3">
              <button 
                onClick={() => setProductFilter('pendiente')}
                className={`card border-0 shadow-sm rounded-3 p-3 text-center w-100 transition-all ${productFilter === 'pendiente' ? 'bg-warning text-dark border border-warning' : 'bg-light text-dark'}`}
              >
                <h4 className="fw-bold mb-1">{getProductsCountByStatus('pendiente')}</h4>
                <span className="small text-muted fw-semibold">⌛ Pendientes de Revisión</span>
              </button>
            </div>
            <div className="col-md-3">
              <button 
                onClick={() => setProductFilter('aprobado')}
                className={`card border-0 shadow-sm rounded-3 p-3 text-center w-100 transition-all ${productFilter === 'aprobado' ? 'bg-success text-white border border-success' : 'bg-light text-dark'}`}
              >
                <h4 className="fw-bold mb-1">{getProductsCountByStatus('aprobado')}</h4>
                <span className="small text-muted fw-semibold">✓ Aprobados / Visibles</span>
              </button>
            </div>
            <div className="col-md-3">
              <button 
                onClick={() => setProductFilter('rechazado')}
                className={`card border-0 shadow-sm rounded-3 p-3 text-center w-100 transition-all ${productFilter === 'rechazado' ? 'bg-danger text-white border border-danger' : 'bg-light text-dark'}`}
              >
                <h4 className="fw-bold mb-1">{getProductsCountByStatus('rechazado')}</h4>
                <span className="small text-muted fw-semibold">✗ Rechazados</span>
              </button>
            </div>
          </div>

          {/* Validation Table */}
          <div className="card shadow border-0 rounded-3 overflow-hidden">
            <div className="card-header bg-transparent border-0 p-4 pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold text-dark mb-0">Control de Publicaciones</h4>
                <p className="text-muted small mb-0">Revisa, aprueba o rechaza publicaciones de ofertantes antes de que sean visibles al público.</p>
              </div>
              <button onClick={fetchProducts} className="btn btn-outline-dark btn-sm fw-semibold">
                🔄 Recargar Catálogo
              </button>
            </div>

            {productsLoading ? (
              <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>
            ) : productsError ? (
              <div className="p-4 text-danger text-center">{productsError}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <span className="fs-1 d-block mb-2">🛡️</span>
                <h5>No hay publicaciones en esta categoría.</h5>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase small fw-bold">
                    <tr>
                      <th className="px-4 py-3">Producto / Servicio</th>
                      <th className="py-3">Categoría</th>
                      <th className="py-3">Ofertante (Seller)</th>
                      <th className="py-3">Precio</th>
                      <th className="py-3">Estado</th>
                      <th className="px-4 py-3 text-end">Acción de Calidad (Validación)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <img 
                              src={resolveImage(p.imageUrl)} 
                              alt={p.name} 
                              className="rounded shadow-sm"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                            />
                            <div>
                              <div className="fw-bold text-dark">{p.name}</div>
                              <div className="small text-muted text-truncate" style={{ maxWidth: '250px' }} title={p.description}>
                                {p.description}
                              </div>
                              <div className="small text-primary-emphasis mt-0.5">📍 {p.location || 'No especificada'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-light text-dark border">{p.category}</span>
                        </td>
                        <td className="py-3">
                          <div className="fw-semibold text-dark">{p.seller?.name || 'Desconocido'}</div>
                          <div className="small text-muted">{p.seller?.email || 'N/A'}</div>
                        </td>
                        <td className="py-3 fw-bold text-primary">
                          ${p.price.toFixed(2)}
                        </td>
                        <td className="py-3">
                          {p.approvalStatus === 'pendiente' && <span className="badge bg-warning text-dark px-2.5 py-1.5 rounded-pill">⏳ Pendiente</span>}
                          {p.approvalStatus === 'aprobado' && <span className="badge bg-success px-2.5 py-1.5 rounded-pill">✓ Aprobado</span>}
                          {p.approvalStatus === 'rechazado' && <span className="badge bg-danger px-2.5 py-1.5 rounded-pill">✗ Rechazado</span>}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            {p.approvalStatus !== 'aprobado' && (
                              <button 
                                className="btn btn-sm btn-success fw-bold px-3 py-1.5 rounded-pill shadow-sm"
                                onClick={() => handleValidateProduct(p.id, 'aprobado')}
                              >
                                Aprobar
                              </button>
                            )}
                            {p.approvalStatus !== 'rechazado' && (
                              <button 
                                className="btn btn-sm btn-danger fw-bold px-3 py-1.5 rounded-pill shadow-sm"
                                onClick={() => handleValidateProduct(p.id, 'rechazado')}
                              >
                                Rechazar
                              </button>
                            )}
                            {p.approvalStatus !== 'pendiente' && (
                              <button 
                                className="btn btn-sm btn-outline-warning fw-bold px-3 py-1.5 rounded-pill"
                                onClick={() => handleValidateProduct(p.id, 'pendiente')}
                              >
                                Deshacer
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-outline-dark shadow-sm px-2.5 py-1.5 rounded-circle"
                              onClick={() => handleDeleteProduct(p.id)}
                              title="Eliminar Publicación"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
