<div align="center">

# 🔥 إيه الكلام؟ | Eah ElKalam?

### رادار الترند المصري — تابع أحدث الترندات في الوقت الحقيقي
### Egyptian Trend Radar — real-time trending topics & AI-powered analysis

[![Live Demo](https://img.shields.io/badge/Live-Demo-0a5c5c?style=for-the-badge&logo=vercel&logoColor=white)](https://eah-elkalam.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ziadamr45/Eah-Elkalam)

</div>

---

## 📖 نبذة | Overview

<div dir="rtl">

**إيه الكلام؟** هو تطبيق ويب تفاعلي يتتبع أحدث الترندات على منصات التواصل الاجتماعي في مصر والعالم العربي. يعرض الترندات في الوقت الحقيقي مع تحليلات ذكية مدعومة بالذكاء الاصطناعي، وخريطة تفاعلية لمصر، ومطابقات مباشرة للترندات المشابهة.

التطبيق يجمع بين التصميم العصري والأداء السريع ليمنحك نظرة شاملة على ما يحدث الآن في المحتوى العربي.

</div>

**Eah ElKalam** is an interactive web app that tracks the latest trending topics on social media platforms in Egypt and the Arab world. It displays real-time trends with AI-powered analysis, an interactive Egypt map, and live matching for similar trends.

The app combines modern design with fast performance to give you a comprehensive view of what's happening now in Arabic content.

---

## ✨ المميزات | Features

| الميزة | Feature |
|--------|---------|
| 📊 تتبع الترندات في الوقت الحقيقي | Real-time trend tracking |
| 🤖 تحليلات ذكية بالذكاء الاصطناعي | AI-powered trend analysis |
| 🗺️ خريطة مصر التفاعلية | Interactive Egypt map |
| 🔍 بحث وفلترة حسب المنصة | Search & filter by platform |
| 📱 تصميم متجاوب بالكامل | Fully responsive design |
| 🌙 وضع داكن/فاتح | Dark/Light mode |
| 🎯 مطابقات مباشرة للترندات | Live trend matching |
| 🖥️ واجهة طرفية تفاعلية | Interactive terminal console |

---

## 🛠️ التقنيات | Tech Stack

| Technology | Purpose |
|------------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white) | Fullstack Framework |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | Type-safe Development |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | Styling |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat) | UI Components |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) | Database ORM |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white) | Animations |
| ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) | Deployment |

---

## 🚀 التشغيل | Getting Started

### المتطلبات | Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

### التثبيت | Installation

```bash
# Clone the repository
git clone https://github.com/ziadamr45/Eah-Elkalam.git
cd Eah-Elkalam

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 📁 هيكل المشروع | Project Structure

```
Eah-Elkalam/
├── src/
│   ├── app/                    # Next.js pages & API routes
│   ├── components/
│   │   └── trend-radar/        # Trend-specific components
│   │       ├── TrendCard       # Trend display card
│   │       ├── TrendDetailModal# Trend details popup
│   │       ├── AISummaryModal  # AI analysis modal
│   │       ├── TerminalConsole # Interactive terminal
│   │       ├── EgyptMap        # Interactive map
│   │       ├── LiveMatches     # Live matching display
│   │       └── NotificationPopup
│   ├── hooks/                  # Custom React hooks
│   └── lib/
│       └── trend-radar/        # Types, data & utilities
├── prisma/                     # Database schema & migrations
├── public/                     # Static assets
└── package.json
```

---

<div align="center">

Made with ❤️ by [Ziad Amr](https://github.com/ziadamr45)

</div>
