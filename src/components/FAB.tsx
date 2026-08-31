import { ReactNode } from 'react';

interface FABProps {
  onClick: () => void;
  icon?: ReactNode;
}

export function FAB({ onClick, icon }: FABProps) {
  return (
    <button className="fab" onClick={onClick} aria-label="Add contact">
      {icon || (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
