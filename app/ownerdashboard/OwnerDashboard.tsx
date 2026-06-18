"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Plus, Search, Trash2, Edit2, Eye, ShieldCheck, Shield,
  User as UserIcon, LogOut, MoreVertical, ChevronDown, X,
  CheckCircle, XCircle, AlertTriangle, Zap, BarChart3,
  RefreshCw, Crown, Settings, ExternalLink, Ban, Copy, CheckCheck,
  Mail, Calendar, Clock
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
  db, UserRecord, Role, Status,
  canManageUsers, canDeleteUsers, canChangeRoles, clearSession
} from '../components/multiUserStore';
import UserFormModal from '../components/UserFormModal';
import UserCardEditor from '../components/UserCardEditor';

type Panel = 'users' | 'overview' | 'settings';

const roleColors: Record<Role, string> = {
  owner: '#f59e0b',
  admin: '#6366f1',
  user: '#10b981',
};

const roleIcons: Record<Role, React.ReactNode> = {
  owner: <Crown size={12} />,
  admin: <ShieldCheck size={12} />,
  user: <UserIcon size={12} />,
};

interface Props {
  currentUser: UserRecord;
  onLogout: () => void;
  onViewCard: (user: UserRecord) => void;
}

export default function OwnerDashboard({ currentUser, onLogout, onViewCard }: Props) {
  const [panel, setPanel] = useState<Panel>('overview');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editCardUser, setEditCardUser] = useState<UserRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
const [loading, setLoading] = useState(true)
const safeUsers = users ?? [];
const reload = async () => {
  try {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
console.log("Loaded :", data,res);
    if (!res.ok) throw new Error(data.error ?? "Failed to fetch users");

const raw = data.users ?? data.data?.users ?? [];
console.log("Raw users:", raw);
    // Map MongoDB shape → UserRecord shape your UI expects
    const list: UserRecord[] = raw.map((u: any) => ({
      id: u.id ?? u._id,
      username: u.username,
      fullName: u.fullName ?? u.profile?.fullName ?? "",
      email: u.email,
      role: u.role ?? "user",
      status: u.isActive ? "active" : "suspended", // ← map isActive → status
      createdAt: u.createdAt,
      card: {
        profile: {
          fullName: u.profile?.fullName ?? "",
          photo: u.profile?.photo ?? "/default-avatar.png", // ← add fallback
          ...u.profile,
        },
        ...u, // spread rest of card fields
      },
    }));
console.log("Mapped users:", list);
    setUsers(list);
  } catch (err) {
    console.error("Failed to load users:", err);
    setUsers([]);
  } finally {
    setLoading(false);
  }
};
 useEffect(() => {
  reload()
}, [])

const filtered = safeUsers.filter((u) => {
  const q = search.toLowerCase();
  const matchQ =
    !q ||
    u.username?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    u.card?.profile?.fullName?.toLowerCase().includes(q); // ← optional chaining
  const matchRole = filterRole === "all" || u.role === filterRole;
  const matchStatus = filterStatus === "all" || u.status === filterStatus;
  return matchQ && matchRole && matchStatus;
});

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
    owners: users.filter((u) => u.role === 'owner').length,
    admins: users.filter((u) => u.role === 'admin').length,
    regularUsers: users.filter((u) => u.role === 'user').length,
  };

  const handleDelete = (user: UserRecord) => {
    if (!canDeleteUsers(currentUser.role)) return toast.error('Only owners can delete users');
    if (user.id === currentUser.id) return toast.error('Cannot delete yourself');
    db.delete(user.id);
    reload();
    setDeleteTarget(null);
    toast.success(`User "${user.username}" deleted`);
  };

  const handleToggleStatus = (user: UserRecord) => {
    if (!canManageUsers(currentUser.role)) return;
    if (user.id === currentUser.id) return toast.error('Cannot suspend yourself');
    const newStatus: Status = user.status === 'active' ? 'suspended' : 'active';
    db.update(user.id, { status: newStatus });
    reload();
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
  };

  const handleRoleChange = (user: UserRecord, role: Role) => {
    if (!canChangeRoles(currentUser.role)) return toast.error('Only owners can change roles');
    if (user.id === currentUser.id && role !== 'owner') return toast.error('Cannot demote yourself');
    db.update(user.id, { role });
    reload();
    setOpenMenuId(null);
    toast.success(`Role updated to ${role}`);
  };

  const handleSaveCard = async (userId: string, updatedCard: UserRecord['card']) => {
   if (editUser) {
     // Update existing user
     const res = await fetch(`/api/admin/users/${editUser.id}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(updatedCard),
     });
     if (res.ok) {
       toast.success("User updated");
     } else {
       toast.error("Failed to update user");
     }
   } else {
     // Create new user
     const res = await fetch("/api/admin/users", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(updatedCard),
     });
     if (res.ok) {
       toast.success("User created");
     } else {
       const err = await res.json();
       toast.error(err.message ?? "Failed to create user");
     }
   }
   reload();
   setShowAddModal(false);
   setEditUser(null);

    toast.success('Card data saved');
  };

  const accent = '#6366f1';

  if (editCardUser) {
    return (
      <UserCardEditor
        user={editCardUser}
        currentUser={currentUser}
        onSave={(card) => handleSaveCard(editCardUser.id, card)}
        onBack={() => setEditCardUser(null)}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "#0a0a0f",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        color: "white",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(30,30,40,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
          },
        }}
      />

      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col gap-2 p-4 shrink-0"
        style={{
          width: 240,
          background: "rgba(255,255,255,0.03)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          minHeight: "100vh",
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3 mb-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>One.Card</span>
        </div>

        {(
          [
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "settings", label: "Settings", icon: Settings },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = panel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPanel(item.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full transition-all"
              style={{
                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                color: active ? "#6366f1" : "rgba(255,255,255,0.5)",
                border: active
                  ? "1px solid rgba(99,102,241,0.3)"
                  : "1px solid transparent",
                fontWeight: active ? 600 : 400,
                fontSize: "0.875rem",
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}

        <div
          className="mt-auto flex flex-col gap-1 px-4 py-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <img
              src={currentUser.card.profile.photo}
              alt=""
              className="w-9 h-9 rounded-xl object-cover"
              style={{ border: "2px solid rgba(99,102,241,0.4)" }}
            />
            <div className="min-w-0">
              <p
                style={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentUser.username}
              </p>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full w-fit"
                style={{
                  background: `${roleColors[currentUser.role]}20`,
                  color: roleColors[currentUser.role],
                  fontSize: "0.68rem",
                  fontWeight: 600,
                }}
              >
                {roleIcons[currentUser.role]}
                {currentUser.role}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-red-500/10 w-full"
            style={{ color: "rgba(255,100,100,0.7)", fontSize: "0.85rem" }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {panel === "overview"
              ? "Dashboard Overview"
              : panel === "users"
                ? "User Management"
                : "System Settings"}
          </h2>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              style={{
                background: `${roleColors[currentUser.role]}15`,
                color: roleColors[currentUser.role],
                fontSize: "0.78rem",
                fontWeight: 600,
                border: `1px solid ${roleColors[currentUser.role]}30`,
              }}
            >
              {roleIcons[currentUser.role]}
              {currentUser.role.toUpperCase()}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={panel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {panel === "overview" && (
                <OverviewPanel
                  stats={stats}
                  users={users}
                  currentUser={currentUser}
                  onNavigate={setPanel}
                  accent={accent}
                />
              )}
              {panel === "users" && (
                <UsersPanel
                  users={filtered}
                  allUsers={users}
                  currentUser={currentUser}
                  search={search}
                  onSearch={setSearch}
                  filterRole={filterRole}
                  onFilterRole={setFilterRole}
                  filterStatus={filterStatus}
                  onFilterStatus={setFilterStatus}
                  onAdd={() => setShowAddModal(true)}
                  onEdit={(u: any) => setEditUser(u)}
                  onEditCard={(u: any) => setEditCardUser(u)}
                  onDelete={(u: any) => setDeleteTarget(u)}
                  onToggleStatus={handleToggleStatus}
                  onRoleChange={handleRoleChange}
                  onViewCard={onViewCard}
                  openMenuId={openMenuId}
                  onOpenMenu={setOpenMenuId}
                  accent={accent}
                />
              )}
              {panel === "settings" && (
                <SettingsPanel
                  currentUser={currentUser}
                  onSave={(u) => {
                    db.update(currentUser.id, u);
                    reload();
                    toast.success("Settings saved");
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {(showAddModal || editUser) && (
          <UserFormModal
            user={editUser}
            currentUser={currentUser}
            onSave={(data) => {
              if (editUser) {
                db.update(editUser.id, data);
                toast.success("User updated");
              } else {
                if (db.usernameExists(data.username!))
                  return toast.error("Username already taken");
                db.create(data as any);
                toast.success("User created");
              }
              reload();
              setShowAddModal(false);
              setEditUser(null);
            }}
            onClose={() => {
              setShowAddModal(false);
              setEditUser(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-7 flex flex-col gap-5 max-w-sm w-full"
              style={{
                background: "#141420",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <AlertTriangle size={24} style={{ color: "#f87171" }} />
              </div>
              <div className="text-center">
                <h3
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  Delete User?
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                  }}
                >
                  This will permanently delete{" "}
                  <strong style={{ color: "white" }}>
                    {deleteTarget.username}
                  </strong>{" "}
                  and all their card data. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  className="flex-1 py-3 rounded-2xl"
                  style={{
                    background: "rgba(239,68,68,0.2)",
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.3)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Overview Panel ── */
function OverviewPanel({ stats, users, currentUser, onNavigate, accent }: any) {
  const recentUsers = [...users].sort((a: UserRecord, b: UserRecord) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: accent },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: '#10b981' },
          { label: 'Suspended', value: stats.suspended, icon: XCircle, color: '#ef4444' },
          { label: 'Owners', value: stats.owners, icon: Crown, color: '#f59e0b' },
          { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: '#6366f1' },
          { label: 'Users', value: stats.regularUsers, icon: UserIcon, color: '#10b981' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <p style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-5">
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Users</p>
          <button onClick={() => onNavigate('users')} style={{ color: accent, fontSize: '0.8rem', fontWeight: 600 }}>View All →</button>
        </div>
        <div className="flex flex-col gap-3">
          {recentUsers.map((u: UserRecord) => (
            <div key={u.id} className="flex items-center gap-4">
              <img src={u.card.profile.photo} alt="" className="w-10 h-10 rounded-xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
              <div className="flex-1 min-w-0">
                <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{u.card.profile.fullName || u.username}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{u.email}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: `${roleColors[u.role]}15`, color: roleColors[u.role], fontSize: '0.72rem', fontWeight: 600 }}>
                {roleIcons[u.role]}{u.role}
              </span>
              <div className="w-2 h-2 rounded-full" style={{ background: u.status === 'active' ? '#4ade80' : '#ef4444' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Users Panel ── */
function UsersPanel({ users, allUsers, currentUser, search, onSearch, filterRole, onFilterRole, filterStatus, onFilterStatus, onAdd, onEdit, onEditCard, onDelete, onToggleStatus, onRoleChange, onViewCard, openMenuId, onOpenMenu, accent }: any) {
  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '0.875rem' }}
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => onFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-2xl outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => onFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-2xl outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        {canManageUsers(currentUser.role) && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', fontSize: '0.875rem', fontWeight: 600 }}
          >
            <Plus size={16} />Add User
          </button>
        )}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>{users.length} of {allUsers.length} users</p>

      {/* Table */}
      <div className="rounded-3xl " style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid gap-0">
          {/* Header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span>User</span><span>Email</span><span>Role</span><span>Status</span><span>Joined</span><span></span>
          </div>

          {users.length === 0 && (
            <div className="py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>No users found</div>
          )}

          {users.map((u: UserRecord, i: number) => (
            <div
              key={u.id}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 transition-colors hover:bg-white/[0.02]"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              {/* User */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img src={u.card.profile.photo} alt="" className="w-9 h-9 rounded-xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                  {u.id === currentUser.id && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: accent }}>
                      <span style={{ fontSize: '0.5rem', color: 'white' }}>✓</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.card.profile.fullName || u.username}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>@{u.username}</p>
                </div>
              </div>

              {/* Email */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>

              {/* Role */}
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit" style={{ background: `${roleColors[u.role]}15`, color: roleColors[u.role], fontSize: '0.72rem', fontWeight: 600 }}>
                {roleIcons[u.role]}{u.role}
              </span>

              {/* Status */}
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit" style={{ background: u.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', color: u.status === 'active' ? '#4ade80' : '#f87171', fontSize: '0.72rem', fontWeight: 600 }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                {u.status}
              </span>

              {/* Joined */}
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                {new Date(u.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </p>

              {/* Actions */}
              <div className="relative">
                <button
                  onClick={() => onOpenMenu(openMenuId === u.id ? null : u.id)}
                  className="p-2 rounded-xl transition-colors hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  <MoreVertical size={16} />
                </button>

                <AnimatePresence>
                  {openMenuId === u.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute right-0 top-full mt-1 z-30 rounded-2xl py-2 min-w-[180px] "
                      style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
                    >
                      <MenuItem icon={<Eye size={14} />} label="View Card" onClick={() => { onViewCard(u); onOpenMenu(null); }} />
                      {canManageUsers(currentUser.role) && (
                        <>
                          <MenuItem icon={<Edit2 size={14} />} label="Edit Info" onClick={() => { onEdit(u); onOpenMenu(null); }} />
                          <MenuItem icon={<Settings size={14} />} label="Edit Card" onClick={() => { onEditCard(u); onOpenMenu(null); }} />
                          <MenuDivider />
                          <MenuItem
                            icon={u.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                            label={u.status === 'active' ? 'Suspend' : 'Activate'}
                            onClick={() => { onToggleStatus(u); onOpenMenu(null); }}
                            color={u.status === 'active' ? '#f59e0b' : '#4ade80'}
                            disabled={u.id === currentUser.id}
                          />
                          {canChangeRoles(currentUser.role) && (
                            <>
                              <MenuDivider />
                              <div className="px-3 py-1">
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Change Role</p>
                                {(['owner', 'admin', 'user'] as Role[]).filter((r) => r !== u.role).map((r) => (
                                  <button key={r} onClick={() => onRoleChange(u, r)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors" style={{ color: roleColors[r], fontSize: '0.8rem', fontWeight: 500 }}>
                                    {roleIcons[r]} Set as {r}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                          {canDeleteUsers(currentUser.role) && u.id !== currentUser.id && (
                            <>
                              <MenuDivider />
                              <MenuItem icon={<Trash2 size={14} />} label="Delete User" onClick={() => { onDelete(u); onOpenMenu(null); }} color="#f87171" />
                            </>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, color, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; color?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2.5 w-full px-4 py-2 transition-colors hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color: color || 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: 500 }}
    >
      {icon}{label}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 mx-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />;
}

/* ── Settings Panel ── */
function SettingsPanel({ currentUser, onSave }: { currentUser: UserRecord; onSave: (u: Partial<UserRecord>) => void }) {
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('');

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <h3 style={{ color: 'white', fontWeight: 600 }}>System Settings</h3>

      <div className="rounded-3xl p-6 flex flex-col gap-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Account</p>

        <div>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Username</label>
          <input value={currentUser.username} disabled className="w-full px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }} />
        </div>

        <div>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-2xl outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.875rem' }} />
        </div>

        <div>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>New Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full px-4 py-3 rounded-2xl outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.875rem' }} />
        </div>

        <button
          onClick={() => onSave({ email, ...(password ? { password } : {}) })}
          className="self-start px-7 py-3 rounded-2xl transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}
        >
          Save Changes
        </button>
      </div>

      <div className="rounded-3xl p-6" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Danger Zone</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1rem' }}>Reset all user data to seed defaults. This cannot be undone.</p>
        <button
          onClick={() => {
            localStorage.removeItem('cf_users');
            window.location.reload();
          }}
          className="px-5 py-2.5 rounded-2xl"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem', fontWeight: 600 }}
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
