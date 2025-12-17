// src/pages/ChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatPage.css';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔧 Listener de mensagens com proteção contra desmontagem
  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    const setupListener = () => {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        // ✅ Só atualiza se o componente ainda estiver montado
        if (!isMounted) return;

        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMessages(msgs);
      }, (error) => {
        console.error('❌ Erro ao carregar mensagens:', error);
      });
    };

    setupListener();

    // 🧹 Cleanup: marca como desmontado e cancela listener
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // ✅ Array vazio - executa apenas uma vez

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    if (!currentUser) {
      alert('Você precisa estar logado para enviar mensagens');
      return;
    }

    try {
      setLoading(true);
      
      await addDoc(collection(db, 'messages'), {
        text: newMessage.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || 'Usuário',
        userEmail: currentUser.email,
        userPhoto: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Verifique as permissões no Firestore.');
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ FUNÇÃO PARA EXCLUIR MENSAGEM
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      return;
    }

    try {
      setDeletingId(messageId);
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('❌ Erro ao excluir mensagem:', error);
      alert('Erro ao excluir mensagem. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Elo Batista - Chat</h1>
        <div className="header-actions">
          <span className="current-user">
            {currentUser?.displayName || currentUser?.email}
          </span>
          <button onClick={handleLogout} className="logout-button">Sair</button>
        </div>
      </header>

      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>📭 Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.id} 
              className={`message ${msg.userId === currentUser?.uid ? 'sent' : 'received'}`}
            >
              <div className="message-header">
                {msg.userPhoto && (
                  <img src={msg.userPhoto} alt={msg.userName} className="user-avatar" />
                )}
                <span className="message-sender">{msg.userName || msg.userEmail}</span>
                {msg.createdAt && (
                  <span className="message-time">
                    {msg.createdAt.toDate().toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
                {/* 🗑️ BOTÃO DE EXCLUIR - Só aparece para o dono da mensagem */}
                {msg.userId === currentUser?.uid && (
                  <button 
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="delete-button"
                    disabled={deletingId === msg.id}
                    title="Excluir mensagem"
                  >
                    {deletingId === msg.id ? '⏳' : '🗑️'}
                  </button>
                )}
              </div>
              <p className="message-text">{msg.text}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="message-input"
          disabled={loading}
          maxLength={500}
        />
        <button type="submit" className="send-button" disabled={loading || !newMessage.trim()}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

export default ChatPage;