import { useState, useEffect, useCallback } from 'react';
import { Tab, Contact, DuplicateGroup } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FAB } from './components/FAB';
import { ErrorBanner } from './components/ErrorBanner';
import { ContactsPage } from './pages/ContactsPage';
import { DuplicatesPage } from './pages/DuplicatesPage';
import { GroupsPage } from './pages/GroupsPage';
import { ImportPage } from './pages/ImportPage';
import { useContacts } from './hooks/useContacts';
import { useSync } from './hooks/useSync';
import { findDuplicates } from './utils/duplicate';
import { getAllContacts, bulkSaveContacts } from './db/dexie';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('contacts');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const {
    contacts,
    loading,
    tags,
    addContact,
    updateContact,
    removeContact,
    filterByTag,
    filterFavorites,
    search,
    refresh
  } = useContacts();

  const {
    status,
    error,
    manualSync,
    retry,
    dismissError,
    triggerSync
  } = useSync();

  useEffect(() => {
    if (contacts.length > 0) {
      const groups = findDuplicates(contacts);
      setDuplicateGroups(groups);
    }
  }, [contacts]);

  const handleAddContact = useCallback(async (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>) => {
    await addContact(data);
    triggerSync();
    setShowContactForm(false);
  }, [addContact, triggerSync]);

  const handleUpdateContact = useCallback(async (contact: Contact) => {
    await updateContact(contact);
    triggerSync();
  }, [updateContact, triggerSync]);

  const handleDeleteContact = useCallback(async (id: string) => {
    await removeContact(id);
    triggerSync();
  }, [removeContact, triggerSync]);

  const handleMergeContact = useCallback(async (merged: Contact) => {
    await addContact(merged);
    triggerSync();
  }, [addContact, triggerSync]);

  const handleImport = useCallback(async (imported: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>[]) => {
    const contactsWithIds = imported.map(c => ({
      ...c,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deleted: false
    })) as Contact[];
    await bulkSaveContacts(contactsWithIds);
    await refresh();
    triggerSync();
  }, [refresh, triggerSync]);

  const handleExport = useCallback(async () => {
    const allContacts = await getAllContacts();
    const blob = new Blob([JSON.stringify(allContacts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleSelectTag = useCallback(async (tag: string) => {
    setSelectedTag(tag);
    await filterByTag(tag);
    setActiveTab('contacts');
  }, [filterByTag]);

  const handleClearFilter = useCallback(async () => {
    setSelectedTag(null);
    setShowFavoritesOnly(false);
    await refresh();
  }, [refresh]);

  const handleSync = useCallback(() => {
    manualSync();
  }, [manualSync]);

  const getPageTitle = (): string => {
    if (selectedTag) return `Tag: ${selectedTag}`;
    switch (activeTab) {
      case 'contacts': return 'Contacts';
      case 'duplicates': return 'Duplicates';
      case 'groups': return 'Groups';
      case 'import': return 'Import/Export';
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <ErrorBanner
          message={error}
          onRetry={retry}
          onDismiss={dismissError}
        />
      )}

      <Header
        title={getPageTitle()}
        status={status}
        onSync={handleSync}
        action={selectedTag ? (
          <button className="header__back-btn" onClick={handleClearFilter}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : undefined}
      />

      <main className="main-content">
        {activeTab === 'contacts' && (
          <ContactsPage
            contacts={contacts}
            onAdd={handleAddContact}
            onUpdate={handleUpdateContact}
            onSearch={search}
            onFilterFavorites={async () => {
              setShowFavoritesOnly(true);
              await filterFavorites();
            }}
            onClearFilter={handleClearFilter}
            showFavoritesOnly={showFavoritesOnly}
          />
        )}

        {activeTab === 'duplicates' && (
          <DuplicatesPage
            duplicateGroups={duplicateGroups}
            onMerge={handleMergeContact}
            onDeleteContact={handleDeleteContact}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsPage
            tags={tags}
            contacts={contacts}
            onSelectTag={handleSelectTag}
          />
        )}

        {activeTab === 'import' && (
          <ImportPage
            onImport={handleImport}
            onExport={handleExport}
          />
        )}
      </main>

      {activeTab === 'contacts' && !showContactForm && (
        <FAB onClick={() => setShowContactForm(true)} />
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
