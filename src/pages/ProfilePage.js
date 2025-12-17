// src/pages/ProfilePage.js
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState(currentUser?.photoURL || '');

  // Função para selecionar arquivo
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 📸 Função para comprimir imagem EXTREMAMENTE (Firebase Auth tem limite de ~2000 caracteres)
  const compressImage = (file, maxSize = 80, quality = 0.3) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Redimensionar para tamanho EXTREMAMENTE pequeno (80x80 por padrão)
          const size = Math.min(img.width, img.height, maxSize);
          canvas.width = size;
          canvas.height = size;
          
          const ctx = canvas.getContext('2d');
          
          // Centralizar a imagem (crop para quadrado)
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;
          
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, size, size
          );
          
          // Converter para Base64 com QUALIDADE MUITO BAIXA
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          console.log(`📊 Tamanho: ${size}x${size}px | Qualidade: ${quality} | Caracteres: ${compressedBase64.length}`);
          
          resolve(compressedBase64);
        };
        
        img.onerror = (error) => reject(error);
      };
      
      reader.onerror = (error) => reject(error);
    });
  };

  // 📤 Função para fazer upload da foto (Base64)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione uma imagem válida.' });
      return;
    }

    // Validar tamanho (máximo 5MB antes da compressão)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      // Comprimir EXTREMAMENTE a imagem (começar com 80x80, qualidade 0.3)
      let photoURL = await compressImage(file, 80, 0.3);
      
      console.log(`🔍 Tentativa 1: ${photoURL.length} caracteres`);
      
      // CRÍTICO: Firebase Auth tem limite de ~1900 caracteres para photoURL (margem de segurança)
      const MAX_LENGTH = 1900;
      
      if (photoURL.length > MAX_LENGTH) {
        console.warn('⚠️ Ainda muito grande, tentando 60x60 com qualidade 0.2...');
        photoURL = await compressImage(file, 60, 0.2);
        console.log(`🔍 Tentativa 2: ${photoURL.length} caracteres`);
        
        if (photoURL.length > MAX_LENGTH) {
          console.warn('⚠️ Ainda muito grande, tentando 50x50 com qualidade 0.1...');
          photoURL = await compressImage(file, 50, 0.1);
          console.log(`🔍 Tentativa 3: ${photoURL.length} caracteres`);
          
          if (photoURL.length > MAX_LENGTH) {
            setMessage({ 
              type: 'error', 
              text: `Imagem muito complexa (${photoURL.length} caracteres). Tente uma foto mais simples ou com fundo sólido.` 
            });
            setUploading(false);
            return;
          }
        }
      }
      
      console.log(`✅ Compressão bem-sucedida! ${photoURL.length} caracteres (limite: ${MAX_LENGTH})`);
      
      // Atualizar perfil no Firebase Auth
      await updateProfile(currentUser, { photoURL });
      
      // Atualizar documento no Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { photoURL });

      setPreviewImage(photoURL);
      setMessage({ type: 'success', text: 'Foto de perfil atualizada com sucesso!' });
    } catch (error) {
      console.error('❌ Erro ao fazer upload da imagem:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao fazer upload da imagem. Tente novamente.' 
      });
    } finally {
      setUploading(false);
    }
  };

  // 💾 Função para atualizar nome
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'O nome não pode estar vazio.' });
      return;
    }

    try {
      setUpdating(true);
      setMessage({ type: '', text: '' });

      // Atualizar perfil no Firebase Auth
      await updateProfile(currentUser, { displayName: displayName.trim() });
      
      // Atualizar documento no Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { displayName: displayName.trim() });

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil. Tente novamente.' });
    } finally {
      setUpdating(false);
    }
  };

  // 🗑️ Função para remover foto
  const handleRemovePhoto = async () => {
    if (!window.confirm('Tem certeza que deseja remover sua foto de perfil?')) {
      return;
    }

    try {
      setUploading(true);
      
      // Atualizar perfil no Firebase Auth
      await updateProfile(currentUser, { photoURL: '' });
      
      // Atualizar documento no Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { photoURL: '' });

      setPreviewImage('');
      setMessage({ type: 'success', text: 'Foto de perfil removida com sucesso!' });
    } catch (error) {
      console.error('❌ Erro ao remover foto:', error);
      setMessage({ type: 'error', text: 'Erro ao remover foto. Tente novamente.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <button onClick={() => navigate('/home')} className="back-button">
          ← Voltar
        </button>
        <h1>Meu Perfil</h1>
      </header>

      <main className="profile-main">
        <div className="profile-card">
          {/* Seção da Foto de Perfil */}
          <div className="profile-photo-section">
            <div className="profile-photo-wrapper">
              {previewImage ? (
                <img src={previewImage} alt="Foto de perfil" className="profile-photo" />
              ) : (
                <div className="profile-photo-placeholder">
                  <span className="placeholder-icon">👤</span>
                </div>
              )}
              
              {uploading && (
                <div className="photo-loading-overlay">
                  <div className="loading-spinner"></div>
                </div>
              )}
            </div>

            <div className="profile-photo-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              <button 
                onClick={handleFileSelect} 
                className="btn-upload"
                disabled={uploading}
              >
                {uploading ? 'Processando...' : '📷 Alterar Foto'}
              </button>
              
              {previewImage && (
                <button 
                  onClick={handleRemovePhoto} 
                  className="btn-remove"
                  disabled={uploading}
                >
                  🗑️ Remover Foto
                </button>
              )}
            </div>

            <p className="photo-info">
              Formatos: JPG, PNG, GIF (máx 5MB) • Imagem será comprimida para caber no limite do Firebase
            </p>
          </div>

          {/* Mensagens de Feedback */}
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.type === 'success' ? '✓' : '⚠️'} {message.text}
            </div>
          )}

          {/* Formulário de Perfil */}
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={currentUser?.email || ''}
                disabled
                className="input-disabled"
              />
              <small>O e-mail não pode ser alterado</small>
            </div>

            <div className="form-group">
              <label htmlFor="displayName">Nome de Exibição</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={50}
              />
            </div>

            <button type="submit" className="btn-save" disabled={updating}>
              {updating ? 'Salvando...' : '💾 Salvar Alterações'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;