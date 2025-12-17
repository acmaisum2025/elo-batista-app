// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebase/config'; // ✅ Import do alias
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Cria o contexto
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider do contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para criar documento no Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    
    try {
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        const { email, displayName, photoURL } = user;
        
        await setDoc(userRef, {
          email,
          displayName: displayName || additionalData.displayName || '',
          photoURL: photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...additionalData
        });
      }

      return userRef;
    } catch (error) {
      console.error('❌ Erro ao criar documento do usuário:', error);
      throw error;
    }
  };

  // 🔥 FUNÇÃO DE CADASTRO
  const signup = async (email, password, displayName) => {
    try {
      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualiza o perfil com o displayName
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Cria o documento no Firestore
      await createUserDocument(userCredential.user, { displayName });

      return userCredential.user;
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      throw error;
    }
  };

  // 🔥 FUNÇÃO DE LOGIN
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Garante que o documento existe
      await createUserDocument(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  // 🔥 FUNÇÃO DE LOGOUT
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      throw error;
    }
  };

  // 🔧 Monitor de autenticação com proteção contra updates após desmontagem
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // ✅ Previne atualizações de estado se o componente foi desmontado
      if (!isMounted) return;

      if (user) {
        try {
          await createUserDocument(user);
        } catch (error) {
          console.error('❌ Erro ao criar documento:', error);
        }
      }

      // ✅ Só atualiza estado se o componente ainda estiver montado
      if (isMounted) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    // 🧹 Cleanup: marca como desmontado e cancela o listener
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // ✅ Array vazio - executa apenas uma vez

  // ⚠️ IMPORTANTE: O objeto value DEVE incluir signup, login e logout
  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};