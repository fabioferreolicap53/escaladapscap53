/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Monitoramento from './pages/Monitoramento';
import Profissionais from './pages/Profissionais';
import Historico from './pages/Historico';
import Resumo from './pages/Resumo';
import Lancamento from './pages/Lancamento';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';

// Componente para proteger rotas
function ProtectedRoute({ children }: { children: ReactNode }) {
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
            
            <Route path="/" element={<Navigate to="/monitoramento" replace />} />
            <Route path="/monitoramento" element={
              <ProtectedRoute>
                <Monitoramento />
              </ProtectedRoute>
            } />
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
            <Route path="/resumo" element={
              <ProtectedRoute>
                <Resumo />
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
