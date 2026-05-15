import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="hero">
      <h1>Cozastore</h1>
      <p>Descubre las últimas tendencias en moda online.</p>
      <Link to="/login" className="hero-btn">
        Comenzar Ahora
      </Link>
    </div>
  );
};

export default Home;
