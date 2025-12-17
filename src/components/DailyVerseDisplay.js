// src/components/DailyVerseDisplay.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/DailyVerseDisplay.css';

function DailyVerseDisplay() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        setLoading(true);
        setError('');

        // Formata a data atual para o ID do documento (ex: "2025-12-15")
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const docId = `${year}-${month}-${day}`;

        const verseRef = doc(db, 'dailyVerses', docId);
        const docSnap = await getDoc(verseRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Suporta tanto 'verse' quanto 'text' para compatibilidade
          setVerse({
            text: data.verse || data.text || '',
            reference: data.reference || 'Referência não disponível'
          });
        } else {
          // Versículo padrão caso não encontre
          setVerse({
            text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
            reference: 'João 3:16',
            isDefault: true
          });
          console.log("Nenhum versículo diário encontrado para o ID:", docId, "- Usando versículo padrão");
        }
      } catch (err) {
        setError('Erro ao carregar o versículo diário.');
        console.error("Erro ao buscar versículo diário:", err);
        
        // Versículo padrão em caso de erro
        setVerse({
          text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
          reference: 'João 3:16',
          isDefault: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDailyVerse();
  }, []);

  if (loading) {
    return <div className="daily-verse-container">Carregando versículo diário...</div>;
  }

  if (error && !verse) {
    return <div className="daily-verse-container error">{error}</div>;
  }

  if (!verse) {
    return <div className="daily-verse-container">Nenhum versículo diário disponível.</div>;
  }

  return (
    <div className="daily-verse-container">
      <h3 className="verse-title">Versículo Diário</h3>
      <p className="verse-text">"{verse.text}"</p>
      <p className="verse-reference">- {verse.reference}</p>
      {verse.isDefault && (
        <p className="verse-default-note">
          <small>💡 Versículo padrão - Configure o versículo do dia no backend</small>
        </p>
      )}
    </div>
  );
}

export default DailyVerseDisplay;