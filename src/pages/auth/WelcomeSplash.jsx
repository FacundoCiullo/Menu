import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginGoogle from '../../components/user/LoginGoogle'; // Revisa que la ruta sea correcta según tu estructura
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import "./style/WelcomeSplash.css";

export default function WelcomeSplash() {
  const navigate = useNavigate();
  const location = useLocation();

  // Consumimos 'user' y 'logout' del AuthContext
  const { user, logout } = useAuth() || {};

  // Estado de autenticación
  const estaLogueado = Boolean(user && (user.email || user.uid));

  // Datos del usuario de Firebase
  const avatarSrc = estaLogueado ? user.photoURL : null;
  const nombreMostrar = estaLogueado 
    ? (user.displayName || user.email?.split('@')[0] || "Usuario") 
    : "Bienvenido";

  // Textos dinámicos
  const textoBotonVerde = estaLogueado ? "Continuar" : "Continuar sin loguearse";
  const textoBotonGoogle = estaLogueado ? "Continuar con Google" : "Iniciar sesión con Google";

  const handleAccionVerde = () => {
    navigate('/Home', { replace: true });
  };

  const handleCerrarSesion = async () => {
    if (logout) {
      await logout();
    }
  };

  const isLoginStep = location.pathname === '/login';

  const goToLogin = () => navigate('/login');
  const goToWelcome = () => navigate('/');

  return (
    <div className="splash-container">
{/* PANTALLA 1: WELCOME */}
{!isLoginStep && (
  <div className="splash-welcome-screen animate-fade-in">
    <div className="splash-media-container splash-card">
      
      <div className="splash-header">
        <h1>Bienvenido</h1>
      </div>

    {/* Tarjeta con el GIF de fondo */}

      <div className="splash-caption">
        <h2>RestorApp</h2>
        <p className="subtitle">Comida especial y deliciosa</p>
        <p className="question">¿Qué plato especial hay hoy?</p>
      </div>
    </div>

    <div className="splash-actions">
      <span className="splash-actions-text">Continuar</span>
      <button
        onClick={goToLogin}
        className="btn-continue-circle"
        aria-label="Continuar a Login"
      >
        <svg className="icon-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  </div>
)}

      {/* ==========================================
          PANTALLA 2: SIGN IN / PERFIL (Ruta '/login')
          ========================================== */}
      {isLoginStep && (
        <div className="splash-login-screen animate-fade-in">
          <div className="splash-login-header"></div>

          <div className="splash-login-body">
            <h1 className="visually-hidden">Iniciar sesión</h1>

            <div className="spotify-center-section">
              {/* CÍRCULO CENTRAL (Avatar o Icono) */}
              <div className="splash-login-avatar-container">
                {estaLogueado && avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={nombreMostrar}
                    className="splash-login-avatar-real"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <FaUserCircle className="default-user-icon" />
                )}
              </div>

              {/* NOMBRE ABAJO DEL CÍRCULO */}
              <div className="splash-user-name-display">
                <h2>{nombreMostrar}</h2>
              </div>

              {/* BOTONES ACCIONES */}
              <div className="spotify-action-buttons">
                {/* 1. Botón Verde */}
                <button
                  onClick={handleAccionVerde}
                  className="btn-spotify-green"
                >
                  {textoBotonVerde}
                </button>

                {/* 2. Botón Google adaptativo */}
                <div className="google-login-container">
                  <LoginGoogle customText={textoBotonGoogle} />
                </div>
              </div>

              {/* 3. Botón de Cerrar Sesión (solo si está logueado) */}
              {estaLogueado && (
                <div className="logout-container-wrapper">
                  <button
                    onClick={handleCerrarSesion}
                    className="btn-logout-custom"
                  >
                    <svg className="icon-logout" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={goToWelcome}
                className="btn-back"
              >
                ← Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}