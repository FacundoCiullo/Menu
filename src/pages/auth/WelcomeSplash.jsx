import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginGoogle from '../../components/user/LoginGoogle';
import "./style/WelcomeSplash.css";

export default function WelcomeSplash() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Leemos el paso actual directamente de la URL (por defecto es 'welcome')
  const step = searchParams.get('step') || 'welcome';

  const goToLogin = () => {
    // Agrega 'step=login' al historial del navegador
    setSearchParams({ step: 'login' });
  };

  const goToWelcome = () => {
    // Si presiona el botón "Volver" en pantalla, retrocede en el historial
    navigate(-1);
  };

  const handleContinueWithoutLogin = () => {
    // Redirige al inicio y reemplaza el historial para que no vuelva al login si presiona atrás desde el Home
    navigate('/Home', { replace: true });
  };

  return (
    <div className="splash-container">
      
      {/* ==========================================
          PANTALLA 1: WELCOME
         ========================================== */}
      {step === 'welcome' && (
        <div className="splash-welcome-screen animate-fade-in">
          
          <div className="splash-header">
            <h1>Bienvenido</h1>
          </div>

          <div className="splash-media-container splash-card">
            <div className="splash-gif-wrapper ">
              <img
                src="/img/fire-2.gif"
                alt="Fuego animado"
                className="splash-gif"
              />
            </div>

            <div className="splash-caption">
              <h2>RestorApp</h2>
              <p className="subtitle">Comida especial y deliciosa</p>
              <p className="question">¿Qué plato especial hay hoy?</p>
            </div>
          </div>

          <div className="splash-actions">
            <span className="splash-actions-text">Continue</span>
            <button
              onClick={goToLogin}
              className="btn-continue-circle"
              aria-label="Continue"
            >
              <svg className="icon-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

        </div>
      )}

      {/* ==========================================
          PANTALLA 2: SIGN IN
         ========================================== */}
      {step === 'login' && (
        <div className="splash-login-screen animate-fade-in">
          
          <div className="splash-login-header "></div>

          <div className="splash-login-body ">
            <div>
              <h1>Sign in</h1>

              <div className="google-login-container ">
                <LoginGoogle />
              </div>
            </div>

            <div>
              <button
                onClick={handleContinueWithoutLogin}
                className="btn-guest"
              >
                Continuar sin loguearse
              </button>

              <button
                onClick={goToWelcome}
                className="btn-back"
              >
                ← Volver a la bienvenida
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}