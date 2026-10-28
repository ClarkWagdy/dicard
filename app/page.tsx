"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRecord, canManageUsers } from "./components/multiUserStore";
import { ROUTES } from "./components/routes";

type Role = UserRecord["role"];

// الصفحة الرئيسية مبتعرضش حاجة، بتوجّه المستخدم للصفحة المناسبة بس
export default function App() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const role: Role =
    (session?.user as { role?: Role } | undefined)?.role ?? ("user" as Role);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(ROUTES.login);
      return;
    }

    router.replace(
      canManageUsers(role) ? ROUTES.adminDashboard : ROUTES.userDashboard,
    );
  }, [status, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}