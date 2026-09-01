import Dexie, { Table } from 'dexie';
import { Contact } from '../types';

export class ContactDatabase extends Dexie {
  contacts!: Table<Contact, string>;

  constructor() {
    super('ContactMergerDB');
    this.version(1).stores({
      contacts: 'id, firstName, lastName, nickname, organization, favorite, deleted, updatedAt, *tags'
    });
  }
}

export const db = new ContactDatabase();

export async function getAllContacts(): Promise<Contact[]> {
  return db.contacts.filter(c => !c.deleted).toArray();
}

export async function getContactById(id: string): Promise<Contact | undefined> {
  return db.contacts.get(id);
}

export async function saveContact(contact: Contact): Promise<string> {
  contact.updatedAt = Date.now();
  await db.contacts.put(contact);
  return contact.id;
}

export async function deleteContact(id: string): Promise<void> {
  const contact = await db.contacts.get(id);
  if (contact) {
    contact.deleted = true;
    contact.updatedAt = Date.now();
    await db.contacts.put(contact);
  }
}

export async function getContactsByTag(tag: string): Promise<Contact[]> {
  return db.contacts.filter(c => !c.deleted && c.tags.includes(tag)).toArray();
}

export async function getFavoriteContacts(): Promise<Contact[]> {
  return db.contacts.filter(c => !c.deleted && c.favorite).toArray();
}

export async function searchContacts(query: string): Promise<Contact[]> {
  const q = query.toLowerCase();
  return db.contacts
    .filter(c => {
      if (c.deleted) return false;
      const searchable = [
        c.firstName,
        c.lastName,
        c.nickname,
        c.organization,
        ...c.phones.map(p => p.number),
        ...c.emails.map(e => e.address),
        ...c.tags
      ].join(' ').toLowerCase();
      return searchable.includes(q);
    })
    .toArray();
}

export async function getAllTags(): Promise<string[]> {
  const contacts = await db.contacts.filter(c => !c.deleted).toArray();
  const tagsSet = new Set<string>();
  for (const c of contacts) {
    for (const t of c.tags) {
      tagsSet.add(t);
    }
  }
  return Array.from(tagsSet).sort();
}

export async function bulkSaveContacts(contacts: Contact[]): Promise<void> {
  const now = Date.now();
  const contactsToSave = contacts.map(c => ({ ...c, updatedAt: now }));
  await db.contacts.bulkPut(contactsToSave);
}
