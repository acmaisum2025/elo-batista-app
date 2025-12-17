// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 'Link' já está importado, o que é ótimo!
import { useAuth } from '../contexts/AuthContext';
import '../styles/LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate(); // 'useNavigate' já está inicializado, perfeito!

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/home');
    } catch (err) {
      console.error('Erro no login:', err);
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
          break;
        case 'auth/user-not-found':
          setError('Usuário não encontrado. Verifique o email ou crie uma nova conta.');
          break;
        case 'auth/wrong-password':
          setError('Senha incorreta. Tente novamente.');
          break;
        case 'auth/invalid-email':
          setError('Formato de email inválido. Verifique e tente novamente.');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.');
          break;
        case 'auth/user-disabled':
          setError('Esta conta foi desativada. Entre em contato com o suporte.');
          break;
        case 'auth/network-request-failed':
          setError('Erro de conexão. Verifique sua internet e tente novamente.');
          break;
        default:
          setError('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Elo Batista</h1>
          <p className="auth-subtitle">Bem-vindo de volta!</p>
        </div>
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
              className={error ? 'input-error' : ''}
            />
          </div>
          {/* AQUI É ONDE A MÁGICA ACONTECE! */}
          <div className="form-group"> {/* Este é o form-group da senha */}
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              disabled={loading}
              className={error ? 'input-error' : ''}
            />
            {/* NOVO TRECHO: O link de "Esqueceu sua senha?" logo após o input de senha */}
            <div className="forgot-password-link">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')} // Isso vai te levar para a rota /forgot-password
                className="link-button"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </div>
          {/* FIM DO NOVO TRECHO */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
        <div className="auth-divider">
          <span>ou</span>
        </div>
        <div className="auth-footer">
          <p className="auth-link">
            Não tem uma conta? {' '}
            <Link to="/signup" className="signup-link">
              Cadastre-se gratuitamente
            </Link>
          </p>
          <p className="back-link">
            <Link to="/">
              ← Voltar para o início
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
