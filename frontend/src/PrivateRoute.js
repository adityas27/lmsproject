import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const navigate = useNavigate();
  const access = localStorage.getItem('access');

  useEffect(() => {
    if (!access) {
      navigate('/login');
    }
  }, [access, navigate]);

  if (!access) {
    return null;  // or loading spinner if you want
  }

  return children;
}
