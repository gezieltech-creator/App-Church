import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificacoesProvider } from './contexts/NotificacoesContext'
import RotaProtegida from './components/RotaProtegida'
import { PageLoader } from './components/ui/LoadingSpinner'
import { ToastContainer } from './components/ui/Toast'

// Auth (pequenas, carregadas imediatamente)
import Login from './pages/auth/Login'
import PreCadastro from './pages/auth/PreCadastro'
import PrimeiroAcesso from './pages/auth/PrimeiroAcesso'

// Layouts (necessários para suas rotas, lazy)
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const MemberLayout = lazy(() => import('./components/layout/MemberLayout'))

// Admin pages (lazy)
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminMembros = lazy(() => import('./pages/admin/Membros'))
const AdminEventos = lazy(() => import('./pages/admin/Eventos'))
const AdminOfertas = lazy(() => import('./pages/admin/Ofertas'))
const AdminConfiguracoes = lazy(() => import('./pages/admin/Configuracoes'))
const AdminAniversariantes = lazy(() => import('./pages/admin/Aniversariantes'))

// Membro pages (lazy)
const MembroDashboard = lazy(() => import('./pages/membro/Dashboard'))
const MembroCalendario = lazy(() => import('./pages/membro/Calendario'))
const MembroCarteiraDigital = lazy(() => import('./pages/membro/CarteiraDigital'))
const MembroOfertas = lazy(() => import('./pages/membro/Ofertas'))
const MembroNotificacoes = lazy(() => import('./pages/membro/Notificacoes'))
const MembroPerfil = lazy(() => import('./pages/membro/Perfil'))
const MembroAniversariantes = lazy(() => import('./pages/membro/Aniversariantes'))

const ROLES_ADMIN = ['super_admin', 'admin', 'lideranca']

function AppRoutes() {
  const location = useLocation()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<Login />} />
        <Route path="/pre-cadastro" element={<PreCadastro />} />
        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <RotaProtegida roles={ROLES_ADMIN}>
              <AdminLayout key={location.key} />
            </RotaProtegida>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="membros" element={<AdminMembros />} />
          <Route path="eventos" element={<AdminEventos />} />
          <Route path="aniversariantes" element={<AdminAniversariantes />} />
          <Route path="ofertas" element={<AdminOfertas />} />
          <Route path="configuracoes" element={<AdminConfiguracoes />} />
        </Route>

        {/* Membro */}
        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <MemberLayout key={location.key} />
            </RotaProtegida>
          }
        >
          <Route index element={<MembroDashboard />} />
          <Route path="calendario" element={<MembroCalendario />} />
          <Route path="carteira" element={<MembroCarteiraDigital />} />
          <Route path="ofertas" element={<MembroOfertas />} />
          <Route path="notificacoes" element={<MembroNotificacoes />} />
          <Route path="perfil" element={<MembroPerfil />} />
          <Route path="aniversariantes" element={<MembroAniversariantes />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificacoesProvider>
          <AppRoutes />
          <ToastContainer />
        </NotificacoesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
