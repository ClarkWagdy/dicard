"use client";
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { Variants } from "motion/react";

import {
  Phone, MessageCircle, Mail, Globe, MapPin, Download, Share2,
  Linkedin, Facebook, Instagram, Twitter, Youtube, Github,
  Send, ExternalLink, ChevronDown, X, ZoomIn
} from 'lucide-react';
import { loadCardData, CardData } from './mockData';

function generateVCF(data: CardData): string {
  const { profile } = data;
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.fullName}`,
    `N:${profile.fullName.split(' ').reverse().join(';')};;;`,
    profile.jobTitle ? `TITLE:${profile.jobTitle}` : '',
    profile.companyName ? `ORG:${profile.companyName}` : '',
    profile.mobile ? `TEL;TYPE=CELL:${profile.mobile}` : '',
    profile.whatsapp ? `TEL;TYPE=WORK:${profile.whatsapp}` : '',
    profile.email ? `EMAIL:${profile.email}` : '',
    profile.website ? `URL:${profile.website}` : '',
    profile.address ? `ADR:;;${profile.address};;;;` : '',
    'END:VCARD',
  ].filter(Boolean);
  return lines.join('\n');
}

function downloadVCF(data: CardData) {
  const vcf = generateVCF(data);
  const blob = new Blob([vcf], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.profile.fullName.replace(/\s+/g, '_')}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}

function shareCard() {
  if (navigator.share) {
    navigator.share({ title: 'My Digital Card', url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
}

const socialIcons: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  linkedin: { icon: <Linkedin size={20} />, label: 'LinkedIn', color: '#0A66C2' },
  facebook: { icon: <Facebook size={20} />, label: 'Facebook', color: '#1877F2' },
  instagram: { icon: <Instagram size={20} />, label: 'Instagram', color: '#E4405F' },
  twitter: { icon: <Twitter size={20} />, label: 'X / Twitter', color: '#000000' },
  youtube: { icon: <Youtube size={20} />, label: 'YouTube', color: '#FF0000' },
  github: { icon: <Github size={20} color='gray'/>, label: 'GitHub', color: '#24292F' },
  telegram: { icon: <Send size={20} />, label: 'Telegram', color: '#26A5E4' },
  tiktok: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.07a8.16 8.16 0 004.77 1.52V7.14a4.85 4.85 0 01-1-.45z" />
      </svg>
    ),
    label: 'TikTok',
    color: '#000000',
  },
  behance: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.443 5.35c.638 0 1.234.067 1.77.197.536.136.994.347 1.37.638.378.29.672.666.876 1.122.204.456.308.998.308 1.614 0 .7-.156 1.29-.47 1.772-.312.48-.773.873-1.378 1.173.825.24 1.444.67 1.86 1.29.415.618.623 1.364.623 2.235 0 .672-.12 1.26-.36 1.766-.24.504-.577.93-1.002 1.275-.427.347-.926.606-1.496.776-.57.172-1.18.257-1.826.257H0V5.35h7.443zm-.43 5.914c.518 0 .94-.128 1.263-.383.322-.255.484-.648.484-1.178 0-.295-.05-.542-.15-.742-.1-.2-.237-.357-.41-.47-.17-.115-.37-.197-.597-.244-.227-.047-.47-.07-.727-.07H3.347v3.087h3.666zm.184 6.213c.286 0 .554-.028.806-.083.253-.057.475-.148.665-.274.19-.127.342-.298.454-.513.112-.215.168-.49.168-.82 0-.65-.18-1.125-.54-1.424-.36-.298-.836-.447-1.427-.447H3.347v3.56h3.85zm8.81-1.88c.37.362.907.543 1.607.543.5 0 .933-.126 1.298-.375.366-.25.592-.518.678-.805h2.665c-.428 1.33-1.085 2.28-1.97 2.848-.886.568-1.958.852-3.216.852-.874 0-1.66-.14-2.36-.42-.698-.28-1.29-.68-1.773-1.195-.485-.516-.854-1.13-1.11-1.842-.254-.712-.382-1.493-.382-2.34 0-.82.13-1.586.392-2.295.26-.71.633-1.324 1.116-1.842.483-.52 1.066-.925 1.75-1.216.684-.29 1.446-.436 2.285-.436 1.002 0 1.858.19 2.565.567.71.377 1.29.886 1.738 1.526.45.638.77 1.366.957 2.18.185.817.246 1.664.184 2.543H14.64c.028.793.266 1.378.638 1.707zm2.835-5.04c-.294-.324-.778-.486-1.452-.486-.425 0-.778.072-1.058.216-.28.144-.503.322-.67.532-.167.21-.284.436-.35.678-.066.24-.103.467-.112.677h4.39c-.094-.742-.454-1.293-.748-1.617zM16.77 6.77h5.013v1.275H16.77V6.77z" />
      </svg>
    ),
    label: 'Behance',
    color: '#053eff',
  },
  dribbble: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 6.628 5.374 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12zm7.96 5.61c1.4 1.712 2.245 3.874 2.274 6.23-.333-.065-3.664-.744-7.015-.32-.085-.197-.162-.4-.248-.6-.23-.537-.48-1.073-.737-1.596 3.712-1.514 5.415-3.693 5.726-3.714zM12 2.15c2.567 0 4.913.97 6.68 2.558-.276.294-1.8 2.33-5.39 3.666C11.56 5.9 9.713 3.84 9.408 3.488A10.02 10.02 0 0112 2.15zm-4.6 1.316c.297.333 2.1 2.394 3.86 5.27-4.862 1.293-9.154 1.27-9.6 1.258A10.027 10.027 0 017.4 3.466zM2.144 12.01v-.26c.432.01 5.44.074 10.632-1.482.298.583.576 1.175.834 1.772-.13.038-.264.074-.396.118-5.377 1.734-8.228 6.475-8.464 6.873A9.846 9.846 0 012.144 12.01zm9.856 9.842c-2.43 0-4.664-.87-6.392-2.306.21-.39 2.618-4.944 8.565-7.01.024-.008.047-.017.07-.024 1.534 3.976 2.165 7.314 2.328 8.235a9.854 9.854 0 01-4.57 1.105zm6.48-2.055c-.12-.718-.7-3.885-2.128-7.8 3.14-.503 5.893.322 6.238.428-.45 3.105-2.28 5.782-4.11 7.372z" />
      </svg>
    ),
    label: 'Dribbble',
    color: '#EA4C89',
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
}

function Lightbox({ images, index, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(index);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        onClick={onClose}
      >
        <X size={28} />
      </button>
      <img
        src={images[current]}
        alt=""
        className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
type Props = {
  username: string;
};
export default function PublicCard({ username }: Props) {
  const [data, setData] = useState<CardData | null>(null);
   const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ index: number } | null>(null);

 useEffect(() => {
  console.log("Fetching card data for username:", username);
   if (!username) return;

   const fetchCard = async () => {
     try {
       setLoading(true);
       setError(null);

       const res = await fetch(`/api/card/${username}`);

       if (res.status === 404) {
         setError("Card not found");
         return;
       }
       if (!res.ok) {
         setError("Failed to load card");
         return;
       }

       const json = await res.json();
       setData(json.data); // ✅ your ok() helper wraps in { data: ... }
     } catch {
       setError("Network error");
     } finally {
       setLoading(false);
     }
   };

   fetchCard();
 }, [username]);


  if (!data) return null;

  const { profile, social, business, appearance } = data;
  const accent = appearance.accentColor || "#6366f1";

  const activeSocials = Object.entries(social).filter(([, v]) => v);

  return (
    <div
      className="min-h-screen flex items-start justify-center py-8 px-4"
      style={{
        background:
          "linear-gradient(135deg, #0d0d0d 0%, #111827 50%, #0d0d0d 100%)",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      {lightbox && (
        <Lightbox
          images={business.portfolioImages}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      <div className="w-full max-w-[430px] flex flex-col gap-4 pb-12">
        {/* Hero */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Gradient glow */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at top, ${accent}40 0%, transparent 60%)`,
            }}
          />

          <div className="relative flex flex-col items-center px-6 pt-10 pb-8 text-center gap-4">
            {/* Profile Photo */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${accent}`, borderRadius: "50%" }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.2, 0.7] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${accent}`, borderRadius: "50%" }}
                animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0, 0.4] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
              <img
                src={profile.photo}
                alt={profile.fullName}
                className="w-28 h-28 rounded-full object-cover relative z-10"
                style={{ border: `3px solid ${accent}` }}
              />
            </div>

            <div>
              <h1
                className="text-white"
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {profile.fullName}
              </h1>
              <p
                style={{
                  color: accent,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginTop: "0.2rem",
                }}
              >
                {profile.jobTitle}
              </p>
              {profile.companyName && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                    marginTop: "0.15rem",
                  }}
                >
                  {profile.companyName}
                </p>
              )}
            </div>

            {profile.bio && (
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "0.875rem",
                  lineHeight: 1.65,
                  maxWidth: "340px",
                }}
              >
                {profile.bio}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-3 mt-2 w-full">
              <button
                onClick={() => downloadVCF(data)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: accent,
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                <Download size={16} />
                Save Contact
              </button>
              <button
                onClick={shareCard}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Contact Actions */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-3xl p-5"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}
          >
            Contact
          </p>
          <div className="grid grid-cols-5  gap-3">
            {[
              {
                icon: <Phone size={22} />,
                label: "Call",
                href: `tel:${profile.mobile}`,
                show: !!profile.mobile,
              },
              {
                icon: <MessageCircle size={22} />,
                label: "WhatsApp",
                href: `https://wa.me/${profile.whatsapp?.replace(/\D/g, "")}`,
                show: !!profile.whatsapp,
              },
              {
                icon: <Mail size={22} />,
                label: "Email",
                href: `mailto:${profile.email}`,
                show: !!profile.email,
              },
              {
                icon: <Globe size={22} />,
                label: "Website",
                href: profile.website,
                show: !!profile.website,
              },
              {
                icon: <MapPin size={22} />,
                label: "Maps",
                href: `https://maps.google.com/?q=${encodeURIComponent(profile.address)}`,
                show: !!profile.address,
              },
            ]
              .filter((i) => i.show)
              .map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span style={{ color: accent }}>{item.icon}</span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              ))}
          </div>
        </motion.div>

        {/* Social Links */}
        {activeSocials.length > 0 && (
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl p-5"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1rem",
              }}
            >
              Connect
            </p>
            <div className="flex flex-wrap gap-3">
              {activeSocials.map(([key, url]) => {
                const social = socialIcons[key];
                if (!social) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                    }}
                  >
                    <span style={{ color: social.color }}>{social.icon}</span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.75)",
                      }}
                    >
                      {social.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Business Section */}
        {(business.description ||
          business.services.length > 0 ||
          business.portfolioImages.length > 0) && (
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl p-5 flex flex-col gap-5"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Business
            </p>

            {/* Logo + Description */}
            {business.logo && (
              <div className="flex items-center gap-4">
                <img
                  src={business.logo}
                  alt="Company Logo"
                  className="w-14 h-14 rounded-2xl object-contain"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <div>
                  <p
                    style={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  >
                    {profile.companyName}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {profile.address?.split(",")[1]?.trim()}
                  </p>
                </div>
              </div>
            )}

            {business.description && (
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "0.875rem",
                  lineHeight: 1.65,
                }}
              >
                {business.description}
              </p>
            )}

            {/* Services */}
            {business.services.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {business.services.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-full text-sm"
                    style={{
                      background: `${accent}20`,
                      border: `1px solid ${accent}40`,
                      color: accent,
                      fontSize: "0.78rem",
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* PDF Downloads */}
            {(business.catalogPdf || business.brochurePdf) && (
              <div className="flex flex-col gap-3">
                {business.catalogPdf && (
                  <a
                    href={business.catalogPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center gap-3 px-5 py-4 rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <ShimmerOverlay />
                    <Download
                      size={18}
                      style={{ color: accent, flexShrink: 0 }}
                    />
                    <div>
                      <p
                        style={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Product Catalog
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.75rem",
                        }}
                      >
                        Download PDF
                      </p>
                    </div>
                    <ExternalLink
                      size={14}
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        marginLeft: "auto",
                      }}
                    />
                  </a>
                )}
                {business.brochurePdf && (
                  <a
                    href={business.brochurePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center gap-3 px-5 py-4 rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <ShimmerOverlay />
                    <Download
                      size={18}
                      style={{ color: accent, flexShrink: 0 }}
                    />
                    <div>
                      <p
                        style={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Company Brochure
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.75rem",
                        }}
                      >
                        Download PDF
                      </p>
                    </div>
                    <ExternalLink
                      size={14}
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        marginLeft: "auto",
                      }}
                    />
                  </a>
                )}
              </div>
            )}

            {/* Portfolio */}
            {business.portfolioImages.length > 0 && (
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Portfolio
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {business.portfolioImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox({ index: i })}
                      className="relative group aspect-square rounded-2xl overflow-hidden"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn size={18} className="text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Map Embed */}
        {profile.mapsUrl && (
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)", height: 240 }}
          >
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjYiTiAxMjLCsDI1JzA5LjgiVw!5e0!3m2!1sen!2sus!4v1234567890&style=element:geometry%7Ccolor:0x212121&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x757575&style=element:labels.text.stroke%7Ccolor:0x212121&style=feature:administrative%7Celement:geometry%7Ccolor:0x757575&style=feature:road%7Celement:geometry%7Ccolor:0x373737&style=feature:water%7Celement:geometry%7Ccolor:0x000000`}
              width="100%"
              height="240"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Location"
            />
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center pt-2"
        >
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
            Powered by{" "}
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
              One.Card
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function ShimmerOverlay() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
      }}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
    />
  );
}
