import "next-auth";
import "next-auth/jwt";
import { UserRole } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string;
    username: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:       string;
    username: string;
    role:     UserRole;
  }
}
