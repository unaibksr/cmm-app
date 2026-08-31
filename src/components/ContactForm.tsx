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
    <form className="contact-form contact-form--simple" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter name"
          autoFocus
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Mobile</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="03XX XXXXXXX"
          autoComplete="tel"
        />
        {phone && !isValidPakistaniMobile(phone) && (
          <span className="form-hint">Format: 03XX XXXXXXX</span>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={!isValid}>
          Save
        </button>
      </div>
    </form>
  );
}
