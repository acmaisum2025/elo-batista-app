// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; // Nova página de cadastro
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // <-- IMPORTANTE: Importe a ForgotPasswordPage
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
// Dentro das suas rotas protegidas:
// <Route path="/profile" element={<ProfilePage />} /> // Esta linha parece ser um comentário solto, remova-a se não for parte do JSX
import './styles/global.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="app-container">
                    <Routes>
                        {/* ========== ROTAS PÚBLICAS ========== */}
                        {/* Tela de boas-vindas inicial */}
                        <Route path="/" element={<WelcomePage />} />
                        {/* Página de Login */}
                        <Route path="/login" element={<LoginPage />} />
                        {/* Página de Cadastro - NOVA FUNCIONALIDADE */}
                        <Route path="/signup" element={<SignupPage />} />

                        {/* 
                            !!! AQUI ESTÁ O AJUSTE CRÍTICO !!!
                            Adicione a rota para ForgotPasswordPage AQUI,
                            entre as outras rotas públicas e ANTES da rota de fallback.
                        */}
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                        {/* ========== ROTAS PROTEGIDAS (Requerem Autenticação) ========== */}
                        {/* 
                            Para simplificar e seguir a prática do React Router v6,
                            você pode agrupar as rotas protegidas dentro de um único PrivateRoute
                            usando um layout de rota.
                            Vou te mostrar como fazer isso de forma mais limpa abaixo,
                            mas por enquanto, vamos manter sua estrutura e apenas adicionar a rota.
                        */}
                        <Route
                            path="/home"
                            element={
                                <PrivateRoute>
                                    <HomePage />
                                </PrivateRoute>
                            }
                        />
                        {/* ChatPage - Interface de conversação */}
                        <Route
                            path="/chat"
                            element={
                                <PrivateRoute>
                                    <ChatPage />
                                </PrivateRoute>
                            }
                        />
                        {/* ProfilePage - Página de perfil do usuário */}
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <ProfilePage />
                                </PrivateRoute>
                            }
                        />

                        {/* ========== ROTA DE FALLBACK ========== */}
                        {/* Redireciona todas as rotas não encontradas para a WelcomePage */}
                        {/* Esta rota DEVE ser a ÚLTIMA */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
