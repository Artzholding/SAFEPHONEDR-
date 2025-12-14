/**
 * SafePhone DR - Phishing URL Detector
 * 
 * Detects suspicious URLs that may be phishing attempts.
 * Specifically tuned for common scams in the Dominican Republic.
 * 
 * PRIVACY: All analysis happens locally. URLs are NOT sent to any server.
 */

import { UrlAnalysisResult, RiskLevel } from '../types';

// Dominios oficiales (lista completa, sin borrar bancos)
const OFFICIAL_BANK_DOMAINS = [
  // Principales
  'banreservas.com',
  'banreservas.com.do',
  'popularenlinea.com',
  'bancopopular.com.do', // portal institucional Popular
  'bhd.com.do',
  'bsc.com.do',
  'do.scotiabank.com',
  'banesco.com.do',
  'bancolafise.com.do',
  'bancocaribe.com.do',
  'blh.com.do',
  'bdi.com.do',
  'apap.com.do',
  'acap.com.do',
  'lanacional.com.do',
  'bagricola.gob.do',
  'bandex.com.do',
  'bancoademi.com.do',
  'cibao.com.do',
  'promerica.com.do',
  'bv.com.do',
  'bancovimencaservicios.com',
  'lafise.com',
  'banfondesa.com.do',
  'motorcredito.com.do',
  'alaver.com.do',
  'adopem.com.do',
  'adap.com.do',
  // Referencia institucional
  'citi.com',
];

// Known phishing patterns and typosquatting variations - específico para RD
const PHISHING_PATTERNS = [
  // Banco Popular variations (el más imitado en RD)
  /bancopopular(?!\.com\.do)/i,
  /banco-popular/i,
  /bancop0pular/i,
  /bancopupular/i,
  /bancopoppular/i,
  /popularenlinea(?!\.com)/i,
  /popular-seguro/i,
  /popularseguro/i,
  /popular-rd/i,
  /bfrpopular/i,
  
  // Banreservas variations
  /banreservas(?!\.com)/i,
  /ban-reservas/i,
  /banresevas/i,
  /banreservas-seguro/i,
  /reservasbank/i,
  /banreserva[^s]/i,
  
  // BHD León variations
  /bhdleon(?!\.com\.do)/i,
  /bhd-leon/i,
  /bhdl30n/i,
  /bhdloen/i,
  /leonbhd/i,
  
  // Scotiabank RD
  /scotiabank(?!\.com\.do)/i,
  /scotia-rd/i,
  
  // APAP
  /apap(?!\.com\.do)/i,
  /asociacionpopular(?!\.com)/i,
  
  // Telecomunicaciones RD (usadas en estafas de "ganaste datos gratis")
  /claro(?!\.com\.do).*promo/i,
  /altice(?!\.com\.do).*gratis/i,
  /viva(?!\.com\.do).*premio/i,
  
  // Gobierno RD (estafas de impuestos y TSS)
  /dgii(?!\.gov\.do)/i,
  /tss(?!\.gob\.do)/i,
  /impuestos-rd/i,
  
  // Patrones genéricos de estafas comunes en RD
  /seguridad-banco/i,
  /verificar-cuenta/i,
  /actualizar-datos/i,
  /confirmar-identidad/i,
  /premio-ganador/i,
  /loteria-gratis/i,
  /bono-gobierno/i,
  /tarjeta-solidaridad/i,
  /superate-bono/i,
  /fase-rd/i,
  
  // WhatsApp scams (muy comunes en RD)
  /whatsapp.*premio/i,
  /wa\.me.*banco/i,
  
  // Suspicious TLDs often used in phishing
  /\.(tk|ml|ga|cf|gq|xyz|top|work|click)$/i,
];

// Suspicious keywords in URLs - palabras comunes en estafas en RD
const SUSPICIOUS_KEYWORDS = [
  // Urgencia (táctica común)
  'login-seguro',
  'cuenta-bloqueada',
  'verificacion-urgente',
  'confirmar-ahora',
  'urgente',
  'inmediato',
  'ultima-oportunidad',
  
  // Premios falsos
  'premio',
  'ganaste',
  'ganador',
  'loteria',
  'sorteo',
  'gratis',
  'regalo',
  
  // Amenazas
  'bloqueo',
  'suspendida',
  'cancelar-cuenta',
  'desactivar',
  'vencido',
  
  // Gobierno RD (estafas de bonos)
  'bono-gobierno',
  'subsidio',
  'tarjeta-solidaridad',
  'superate',
  'fase',
  'ayuda-social',
  
  // Telecomunicaciones
  'recarga-gratis',
  'datos-gratis',
  'megas-regalo',
  
  // Banco específico
  'actualizar-token',
  'renovar-clave',
  'desbloquear-tarjeta',
];

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    // Add protocol if missing
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }
    const urlObj = new URL(fullUrl);
    return urlObj.hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Check if URL uses HTTPS
 */
function isHttps(url: string): boolean {
  const lowerUrl = url.toLowerCase().trim();
  return lowerUrl.startsWith('https://') || 
         (!lowerUrl.startsWith('http://') && !lowerUrl.includes('://'));
}

/**
 * Check for typosquatting attempts on bank domains
 */
function checkTyposquatting(domain: string): { isTyposquatting: boolean; matchedPattern?: string } {
  // Check if it's an official domain
  if (OFFICIAL_BANK_DOMAINS.some(official => domain.endsWith(official))) {
    return { isTyposquatting: false };
  }

  // Check against phishing patterns
  for (const pattern of PHISHING_PATTERNS) {
    if (pattern.test(domain)) {
      return { 
        isTyposquatting: true, 
        matchedPattern: `Dominio sospechoso similar a banco oficial` 
      };
    }
  }

  return { isTyposquatting: false };
}

/**
 * Check URL for suspicious keywords
 */
function checkSuspiciousKeywords(url: string): string[] {
  const lowerUrl = url.toLowerCase();
  return SUSPICIOUS_KEYWORDS.filter(keyword => lowerUrl.includes(keyword));
}

/**
 * Generate warning message based on analysis
 */
function generateWarningMessage(
  analysis: Partial<UrlAnalysisResult>,
  suspiciousKeywords: string[]
): string {
  const warnings: string[] = [];

  if (!analysis.isHttps) {
    warnings.push('⚠️ Esta página NO es segura (sin HTTPS)');
  }

  if (analysis.isTyposquatting) {
    warnings.push('🚨 Este dominio imita a un banco oficial');
    warnings.push('💀 Posible intento de ROBAR tus datos');
  }

  if (suspiciousKeywords.length > 0) {
    warnings.push('⚠️ Contiene palabras sospechosas usadas en estafas');
  }

  if (warnings.length === 0) {
    return '';
  }

  return warnings.join('\n');
}

/**
 * Analyze a URL for phishing indicators
 */
export function analyzeUrl(url: string): UrlAnalysisResult {
  if (!url || url.trim() === '') {
    return {
      url: '',
      isHttps: false,
      isSuspicious: false,
      isTyposquatting: false,
      riskLevel: 'safe',
    };
  }

  const domain = extractDomain(url);
  const hasHttps = isHttps(url);
  const typosquatting = checkTyposquatting(domain);
  const suspiciousKeywords = checkSuspiciousKeywords(url);

  // Calculate risk level
  let riskScore = 0;
  
  if (!hasHttps) riskScore += 2;
  if (typosquatting.isTyposquatting) riskScore += 5;
  if (suspiciousKeywords.length > 0) riskScore += suspiciousKeywords.length;

  let riskLevel: RiskLevel = 'safe';
  if (riskScore >= 4) {
    riskLevel = 'danger';
  } else if (riskScore >= 2) {
    riskLevel = 'warning';
  }

  const isSuspicious = riskLevel !== 'safe';

  const result: UrlAnalysisResult = {
    url,
    isHttps: hasHttps,
    isSuspicious,
    isTyposquatting: typosquatting.isTyposquatting,
    matchedPattern: typosquatting.matchedPattern,
    riskLevel,
  };

  result.warningMessage = generateWarningMessage(result, suspiciousKeywords);

  return result;
}

/**
 * Quick check if URL should trigger warning
 */
export function shouldShowWarning(url: string): boolean {
  const analysis = analyzeUrl(url);
  return analysis.riskLevel === 'danger' || analysis.riskLevel === 'warning';
}

/**
 * Get list of safe banking URLs for DR
 * Bancos principales de República Dominicana
 */
export function getSafeBankingUrls(): Array<{ name: string; url: string }> {
  return [
    { name: 'Banreservas', url: 'https://www.banreservas.com' },
    { name: 'Banreservas .com.do', url: 'https://www.banreservas.com.do' },
    { name: 'Popular en Línea', url: 'https://www.popularenlinea.com' },
    { name: 'Popular (correo bpd.com.do)', url: 'https://www.bancopopular.com.do' },
    { name: 'BHD', url: 'https://www.bhd.com.do' },
    { name: 'Banco Santa Cruz', url: 'https://www.bsc.com.do' },
    { name: 'Scotiabank RD', url: 'https://do.scotiabank.com' },
    { name: 'Banesco RD', url: 'https://www.banesco.com.do' },
    { name: 'Banco Lafise RD', url: 'https://www.bancolafise.com.do' },
    { name: 'Banco Caribe', url: 'https://www.bancocaribe.com.do' },
    { name: 'Banco López de Haro', url: 'https://www.blh.com.do' },
    { name: 'APAP', url: 'https://www.apap.com.do' },
    { name: 'ACAP', url: 'https://www.acap.com.do' },
    { name: 'La Nacional', url: 'https://www.lanacional.com.do' },
    { name: 'Bagricola', url: 'https://www.bagricola.gob.do' },
    { name: 'Bandex', url: 'https://www.bandex.com.do' },
    { name: 'ADEMI', url: 'https://www.bancoademi.com.do' },
    { name: 'Asociación Cibao', url: 'https://www.cibao.com.do' },
    { name: 'Promerica', url: 'https://www.promerica.com.do' },
    { name: 'Vimenca', url: 'https://www.bv.com.do' },
    { name: 'Vimenca Servicios', url: 'https://www.bancovimencaservicios.com' },
    { name: 'Lafise', url: 'https://www.lafise.com' },
    { name: 'Banfondesa', url: 'https://www.banfondesa.com.do' },
    { name: 'Motor Crédito', url: 'https://www.motorcredito.com.do' },
    { name: 'Alaver', url: 'https://www.alaver.com.do' },
    { name: 'Adopem', url: 'https://www.adopem.com.do' },
    { name: 'Asociación Duarte (ADAP)', url: 'https://www.adap.com.do' },
  ];
}

// ============================================
// PLACEHOLDER: Future SMS phishing detection
// ============================================
export function analyzeSmsForPhishing(_messageContent: string): boolean {
  // TODO: Implement SMS content analysis
  // Check for phishing links in SMS messages
  // Detect urgent language patterns
  console.log('[PLACEHOLDER] SMS phishing detection');
  return false;
}

// ============================================
// PLACEHOLDER: Future call scam detection
// ============================================
export function analyzeCallForScam(_phoneNumber: string): boolean {
  // TODO: Implement call scam detection
  // Check against known scam numbers
  // Detect spoofed bank numbers
  console.log('[PLACEHOLDER] Call scam detection');
  return false;
}

