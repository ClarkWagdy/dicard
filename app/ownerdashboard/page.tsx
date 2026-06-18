"use client";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import OwnerDashboard from "./OwnerDashboard";
import { useEffect, useState } from "react";
import { UserRecord } from "../components/multiUserStore";

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      fetch(`/api/card/${session.user.username}`)
        .then((res) => res.json())
        .then((data) => setUser(data.data))
        .catch((err) => console.error("Error fetching card data:", err));
    }
  }, [status, session, router]);

  // ✅ Wait until user is loaded
  if (status === "loading" || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0f" }}
      >
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
      </div>
    );
  }

  const mappedUser: UserRecord = {
    id: user._id?.toString() ?? user.id,
    username: user.username,
    fullName: user.profile?.fullName ?? user.username,
    email: user.email,
    password: "",
    role: session?.user?.role ?? user.role,
    status: user.isActive === false ? "suspended" : "active",
    createdAt: user.createdAt ?? new Date().toISOString(),
    lastLogin: user.updatedAt ?? null,
    card: {
      profile: user.profile ?? {
        fullName: user.username,
        jobTitle: "",
        companyName: "",
        email: user.email,
        photo: "",
        mobile: "",
        whatsapp: "",
        website: "",
        address: "",
      },
      social: user.social ?? {},
      business: user.business ?? {
        services: [],
        portfolioImages: [],
      },
      appearance: user.appearance ?? {
        accentColor: "#6366f1",
      },
    },
  };

  return (
    <OwnerDashboard
      currentUser={mappedUser}
      onLogout={async () => {
        signOut({ redirect: true, callbackUrl: "/login" });
        // router.push("/login");
      }}
      onViewCard={(u: any) => router.push(`/${u.username}`)}
    />
  );
}
