import { SyncStatus } from '../types';

interface SyncStatusProps {
  status: SyncStatus;
}

export function SyncStatusIndicator({ status }: SyncStatusProps) {
  const getIcon = () => {
    switch (status) {
      case 'syncing':
        return (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'done':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'error':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const getText = () => {
    switch (status) {
      case 'syncing': return 'Syncing...';
      case 'done': return 'Synced';
      case 'error': return 'Sync error';
      default: return 'Sync';
    }
  };

  return (
    <div className={`sync-status sync-status--${status}`}>
      {getIcon()}
      <span>{getText()}</span>
    </div>
  );
}
