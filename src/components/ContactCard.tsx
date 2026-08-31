import { Contact } from '../types';
import { getDisplayPhone } from '../utils/phone';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
  onFavoriteToggle: (e: React.MouseEvent) => void;
}

export function ContactCard({ contact, onClick, onFavoriteToggle }: ContactCardProps) {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'No Name';
  const primaryPhone = contact.phones[0]?.number || '';

  const initials = [contact.firstName[0], contact.lastName[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="contact-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="contact-card__avatar">
        {initials}
      </div>
      <div className="contact-card__info">
        <span className="contact-card__name">{fullName}</span>
        {primaryPhone && <span className="contact-card__phone">{getDisplayPhone(primaryPhone)}</span>}
      </div>
      {contact.favorite && (
        <svg className="contact-card__favorite" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      <button
        className="contact-card__favorite-btn"
        onClick={onFavoriteToggle}
        aria-label={contact.favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={contact.favorite ? 'currentColor' : 'none'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}
