import { DuplicateGroup } from '../types';
import { getDisplayPhone } from '../utils/phone';

interface DuplicateCardProps {
  group: DuplicateGroup;
  onMerge: () => void;
}

export function DuplicateCard({ group, onMerge }: DuplicateCardProps) {
  return (
    <div className="duplicate-card">
      <div className="duplicate-card__header">
        <span className="duplicate-card__count">{group.contacts.length} contacts</span>
        <span className="duplicate-card__similarity">Same phone</span>
      </div>
      <div className="duplicate-card__contacts">
        {group.contacts.map(contact => {
          const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'No Name';
          const primaryPhone = contact.phones[0]?.number || 'No phone';
          return (
            <div key={contact.id} className="duplicate-card__contact">
              <span className="duplicate-card__name">{fullName}</span>
              <span className="duplicate-card__phone">{getDisplayPhone(primaryPhone)}</span>
            </div>
          );
        })}
      </div>
      <button className="btn btn--primary" onClick={onMerge}>
        Merge Contacts
      </button>
    </div>
  );
}
