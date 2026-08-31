/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Navigator {
  contacts?: ContactsManager;
}

interface ContactsManager {
  getProperties(): Promise<string[]>;
  select(properties: string[], options?: { multiple: boolean }): Promise<ContactProperty[]>;
}

interface ContactProperty {
  name?: { given: string; family: string };
  phones?: { value: string }[];
  emails?: { value: string }[];
}
