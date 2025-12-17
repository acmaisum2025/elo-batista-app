// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import '../styles/ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Por favor, digite seu e-mail.' });
      return;
    }

    // Validação de formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Por favor, digite um e-mail válido.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Enviar e-mail de recuperação
      await sendPasswordResetEmail(auth, email);

      setEmailSent(true);
      setMessage({ 
        type: 'success', 
        text: 'E-mail de recuperação enviado! Verifique sua caixa de entrada.' 
      });
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de recuperação:', error);
      
      // Mensagens de erro amigáveis
      let errorMessage = 'Erro ao enviar e-mail. Tente novamente.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Nenhuma conta encontrada com este e-mail.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = error.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await sendPasswordResetEmail(auth, email);
      
      setMessage({ 
        type: 'success', 
        text: 'E-mail reenviado com sucesso!' 
      });
    } catch (error) {
      console.error('❌ Erro ao reenviar e-mail:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erro ao reenviar e-mail. Aguarde alguns minutos.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <div className="icon-wrapper">
            <span className="lock-icon">🔒</span>
          </div>
          <h1>Recuperar Senha</h1>
          <p className="subtitle">
            {emailSent 
              ? 'E-mail enviado com sucesso!' 
              : 'Digite seu e-mail para receber o link de recuperação'}
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.type === 'success' ? '✓' : '⚠️'} {message.text}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Enviando...
                </>
              ) : (
                <>
                  📧 Enviar Link de Recuperação
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="btn-back"
              disabled={loading}
            >
              ← Voltar para Login
            </button>
          </form>
        ) : (
          <div className="success-content">
            <div className="success-icon">✉️</div>
            
            <div className="success-message">
              <h2>Verifique seu e-mail</h2>
              <p>
                Enviamos um link de recuperação para <strong>{email}</strong>
              </p>
              <p className="help-text">
                Clique no link do e-mail para criar uma nova senha.
              </p>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.type === 'success' ? '✓' : '⚠️'} {message.text}
              </div>
            )}

            <div className="success-actions">
              <button 
                onClick={handleResendEmail}
                className="btn-resend"
                disabled={loading}
              >
                {loading ? 'Reenviando...' : '🔄 Reenviar E-mail'}
              </button>

              <button 
                onClick={() => navigate('/login')}
                className="btn-back"
              >
                ← Voltar para Login
              </button>
            </div>

            <div className="help-section">
              <p className="help-title">Não recebeu o e-mail?</p>
              <ul className="help-list">
                <li>Verifique sua pasta de spam</li>
                <li>Aguarde alguns minutos</li>
                <li>Verifique se digitou o e-mail correto</li>
                <li>Tente reenviar o e-mail</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;