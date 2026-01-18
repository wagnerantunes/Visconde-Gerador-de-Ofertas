// Analytics and Marketing Tracking Utilities
// Funções para tracking de eventos em Google Analytics, Google Ads e Meta Pixel

// Tipos para TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Track event in Google Analytics 4
 * @param eventName - Nome do evento (ex: 'flyer_exported', 'product_added')
 * @param params - Parâmetros adicionais do evento
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
    console.log('[Analytics] Event tracked:', eventName, params);
  }
};

/**
 * Track conversion for Google Ads
 * @param conversionId - ID da conversão do Google Ads (formato: 'AW-XXXXXXXXX/CONVERSION_LABEL')
 * @param value - Valor da conversão (opcional)
 * @param currency - Moeda (padrão: BRL)
 */
export const trackConversion = (
  conversionId: string,
  value?: number,
  currency: string = 'BRL'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: currency,
    });
    console.log('[Google Ads] Conversion tracked:', conversionId, value);
  }
};

/**
 * Track event in Meta Pixel (Facebook/Instagram)
 * @param eventName - Nome do evento padrão do Meta (ex: 'Lead', 'ViewContent', 'CompleteRegistration')
 * @param params - Parâmetros adicionais
 */
export const trackMetaEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
    console.log('[Meta Pixel] Event tracked:', eventName, params);
  }
};

/**
 * Track custom event in Meta Pixel
 * @param eventName - Nome customizado do evento
 * @param params - Parâmetros adicionais
 */
export const trackMetaCustomEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
    console.log('[Meta Pixel] Custom event tracked:', eventName, params);
  }
};

/**
 * Track page view (útil para SPAs)
 * @param pagePath - Caminho da página (opcional)
 */
export const trackPageView = (pagePath?: string) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath || window.location.pathname,
    });
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }

  console.log('[Analytics] Page view tracked:', pagePath || window.location.pathname);
};

/**
 * Initialize tracking only after user consent (LGPD compliance)
 */
export const initializeTracking = () => {
  console.log('[Analytics] Tracking initialized after user consent');
  trackPageView();
};

/**
 * Eventos pré-definidos para o Gerador de Ofertas
 */
export const AnalyticsEvents = {
  // Eventos de produto
  PRODUCT_ADDED: 'product_added',
  PRODUCT_REMOVED: 'product_removed',
  PRODUCT_EDITED: 'product_edited',
  
  // Eventos de exportação (CONVERSÃO PRINCIPAL)
  FLYER_EXPORTED: 'flyer_exported',
  FLYER_EXPORT_STARTED: 'flyer_export_started',
  
  // Eventos de template
  TEMPLATE_SAVED: 'template_saved',
  TEMPLATE_LOADED: 'template_loaded',
  
  // Eventos de sincronização
  GOOGLE_SHEETS_SYNC: 'google_sheets_sync',
  
  // Eventos de engajamento
  THEME_CHANGED: 'theme_changed',
  LAYOUT_CHANGED: 'layout_changed',
} as const;
