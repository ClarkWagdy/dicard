o
Build a production-ready Digital Business Card / Portfolio web app using:
- Next.js 14+ with TypeScript (App Router)
- Tailwind CSS + shadcn/ui
- PostgreSQL via Prisma ORM
- NextAuth.js (admin dashboard auth)
- Next.js Route Handlers (REST API)
- Cloudinary or UploadThing for file/image uploads

---

## 📁 Project Structure

/app
  /(card)                    → Public-facing digital card
    /[username]/page.tsx     → The shareable card page
  /(dashboard)               → Protected admin area
    /login/page.tsx
    /dashboard/page.tsx
    /dashboard/profile/page.tsx
    /dashboard/social/page.tsx
    /dashboard/business/page.tsx
    /dashboard/appearance/page.tsx
/api
  /profile/route.ts
  /social/route.ts
  /business/route.ts
  /upload/route.ts
/components
  /card                      → Public card UI components
  /dashboard                 → Admin UI components
  /ui                        → shadcn/ui base components
/lib
  /prisma.ts
  /auth.ts
  /upload.ts
/prisma
  /schema.prisma

---

## 🗄️ Prisma Schema

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  profile   Profile?
  social    Social?
  business  Business?
  createdAt DateTime @default(now())
}

model Profile {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id])

  // Personal Details
  fullName    String
  jobTitle    String?
  companyName String?
  photo       String?   // Cloudinary URL
  bio         String?

  // Communication
  mobile      String?
  whatsapp    String?
  email       String?
  website     String?

  // Address
  address     String?
  mapsUrl     String?   // Google Maps embed or link
}

model Social {
  id        String  @id @default(cuid())
  userId    String  @unique
  user      User    @relation(fields: [userId], references: [id])

  linkedin  String?
  facebook  String?
  instagram String?
  twitter   String?
  tiktok    String?
  youtube   String?
  github    String?
  behance   String?
  dribbble  String?
  telegram  String?
}

model Business {
  id              String  @id @default(cuid())
  userId          String  @unique
  user            User    @relation(fields: [userId], references: [id])

  logo            String?   // Cloudinary URL
  description     String?
  services        String[]  // Array of service names
  catalogPdf      String?   // Cloudinary PDF URL
  brochurePdf     String?   // Cloudinary PDF URL
  portfolioImages String[]  // Array of Cloudinary image URLs
}

---

## 🔌 API Routes

### /api/profile
- GET    → return full profile (public, by username)
- PUT    → update profile (protected)

### /api/social
- GET    → return social links (public)
- PUT    → update social links (protected)

### /api/business
- GET    → return business info (public)
- PUT    → update business info (protected)

### /api/upload
- POST   → upload image/PDF to Cloudinary, return URL

---

## 🌐 Public Digital Card — /[username]

A single elegant scrollable page (or card-stack layout) with these sections:

### 1. Hero / Identity Block
- Profile photo (circular, with subtle ring)
- Full Name (large, bold)
- Job Title + Company Name
- Bio / About Me text
- "Save Contact" button → downloads .vcf file
- "Share" button → copies link or opens share sheet

### 2. Contact Actions Bar
Prominent icon buttons (tap to action):
- 📞 Call Mobile
- 💬 WhatsApp
- 📧 Email
- 🌐 Website
- 📍 Google Maps (open location)

### 3. Social Media Links
Icon grid, only show platforms that have a URL set.
Platforms: LinkedIn, Facebook, Instagram, X, TikTok, YouTube, GitHub, Behance, Dribbble, Telegram

### 4. Business Section
- Company Logo
- Company Description
- Services list (tags/chips style)
- Download buttons:
  - 📄 Product Catalog (PDF)
  - 📋 Company Brochure (PDF)
- Portfolio Gallery (image grid, lightbox on click)

### 5. Map Embed
- Embedded Google Maps iframe for company address

### 6. Footer
- "Powered by [Your App Name]" branding

---

## 🔐 Admin Dashboard — /dashboard

Protected by NextAuth (credentials provider). Only the logged-in owner can manage their card.

### Pages:

#### 1. Profile Settings /dashboard/profile
Form with all Profile fields:
- Photo upload (drag & drop, preview)
- Full Name, Job Title, Company Name
- Bio (textarea)
- Mobile, WhatsApp, Email, Website
- Company Address + Google Maps URL
- Save button → PUT /api/profile

#### 2. Social Media /dashboard/social
- Toggle + input for each platform
- Show/hide platforms with a toggle switch
- Platforms: LinkedIn, Facebook, Instagram, X, TikTok, YouTube, GitHub, Behance, Dribbble, Telegram
- Save button → PUT /api/social

#### 3. Business Info /dashboard/business
- Logo upload
- Company Description
- Services: tag input (add/remove chips)
- Upload Product Catalog PDF
- Upload Company Brochure PDF
- Portfolio: multi-image upload (drag & drop grid, reorder, delete)
- Save button → PUT /api/business

#### 4. Appearance /dashboard/appearance
- Card theme selector (Light / Dark / Auto)
- Accent color picker
- Font style selector (3-4 options)
- Preview pane showing live card preview

#### 5. Dashboard Overview /dashboard
- Stats: Profile Views (if analytics added), Files Uploaded
- Quick links to each section
- "View My Card" button → opens /[username] in new tab
- "Copy Card Link" button

---

## 🎨 Design Requirements

### Public Card Design:
- **Aesthetic**: Premium, app-like, feels like a native iOS/Android card
- **Theme**: Dark glassmorphism base with frosted panels
- **Typography**: Clash Display or Sora (headings) + DM Sans (body)
- **Color**: Near-black base (#0d0d0d) with a configurable accent (default: electric indigo #6366f1)
- **Animations**:
  - Staggered fade-in on load for each section
  - Smooth hover lift on action buttons
  - Pulse ring on profile photo
  - PDF download buttons with shimmer effect
- **Mobile-first**: Designed for phone screens, max-width 430px on mobile, centered card on desktop
- **Action buttons**: Large 56px tap targets, rounded, with icon + label

### Dashboard Design:
- Clean sidebar layout, minimal and functional
- shadcn/ui components throughout
- Toast notifications for save success/error
- Drag-and-drop for portfolio image reordering

---

## 📎 VCF Contact Export

When user clicks "Save Contact":
Generate a .vcf file dynamically from profile data containing:
- Full Name
- Job Title
- Company
- Mobile
- WhatsApp
- Email
- Website
- Address
- Profile Photo (base64 embedded)

---

## ⚙️ Environment Variables

DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=

---

## 📦 Deliverables

1. Full Next.js project with App Router, TypeScript
2. Prisma schema + seed script with sample data
3. All API routes (profile, social, business, upload)
4. Public digital card page (/[username])
5. Full admin dashboard (profile, social, business, appearance)
6. VCF export functionality
7. Cloudinary upload integration
8. README with full setup and deployment guide (Vercel + Railway)

---

## 🚀 Build Order

1. Prisma schema + DB setup
2. NextAuth config
3. Upload utility (Cloudinary)
4. All API routes
5. Dashboard pages (profile → social → business → appearance)
6. Public card page (hero → contacts → social → business → map)
7. VCF export
8. Polish animations and mobile responsiveness