import { useState } from 'react';
import { Upload, Camera, User } from "lucide-react";
import { CardData } from '../mockData';
import { toast } from 'sonner';

interface Props {
  data: CardData;
  onSave: (data: CardData) => void;
}

export default function ProfileForm({ data, onSave }: Props) {
  const [form, setForm] = useState(data.profile);
const [uploading, setUploading] = useState(false);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const { url } = await res.json();
    set("photo", url);
  } catch {
    toast.error("Upload failed");
  } finally {
    setUploading(false);
  }
};
  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => onSave({ ...data, profile: form });

  return (
    <div className="max-w-2xl flex flex-col gap-6" >
      <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 600 }}>
        Profile Settings
      </h3>

      {/* Photo */}
      <section
        className="rounded-3xl p-6 flex flex-col gap-4"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <label
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Profile Photo
        </label>
        <div className="flex items-center gap-5">
          {/* Avatar preview */}
          <div className="relative shrink-0 group">
            <img
              src={form.photo || ""}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover"
              style={{
                border: "2px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Hover overlay */}
            <label
              className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {uploading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </label>
          </div>

          {/* URL input + upload button */}
          <div className="flex-1 flex flex-col gap-2">
            <Field
              label="Photo URL"
              value={form.photo}
              onChange={(v) => set("photo", v)}
              placeholder="https://..."
            />
            <label
              className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer w-fit transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#818cf8",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload Image
                </>
              )}
            </label>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
              Hover photo to change · or paste a URL above
            </p>
          </div>
        </div>
      </section>

      {/* Personal Details */}
      <Section label="Personal Details">
        <Field
          label="Full Name"
          value={form.fullName}
          onChange={(v) => set("fullName", v)}
        />
        <Field
          label="Job Title"
          value={form.jobTitle}
          onChange={(v) => set("jobTitle", v)}
        />
        <Field
          label="Company Name"
          value={form.companyName}
          onChange={(v) => set("companyName", v)}
        />
        <TextArea
          label="Bio"
          value={form.bio}
          onChange={(v) => set("bio", v)}
          rows={3}
        />
      </Section>

      {/* Contact */}
      <Section label="Contact Info " >
        <Field
          label="Mobile"
          value={form.mobile}
          onChange={(v) => set("mobile", v)}
          placeholder="+1 (555) 000-0000"
        />
        <Field
          label="WhatsApp"
          value={form.whatsapp}
          onChange={(v) => set("whatsapp", v)}
          placeholder="+15550000000"
        />
        <Field
          label="Email"
          value={form.email}
          onChange={(v) => set("email", v)}
          placeholder="you@example.com"
        />
        <Field
          label="Website"
          value={form.website}
          onChange={(v) => set("website", v)}
          placeholder="https://"
        />
      </Section>

      {/* Address */}
      <Section label="Address">
        <TextArea
          label="Address"
          value={form.address}
          onChange={(v) => set("address", v)}
          rows={2}
          placeholder="123 Main St, City, State ZIP"
        />
        <Field
          label="Google Maps Embed URL"
          value={form.mapsUrl}
          onChange={(v) => set("mapsUrl", v)}
          placeholder="https://www.google.com/maps/embed?..."
        />
      </Section>

      <button
        onClick={handleSave}
        className="self-start px-8 py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
        style={{
          background: "linear-gradient(135deg, #6366f1, #818cf8)",
          color: "white",
          fontWeight: 600,
          fontSize: "0.9rem",
        }}
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

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          fontSize: '0.875rem',
        }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows || 3}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl outline-none transition-all resize-none"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          fontSize: '0.875rem',
        }}
      />
    </div>
  );
}
