import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { FcGoogle } from 'react-icons/fc';

export default function LoginGoogle({ customText = "Iniciar sesión con Google" }) {
  
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Forzar que pida la cuenta si se desea cambiar
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      console.log("Sesión iniciada con éxito:", result.user);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="btn-google-custom"
      type="button"
    >
      <FcGoogle style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} />
      <span>{customText}</span>
    </button>
  );
}