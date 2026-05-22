import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        COZASTORE
      </Link>

      <ul className="nav-links">
        <li>
          <Link to="/" className="nav-link">Inicio (Marketplace)</Link>
        </li>
        {user && (user.role === 'vendedor' || user.role === 'admin') && (
          <li>
            <Link to="/publish" className="nav-link" style={{ color: 'var(--primary)', fontWeight: '600' }}>Publicar Producto</Link>
          </li>
        )}
        {user && (
          <li>
            <Link to="/chat" className="nav-link">💬 Mensajes</Link>
          </li>
        )}
        {user && user.role === 'admin' && (
          <li>
            <Link to="/admin" className="nav-link admin-link" style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Admin</Link>
          </li>
        )}
        {user ? (
          <>
            <li>
              <Link to="/profile" className="nav-link">Mi Perfil</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-btn-logout">Cerrar Sesión</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link">Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/register" className="nav-link">Registro</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
