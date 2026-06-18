export interface Profile {
  fullName: string;
  jobTitle: string;
  companyName: string;
  photo: string;
  bio: string;
  mobile: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  mapsUrl: string;
}

export interface Social {
  linkedin: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  github: string;
  behance: string;
  dribbble: string;
  telegram: string;
}

export interface Business {
  logo: string;
  description: string;
  services: string[];
  catalogPdf: string;
  brochurePdf: string;
  portfolioImages: string[];
}

export interface Appearance {
  theme: "light" | "dark" | "auto";
  accentColor: string;
  fontStyle: "sora" | "dm-sans" | "inter" | "poppins";
}

export interface CardData {
  profile: Profile;
  social: Social;
  business: Business;
  appearance: Appearance;
}

export const defaultCardData: CardData = {
  profile: {
    fullName: "Alex Morgan",
    jobTitle: "Senior Product Designer",
    companyName: "Nexus Creative Studio",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Crafting digital experiences that merge aesthetics with purpose. Passionate about human-centered design, emerging tech, and building products people love.",
    mobile: "+1 (555) 234-5678",
    whatsapp: "+15552345678",
    email: "alex@nexuscreative.io",
    website: "https://nexuscreative.io",
    address: "123 Innovation Drive, San Francisco, CA 94103",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjYiTiAxMjLCsDI1JzA5LjgiVw!5e0!3m2!1sen!2sus!4v1234567890",
  },
  social: {
    linkedin: "https://linkedin.com/in/alexmorgan",
    facebook: "https://facebook.com/alexmorgan",
    instagram: "https://instagram.com/alexmorgan.design",
    twitter: "https://twitter.com/alexmorgan",
    tiktok: "",
    youtube: "https://youtube.com/@alexmorgan",
    github: "https://github.com/alexmorgan",
    behance: "https://behance.net/alexmorgan",
    dribbble: "https://dribbble.com/alexmorgan",
    telegram: "",
  },
  business: {
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop",
    description:
      "Nexus Creative Studio is a full-service design and innovation agency helping startups and enterprises build iconic digital products. We combine strategy, design, and technology to create experiences that drive growth.",
    services: [
      "UI/UX Design",
      "Brand Identity",
      "Web Development",
      "Mobile Apps",
      "Design Systems",
      "Prototyping",
    ],
    catalogPdf: "#",
    brochurePdf: "#",
    portfolioImages: [
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1576153192396-180ecef2a715?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop",
    ],
  },
  appearance: {
    theme: "dark",
    accentColor: "#6366f1",
    fontStyle: "sora",
  },
};

export function loadCardData(username: string): CardData {
  console.log(username);
  try {
    const stored = localStorage.getItem("cardData");
    if (stored) return { ...defaultCardData, ...JSON.parse(stored) };
  } catch {}
  return defaultCardData;
}

 
export function isAuthenticated(): boolean {
  return localStorage.getItem("auth") === "true";
}

export function login(username: string, password: string): boolean {
  if (username === "admin" && password === "admin123") {
    localStorage.setItem("auth", "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem("auth");
}

export async function saveCardData(
  username: string,
  data: CardData,
): Promise<void> {
  const res = await fetch(`/api/card/${username}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to save card data");
  }
}