import { ReactNode } from 'react';
import { SyncStatus } from '../types';
import { SyncStatusIndicator } from './SyncStatus';

interface HeaderProps {
  title: string;
  status: SyncStatus;
  onSync?: () => void;
  action?: ReactNode;
}

export function Header({ title, status, onSync, action }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header__title">{title}</h1>
      <div className="header__actions">
        {action}
        <button
          className="header__sync-btn"
          onClick={onSync}
          disabled={status === 'syncing'}
          aria-label="Sync contacts"
        >
          <SyncStatusIndicator status={status} />
        </button>
      </div>
    </header>
  );
}
