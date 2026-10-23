"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import { clearSession } from "../components/multiUserStore";
import { CardData } from "../components/mockData";

function getTheme(theme: "light" | "dark") {
  const isDark = theme === "dark";
  return {
    isDark,
    bgPage: isDark
      ? "linear-gradient(135deg, #0d0d0d 0%, #111827 50%, #0d0d0d 100%)"
      : "linear-gradient(135deg, #f0f4ff 0%, #e8edf8 50%, #f0f4ff 100%)",
    textMuted: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.45)",
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [card, setCard] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const username = (session?.user as { username?: string } | undefined)
    ?.username;

  // ── Load the card from MongoDB (never cached) ───────────────────────────────
  const loadCard = useCallback(async () => {
    if (!username) return;
    try {
      setError(null);
      const res = await fetch(`/api/card/${username}`, { cache: "no-store" });
      if (!res.ok) {
        setError("Failed to load your card");
        return;
      }
      const json = await res.json();
      setCard(json.data as CardData);
    } catch (err) {
      console.error("Error fetching card data:", err);
      setError("Network error");
    }
  }, [username]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") loadCard();
  }, [status, router, loadCard]);

  // ── Save to MongoDB (بدل db.update اللي كان بيكتب في localStorage) ──────────
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

    // أعد التحميل من الـ DB عشان تعرض اللي اتحفظ فعلاً
    await loadCard();
  };

  const handleLogout = async () => {
    clearSession(); // تنضيف أي داتا قديمة في localStorage
    await signOut({ callbackUrl: "/login" });
  };

  const t = getTheme((card?.appearance?.theme as "light" | "dark") ?? "dark");

  if (status === "loading" || (status === "authenticated" && !card && !error)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: t.bgPage }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: "#6366f1", borderRightColor: "#6366f1" }}
          />
          <p style={{ color: t.textMuted, fontSize: "0.875rem" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !username) return null;

  if (error || !card) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: t.bgPage }}
      >
        <div className="flex flex-col items-center gap-3">
          <p style={{ color: t.textMuted, fontSize: "0.875rem" }}>
            {error ?? "Card not found"}
          </p>
          <button
            onClick={loadCard}
            className="px-5 py-2.5 rounded-xl"
            style={{ background: "#6366f1", color: "white", fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      username={username}
      data={card}
      onUpdate={handleUpdate}
      onLogout={handleLogout}
      onViewCard={() => router.push(`/${username}`)}
    />
  );
}
