import { useState } from 'react';
import { DuplicateGroup, Contact } from '../types';
import { DuplicateCard } from '../components/DuplicateCard';
import { mergeContacts } from '../utils/merge';

interface DuplicatesPageProps {
  duplicateGroups: DuplicateGroup[];
  onMerge: (merged: Contact) => void;
  onDeleteContact: (id: string) => void;
}

export function DuplicatesPage({ duplicateGroups, onMerge, onDeleteContact }: DuplicatesPageProps) {
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);

  const handleMerge = (group: DuplicateGroup) => {
    if (group.contacts.length < 2) return;

    let merged = group.contacts[0];
    for (let i = 1; i < group.contacts.length; i++) {
      merged = mergeContacts(merged, group.contacts[i]);
    }

    group.contacts.forEach(c => {
      if (c.id !== merged.id) {
        onDeleteContact(c.id);
      }
    });

    onMerge(merged);
    setSelectedGroup(null);
  };

  if (selectedGroup) {
    return (
      <div className="page">
        <div className="merge-view">
          <h2 className="merge-view__title">Select Primary Contact</h2>
          <p className="merge-view__subtitle">Choose which contact to keep as primary</p>
          <div className="merge-view__contacts">
            {selectedGroup.contacts.map(contact => {
              const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'No Name';
              return (
                <button
                  key={contact.id}
                  className="merge-view__contact"
                  onClick={() => handleMerge(selectedGroup)}
                >
                  <span className="merge-view__name">{fullName}</span>
                  <span className="merge-view__details">
                    {contact.phones.map(p => p.number).join(', ')}
                  </span>
                </button>
              );
            })}
          </div>
          <button className="btn btn--secondary" onClick={() => setSelectedGroup(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="duplicates-page__list">
        {duplicateGroups.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p>No duplicates found</p>
            <span className="empty-state__hint">Contacts with similar phone numbers will appear here</span>
          </div>
        ) : (
          duplicateGroups.map(group => (
            <DuplicateCard
              key={group.id}
              group={group}
              onMerge={() => setSelectedGroup(group)}
            />
          ))
        )}
      </div>
    </div>
  );
}
