import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'comprador',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, passwordConfirm, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirm) {
      return setError('Las contraseñas no coinciden');
    }

    try {
      await register(formData);
      setSuccess('Cuenta creada exitosamente. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Crear Cuenta</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              className="form-input"
              name="name"
              value={name}
              onChange={onChange}
              required
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Contraseña</label>
            <input
              type="password"
              className="form-input"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={onChange}
              required
              placeholder="Repite tu contraseña"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Cuenta</label>
            <select
              className="form-input"
              name="role"
              value={role}
              onChange={onChange}
              style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}
            >
              <option value="comprador">Demandante (Comprar productos/servicios)</option>
              <option value="vendedor">Ofertante (Publicar productos/servicios)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Registrarse
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia Sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
