import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginGoogle from '../../components/user/LoginGoogle'; 
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import "./style/WelcomeSplash.css";

export default function WelcomeSplash() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth() || {};
  const estaLogueado = Boolean(user && (user.email || user.uid));

  const avatarSrc = estaLogueado ? user.photoURL : null;
  const nombreMostrar = estaLogueado 
    ? (user.displayName || user.email?.split('@')[0] || "Usuario") 
    : "Bienvenido";

  const textoBotonVerde = estaLogueado ? "Continuar" : "Continuar sin loguearse";
  const textoBotonGoogle = estaLogueado ? "Iniciar sesión con Google" : "Iniciar sesión con Google";

  const isLoginStep = location.pathname === '/login';

  // Temporizador para la transición automática a los 4 segundos
  useEffect(() => {
    if (!isLoginStep) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);

      // Limpia el temporizador si el componente se desmonta antes del tiempo
      return () => clearTimeout(timer);
    }
  }, [isLoginStep, navigate]);

  const handleAccionVerde = () => {
    navigate('/Home', { replace: true });
  };

  const handleCerrarSesion = async () => {
    if (logout) {
      await logout();
    }
  };

  const goToWelcome = () => navigate('/');

  return (
    <div className="splash-container">
      {/* PANTALLA 1: WELCOME (AUTOTRANSICIÓN EN 4S) */}
      {!isLoginStep && (
        <div className="splash-welcome-screen animate-fade-in">
          <div className="splash-media-container splash-card">
            
                        {/* VIDEO DE FONDO */}
            <video className="bg-video" autoPlay loop muted playsInline>
              <source src="/img/sarten.mp4" type="video/mp4" />
            </video>
            <div className="splash-header">
              <h1>RestoApp</h1>
            </div>
          </div>

          {/* BARRA DE CARGA INFERIOR */}
          <div className="splash-loader-container">
            <span className="splash-loader-text">Cargando experiencia...</span>
            <div className="splash-progress-track">
              <div className="splash-progress-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 2: SIGN IN / PERFIL (Ruta '/login') */}
      {isLoginStep && (
        <div className="splash-login-screen animate-fade-in">
          <div className="splash-login-body">
            <h1 className="visually-hidden">Iniciar sesión</h1>

            <div className="spotify-center-section">
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

              <div className="splash-user-name-display">
                <h2>{nombreMostrar}</h2>
              </div>

              <div className="spotify-action-buttons">
                <button
                  onClick={handleAccionVerde}
                  className="btn-spotify-green"
                >
                  {textoBotonVerde}
                </button>

                <div className="google-login-container">
                  <LoginGoogle customText={textoBotonGoogle} />
                </div>
              </div>

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