import { Contact, Phone, Email, Address } from '../types';
import { v4 as uuidv4 } from 'uuid';

function mergeField<T>(a: T | undefined, b: T | undefined): T | undefined {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  return a;
}

function mergeArray<T>(a: T[], b: T[], getKey: (item: T) => string): T[] {
  const map = new Map<string, T>();
  a.forEach(item => map.set(getKey(item), item));
  b.forEach(item => map.set(getKey(item), item));
  return Array.from(map.values());
}

function mergePhones(a: Phone[], b: Phone[]): Phone[] {
  return mergeArray(a, b, p => p.number);
}

function mergeEmails(a: Email[], b: Email[]): Email[] {
  return mergeArray(a, b, e => e.address);
}

function mergeAddresses(a: Address[], b: Address[]): Address[] {
  return mergeArray(a, b, addr => `${addr.street}-${addr.city}-${addr.postalCode}`);
}

function mergeTags(a: string[], b: string[]): string[] {
  const set = new Set([...a, ...b]);
  return Array.from(set);
}

export function mergeContacts(primary: Contact, secondary: Contact): Contact {
  const now = Date.now();

  return {
    id: primary.id,
    firstName: mergeField(primary.firstName, secondary.firstName) || '',
    lastName: mergeField(primary.lastName, secondary.lastName) || '',
    nickname: mergeField(primary.nickname, secondary.nickname),
    organization: mergeField(primary.organization, secondary.organization),
    phones: mergePhones(primary.phones, secondary.phones),
    emails: mergeEmails(primary.emails, secondary.emails),
    addresses: mergeAddresses(primary.addresses, secondary.addresses),
    notes: mergeField(primary.notes, secondary.notes),
    tags: mergeTags(primary.tags, secondary.tags),
    favorite: primary.favorite || secondary.favorite,
    createdAt: Math.min(primary.createdAt, secondary.createdAt),
    updatedAt: now,
    syncedAt: undefined,
    deleted: false
  };
}

export function createMergedContact(contacts: Contact[]): Contact {
  if (contacts.length === 0) {
    throw new Error('No contacts to merge');
  }

  let result = contacts[0];
  for (let i = 1; i < contacts.length; i++) {
    result = mergeContacts(result, contacts[i]);
  }

  result.id = uuidv4();
  result.createdAt = Date.now();
  result.updatedAt = Date.now();

  return result;
}
