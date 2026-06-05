import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.token) {
        try {
          // Verify token validity against backend to prevent direct URL access via local storage tampering
          await authService.verify(storedUser.token);
          setUser(storedUser.user);
          setToken(storedUser.token);
        } catch (error) {
          console.error("Autenticación fallida. Token inválido o expirado.");
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (userData) => {
    const data = await authService.login(userData);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser) => {
    const storedData = JSON.parse(localStorage.getItem('user'));
    const newData = { ...storedData, user: updatedUser };
    localStorage.setItem('user', JSON.stringify(newData));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
