import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { CardData, Business } from '../mockData';
import { Building2, Camera, Upload } from "lucide-react";
import { toast } from 'sonner';

interface Props {
  data: CardData;
  onSave: (data: CardData) => void;
}

export default function BusinessForm({ data, onSave }: Props) {
  const [form, setForm] = useState<Business>(data.business);
  const [newService, setNewService] = useState('');
  const [newImage, setNewImage] = useState('');

  const set = (key: keyof Business, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const addService = () => {
    if (newService.trim()) {
      set('services', [...form.services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (i: number) => set('services', form.services.filter((_, idx) => idx !== i));

  const addImage = () => {
    if (newImage.trim()) {
      set('portfolioImages', [...form.portfolioImages, newImage.trim()]);
      setNewImage('');
    }
  };

  const removeImage = (i: number) => set('portfolioImages', form.portfolioImages.filter((_, idx) => idx !== i));
const [uploadingLogo, setUploadingLogo] = useState(false);

const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploadingLogo(true);
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "logos");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const { url } = await res.json();
    set("logo", url);
  } catch {
    toast.error("Upload failed");
  } finally {
    setUploadingLogo(false);
  }
};
  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 600 }}>
        Business Info
      </h3>

      {/* Logo */}
      <Section label="Company Logo">
        <div className="flex items-center gap-5">
          {/* Preview + hover to change */}
          <div className="relative shrink-0 group">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              {form.logo ? (
                <img
                  src={form.logo}
                  alt=""
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <Building2
                  size={24}
                  style={{ color: "rgba(255,255,255,0.2)" }}
                />
              )}
            </div>
            <label
              className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {uploadingLogo ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Camera size={18} className="text-white" />
              )}
            </label>
          </div>

          {/* URL + upload button */}
          <div className="flex-1 flex flex-col gap-2">
            <Field
              label="Logo URL"
              value={form.logo}
              onChange={(v) => set("logo", v)}
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
                onChange={handleLogoUpload}
              />
              {uploadingLogo ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload Logo
                </>
              )}
            </label>
          </div>
        </div>
      </Section>

      {/* Description */}
      <Section label="Company Description">
        <TextArea
          label=""
          value={form.description}
          onChange={(v) => set("description", v)}
          rows={4}
        />
      </Section>

      {/* Services */}
      <Section label="Services">
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {form.services.map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#818cf8",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              {s}
              <button
                onClick={() => removeService(i)}
                className="hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addService()}
            placeholder="Add a service..."
            className="flex-1 px-4 py-2.5 rounded-xl outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "0.875rem",
            }}
          />
          <button
            onClick={addService}
            className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </Section>

      {/* PDFs */}
      <Section label="Downloads">
        <Field
          label="Product Catalog PDF URL"
          value={form.catalogPdf}
          onChange={(v) => set("catalogPdf", v)}
          placeholder="https://..."
        />
        <Field
          label="Company Brochure PDF URL"
          value={form.brochurePdf}
          onChange={(v) => set("brochurePdf", v)}
          placeholder="https://..."
        />
      </Section>

      {/* Portfolio */}
      <Section label="Portfolio Gallery">
        <div className="grid grid-cols-3 gap-2">
          {form.portfolioImages.map((img, i) => (
            <div
              key={i}
              className="relative group aspect-square rounded-2xl overflow-hidden"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => removeImage(i)} className="text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addImage()}
            placeholder="Image URL..."
            className="flex-1 px-4 py-2.5 rounded-xl outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "0.875rem",
            }}
          />
          <button
            onClick={addImage}
            className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </Section>

      <button
        onClick={() => onSave({ ...data, business: form })}
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
      {label && <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>}
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      {label && <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl outline-none"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.875rem' }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      {label && <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows || 3}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl outline-none resize-none"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.875rem' }}
      />
    </div>
  );
}
