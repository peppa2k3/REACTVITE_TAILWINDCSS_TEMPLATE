// frontend/src/pages/GoogleAuthCallback.jsx
// Trang này chỉ hiển thị loading spinner.
// Toàn bộ logic xử lý token đã được handle trong AuthContext (useEffect theo pathname).
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleAuthCallback = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Khi AuthContext đã xử lý xong token và set user → redirect
    if (!loading) {
      if (user) {
        navigate('/', { replace: true });
      } else {
        navigate('/login?error=google_failed', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Đang đăng nhập với Google...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
