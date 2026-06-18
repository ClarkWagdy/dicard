import { useState } from 'react';
import { CardData, Social } from '../mockData';

const platforms: { key: keyof Social; label: string; placeholder: string; color: string }[] = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', color: '#0A66C2' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username', color: '#1877F2' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', color: '#E4405F' },
  { key: 'twitter', label: 'X / Twitter', placeholder: 'https://twitter.com/username', color: '#000000' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username', color: '#010101' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@username', color: '#FF0000' },
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username', color: '#24292F' },
  { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/username', color: '#053eff' },
  { key: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/username', color: '#EA4C89' },
  { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/username', color: '#26A5E4' },
];

interface Props {
  data: CardData;
  onSave: (data: CardData) => void;
}

export default function SocialForm({ data, onSave }: Props) {
  const [form, setForm] = useState<Social>(data.social);

  const set = (key: keyof Social, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key: keyof Social) => set(key, form[key] ? '' : '');

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 600 }}>Social Media Links</h3>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '-1rem' }}>
        Only platforms with a URL will appear on your card.
      </p>

      <div className="flex flex-col gap-3">
        {platforms.map((p) => (
          <div
            key={p.key}
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${p.color}22`, border: `1px solid ${p.color}40` }}
            >
              <span style={{ color: p.color, fontSize: '0.7rem', fontWeight: 700 }}>
                {p.label.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 500, marginBottom: '0.3rem' }}>{p.label}</p>
              <input
                type="url"
                value={form[p.key]}
                onChange={(e) => set(p.key, e.target.value)}
                placeholder={p.placeholder}
                className="w-full px-3 py-2 rounded-xl outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  fontSize: '0.82rem',
                }}
              />
            </div>
            {/* Toggle indicator */}
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: form[p.key] ? '#4ade80' : 'rgba(255,255,255,0.15)' }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave({ ...data, social: form })}
        className="self-start px-8 py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', fontWeight: 600, fontSize: '0.9rem' }}
      >
        Save Changes
      </button>
    </div>
  );
}
