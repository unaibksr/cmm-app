import { memo } from 'react';

interface GroupCardProps {
  tag: string;
  contactCount: number;
  onClick: () => void;
}

function GroupCardComponent({ tag, contactCount, onClick }: GroupCardProps) {
  return (
    <div className="group-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="group-card__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="group-card__info">
        <span className="group-card__name">{tag}</span>
        <span className="group-card__count">{contactCount} contacts</span>
      </div>
      <svg className="group-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export const GroupCard = memo(GroupCardComponent);
