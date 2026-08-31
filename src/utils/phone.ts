export function normalizePhone(phone: string): string {
  let normalized = phone.trim();

  if (normalized.startsWith('+92')) {
    normalized = '0' + normalized.slice(3);
  }

  normalized = normalized.replace(/[\s\-\(\)]/g, '');

  return normalized;
}

export function isValidPakistaniMobile(phone: string): boolean {
  const normalized = normalizePhone(phone);
  const mobileRegex = /^0[3][0-9]{9}$/;
  return mobileRegex.test(normalized);
}

export function getDisplayPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length === 11 && normalized.startsWith('03')) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4)}`;
  }
  return phone;
}

export function formatPhoneForStorage(phone: string): { number: string; original: string } {
  return {
    number: normalizePhone(phone),
    original: phone
  };
}
