import { useState } from 'react';
import { CardData, Appearance } from '../mockData';

const themes = [
  { value: 'dark', label: 'Dark', desc: 'Sleek & premium' },
  { value: 'light', label: 'Light', desc: 'Clean & minimal' },
  { value: 'auto', label: 'Auto', desc: 'System default' },
] as const;

const fontStyles = [
  { value: 'sora', label: 'Sora', desc: 'Modern geometric' },
  { value: 'dm-sans', label: 'DM Sans', desc: 'Clean humanist' },
  { value: 'inter', label: 'Inter', desc: 'Systematic neutral' },
  { value: 'poppins', label: 'Poppins', desc: 'Friendly rounded' },
] as const;

const accentColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#ef4444', '#f97316',
  '#84cc16', '#ffffff',
];

interface Props {
  data: CardData;
  onSave: (data: CardData) => void;
}

export default function AppearanceForm({ data, onSave }: Props) {
  const [form, setForm] = useState<Appearance>(data.appearance);

  const set = <K extends keyof Appearance>(key: K, value: Appearance[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const accent = form.accentColor;

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 600 }}>Appearance</h3>

      {/* Theme */}
      <Section label="Card Theme">
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => set('theme', t.value)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
              style={{
                background: form.theme === t.value ? `${accent}15` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${form.theme === t.value ? accent + '60' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div
                className="w-12 h-8 rounded-xl"
                style={{
                  background: t.value === 'dark' ? '#0d0d0d' : t.value === 'light' ? '#f5f5f5' : 'linear-gradient(135deg, #0d0d0d 50%, #f5f5f5 50%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <div className="text-center">
                <p style={{ color: form.theme === t.value ? accent : 'white', fontSize: '0.875rem', fontWeight: 600 }}>{t.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Accent Color */}
      <Section label="Accent Color">
        <div className="flex flex-wrap gap-3">
          {accentColors.map((c) => (
            <button
              key={c}
              onClick={() => set('accentColor', c)}
              className="w-10 h-10 rounded-full transition-all hover:scale-110"
              style={{
                background: c,
                border: form.accentColor === c ? `3px solid white` : '3px solid transparent',
                outline: form.accentColor === c ? `2px solid ${c}` : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
          <div className="flex items-center gap-2">
            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Custom:</label>
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => set('accentColor', e.target.value)}
              className="w-10 h-10 rounded-full cursor-pointer"
              style={{ border: 'none', background: 'none', padding: 0 }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl" style={{ background: form.accentColor }} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{form.accentColor}</span>
        </div>
      </Section>

      {/* Font */}
      <Section label="Font Style">
        <div className="grid grid-cols-2 gap-3">
          {fontStyles.map((f) => (
            <button
              key={f.value}
              onClick={() => set('fontStyle', f.value)}
              className="flex flex-col gap-1 p-4 rounded-2xl text-left transition-all"
              style={{
                background: form.fontStyle === f.value ? `${accent}15` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${form.fontStyle === f.value ? accent + '60' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <p
                style={{
                  color: form.fontStyle === f.value ? accent : 'white',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: f.value === 'sora' ? 'Sora' : f.value === 'dm-sans' ? 'DM Sans' : f.value === 'inter' ? 'Inter' : 'Poppins',
                }}
              >
                {f.label}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{f.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Live Preview */}
      <Section label="Live Preview">
        <div
          className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: `1px solid ${accent}30`,
          }}
        >
          <div className="w-14 h-14 rounded-full" style={{ background: `${accent}40`, border: `2px solid ${accent}` }} />
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{data.profile.fullName}</p>
            <p style={{ color: accent, fontSize: '0.85rem', fontWeight: 500 }}>{data.profile.jobTitle}</p>
          </div>
          <div className="flex gap-2">
            <div className="w-20 h-9 rounded-xl" style={{ background: accent }} />
            <div className="w-9 h-9 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>
        </div>
      </Section>

      <button
        onClick={() => onSave({ ...data, appearance: form })}
        className="self-start px-8 py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', fontWeight: 600, fontSize: '0.9rem' }}
      >
        Save Changes
      </button>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl p-6 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      {children}
    </section>
  );
}
