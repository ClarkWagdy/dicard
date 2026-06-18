"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // ✅ App Router
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import { db } from "../components/multiUserStore";
import { CardData } from "../components/mockData";

export default function  DashboardPage () {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect( () => {
if (status === "authenticated" && session?.user) {
      fetch(`/api/card/${session?.user.username}`).then(res => res.json()).then(data => {
      
        setUser(data.data);
        console.log("Fetched card data:", data);
      }).catch(err => {
        console.error("Error fetching card data:", err);
      });
    }
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0f" }}
      >
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
      </div>
    );
  }

  if (!session?.user) return null;


if (user) 
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
