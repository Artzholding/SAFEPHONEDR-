import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAIL_KEY = 'reported_emails';
const PHONE_KEY = 'reported_phones'; // compat anterior (lista simple)
const PHONE_MAP_KEY = 'reported_phones_v2';

export type ReportedPhone = {
  number: string;
  count: number;
  updatedAt: number;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizePhone = (phone: string) => phone.replace(/[^0-9+]/g, '');

async function getLegacyPhoneList(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(PHONE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function getPhoneMap(): Promise<Record<string, ReportedPhone>> {
  try {
    const raw = await AsyncStorage.getItem(PHONE_MAP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
    // migrar legacy lista simple
    const legacy = await getLegacyPhoneList();
    const migrated: Record<string, ReportedPhone> = {};
    legacy.forEach((p) => {
      const num = normalizePhone(p);
      if (num) migrated[num] = { number: num, count: 1, updatedAt: Date.now() };
    });
    await AsyncStorage.setItem(PHONE_MAP_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return {};
  }
}

async function savePhoneMap(map: Record<string, ReportedPhone>) {
  try {
    await AsyncStorage.setItem(PHONE_MAP_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

async function getEmailList(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(EMAIL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveEmailList(list: string[]) {
  try {
    await AsyncStorage.setItem(EMAIL_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export async function addReportedEmail(email: string): Promise<void> {
  const norm = normalizeEmail(email);
  if (!norm) return;
  const list = await getEmailList();
  if (!list.includes(norm)) {
    list.push(norm);
    await saveEmailList(list);
  }
}

export async function addReportedPhone(phone: string): Promise<void> {
  const norm = normalizePhone(phone);
  if (!norm) return;
  const map = await getPhoneMap();
  const existing = map[norm];
  if (existing) {
    map[norm] = { ...existing, count: existing.count + 1, updatedAt: Date.now() };
  } else {
    map[norm] = { number: norm, count: 1, updatedAt: Date.now() };
  }
  await savePhoneMap(map);
}

export async function isReportedEmail(email: string): Promise<boolean> {
  const norm = normalizeEmail(email);
  if (!norm) return false;
  const list = await getEmailList();
  return list.includes(norm);
}

export async function isReportedPhone(phone: string): Promise<boolean> {
  const report = await getReportForPhone(phone);
  return !!report;
}

export async function getReportForPhone(phone: string): Promise<ReportedPhone | null> {
  const norm = normalizePhone(phone);
  if (!norm) return null;
  const map = await getPhoneMap();
  return map[norm] ?? null;
}

export async function getReportedPhones(): Promise<ReportedPhone[]> {
  const map = await getPhoneMap();
  return Object.values(map);
}

async function mergeReports(
  current: Record<string, ReportedPhone>,
  incoming: ReportedPhone[],
): Promise<Record<string, ReportedPhone>> {
  const merged = { ...current };
  incoming.forEach((r) => {
    const num = normalizePhone(r.number);
    if (!num) return;
    const existing = merged[num];
    if (!existing || r.updatedAt > existing.updatedAt) {
      merged[num] = { number: num, count: Math.max(1, r.count || 1), updatedAt: r.updatedAt || Date.now() };
    }
  });
  return merged;
}

export async function syncReportedPhones(endpoint?: string): Promise<{ pulled: number; pushed: number }> {
  if (!endpoint) return { pulled: 0, pushed: 0 };
  let pulled = 0;
  let pushed = 0;
  const map = await getPhoneMap();
  const payload = { phones: Object.values(map) };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      pushed = payload.phones.length;
    }
  } catch {
    // ignore push errors
  }

  try {
    const res = await fetch(endpoint, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data?.phones && Array.isArray(data.phones)) {
        const merged = await mergeReports(map, data.phones);
        pulled = data.phones.length;
        await savePhoneMap(merged);
      }
    }
  } catch {
    // ignore pull errors
  }

  return { pulled, pushed };
}
