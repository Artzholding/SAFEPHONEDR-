/**
 * Verificador de correos bancarios (RD)
 * - Usa una allowlist de dominios oficiales.
 * - Acepta subdominios legítimos.
 * - Heurísticas básicas para dominios sospechosos.
 */

export type BankEmailCheck = {
  isOfficial: boolean;
  domain: string;
  reason: string;
  isTyposquatting?: boolean;
};

const OFFICIAL_BANK_DOMAINS: string[] = [
  // Bancos principales RD
  'banreservas.com',
  'banreservas.com.do',
  'popularenlinea.com',
  'bpd.com.do',
  'bpservices.com',
  'bancopopular.com.do',
  'bhd.com.do',
  'bhdleon.com.do',
  'bsc.com.do', // Banco Santa Cruz
  'scotiabank.com.do',
  'bancocaribe.com.do',
  'banviv.com.do', // Vimenca
  'blh.com.do', // López de Haro
  'apap.com.do', // APAP
  'lanacional.com.do',
  'acap.com.do',
  'bdi.com.do',
  'motorcredito.com.do',
  // Otros que suelen aparecer en RD
  'scotiabank.com',
  'banesco.com.do',
  'bancolafise.com',
  'bancolafise.com.do',
];

const SUSPICIOUS_TOKENS = ['seguro', 'soporte', 'verify', 'update', 'alerta', 'pago', 'premio'];
const COMMON_SUFFIXES = ['com', 'com.do', 'net.do', 'gob.do', 'do'];
import { BANK_OFFICIAL_EMAILS } from '../constants/bankOfficialEmails';
import { isReportedEmail } from './reportedIndicators';

function normalizeDomain(raw?: string): string {
  if (!raw) return '';
  return raw.trim().toLowerCase();
}

function extractDomain(emailAddress?: string): string {
  if (!emailAddress || !emailAddress.includes('@')) return '';
  const parts = emailAddress.trim().split('@');
  return normalizeDomain(parts[parts.length - 1]);
}

function isSubdomainOf(candidate: string, root: string): boolean {
  return candidate === root || candidate.endsWith(`.${root}`);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const v0 = new Array(b.length + 1).fill(0);
  const v1 = new Array(b.length + 1).fill(0);
  for (let i = 0; i < v0.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j < v0.length; j++) v0[j] = v1[j];
  }
  return v1[b.length];
}

function getRootCandidates(domain: string): string[] {
  const parts = domain.split('.').filter(Boolean);
  if (parts.length < 2) return [domain];
  const roots = new Set<string>();
  // última + penúltima
  roots.add(parts.slice(-2).join('.'));
  // últimas 3 (para .com.do)
  if (parts.length >= 3) roots.add(parts.slice(-3).join('.'));
  return Array.from(roots);
}

function isCommonSuffixRoot(root: string): boolean {
  return COMMON_SUFFIXES.includes(root);
}

export async function verifyBankEmail(emailAddress: string): Promise<BankEmailCheck> {
  const domain = extractDomain(emailAddress);
  if (!domain) {
    return { isOfficial: false, domain, reason: 'Formato inválido' };
  }

  // Coincidencia exacta de remitente oficial
  if (BANK_OFFICIAL_EMAILS.some((e) => e.toLowerCase() === emailAddress.trim().toLowerCase())) {
    return { isOfficial: true, domain, reason: 'Remitente oficial registrado' };
  }

  // Reportado por usuarios como phishing
  const reported = await isReportedEmail(emailAddress);
  if (reported) {
    return { isOfficial: false, domain, reason: 'Reportado por usuarios como phishing' };
  }

  const rootCandidates = getRootCandidates(domain);

  // Exacto o subdominio de alguno oficial
  for (const official of OFFICIAL_BANK_DOMAINS) {
    if (isSubdomainOf(domain, official)) {
      return { isOfficial: true, domain, reason: `Dominio oficial (${official})` };
    }
  }

  // Heurística: si el root es un sufijo común (.com, .com.do) sin marca, no basta
  const rootIsGeneric = rootCandidates.every(isCommonSuffixRoot);

  // Heurística simple
  if (SUSPICIOUS_TOKENS.some((tok) => domain.includes(tok))) {
    return { isOfficial: false, domain, reason: 'Dominio no oficial con palabras sospechosas' };
  }

  // Typosquatting: distancia Levenshtein pequeña contra dominios oficiales
  let minDistance = Infinity;
  for (const official of OFFICIAL_BANK_DOMAINS) {
    // Si contiene el dominio oficial pero no es subdominio válido, marcar como typosquatting
    if (domain.includes(official) && !isSubdomainOf(domain, official)) {
      return {
        isOfficial: false,
        domain,
        isTyposquatting: true,
        reason: 'Dominio contiene nombre de banco pero no es dominio oficial',
      };
    }
    const d = levenshtein(domain, official);
    if (d < minDistance) minDistance = d;
  }
  if (minDistance <= 2 && !rootIsGeneric) {
    return {
      isOfficial: false,
      domain,
      isTyposquatting: true,
      reason: 'Dominio parecido a uno oficial (posible typosquatting)',
    };
  }

  return { isOfficial: false, domain, reason: 'Dominio no está en la lista oficial' };
}

export function getOfficialBankDomains(): string[] {
  return [...OFFICIAL_BANK_DOMAINS];
}


