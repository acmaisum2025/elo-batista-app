// elo-batista-backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { db, messaging } = require('../config/firebaseAdmin'); // Importa Firestore e Messaging

// Rota para registrar um token FCM do dispositivo
router.post('/register-token', async (req, res) => {
  const { token, uid } = req.body; // uid é o ID do usuário logado no frontend

  if (!token || !uid) {
    return res.status(400).send({ message: 'Token e UID são obrigatórios.' });
  }

  try {
    // Armazena o token no Firestore, associado ao UID do usuário
    // Isso permite enviar notificações direcionadas a usuários específicos
    await db.collection('fcmTokens').doc(uid).set({ token, uid, timestamp: new Date() }, { merge: true });
    res.status(200).send({ message: 'Token FCM registrado com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar token FCM:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
});

// Rota para enviar uma notificação de teste (pode ser protegida para admins)
router.post('/send-test-notification', async (req, res) => {
  const { targetUid, title, body } = req.body;

  if (!targetUid || !title || !body) {
    return res.status(400).send({ message: 'targetUid, title e body são obrigatórios.' });
  }

  try {
    const doc = await db.collection('fcmTokens').doc(targetUid).get();
    if (!doc.exists) {
      return res.status(404).send({ message: 'Token FCM para este usuário não encontrado.' });
    }
    const token = doc.data().token;

    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token, // Envia para o token específico
    };

    const response = await messaging.send(message);
    console.log('Notificação de teste enviada com sucesso:', response);
    res.status(200).send({ message: 'Notificação enviada com sucesso.', response });
  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error);
    res.status(500).send({ message: 'Erro ao enviar notificação de teste.' });
  }
});

module.exports = router;
