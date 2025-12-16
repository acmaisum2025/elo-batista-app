// elo-batista-backend/config/firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Caminho para sua chave de serviço

// Inicializa o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Opcional: Se você for usar o Realtime Database, adicione a URL aqui
  // databaseURL: "https://SEU_PROJECT_ID.firebaseio.com"
});

// Exporta os serviços do Firebase que vamos usar
const db = admin.firestore();
const messaging = admin.messaging(); // Para enviar notificações push

module.exports = { admin, db, messaging };
