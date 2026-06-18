"use client";
import { useEffect, useState } from 'react';
import AuthGate from './components/AuthGate';
import OwnerDashboard from './ownerdashboard/OwnerDashboard';
import Dashboard from './dashboard/Dashboard';
import PublicCard from './components/PublicCard';
import { UserRecord, getSessionUser, clearSession, canManageUsers, db } from './components/multiUserStore';
import { CardData } from './components/mockData';
import { SessionProvider, useSession } from 'next-auth/react';
import { Metadata } from 'next';
import { useRouter } from 'next/navigation';
 
type View = 'auth' | 'dashboard' | 'card' | 'preview-card';


export default function App() {
    const router = useRouter();
  
  const [user, setUser] = useState<UserRecord | null>(getSessionUser);
  const [view, setView] = useState<View>(user ? 'dashboard' : 'auth');
  const [previewUser, setPreviewUser] = useState<UserRecord | null>(null);
  const { data: session, status } = useSession();

  const handleLogin = (u: UserRecord) => {
    setUser(u);
    setView('dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
   router.push("/login");
  };

  const handleViewCard = (target?: UserRecord) => {
    setPreviewUser(target || null);
    setView('preview-card');
  };


  if (view === 'auth' || !user) {
    return <AuthGate  />;
  }

  // Owner/Admin → full control panel
  if (canManageUsers(user.role)) {
    return (
      <OwnerDashboard
        currentUser={user}
        onLogout={handleLogout}
        onViewCard={handleViewCard}
      />
    );
  }
  type Props = {
    params: { username: string };
  };
 async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${user?.username} - One Card`,
    description: "All in one chip",
    keywords: ["One card", "NFC", "nfc", "chip"],
    icons: { icon: "/One.svg" },
    viewport: "width=device-width, initial-scale=1",
  };
}
  

  // Regular user → personal dashboard
  return (
   
      <Dashboard
      data={user.card}
      onUpdate={(card: CardData) => {
        db.update(user.id, { card });
      } }
      onLogout={handleLogout}
      onViewCard={() => handleViewCard()} username={''}      />
    
  );
}
