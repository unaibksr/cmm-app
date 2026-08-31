import { Contact } from '../types';
import { GroupCard } from '../components/GroupCard';

interface GroupsPageProps {
  tags: string[];
  contacts: Contact[];
  onSelectTag: (tag: string) => void;
}

export function GroupsPage({ tags, contacts, onSelectTag }: GroupsPageProps) {
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = contacts.filter(c => c.tags.includes(tag) && !c.deleted).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="page">
      <div className="groups-page__list">
        {tags.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>No groups yet</p>
            <span className="empty-state__hint">Add tags to your contacts to create groups</span>
          </div>
        ) : (
          tags.map(tag => (
            <GroupCard
              key={tag}
              tag={tag}
              contactCount={tagCounts[tag] || 0}
              onClick={() => onSelectTag(tag)}
            />
          ))
        )}
      </div>
    </div>
  );
}
