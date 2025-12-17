   // src/pages/WelcomePage.js
   import React from 'react';
   import { useNavigate } from 'react-router-dom';
   import '../styles/HomePage.css'; // Reutiliza o estilo da HomePage para a parte pública

   function WelcomePage() {
     const navigate = useNavigate();

     return (
       <div className="home-container public">
         <header className="home-header">
           <h1>Bem-vindo ao Elo Batista!</h1>
           <button onClick={() => navigate('/login')} className="login-button">Entrar</button>
         </header>
         <main className="home-main">
           <p>Conecte-se com a comunidade da Igreja Batista Nacional, receba versículos diários e fortaleça sua fé.</p>
         </main>
         <footer className="home-footer">
           <p>© 2025 Igreja Batista Nacional. Todos os direitos reservados.</p>
         </footer>
       </div>
     );
   }

   export default WelcomePage;
