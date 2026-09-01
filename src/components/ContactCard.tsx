import { memo } from 'react';
import { Contact } from '../types';
import { getDisplayPhone } from '../utils/phone';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
  onLongPress: () => void;
  onCancelLongPress: () => void;
  onToggleSelect: () => void;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  selected?: boolean;
  selectionMode?: boolean;
}

function ContactCardComponent({
  contact,
  onClick,
  onLongPress,
  onCancelLongPress,
  onToggleSelect,
  onFavoriteToggle,
  selected = false,
  selectionMode = false
}: ContactCardProps) {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'No Name';
  const primaryPhone = contact.phones[0]?.number || '';

  const initials = [contact.firstName[0], contact.lastName[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  return (
    <div
      className={`contact-card ${selected ? 'contact-card--selected' : ''}`}
      onClick={selectionMode ? onToggleSelect : onClick}
      onMouseDown={selectionMode ? undefined : onLongPress}
      onMouseUp={selectionMode ? undefined : onCancelLongPress}
      onMouseLeave={selectionMode ? undefined : onCancelLongPress}
      onTouchStart={selectionMode ? undefined : onLongPress}
      onTouchEnd={selectionMode ? undefined : onCancelLongPress}
      role="button"
      tabIndex={0}
    >
      {selectionMode && (
        <div className={`contact-card__checkbox ${selected ? 'contact-card__checkbox--checked' : ''}`}>
          {selected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      )}
      <div className="contact-card__avatar">
        {initials}
      </div>
      <div className="contact-card__info">
        <span className="contact-card__name">{fullName}</span>
        {primaryPhone && <span className="contact-card__phone">{getDisplayPhone(primaryPhone)}</span>}
      </div>
      {contact.favorite && !selectionMode && (
        <svg className="contact-card__favorite" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {!selectionMode && (
        <button
          className="contact-card__favorite-btn"
          onClick={onFavoriteToggle}
          aria-label={contact.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={contact.favorite ? 'currentColor' : 'none'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      )}
    </div>
  );
}

export const ContactCard = memo(ContactCardComponent);
