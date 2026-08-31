import { useState, useEffect, useCallback, useRef } from 'react';
import { Contact, SyncStatus } from '../types';
import { db, getAllContacts, bulkSaveContacts } from '../db/dexie';
import { fetchCloudContacts, pushAllContactsToCloud, isSupabaseConfigured } from '../db/supabase';
import { useDebounce } from './useDebounce';
import { normalizePhone } from '../utils/phone';

function deduplicateByPhoneOrEmail(local: Contact[], cloud: Contact[]): Contact[] {
  const phoneMap = new Map<string, Contact>();
  const emailMap = new Map<string, Contact>();

  local.forEach(c => {
    c.phones.forEach(p => phoneMap.set(normalizePhone(p.number), c));
    c.emails.forEach(e => emailMap.set(e.address.toLowerCase(), c));
  });

  const merged: Contact[] = [...local];

  cloud.forEach(c => {
    let found = false;
    for (const p of c.phones) {
      const norm = normalizePhone(p.number);
      if (phoneMap.has(norm)) {
        found = true;
        break;
      }
    }
    if (!found) {
      for (const e of c.emails) {
        if (emailMap.has(e.address.toLowerCase())) {
          found = true;
          break;
        }
      }
    }
    if (!found) {
      merged.push(c);
    }
  });

  return merged;
}

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const statusRef = useRef(status);
  const pendingSync = useRef(false);
  const syncTimeout = useRef<number | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const performSync = useCallback(async (force = false) => {
    try {
      setStatus('syncing');
      setError(null);

      const local = await getAllContacts();
      let cloud: Contact[] = [];

      if (isSupabaseConfigured()) {
        try {
          cloud = await fetchCloudContacts();
        } catch (e) {
          console.warn('Could not fetch cloud contacts:', e);
        }
      }

      let toSave = local;
      if (cloud.length > 0) {
        toSave = deduplicateByPhoneOrEmail(local, cloud);
        if (toSave.length !== local.length || force) {
          await bulkSaveContacts(toSave.filter(c => !local.includes(c)));
        }
      }

      if (toSave.length > 0 && isSupabaseConfigured()) {
        try {
          await pushAllContactsToCloud(toSave);
        } catch (e) {
          console.warn('Could not push to cloud:', e);
        }
      }

      const now = Date.now();
      if (toSave.length > 0) {
        await db.contacts.where('id').anyOf(toSave.map(c => c.id)).modify({ syncedAt: now });
      }

      setLastSynced(now);
      setStatus('done');
      pendingSync.current = false;

      setTimeout(() => {
        setStatus(prev => prev === 'done' ? 'idle' : prev);
      }, 3000);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sync failed';
      setError(message);
      setStatus('error');
      pendingSync.current = false;
    }
  }, []);

  const debouncedSync = useDebounce(performSync, 2000);

  const triggerSync = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    pendingSync.current = true;
    debouncedSync();
  }, [debouncedSync]);

  const manualSync = useCallback(() => {
    if (syncTimeout.current) {
      clearTimeout(syncTimeout.current);
    }
    performSync(true);
  }, [performSync]);

  const retry = useCallback(() => {
    setError(null);
    manualSync();
  }, [manualSync]);

  const dismissError = useCallback(() => {
    setError(null);
    setStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (syncTimeout.current) {
        clearTimeout(syncTimeout.current);
      }
    };
  }, []);

  return {
    status,
    error,
    lastSynced,
    triggerSync,
    manualSync,
    retry,
    dismissError
  };
}
