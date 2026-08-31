import { useState, useRef } from 'react';
import { Contact, Phone, Email } from '../types';
import { normalizePhone } from '../utils/phone';
import { v4 as uuidv4 } from 'uuid';

interface ImportPageProps {
  onImport: (contacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>[]) => void;
  onExport: () => void;
}

interface DeviceContact {
  name?: { given: string; family: string };
  phones?: { value: string }[];
  emails?: { value: string }[];
}

export function ImportPage({ onImport, onExport }: ImportPageProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceImport = async () => {
    setImporting(true);
    setImportResult(null);
    setError(null);

    if (!navigator.contacts) {
      setError('Contacts API not supported. Use JSON import instead.');
      setImporting(false);
      return;
    }

    try {
      const props = ['Name', 'tel', 'email'];
      const deviceContacts = await navigator.contacts.select(props, { multiple: true });

      const importedContacts = processDeviceContacts(deviceContacts as DeviceContact[]);

      if (importedContacts.length > 0) {
        onImport(importedContacts);
      }
      setImportResult({ imported: importedContacts.length, skipped: 0 });
    } catch (e: any) {
      if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
        setError('Permission denied. Please allow access to contacts in your browser settings.');
      } else {
        setError(e.message || 'Failed to import contacts');
      }
    } finally {
      setImporting(false);
    }
  };

  const processDeviceContacts = (deviceContacts: DeviceContact[]): Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>[] => {
    const importedContacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>[] = [];

    for (const dc of deviceContacts) {
      if (!dc.name?.given && !dc.name?.family) continue;

      const phones: Phone[] = (dc.phones || []).map(p => ({
        id: uuidv4(),
        label: 'mobile',
        number: normalizePhone(p.value),
        original: p.value
      }));

      const emails: Email[] = (dc.emails || []).map(e => ({
        id: uuidv4(),
        label: 'personal',
        address: e.value
      }));

      importedContacts.push({
        firstName: dc.name?.given || '',
        lastName: dc.name?.family || '',
        phones,
        emails,
        addresses: [],
        tags: ['imported'],
        favorite: false
      });
    }

    return importedContacts;
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let contacts;

        if (file.name.endsWith('.json')) {
          contacts = JSON.parse(text);
        } else if (file.name.endsWith('.vcf')) {
          contacts = parseVcf(text);
        } else {
          throw new Error('Unsupported file format');
        }

        if (!Array.isArray(contacts)) {
          contacts = [contacts];
        }

        const imported = contacts.map(c => ({
          firstName: c.firstName || c.first_name || '',
          lastName: c.lastName || c.last_name || '',
          nickname: c.nickname,
          organization: c.organization,
          phones: (c.phones || []).map((p: any) => ({
            id: uuidv4(),
            label: p.label || 'mobile',
            number: normalizePhone(p.number || p.value || ''),
            original: p.original || p.number || p.value || ''
          })),
          emails: (c.emails || []).map((e: any) => ({
            id: uuidv4(),
            label: e.label || 'personal',
            address: e.address || e.value || ''
          })),
          addresses: c.addresses || [],
          notes: c.notes,
          tags: c.tags || ['imported'],
          favorite: c.favorite || false
        })) as Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>[];

        if (imported.length > 0) {
          onImport(imported);
        }
        setImportResult({ imported: imported.length, skipped: 0 });
      } catch (err: any) {
        setError(err.message || 'Failed to parse file');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setImporting(false);
    };

    reader.readAsText(file);
  };

  const parseVcf = (vcfText: string): Partial<Contact>[] => {
    const contacts: Partial<Contact>[] = [];
    const vcards = vcfText.split('BEGIN:VCARD');

    for (const vcard of vcards) {
      if (!vcard.trim()) continue;

      const contact: Partial<Contact> = { phones: [], emails: [], tags: ['imported'] };
      const lines = vcard.split('\n');

      for (const line of lines) {
        if (line.startsWith('FN:') || line.startsWith('FN;')) {
          const name = line.split(':')[1]?.trim() || '';
          const parts = name.split(' ');
          contact.firstName = parts[0] || '';
          contact.lastName = parts.slice(1).join(' ');
        } else if (line.startsWith('TEL:') || line.startsWith('TEL;')) {
          const phone = line.split(':')[1]?.trim() || '';
          if (phone) {
            contact.phones?.push({ id: uuidv4(), label: 'mobile', number: phone, original: phone });
          }
        } else if (line.startsWith('EMAIL:') || line.startsWith('EMAIL;')) {
          const email = line.split(':')[1]?.trim() || '';
          if (email) {
            contact.emails?.push({ id: uuidv4(), label: 'personal', address: email });
          }
        } else if (line.startsWith('ORG:') || line.startsWith('ORG;')) {
          contact.organization = line.split(':')[1]?.trim() || '';
        }
      }

      if (contact.firstName || contact.lastName) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  return (
    <div className="page">
      <div className="import-page__content">
        <div className="import-card">
          <div className="import-card__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5 5-5m-5 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="import-card__title">Import from Device</h2>
          <p className="import-card__description">
            Import contacts from your device's address book (Chrome/Edge on mobile)
          </p>
          {error && <p className="import-card__error">{error}</p>}
          <button className="btn btn--primary" onClick={handleDeviceImport} disabled={importing}>
            {importing ? 'Importing...' : 'Import Contacts'}
          </button>
        </div>

        <div className="import-card">
          <div className="import-card__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="import-card__title">Import from File</h2>
          <p className="import-card__description">
            Import contacts from a JSON or VCF (vCard) file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.vcf"
            onChange={handleFileImport}
            style={{ display: 'none' }}
            id="file-import"
          />
          <label htmlFor="file-import" className="btn btn--secondary" style={{ display: 'block', cursor: 'pointer' }}>
            Choose File
          </label>
        </div>

        <div className="import-card">
          <div className="import-card__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m14-7l-5-5-5 5m5-5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="import-card__title">Export Contacts</h2>
          <p className="import-card__description">
            Export all contacts as a JSON file for backup
          </p>
          <button className="btn btn--secondary" onClick={onExport}>
            Export to JSON
          </button>
        </div>

        {importResult && (
          <div className="import-result">
            <p>Imported: {importResult.imported} contacts</p>
            {importResult.skipped > 0 && <p>Skipped: {importResult.skipped} (no name)</p>}
          </div>
        )}
      </div>
    </div>
  );
}
