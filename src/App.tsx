/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Profissionais from './pages/Profissionais';
import Historico from './pages/Historico';
import Lancamento from './pages/Lancamento';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';

// Componente para proteger rotas
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Navigate to="/escala" replace />} />
            <Route path="/profissionais" element={
              <ProtectedRoute>
                <Profissionais />
              </ProtectedRoute>
            } />
            <Route path="/escala" element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            } />
            <Route path="/lancamento" element={
              <ProtectedRoute>
                <Lancamento />
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}
