import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { UserRecord, Role, canChangeRoles } from './multiUserStore';

interface Props {
  user: UserRecord | null;
  currentUser: UserRecord;
  onSave: (data: Partial<UserRecord>) => void;
  onClose: () => void;
}

export default function UserFormModal({ user, currentUser, onSave, onClose }: Props) {
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setfullName] = useState(user?.fullName || "");

  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(user?.role || 'user');

  const isEdit = !!user;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isEdit && !password) return;

  const data: Partial<UserRecord> = {fullName, username, email, role ,id: user?.id };
  if (password) data.password = password;

  const method = isEdit ? "PUT" : "POST";
  const body = isEdit ? { ...data, id: currentUser.id } : data;
console.log("Submitting user form: ", data);
  try {
    const res = await fetch(
      isEdit ? `/api/admin/users/${user?.id}` : "/api/auth/register",
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("Save failed:", err.error);
      return;
    }

    const result = await res.json();
    onSave(result.user); // pass updated user back to parent
  } catch (err) {
    console.error("Network error:", err);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl p-7 flex flex-col gap-6"
        style={{
          background: "#141420",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        <div className="flex items-center justify-between">
          <h3 style={{ color: "white", fontWeight: 700, fontSize: "1.1rem" }}>
            {isEdit ? "Edit User" : "Add New User"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="FullName"
            value={fullName}
            onChange={setfullName}
            placeholder="ENG. john doe"
            required
            disabled={isEdit}
          />
          <Field
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="john_doe"
            required
            disabled={isEdit}
          />
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="john@example.com"
            required
          />
          <Field
            label={isEdit ? "New Password (leave blank to keep)" : "Password"}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required={!isEdit}
          />

          {canChangeRoles(currentUser.role) && (
            <div>
              <label
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["user", "admin", "owner"] as Role[]).map((r) => {
                  const colors: Record<Role, string> = {
                    owner: "#f59e0b",
                    admin: "#6366f1",
                    user: "#10b981",
                  };
                  const c = colors[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="py-2.5 rounded-2xl capitalize transition-all"
                      style={{
                        background:
                          role === r ? `${c}20` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${role === r ? c + "60" : "rgba(255,255,255,0.08)"}`,
                        color: role === r ? c : "rgba(255,255,255,0.5)",
                        fontSize: "0.82rem",
                        fontWeight: role === r ? 600 : 400,
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl transition-all hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, required, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div>
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-2xl outline-none"
        style={{ background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: disabled ? 'rgba(255,255,255,0.35)' : 'white', fontSize: '0.875rem' }}
      />
    </div>
  );
}
