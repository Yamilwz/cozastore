import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import PublishProduct from './pages/PublishProduct';
import AdminProducts from './pages/AdminProducts';

// Component to handle root redirection based on authentication and role
function RoleRedirect() {
  const { token, user } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  const target =
    user?.role === 'comprador'
      ? '/products'
      : user?.role === 'vendedor'
      ? '/seller'
      : user?.role === 'admin'
      ? '/admin'
      : '/login';
  return <Navigate to={target} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat" element={<Chat />} />
            </Route>
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route element={<ProtectedRoute sellerOnly={true} />}>
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/publish" element={<PublishProduct />} />
            </Route>
            <Route path="/products" element={<Products />} />
            {/* Root redirects based on role */}
            <Route path="/" element={<RoleRedirect />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
