import { useState } from 'react';
import { ArrowLeft, User, Share2, Briefcase, Palette } from 'lucide-react';
import { Toaster } from 'sonner';
import { UserRecord } from './multiUserStore';
import { CardData } from './mockData';
import ProfileForm from './dashboard/ProfileForm';
import SocialForm from './dashboard/SocialForm';
import BusinessForm from './dashboard/BusinessForm';
import AppearanceForm from './dashboard/AppearanceForm';

type Tab = 'profile' | 'social' | 'business' | 'appearance';

const tabs = [
  { id: 'profile' as Tab, label: 'Profile', icon: User },
  { id: 'social' as Tab, label: 'Social', icon: Share2 },
  { id: 'business' as Tab, label: 'Business', icon: Briefcase },
  { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
];

interface Props {
  user: UserRecord;
  currentUser: UserRecord;
  onSave: (card: CardData) => void;
  onBack: () => void;
}

export default function UserCardEditor({ user, currentUser, onSave, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('profile');
  const [card, setCard] = useState<CardData>(user.card);

  const handleSave = (updated: CardData) => {
    setCard(updated);
    onSave(updated);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f', fontFamily: "'Sora', 'DM Sans', sans-serif", color: 'white' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: 'rgba(30,30,40,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', backdropFilter: 'blur(20px)', borderRadius: '16px' } }} />

      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />Back
        </button>
        <div className="flex items-center gap-3">
          <img src={user.card.profile.photo} alt="" className="w-9 h-9 rounded-xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
          <div>
            <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
              Editing card for <span style={{ color: '#818cf8' }}>@{user.username}</span>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{user.email}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Tabs sidebar */}
        <nav className="hidden md:flex flex-col gap-1 p-4 shrink-0" style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full transition-all"
                style={{
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: active ? '#6366f1' : 'rgba(255,255,255,0.5)',
                  border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.875rem',
                }}
              >
                <Icon size={16} />{t.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile tab bar */}
        <div className="md:hidden flex border-b w-full" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex flex-col items-center gap-1 py-3" style={{ color: active ? '#6366f1' : 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: active ? 600 : 400, borderBottom: active ? '2px solid #6366f1' : '2px solid transparent' }}>
                <Icon size={16} />{t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {tab === 'profile' && <ProfileForm data={card} onSave={handleSave} />}
          {tab === 'social' && <SocialForm data={card} onSave={handleSave} />}
          {tab === 'business' && <BusinessForm data={card} onSave={handleSave} />}
          {tab === 'appearance' && <AppearanceForm data={card} onSave={handleSave} />}
        </main>
      </div>
    </div>
  );
}
