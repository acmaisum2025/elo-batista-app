// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getStorage } from 'firebase/storage'; // ADICIONADO

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // ADICIONADO

let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn('Firebase Messaging não está disponível:', error);
}

// Função para solicitar permissão de notificação e obter token
export const requestForToken = async () => {
  if (!messaging) {
    console.warn('Firebase Messaging não está disponível');
    return null;
  }

  try {
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
    });
    
    if (currentToken) {
      console.log('Token FCM obtido:', currentToken);
      return currentToken;
    } else {
      console.log('Nenhum token de registro disponível. Solicite permissão para gerar um.');
      return null;
    }
  } catch (err) {
    console.error('Erro ao obter token:', err);
    return null;
  }
};

// Listener para mensagens em primeiro plano
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('Mensagem recebida em primeiro plano:', payload);
    // Aqui você pode mostrar uma notificação customizada
  });
}

export { auth, db, messaging, storage }; // ADICIONADO storage na exportação