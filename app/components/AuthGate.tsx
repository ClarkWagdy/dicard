import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Zap, ShieldCheck } from 'lucide-react';
import { db, setSessionUser, UserRecord } from './multiUserStore';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";



export default function AuthGate() {
    const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   const form = new FormData(e.currentTarget);

  //   try {
  //     const result = await signIn("credentials", {
  //       username: form.get("username") as string,
  //       password: form.get("password") as string,
  //       redirect: false, // ← never let NextAuth handle redirect
  //     });

  //     if (!result?.ok || result?.error) {
  //       setError("Invalid username or password");
  //       return; // stop here, no url update, no redirect
  //     }
  //   if (result?.ok) {
  //     const session = await getSession();
  //     const userId = session?.user?.id;

  //     // ✅ Redirect to URL containing user ID
  //     router.push(`/profile/${userId}`);
  //   }
  //     router.push("/dashboard");
  //   } catch {
  //     setError("Something went wrong, please try again");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
 useEffect(() => {
   if (status === "authenticated" && session?.user) {
     const role = session.user.role; // make sure role is in your JWT/session
     if (role === "owner" ) {
       router.push("/dashboard");
     }else if (role === "admin") {
        router.push("/ownerdashboard");
     } else {
       router.push(`/${session.user.username}`);
     }
   }
 }, [status, session]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      username: form.get("username"),
      password: form.get("password"),
      redirect: false, // ✅ we handle redirect manually
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password");
    }
    // ← session update triggers useEffect above
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0d0d0d 0%, #111827 50%, #0d0d0d 100%)",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <div
          className="rounded-3xl p-8 flex flex-col gap-7"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
              }}
            >
              <Zap size={26} className="text-white" />
            </div>
            <div>
              <h1
                style={{ color: "white", fontSize: "1.4rem", fontWeight: 700 }}
              >
                One.Card
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                }}
              >
                Sign in to your account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: "0.9rem",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl outline-none pr-12"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "0.9rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="px-4 py-3 rounded-2xl"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  color: "#f87171",
                  fontSize: "0.8rem",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Demo hints */}
        {/* <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Demo Accounts</p>
          </div>
          {hints.map((h) => (
            <button
              key={h.label}
              onClick={() => {
                const [u, p] = h.creds.split(' / ');
                setUsername(u);
                setPassword(p);
              }}
              className="flex items-center justify-between px-3 py-2 rounded-xl transition-all hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: h.color }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>{h.label}</span>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{h.creds}</span>
            </button>
          ))}
        </div> */}
      </motion.div>
    </div>
  );
}
