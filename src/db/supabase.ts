import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Contact } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

export function contactToSupabase(contact: Contact) {
  return {
    id: contact.id,
    first_name: contact.firstName,
    last_name: contact.lastName,
    nickname: contact.nickname,
    organization: contact.organization,
    phones: contact.phones,
    emails: contact.emails,
    addresses: contact.addresses,
    notes: contact.notes,
    tags: contact.tags,
    favorite: contact.favorite,
    created_at: new Date(contact.createdAt).toISOString(),
    updated_at: new Date(contact.updatedAt).toISOString(),
    synced_at: contact.syncedAt ? new Date(contact.syncedAt).toISOString() : null,
    deleted: contact.deleted
  };
}

export function contactFromSupabase(row: any): Contact {
  return {
    id: row.id,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    nickname: row.nickname,
    organization: row.organization,
    phones: row.phones || [],
    emails: row.emails || [],
    addresses: row.addresses || [],
    notes: row.notes,
    tags: row.tags || [],
    favorite: row.favorite || false,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    syncedAt: row.synced_at ? new Date(row.synced_at).getTime() : undefined,
    deleted: row.deleted || false
  };
}

export async function fetchCloudContacts(): Promise<Contact[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(contactFromSupabase);
}

export async function pushContactToCloud(contact: Contact): Promise<void> {
  if (!supabase) return;
  
  const { error } = await supabase
    .from('contacts')
    .upsert(contactToSupabase(contact));

  if (error) throw error;
}

export async function pushAllContactsToCloud(contacts: Contact[]): Promise<void> {
  if (!supabase) return;
  
  const records = contacts.map(contactToSupabase);
  const { error } = await supabase
    .from('contacts')
    .upsert(records);

  if (error) throw error;
}
