// elo-batista-backend/routes/dailyVerseRoutes.js
const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseAdmin');

// Função auxiliar para formatar data no formato YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Rota para obter o versículo diário atual (data de hoje)
router.get('/current', async (req, res) => {
  try {
    const today = formatDate(new Date());
    const doc = await db.collection('dailyVerses').doc(today).get();
    
    if (!doc.exists) {
      // Retorna versículo padrão se não encontrar o do dia
      return res.status(200).json({
        verse: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
        reference: 'João 3:16',
        date: today,
        isDefault: true,
        message: 'Versículo padrão - nenhum versículo específico cadastrado para hoje'
      });
    }
    
    res.status(200).json({
      ...doc.data(),
      date: today,
      isDefault: false
    });
  } catch (error) {
    console.error('Erro ao buscar versículo diário:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor.',
      error: error.message 
    });
  }
});

// Rota para obter versículo de uma data específica
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params; // Espera formato YYYY-MM-DD
    
    // Valida formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        message: 'Formato de data inválido. Use YYYY-MM-DD' 
      });
    }
    
    const doc = await db.collection('dailyVerses').doc(date).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        message: `Nenhum versículo encontrado para ${date}` 
      });
    }
    
    res.status(200).json({
      ...doc.data(),
      date: date
    });
  } catch (error) {
    console.error('Erro ao buscar versículo por data:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor.',
      error: error.message 
    });
  }
});

// Rota para criar/atualizar versículo diário
router.post('/create', async (req, res) => {
  try {
    const { date, verse, reference } = req.body;
    
    // Validações
    if (!date || !verse || !reference) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios: date, verse, reference' 
      });
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        message: 'Formato de data inválido. Use YYYY-MM-DD' 
      });
    }
    
    await db.collection('dailyVerses').doc(date).set({
      verse,
      reference,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ 
      message: 'Versículo criado/atualizado com sucesso',
      date,
      verse,
      reference
    });
  } catch (error) {
    console.error('Erro ao criar versículo:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor.',
      error: error.message 
    });
  }
});

// Rota para listar todos os versículos
router.get('/all', async (req, res) => {
  try {
    const snapshot = await db.collection('dailyVerses')
      .orderBy('__name__', 'desc')
      .limit(30)
      .get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    
    const verses = [];
    snapshot.forEach(doc => {
      verses.push({
        date: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(verses);
  } catch (error) {
    console.error('Erro ao listar versículos:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor.',
      error: error.message 
    });
  }
});

// Rota para deletar versículo
router.delete('/delete/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    await db.collection('dailyVerses').doc(date).delete();
    
    res.status(200).json({ 
      message: 'Versículo deletado com sucesso',
      date 
    });
  } catch (error) {
    console.error('Erro ao deletar versículo:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor.',
      error: error.message 
    });
  }
});

module.exports = router;