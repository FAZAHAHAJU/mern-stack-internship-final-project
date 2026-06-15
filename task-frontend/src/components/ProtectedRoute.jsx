// src/components/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);

  // If not authenticated, redirect smoothly to the login view
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}