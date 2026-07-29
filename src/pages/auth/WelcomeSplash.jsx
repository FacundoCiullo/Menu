import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginGoogle from '../../components/user/LoginGoogle';
import "./style/WelcomeSplash.css";

export default function WelcomeSplash() {
  const [step, setStep] = useState('welcome');
  const navigate = useNavigate();

  const handleContinueWithoutLogin = () => {
    navigate('/Home');
  };

  return (
    <div className="splash-container">
      
      {/* ==========================================
          PANTALLA 1: WELCOME + GIF + BOTÓN CONTINUE
         ========================================== */}
      {step === 'welcome' && (
        <div className="splash-welcome-screen animate-fade-in">
          
          {/* Encabezado */}
          <div className="splash-header">
            <h1>Welcome</h1>
          </div>

          {/* Centro: GIF + Texto */}
          <div className="splash-media-container">
            <div className="splash-gif-wrapper">
              <img
                src="/img/fire-2.gif" // Ruta directa desde la carpeta public
                alt="Fuego animado"
                className="splash-gif"
              />
            </div>

            <div className="splash-caption">
              <h2>FoodCart</h2>
              <p className="subtitle">Special & Delicious Food</p>
              <p className="question">What Special meal today?</p>
            </div>
          </div>

          {/* Botón Continue */}
          <div className="splash-actions">
            <span className="splash-actions-text">Continue</span>
            <button
              onClick={() => setStep('login')}
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
          PANTALLA 2: SIGN IN / LOGIN CON GOOGLE
         ========================================== */}
      {step === 'login' && (
        <div className="splash-login-screen animate-fade-in">
          
          {/* Header con la forma de ola/curva en CSS */}
          <div className="splash-login-header"></div>

          {/* Formulario / Login */}
          <div className="splash-login-body">
            <div>
              <h1>Sign in</h1>

              <div className="google-login-container">
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
                onClick={() => setStep('welcome')}
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