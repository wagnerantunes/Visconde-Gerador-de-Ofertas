import React, { useState, useEffect } from 'react';
import { initializeTracking } from '../utils/analytics';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Aguardar 1 segundo antes de mostrar o banner para não ser intrusivo
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (consent === 'accepted') {
      // Se já aceitou, inicializar tracking
      initializeTracking();
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // Inicializar tracking apenas após consentimento
    initializeTracking();
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl z-50 animate-slide-up">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm md:text-base">
              🍪 Usamos cookies para melhorar sua experiência e medir o desempenho do site. 
              Ao continuar navegando, você concorda com nossa{' '}
              <a 
                href="/politica-privacidade.html" 
                target="_blank"
                className="underline hover:text-secondary transition-colors"
              >
                Política de Privacidade
              </a>
              {' '}e{' '}
              <a 
                href="/termos-de-uso.html" 
                target="_blank"
                className="underline hover:text-secondary transition-colors"
              >
                Termos de Uso
              </a>.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={rejectCookies}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
            >
              Rejeitar
            </button>
            <button
              onClick={acceptCookies}
              className="px-6 py-2 bg-primary hover:bg-red-700 rounded-lg transition-colors text-sm font-bold shadow-lg"
            >
              Aceitar Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
