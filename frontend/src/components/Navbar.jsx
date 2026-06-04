import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const handleNavClick = () => setMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo" onClick={handleNavClick}>
        COZASTORE
      </Link>

      {/* Hamburger button — only visible on mobile */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
      >
        <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`} />
        <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`} />
        <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`} />
      </button>

      {/* Nav links — slides down on mobile when open */}
      <ul className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
        <li>
          <Link
            to="/"
            className={`nav-link ${isActive('/') || isActive('/products') ? 'nav-link--active' : ''}`}
            onClick={handleNavClick}
          >
            🏪 Marketplace
          </Link>
        </li>

        {/* Vendor & Admin: publish product */}
        {user && (user.role === 'vendedor' || user.role === 'admin') && (
          <li>
            <Link
              to="/publish"
              className="nav-link"
              style={{ color: 'var(--primary)', fontWeight: '600' }}
              onClick={handleNavClick}
            >
              + Publicar
            </Link>
          </li>
        )}

        {/* Vendor: go to dashboard */}
        {user && user.role === 'vendedor' && (
          <li>
            <Link to="/seller" className={`nav-link ${isActive('/seller') ? 'nav-link--active' : ''}`} onClick={handleNavClick}>
              📦 Mi Panel
            </Link>
          </li>
        )}

        {/* Admin panel */}
        {user && user.role === 'admin' && (
          <li>
            <Link
              to="/admin"
              className="nav-link admin-link"
              style={{ color: '#ff4d4d', fontWeight: 'bold' }}
              onClick={handleNavClick}
            >
              🛡️ Admin
            </Link>
          </li>
        )}

        {user ? (
          <>
            <li>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'nav-link--active' : ''}`} onClick={handleNavClick}>
                👤 Mi Perfil
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-btn-logout">
                Salir
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link" onClick={handleNavClick}>Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/register" className="nav-link nav-link--cta" onClick={handleNavClick}>Registro</Link>
            </li>
          </>
        )}
      </ul>

      {/* Backdrop — closes menu when tapping outside on mobile */}
      {menuOpen && (
        <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
