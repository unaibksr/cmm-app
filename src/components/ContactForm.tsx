import { useState } from 'react';
import { Contact, Phone } from '../types';
import { normalizePhone, isValidPakistaniMobile } from '../utils/phone';
import { v4 as uuidv4 } from 'uuid';

interface ContactFormProps {
  contact?: Contact;
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>) => void;
  onCancel: () => void;
}

export function ContactForm({ contact, onSave, onCancel }: ContactFormProps) {
  const [name, setName] = useState(contact ? `${contact.firstName} ${contact.lastName}`.trim() : '');
  const [phone, setPhone] = useState(contact?.phones[0]?.original || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const normalizedPhone = normalizePhone(phone);
    const phones: Phone[] = phone ? [{
      id: uuidv4(),
      label: 'mobile',
      number: normalizedPhone,
      original: phone
    }] : [];

    onSave({
      firstName,
      lastName,
      phones,
      emails: [],
      addresses: [],
      tags: [],
      favorite: contact?.favorite || false
    });
  };

  const isValid = name.trim().length > 0;

  return (
    <form className="contact-form contact-form--modal" onSubmit={handleSubmit}>
      <div className="form-group">
        <div className="form-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            autoFocus
            autoComplete="name"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <div className="form-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Mobile number"
            autoComplete="tel"
            className="form-input"
          />
        </div>
        {phone && !isValidPakistaniMobile(phone) && (
          <span className="form-hint">Format: 03XX XXXXXXX</span>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn--secondary btn--full" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary btn--full" disabled={!isValid}>
          Add Contact
        </button>
      </div>
    </form>
  );
}
