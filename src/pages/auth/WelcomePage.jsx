import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/login'); // Navega a la segunda pantalla
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-10 bg-cover bg-center select-none"
      style={{
        backgroundImage: `url('/assets/welcome_bg.png')`, // Usa tu imagen de fondo completo
        backgroundColor: '#FF7F7F' // Color de respaldo por si no carga la imagen
      }}
    >
      {/* Parte Superior Vacía (o puedes poner el logo aquí si quieres) */}
      <div className="flex-1"></div>

      {/* Parte Inferior con Textos y Botón */}
      <div className="flex flex-col gap-10">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
            Welcome
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed max-w-sm">
            Lorem ipsum dolor sit amet consectetur.
            Lorem id sit.
          </p>
        </div>

        {/* El Botón Circular con la Flecha */}
        <div className="flex justify-end items-center gap-4">
          <span className="text-lg font-semibold text-slate-900">
            Continue
          </span>
          <button
            onClick={handleContinue}
            className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
            aria-label="Continue"
          >
            {/* Flecha SVG Simple (blanca) */}
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}