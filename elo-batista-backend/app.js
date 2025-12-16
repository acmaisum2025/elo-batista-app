// elo-batista-backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, messaging } = require('./config/firebaseAdmin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
const dailyVerseRoutes = require('./routes/dailyVerseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// CORRIGIDO: Mudou de '/api/verse' para '/api/daily-verse'
app.use('/api/daily-verse', dailyVerseRoutes);
app.use('/api/notifications', notificationRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend do Elo Batista funcionando!');
});

// Função para buscar e armazenar versículos diários
const fetchAndStoreDailyVerse = async () => {
  try {
    const verses = [
      { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
      { text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13" },
      { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1" },
      { text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", reference: "Mateus 11:28" },
      { text: "Mas buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.", reference: "Mateus 6:33" }
    ];
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];

    // ATUALIZADO: Agora salva com a data como ID (YYYY-MM-DD)
    const today = new Date();
    const dateId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    await db.collection('dailyVerses').doc(dateId).set({
      verse: randomVerse.text,  // Mudado de 'text' para 'verse' para consistência
      reference: randomVerse.reference,
      date: new Date().toISOString()
    });
    console.log(`Versículo diário atualizado para ${dateId}:`, randomVerse.reference);

    // Enviar notificação push
    const snapshot = await db.collection('fcmTokens').get();
    const tokens = snapshot.docs.map(doc => doc.data().token);

    if (tokens.length > 0) {
      const message = {
        notification: {
          title: 'Versículo Diário - Elo Batista',
          body: `${randomVerse.text} (${randomVerse.reference})`
        },
        tokens: tokens,
      };

      messaging.sendMulticast(message)
        .then((response) => {
          console.log(response.successCount + ' mensagens de versículo diário enviadas com sucesso.');
          if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                console.error(`Falha ao enviar para o token ${tokens[idx]}: ${resp.exception}`);
              }
            });
          }
        })
        .catch((error) => {
          console.error('Erro ao enviar notificação de versículo diário:', error);
        });
    }

  } catch (error) {
    console.error('Erro ao buscar e armazenar versículo diário:', error);
  }
};

// Chama a função ao iniciar
fetchAndStoreDailyVerse();

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Backend do Elo Batista rodando na porta ${PORT}`);
});