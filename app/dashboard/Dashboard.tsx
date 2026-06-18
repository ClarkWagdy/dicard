"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Share2, Briefcase, Palette, LayoutDashboard,
  LogOut, ExternalLink, Copy, CheckCheck, Menu, X, Zap
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { logout, CardData, saveCardData } from '../components/mockData';
import ProfileForm from '../components/dashboard/ProfileForm';
import SocialForm from '../components/dashboard/SocialForm';
import BusinessForm from '../components/dashboard/BusinessForm';
import AppearanceForm from '../components/dashboard/AppearanceForm';
import { useSession } from 'next-auth/react';

type Tab = 'overview' | 'profile' | 'social' | 'business' | 'appearance';

const tabs = [
  { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
  { id: 'profile' as Tab, label: 'Profile', icon: User },
  { id: 'social' as Tab, label: 'Social', icon: Share2 },
  { id: 'business' as Tab, label: 'Business', icon: Briefcase },
  { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
];

interface Props {
  username: string;
  data: CardData;
  onUpdate: (data: CardData) => void;
  onLogout: () => void;
  onViewCard: () => void;
}

export default function Dashboard({ username,data, onUpdate, onLogout, onViewCard }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = (updated: CardData) => {
    saveCardData(username, updated);
    onUpdate(updated);
    toast.success("Changes saved!");
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      window.location.href.replace("/dashboard", ""),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItem = (t: (typeof tabs)[0]) => {
    const Icon = t.icon;
    const active = tab === t.id;
    return (
      <button
        key={t.id}
        onClick={() => {
          setTab(t.id);
          setMobileOpen(false);
        }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full transition-all"
        style={{
          background: active ? "rgba(99,102,241,0.15)" : "transparent",
          color: active ? "#6366f1" : "rgba(255,255,255,0.5)",
          border: active
            ? "1px solid rgba(99,102,241,0.3)"
            : "1px solid transparent",
          fontWeight: active ? 600 : 400,
          fontSize: "0.875rem",
        }}
      >
        <Icon size={18} />
        {t.label}
      </button>
    );
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "#0a0a0f",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        color: "white",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(30,30,40,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
          },
        }}
      />

      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col gap-2 p-4 shrink-0"
        style={{
          width: 240,
          background: "rgba(255,255,255,0.03)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          minHeight: "100vh",
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3 mb-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>One.Card</span>
        </div>

        {tabs.map(navItem)}

        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={onViewCard}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full transition-all hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}
          >
            <ExternalLink size={18} />
            View Card
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full transition-all hover:bg-red-500/10"
            style={{ color: "rgba(255,100,100,0.7)", fontSize: "0.875rem" }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 p-4 flex flex-col gap-2"
              style={{
                width: 240,
                background: "#141420",
                borderRight: "1px solid rgba(255,255,255,0.07)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #818cf8)",
                    }}
                  >
                    <Zap size={16} className="text-white" />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "1rem" }}>
                    One.Card
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <X size={20} />
                </button>
              </div>
              {tabs.map(navItem)}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                {tabs.find((t) => t.id === tab)?.label}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.8rem",
              }}
            >
              {copied ? (
                <CheckCheck size={15} style={{ color: "#4ade80" }} />
              ) : (
                <Copy size={15} />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "overview" && (
                <Overview
                  data={data}
                  onViewCard={onViewCard}
                  onNavigate={setTab}
                />
              )}
              {tab === "profile" && (
                <ProfileForm data={data} onSave={handleSave} />
              )}
              {tab === "social" && (
                <SocialForm data={data} onSave={handleSave} />
              )}
              {tab === "business" && (
                <BusinessForm data={data} onSave={handleSave} />
              )}
              {tab === "appearance" && (
                <AppearanceForm data={data} onSave={handleSave} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Overview({ data, onViewCard, onNavigate }: { data: CardData; onViewCard: () => void; onNavigate: (t: Tab) => void }) {
  const accent = data.appearance.accentColor || '#6366f1';
  const stats = [
    { label: 'Social Platforms', value: Object.values(data.social).filter(Boolean).length, suffix: ' connected' },
    { label: 'Services Listed', value: data.business.services.length, suffix: '' },
    { label: 'Portfolio Images', value: data.business.portfolioImages.length, suffix: '' },
    { label: 'Profile Complete', value: Object.values(data.profile).filter(Boolean).length * 10, suffix: '%' },
  ];

  const quickLinks = [
    { id: 'profile' as Tab, label: 'Edit Profile', desc: 'Name, photo, contact details', icon: User },
    { id: 'social' as Tab, label: 'Social Links', desc: 'LinkedIn, Instagram, GitHub...', icon: Share2 },
    { id: 'business' as Tab, label: 'Business Info', desc: 'Services, portfolio, downloads', icon: Briefcase },
    { id: 'appearance' as Tab, label: 'Appearance', desc: 'Theme, colors, fonts', icon: Palette },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Welcome */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
          border: `1px solid ${accent}30`,
        }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: accent, filter: 'blur(40px)', transform: 'translate(20px, -20px)' }} />
        <div className="flex items-center gap-5 relative">
          <img
            src={data.profile.photo}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover"
            style={{ border: `2px solid ${accent}50` }}
          />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500 }}>Welcome back 👋</p>
            <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700 }}>{data.profile.fullName}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{data.profile.jobTitle}</p>
          </div>
          <button
            onClick={onViewCard}
            className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all hover:scale-[1.02]"
            style={{ background: accent, color: 'white', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <ExternalLink size={15} />
            View Card
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p style={{ color: 'white', fontSize: '1.6rem', fontWeight: 700 }}>
              {s.value}{s.suffix}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Quick Access
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((l) => {
            const Icon = l.icon;
            return (
              <button
                key={l.id}
                onClick={() => onNavigate(l.id)}
                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}20` }}>
                  <Icon size={18} style={{ color: accent }} />
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{l.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '0.1rem' }}>{l.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
