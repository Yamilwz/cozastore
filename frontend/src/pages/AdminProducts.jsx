import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import adminService from '../services/adminService';

const AdminProducts = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await adminService.getProducts(token);
      setProducts(data);
    } catch (err) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await adminService.deleteProduct(id, token);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar producto');
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  if (loading) return <div className="container mt-5">Cargando...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5 pb-5">
      <h2 className="mb-4">Gestión de Productos (Admin)</h2>
      {products.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Vendedor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.seller?.name || 'Desconocido'}</td>
                <td>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProducts;
