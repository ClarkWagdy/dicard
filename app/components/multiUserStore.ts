import { CardData, defaultCardData } from './mockData';

export type Role = 'owner' | 'admin' | 'user';
export type Status = 'active' | 'suspended';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: Role;
  status: Status;
  createdAt: string;
  lastLogin: string | null;
  card: CardData;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

 

function load(): UserRecord[] {
  try {
    const stored = localStorage.getItem('cf_users');
    if (stored) return JSON.parse(stored);
  } catch {}

  return [];
}

function save(users: UserRecord[]) {
  localStorage.setItem('cf_users', JSON.stringify(users));
}

export const db = {
  getAll: (): UserRecord[] => load(),

  getById: (id: string): UserRecord | undefined => load().find((u) => u.id === id),

  getByCredentials: (username: string, password: string): UserRecord | undefined =>
    load().find((u) => u.username === username && u.password === password && u.status === 'active'),

  create: (data: Omit<UserRecord, 'id' | 'createdAt' | 'lastLogin' | 'card'>): UserRecord => {
    const users = load();
    const newUser: UserRecord = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
      lastLogin: null,
      card: {
        ...defaultCardData,
        profile: { ...defaultCardData.profile, fullName: data.username, email: data.email },
        appearance: { ...defaultCardData.appearance },
      },
    };
    save([...users, newUser]);
    return newUser;
  },
  findByUsername:(username: string): UserRecord | undefined =>
     load().find((u) => u.username === username)
  ,
  update: (id: string, updates: Partial<UserRecord>): UserRecord | null => {
    const users = load();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    save(users);
    return users[idx];
  },

  delete: (id: string): boolean => {
    const users = load();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    save(filtered);
    return true;
  },

  usernameExists: (username: string, excludeId?: string): boolean =>
    load().some((u) => u.username === username && u.id !== excludeId),

  setLastLogin: (id: string) => {
    const users = load();
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) { users[idx].lastLogin = new Date().toISOString(); save(users); }
  },
};

export function getSessionUser(): UserRecord | null {
  try {
    const raw = sessionStorage.getItem('cf_session');
    if (!raw) return null;
    const { id } = JSON.parse(raw);
    return db.getById(id) ?? null;
  } catch { return null; }
}

export function setSessionUser(user: UserRecord) {
  sessionStorage.setItem('cf_session', JSON.stringify({ id: user.id }));
  db.setLastLogin(user.id);
}

export function clearSession() {
  sessionStorage.removeItem('cf_session');
}

export function canManageUsers(role: Role) {
  return role === 'owner' || role === 'admin';
}

export function canDeleteUsers(role: Role) {
  return role === 'owner';
}

export function canChangeRoles(role: Role) {
  return role === "admin";
}
 
