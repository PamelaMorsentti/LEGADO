import { Toaster } from '@/components/ui/toaster'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import Mfa from '@/pages/Mfa';
import EstaSoyYo from '@/pages/EstaSoyYo';
import Seccion from '@/pages/Seccion';
import Lectura from '@/pages/Lectura';
import Fotos from '@/pages/Fotos';
import Carta from '@/pages/Carta';
import Cronologia from '@/pages/Cronologia';
import Recetas from '@/pages/Recetas';
import Arbol from '@/pages/Arbol';
import Lugares from '@/pages/Lugares';
import CartasFuturas from '@/pages/CartasFuturas';
import Canciones from '@/pages/Canciones';
import Familia from '@/pages/Familia';
import MiCapitulo from '@/pages/MiCapitulo';
import Invitado from '@/pages/Invitado';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Enlace de invitado: se abre sin iniciar sesión, en modo solo lectura
  if (location.pathname.startsWith('/invitado/')) {
    return (
      <Routes>
        <Route path="/invitado/:token" element={<Invitado />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    );
  }

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth-consent" element={<OAuthConsent />} />
      <Route path="/mfa" element={<Mfa />} />
      <Route path="/" element={<Home />} />
      <Route path="/esta-soy-yo" element={<EstaSoyYo />} />
      <Route path="/seccion/:sectionKey" element={<Seccion />} />
      <Route path="/lectura" element={<Lectura />} />
      <Route path="/fotos" element={<Fotos />} />
      <Route path="/carta" element={<Carta />} />
      <Route path="/cronologia" element={<Cronologia />} />
      <Route path="/recetas" element={<Recetas />} />
      <Route path="/arbol" element={<Arbol />} />
      <Route path="/lugares" element={<Lugares />} />
      <Route path="/cartas-futuras" element={<CartasFuturas />} />
      <Route path="/canciones" element={<Canciones />} />
      <Route path="/familia" element={<Familia />} />
      <Route path="/mi-capitulo/:chapterId" element={<MiCapitulo />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App