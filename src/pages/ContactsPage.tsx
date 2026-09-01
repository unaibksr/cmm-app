import { useState } from 'react';
import { Contact } from '../types';
import { ContactCard } from '../components/ContactCard';
import { ContactForm } from '../components/ContactForm';
import { Contact as ContactType } from '../types';
import { getDisplayPhone } from '../utils/phone';

interface ContactsPageProps {
  contacts: Contact[];
  onAdd: (contact: Omit<ContactType, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>) => void;
  onUpdate: (contact: ContactType) => void;
  onDelete: (id: string) => void;
  onSearch: (query: string) => void;
  onFilterFavorites: () => void;
  onClearFilter: () => void;
  showFavoritesOnly: boolean;
}

export function ContactsPage({
  contacts,
  onAdd,
  onUpdate,
  onDelete,
  onSearch,
  onFilterFavorites,
  onClearFilter,
  showFavoritesOnly
}: ContactsPageProps) {
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDelete = () => {
    if (!selectedContact) return;
    if (confirm('Delete this contact?')) {
      onDelete(selectedContact.id);
      setSelectedContact(undefined);
    }
  };

  const handleSave = (data: Omit<ContactType, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>) => {
    if (editingContact) {
      onUpdate({ ...editingContact, ...data, updatedAt: Date.now() });
    } else {
      onAdd(data);
    }
    setEditingContact(undefined);
    setSelectedContact(undefined);
  };

  const handleBack = () => {
    setSelectedContact(undefined);
    setEditingContact(undefined);
  };

  const handleCopy = () => {
    if (!selectedContact) return;
    const fullName = [selectedContact.firstName, selectedContact.lastName].filter(Boolean).join(' ');
    const phone = selectedContact.phones[0]?.number || '';
    const text = `${fullName} ${getDisplayPhone(phone)}`.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  if (editingContact && selectedContact) {
    return (
      <div className="page page--form">
        <div className="contact-detail__header">
          <button className="contact-detail__back" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn btn--primary btn--sm" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <ContactForm
          contact={editingContact}
          onSave={handleSave}
          onCancel={handleBack}
        />
      </div>
    );
  }

  if (selectedContact) {
    const fullName = [selectedContact.firstName, selectedContact.lastName].filter(Boolean).join(' ') || 'No Name';
    const phone = selectedContact.phones[0];

    return (
      <div className="page">
        <div className="contact-detail">
          <button className="contact-detail__back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          <div className="contact-detail__profile">
            <div className="contact-detail__avatar">
              {[selectedContact.firstName[0], selectedContact.lastName[0]].filter(Boolean).join('').toUpperCase() || '?'}
            </div>
            <h2 className="contact-detail__name">{fullName}</h2>
            {phone && <p className="contact-detail__phone">{getDisplayPhone(phone.number)}</p>}
          </div>

          <div className="contact-detail__actions">
            <button className="contact-detail__action" onClick={handleCopy}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="contact-detail__action contact-detail__action--delete" onClick={handleDelete}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete
            </button>
            <button className="contact-detail__action contact-detail__action--edit" onClick={() => setEditingContact(selectedContact)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="contacts-page__search">
        <div className="search-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className="search-input"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <button
          className={`filter-btn ${showFavoritesOnly ? 'filter-btn--active' : ''}`}
          onClick={showFavoritesOnly ? onClearFilter : onFilterFavorites}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={showFavoritesOnly ? 'currentColor' : 'none'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      <div className="contacts-page__list">
        {contacts.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>No contacts found</p>
          </div>
        ) : (
          contacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => setSelectedContact(contact)}
              onFavoriteToggle={(e) => {
                e.stopPropagation();
                onUpdate({ ...contact, favorite: !contact.favorite });
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
