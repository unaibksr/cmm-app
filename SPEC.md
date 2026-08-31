# Contact Merger App - Specification

## 1. Project Overview
- **Name**: ContactMerger
- **Type**: PWA (Progressive Web App)
- **Core**: Merge duplicate contacts with cloud sync
- **Users**: Individual users managing personal contacts across devices

## 2. Tech Stack
- React 19 + Vite + TypeScript
- Dexie (IndexedDB) for local storage
- Supabase (PostgreSQL) for cloud sync
- Workbox for PWA service worker

## 3. Data Models

### Contact
```typescript
interface Contact {
  id: string;              // UUID
  firstName: string;
  lastName: string;
  nickname?: string;
  organization?: string;
  phones: Phone[];
  emails: Email[];
  addresses: Address[];
  notes?: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  deleted?: boolean;
}

interface Phone {
  id: string;
  label: string;           // mobile, home, work, other
  number: string;          // normalized
  original: string;         // original input
}

interface Email {
  id: string;
  label: string;
  address: string;
}

interface Address {
  id: string;
  label: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
```

### Supabase Schema
```sql
-- contacts table with RLS
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  first_name text not null default '',
  last_name text not null default '',
  nickname text,
  organization text,
  phones jsonb not null default '[]',
  emails jsonb not null default '[]',
  addresses jsonb not null default '[]',
  notes text,
  tags text[] not null default '{}',
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz,
  deleted boolean not null default false
);

-- RLS: public read/write with anon key (single-user app)
alter table contacts enable row level security;
create policy "Allow all" on contacts for all using (true) with check (true);
```

## 4. Phone Normalization (Pakistani mobiles)
- Convert `+92` prefix to `0`
- Strip spaces, dashes, parentheses
- Validate 11 digits for Pakistani mobiles (03XXXXXXXXX)
- Store both normalized and original values

## 5. Core Features

### Contact CRUD
- Add/Edit/Delete contacts
- Multi-value fields: phones, emails, addresses
- Tags for grouping
- Favorite toggle

### Duplicate Detection
- Compare normalized phone numbers using Levenshtein distance
- Threshold: similarity > 0.7 indicates duplicate
- Group duplicates for review
- Manual merge with field selection

### Search & Filter
- Full-text search on name, phone, email, tags
- Filter by favorites
- Filter by tag/group
- Sort by name, date

### Import
- Use `navigator.contacts API`
- Request CONTACTSS permission
- Map device fields to our schema
- Deduplicate on import

## 6. Cloud Sync

### Sync Strategy
- **Debounce**: 2 second delay after changes
- **Push**: Local changes → Supabase
- **Pull**: Cloud changes → Local (deduplicate by phone/email)
- **Conflict**: Latest updatedAt wins

### Manual Sync
- Button with loading state
- Error handling with retry
- Success/error toast

### Sync Status States
- `idle`: No activity
- `syncing`: In progress (animated)
- `done`: Success (auto-dismiss 3s)
- `error`: Failed (retry button)

## 7. UI Design

### Layout
- Mobile-first responsive
- Bottom navigation (4 tabs)
- Floating action button for add
- Header with sync status indicator

### Color Scheme
- Primary: #6366f1 (indigo)
- Background: #f8fafc
- Surface: #ffffff
- Error: #ef4444
- Success: #22c55e

### Bottom Navigation Tabs
1. **Contacts**: List with search, filter, favorites
2. **Duplicates**: Duplicate groups for merging
3. **Groups**: Tag-based grouping
4. **Import**: Device import + export

### Components
- ContactCard: Avatar, name, phone, favorite toggle
- ContactForm: All fields with multi-value support
- DuplicateCard: Show duplicate pair, merge button
- GroupCard: Tag name, contact count
- ErrorBanner: Message, retry, dismiss

### Touch Targets
- Minimum 44x44px for all interactive elements
- FAB: 56x56px

## 8. PWA

### Service Worker
- Workbox with CacheFirst for assets
- NetworkFirst for API calls
- Offline fallback page

### Manifest
- Name: ContactMerger
- Short name: Contacts
- Theme color: #6366f1
- Background: #ffffff
- Display: standalone
- Icons: 192x192, 512x512

## 9. File Structure
```
src/
├── components/
│   ├── BottomNav.tsx
│   ├── ContactCard.tsx
│   ├── ContactForm.tsx
│   ├── DuplicateCard.tsx
│   ├── ErrorBanner.tsx
│   ├── FAB.tsx
│   ├── GroupCard.tsx
│   ├── Header.tsx
│   ├── MultiFieldInput.tsx
│   └── SyncStatus.tsx
├── pages/
│   ├── ContactsPage.tsx
│   ├── DuplicatesPage.tsx
│   ├── GroupsPage.tsx
│   └── ImportPage.tsx
├── db/
│   ├── dexie.ts
│   └── supabase.ts
├── hooks/
│   ├── useContacts.ts
│   ├── useSync.ts
│   └── useDebounce.ts
├── utils/
│   ├── phone.ts
│   ├── duplicate.ts
│   └── merge.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```
