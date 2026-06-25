"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import { db } from "../components/multiUserStore";
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
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch(`/api/card/${session?.user.username}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data.data);
          console.log("Fetched card data:", data);
        })
        .catch((err) => {
          console.error("Error fetching card data:", err);
        });
    }
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Derive theme as soon as we have data (or fall back to dark while loading)
  const rawTheme = (user?.appearance?.theme as "light" | "dark") ?? "dark";
  const t = getTheme(rawTheme);

  if (status === "loading" || (status === "authenticated" && !user)) {
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

  if (!session?.user) return null;

  return (
    <Dashboard
      username={session.user.username}
      data={user}
      onUpdate={(card: CardData) => {
        db.update(user.id, { card });
      }}
      onLogout={() => router.push("/login")}
      onViewCard={() => router.push(`/${session.user.username}`)}
    />
  );
}
