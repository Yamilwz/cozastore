import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import adminService from '../services/adminService';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cliente'
  });

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers(token);
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar usuarios');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        const updated = await adminService.updateUser(editingId, formData, token);
        setUsers(users.map(u => u.id === editingId ? updated : u));
        alert('Usuario actualizado');
      } else {
        // Create
        if (!formData.password) return alert('La contraseña es obligatoria para nuevos usuarios');
        const newUser = await adminService.createUser(formData, token);
        setUsers([...users, newUser]);
        alert('Usuario creado');
      }
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Error en la operación');
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      password: '', // Password hidden for security
      role: u.role
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'cliente' });
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

  if (loading) return <div className="container mt-5">Cargando...</div>;

  return (
    <div className="container mt-5 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <button className="btn btn-primary" onClick={resetForm}>+ Nuevo Usuario</button>
      </div>

      <div className="row">
        {/* Formulario */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0 profile-card">
            <h4 className="mb-4">{editingId ? 'Editar Usuario' : 'Crear Usuario'}</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required />
              </div>
              {!editingId && (
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input type="password" name="password" className="form-input" value={formData.password} onChange={handleInputChange} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select name="role" className="form-input" value={formData.role} onChange={handleInputChange}>
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar Usuario' : 'Guardar Usuario'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-link w-100 mt-2" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Tabla */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0 overflow-hidden">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="fw-bold">{u.name}</div>
                      <div className="small text-muted">{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-dark me-2" onClick={() => handleEdit(u)}>
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
