import { useState, useEffect, useCallback } from 'react';
import { Contact } from '../types';
import {
  getAllContacts,
  saveContact,
  deleteContact as dbDeleteContact,
  getContactsByTag,
  getFavoriteContacts,
  searchContacts as dbSearchContacts,
  getAllTags
} from '../db/dexie';
import { v4 as uuidv4 } from 'uuid';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllContacts();
      setContacts(all);
      const allTags = await getAllTags();
      setTags(allTags);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, []);

  const addContact = useCallback(async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>) => {
    const newContact: Contact = {
      ...contact,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deleted: false
    };
    await saveContact(newContact);
    await loadContacts();
    return newContact;
  }, [loadContacts]);

  const updateContact = useCallback(async (contact: Contact) => {
    await saveContact(contact);
    await loadContacts();
  }, [loadContacts]);

  const removeContact = useCallback(async (id: string) => {
    await dbDeleteContact(id);
    await loadContacts();
  }, [loadContacts]);

  const filterByTag = useCallback(async (tag: string) => {
    const filtered = await getContactsByTag(tag);
    setContacts(filtered);
  }, []);

  const filterFavorites = useCallback(async () => {
    const filtered = await getFavoriteContacts();
    setContacts(filtered);
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadContacts();
      return;
    }
    const results = await dbSearchContacts(query);
    setContacts(results);
  }, [loadContacts]);

  return {
    contacts,
    loading,
    tags,
    addContact,
    updateContact,
    removeContact,
    filterByTag,
    filterFavorites,
    search,
    refresh: loadContacts
  };
}
