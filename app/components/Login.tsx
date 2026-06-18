import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { login } from './mockData';

interface Props {
  onLogin: () => void;
  onViewCard: () => void;
}

export default function Login({ onLogin, onViewCard }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 600));
    if (login(username, password)) {
      onLogin();
    } else {
      setError('Invalid credentials. Try admin / admin123');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0d0d0d 0%, #111827 50%, #0d0d0d 100%)',
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-3xl p-8 flex flex-col gap-7"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
            >
              <Zap size={26} className="text-white" />
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>One.Card Admin</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Sign in to manage your card
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all pr-12"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '0.9rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm rounded-2xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '0.8rem' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', fontWeight: 600, fontSize: '0.95rem' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={onViewCard}
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textAlign: 'center' }}
            className="hover:text-white/60 transition-colors"
          >
            ← View public card
          </button>
        </div>
      </motion.div>
    </div>
  );
}
