import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import productService from '../services/productService';
import { useNavigate, Link } from 'react-router-dom';

const PublishProduct = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Ropa',
    stock: '1',
    location: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError('Necesitas iniciar sesión');
    
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', parseFloat(form.price));
      formData.append('category', form.category);
      formData.append('stock', parseInt(form.stock, 10));
      formData.append('location', form.location || user?.location || 'No especificada');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await productService.createProduct(formData, token);
      setSuccess(true);
      setTimeout(() => {
        navigate('/seller');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al crear el producto');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container mt-5 py-5 text-center">
        <div className="card shadow-lg p-5 border-0 rounded-3 mx-auto" style={{ maxWidth: '500px' }}>
          <div className="mb-4">
            <span className="display-1 text-warning">⏳</span>
          </div>
          <h3 className="fw-bold mb-3">¡Producto Registrado con Éxito!</h3>
          <p className="text-muted mb-4">
            Tu oferta ha sido guardada en estado <strong>Pendiente de Validación</strong>. 
            El administrador la revisará a la brevedad para garantizar la seguridad y calidad de la plataforma.
          </p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Redirigiendo...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Link to="/seller" className="btn btn-outline-secondary btn-sm">
              ← Volver al Inventario
            </Link>
            <span className="badge bg-light text-dark shadow-sm">Modo Ofertante</span>
          </div>

          <div className="card shadow-lg border-0 rounded-3 p-4">
            <h2 className="fw-bold mb-3 text-dark">Publicar Nuevo Producto o Servicio</h2>
            
            {/* Info Banner on Spec Rules */}
            <div className="alert alert-warning border-0 shadow-sm d-flex align-items-start mb-4" style={{ borderRadius: '12px' }}>
              <span className="me-2 fs-4">ℹ️</span>
              <div>
                <strong className="d-block mb-1 text-warning-emphasis">Proceso de Calidad CozaStore</strong>
                <span className="small text-muted">
                  Por políticas de seguridad, todas las nuevas publicaciones inician en estado 
                  <strong> "Pendiente"</strong> y deben ser validadas por un administrador antes de ser visibles para los Demandantes.
                </span>
              </div>
            </div>

            {error && <div className="alert alert-danger border-0 mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Título o Nombre</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control py-2 shadow-sm border-light" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Ej: Camisa Minimalista Lino" 
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Descripción Detallada</label>
                <textarea 
                  name="description" 
                  rows="3"
                  className="form-control py-2 shadow-sm border-light" 
                  value={form.description} 
                  onChange={handleChange} 
                  required 
                  placeholder="Describe los detalles principales, materiales o tarifas de tu servicio..." 
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Precio / Tarifa ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    name="price" 
                    className="form-control py-2 shadow-sm border-light" 
                    value={form.price} 
                    onChange={handleChange} 
                    required 
                    placeholder="0.00" 
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Stock / Cupos</label>
                  <input 
                    type="number" 
                    name="stock" 
                    className="form-control py-2 shadow-sm border-light" 
                    value={form.stock} 
                    onChange={handleChange} 
                    required 
                    min="1" 
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Categoría</label>
                  <select 
                    name="category" 
                    className="form-select py-2 shadow-sm border-light" 
                    value={form.category} 
                    onChange={handleChange}
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
                    className="form-control py-2 shadow-sm border-light" 
                    value={form.location} 
                    onChange={handleChange} 
                    placeholder="Ej: Santiago, Chile" 
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Imagen del producto</label>
                <input 
                  type="file" 
                  name="image" 
                  className="form-control shadow-sm border-light" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                {previewUrl && (
                  <div className="mt-3 text-center">
                    <img 
                      src={previewUrl} 
                      alt="Vista previa" 
                      className="img-thumbnail rounded" 
                      style={{ maxHeight: '150px' }} 
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2.5 fw-bold shadow"
                disabled={submitting}
              >
                {submitting ? 'Registrando...' : 'Publicar Oferta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishProduct;
