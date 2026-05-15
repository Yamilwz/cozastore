import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';

const Profile = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const data = await userService.updateProfile(formData, token);
      updateUser(data.user);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Perfil actualizado con éxito' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar' });
    }
  };

  if (!user) return <div className="container">Cargando...</div>;

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} de COZASTORE</p>
          </div>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-card">
          {!isEditing ? (
            <>
              <div className="profile-grid">
                <div className="profile-item">
                  <label>Nombre</label>
                  <p>{user.name}</p>
                </div>
                <div className="profile-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="profile-item">
                  <label>Rol</label>
                  <p>{user.role}</p>
                </div>
                <div className="profile-item">
                  <label>Miembro desde</label>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn-edit"
              >
                Editar Perfil
              </button>
            </>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-input"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Guardar Cambios
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="btn-edit"
                  style={{ flex: 1, marginTop: '10px' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
