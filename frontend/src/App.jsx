import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmailProvider } from './context/EmailContext';
import Login from './pages/Login';
import Home from './pages/Home';
import SenderDetail from './pages/SenderDetail';
import EmailDetail from './pages/EmailDetail';
import Settings from './pages/Settings';
import Layout from './components/Layout';

// Loading Page Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#F6F8FB] flex flex-col items-center justify-center relative">
    {/* Floating spheres in spinner background */}
    <div className="absolute top-[30%] left-[20%] w-40 h-40 bg-[#5B5FEF]/5 rounded-full blur-3xl pointer-events-none"></div>
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-4 border-[#5B5FEF]/10"></div>
      <div className="absolute inset-0 rounded-full border-4 border-t-[#5B5FEF] animate-spin"></div>
    </div>
    <p className="mt-5 text-xs text-gray-400 font-extrabold uppercase tracking-widest animate-pulse">Initializing MailMate...</p>
  </div>
);

// Router Guard for protected pages
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Google Callback Handler Page
const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      
      // Fetch user profile info
      import('./utils/api').then(({ default: api }) => {
        api.get('/auth/me')
          .then((res) => {
            setUser(res.data);
            navigate('/', { replace: true });
          })
          .catch((err) => {
            console.error('Error in callback profile load:', err);
            localStorage.removeItem('token');
            navigate('/login?error=auth_failed', { replace: true });
          });
      });
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, [searchParams, navigate, setUser]);

  return <LoadingSpinner />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EmailProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sender/:senderName" 
              element={
                <ProtectedRoute>
                  <SenderDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/email/:id" 
              element={
                <ProtectedRoute>
                  <EmailDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EmailProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
