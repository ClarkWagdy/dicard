"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import AuthGate from "./components/AuthGate";
import OwnerDashboard from "./ownerdashboard/OwnerDashboard";
import Dashboard from "./dashboard/Dashboard";
import PublicCard from "./components/PublicCard";
import {
  UserRecord,
  clearSession,
  canManageUsers,
} from "./components/multiUserStore";
import { CardData } from "./components/mockData";

type View = "dashboard" | "preview-card";

// النوع بيتاخد مباشرة من UserRecord، فمفيش حاجة تتعمل لها export
type Role = UserRecord["role"];

type SessionUserShape = {
  id?: string;
  username?: string;
  email?: string;
  role?: Role;
};

export default function App() {
  const { data: session, status } = useSession();

  const [view, setView] = useState<View>("dashboard");
  const [previewUsername, setPreviewUsername] = useState<string | null>(null);
  const [card, setCard] = useState<CardData | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // بيانات اليوزر من next-auth (مش من multiUserStore)
  const sessionUser = session?.user as SessionUserShape | undefined;
  const username = sessionUser?.username ?? "";
  const role: Role = sessionUser?.role ?? ("user" as Role);

  // ── Page title (بديل generateMetadata اللي مش بيشتغل في client component) ──
  useEffect(() => {
    if (username) document.title = `${username} - One Card`;
    
  }, [username]);

  // ── Load the card from MongoDB (always fresh) ───────────────────────────────
  const loadCard = useCallback(async () => {
    if (!username) return;
    try {
      setCardLoading(true);
      setCardError(null);
      const res = await fetch(`/api/card/${username}`, { cache: "no-store" });
      if (!res.ok) {
        setCardError("Failed to load your card");
        return;
      }
      const json = await res.json();
      setCard(json.data as CardData);
    } catch {
      setCardError("Network error");
    } finally {
      setCardLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (status === "authenticated") loadCard();
  }, [status, loadCard]);

  // ── Save to MongoDB through the API ─────────────────────────────────────────
  const handleUpdate = async (next: CardData) => {
    if (!username) return;

    const res = await fetch(`/api/card/${username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        profile: next.profile,
        social: next.social,
        business: next.business,
        appearance: next.appearance,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Save failed:", err);
      throw new Error(err?.error ?? "Save failed");
    }

    // أعد التحميل من الـ DB عشان الـ UI يعرض اللي اتحفظ فعلاً
    await loadCard();
  };

  const handleLogout = async () => {
    clearSession(); // تنضيف أي داتا قديمة في localStorage
    await signOut({ callbackUrl: "/login" });
  };

  const handleViewCard = (target?: UserRecord) => {
    setPreviewUsername(target?.username ?? username);
    setView("preview-card");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !sessionUser) {
    return <AuthGate />;
  }

  // معاينة الكارت
  if (view === "preview-card" && previewUsername) {
    return (
      <div>
        <button
          onClick={() => setView("dashboard")}
          className="fixed top-4 left-4 z-50 px-4 py-2 rounded-xl bg-black/70 text-white text-sm"
        >
          Back
        </button>
        <PublicCard username={previewUsername} />
      </div>
    );
  }

  // Owner / Admin → لوحة التحكم الكاملة
  if (canManageUsers(role)) {
    return (
      <OwnerDashboard
        // لو OwnerDashboard محتاج UserRecord كامل، حمّله من API بدل multiUserStore
        currentUser={sessionUser as unknown as UserRecord}
        onLogout={handleLogout}
        onViewCard={handleViewCard}
      />
    );
  }

  // Regular user → الداشبورد الشخصي
  if (cardLoading && !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your card...</p>
      </div>
    );
  }

  if (cardError || !card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p>{cardError ?? "Card not found"}</p>
        <button
          onClick={loadCard}
          className="px-4 py-2 rounded-xl bg-indigo-500 text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <Dashboard
      data={card}
      onUpdate={handleUpdate}
      onLogout={handleLogout}
      onViewCard={() => handleViewCard()}
      username={username}
    />
  );
}
