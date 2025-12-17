   // src/pages/HomePage.js
   import React from 'react';
   import { useAuth } from '../contexts/AuthContext';
   import { useNavigate } from 'react-router-dom';
   import DailyVerseDisplay from '../components/DailyVerseDisplay'; // Importe o novo componente
   import '../styles/HomePage.css'; // Estilo para a página inicial

   function HomePage() {
     const { currentUser, logout } = useAuth();
     const navigate = useNavigate();

     const handleLogout = async () => {
       try {
         await logout();
         navigate('/login'); // Redireciona para a página de login após o logout
       } catch (error) {
         console.error("Erro ao fazer logout: ", error);
       }
     };

     // Esta HomePage agora será sempre a página principal para usuários autenticados.
     // A página pública de "Bem-vindo" será uma rota separada ou a LoginPage.
     return (
       <div className="home-container authenticated">
         <header className="home-header">
           <h1>Bem-vindo, {currentUser ? currentUser.email : 'Usuário'}!</h1> {/* Exibe o e-mail do usuário logado */}
           <nav className="main-nav">
             <button onClick={() => navigate('/chat')} className="nav-button">Chat</button>
             <button onClick={() => navigate('/profile')} className="nav-button">Perfil</button>
             <button onClick={handleLogout} className="logout-button">Sair</button>
           </nav>
         </header>
         <main className="home-main">
           <DailyVerseDisplay /> {/* Aqui o versículo diário será exibido */}
           {/* Adicione outros componentes ou informações da dashboard aqui */}
         </main>
         <footer className="home-footer">
           <p>© 2025 Igreja Batista Nacional. Todos os direitos reservados.</p>
         </footer>
       </div>
     );
   }

   export default HomePage;
