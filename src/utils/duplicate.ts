import { Contact, DuplicateGroup } from '../types';

function getAllPhoneNumbers(contact: Contact): string[] {
  return contact.phones.map(p => p.number);
}

function contactsSharePhone(c1: Contact, c2: Contact): { share: boolean; similarity: number } {
  const phones1 = getAllPhoneNumbers(c1);
  const phones2 = getAllPhoneNumbers(c2);

  for (const p1 of phones1) {
    for (const p2 of phones2) {
      if (p1 === p2) {
        return { share: true, similarity: 1 };
      }
    }
  }

  return { share: false, similarity: 0 };
}

export function findDuplicates(contacts: Contact[]): DuplicateGroup[] {
  const activeContacts = contacts.filter(c => !c.deleted);
  const groups: DuplicateGroup[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < activeContacts.length; i++) {
    const c1 = activeContacts[i];
    if (processed.has(c1.id)) continue;

    const duplicates: Contact[] = [c1];

    for (let j = i + 1; j < activeContacts.length; j++) {
      const c2 = activeContacts[j];
      if (processed.has(c2.id)) continue;

      const { share } = contactsSharePhone(c1, c2);
      if (share) {
        duplicates.push(c2);
        processed.add(c2.id);
      }
    }

    if (duplicates.length > 1) {
      groups.push({
        id: `dup-${c1.id}`,
        contacts: duplicates,
        similarity: 1
      });
      processed.add(c1.id);
    }
  }

  return groups;
}
