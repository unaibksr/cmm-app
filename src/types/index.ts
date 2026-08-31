export interface Phone {
  id: string;
  label: string;
  number: string;
  original: string;
}

export interface Email {
  id: string;
  label: string;
  address: string;
}

export interface Address {
  id: string;
  label: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  organization?: string;
  phones: Phone[];
  emails: Email[];
  addresses: Address[];
  notes?: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  deleted: boolean;
}

export type Tab = 'contacts' | 'duplicates' | 'groups' | 'import';

export type SyncStatus = 'idle' | 'syncing' | 'done' | 'error';

export interface DuplicateGroup {
  id: string;
  contacts: Contact[];
  similarity: number;
}
