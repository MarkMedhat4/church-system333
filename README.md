<div align="center">

<br/>

```
✝ كنيسة الثلاثة فتية القديسين — أسوان
```

# ⛪ Church Management System

### نظام إدارة متكامل للخدمة الإعدادية والثانوية

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-RTL-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

<br/>

🔗 **[Live Demo → church-system333.vercel.app](https://church-system333.vercel.app/login)**

<br/>

</div>

---

## 📌 نظرة عامة

نظام SaaS متكامل مصمم خصيصاً لكنيسة الثلاثة فتية القديسين بأسوان، يُدير الخدمتين الإعدادية والثانوية بشكل رقمي كامل — من تسجيل المخدومين وحتى تتبع الحضور والنقاط، مع لوحة تحكم مباشرة (Realtime) للخدام.

```
المخدوم يسجّل → الخادم يقبل → QR يُولَّد تلقائياً → الحضور يُسجَّل → نقاط تُحسب
```

---

## ✨ المميزات الرئيسية

| المميزة | التفاصيل |
|---------|----------|
| 🔐 **تسجيل متدرج** | فورم 3 خطوات مع رفع الصورة |
| ✅ **نظام موافقة** | Admin يقبل/يرفض مع إشعار فوري |
| 📱 **QR ذكي** | يُولَّد تلقائياً عند القبول، ومضاد للغش |
| 📊 **Dashboard حي** | إحصائيات فورية بدون Refresh |
| 🏆 **نقاط تلقائية** | كل 4 حضور = نقطة بدون تدخل |
| 🎂 **أعياد الميلاد** | تنبيهات فورية للأسبوع القادم |
| 🪪 **بطاقات هوية** | طباعة PDF مع QR لكل مخدوم |
| 📥 **استيراد جماعي** | Excel أو SQL مباشرة |
| 🌙 **Dark Mode** | تبديل فوري بدون إعادة تحميل |
| 📲 **PWA** | قابل للتثبيت على المحمول |

---

## 🏗️ التقنيات المستخدمة

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  Next.js 14  ·  React 18  ·  TypeScript  ·  RTL    │
│  Tailwind CSS  ·  Recharts  ·  QRCode               │
├─────────────────────────────────────────────────────┤
│                    BACKEND                          │
│  Supabase PostgreSQL  ·  Row Level Security         │
│  Supabase Auth  ·  Supabase Storage  ·  Realtime    │
├─────────────────────────────────────────────────────┤
│                   ARCHITECTURE                      │
│  Pages → Hooks → Services → Supabase Client        │
├─────────────────────────────────────────────────────┤
│                    HOSTING                          │
│  Vercel (Frontend)  ·  Supabase Cloud (Backend)    │
└─────────────────────────────────────────────────────┘
```

---

## 👥 أنواع المستخدمين

### 👨‍💼 Admin — الخادم
> يسجّل دخوله بـ Email + Password عبر Supabase Auth

| الصلاحية | الوصف |
|----------|-------|
| 📋 مراجعة الطلبات | قبول أو رفض المخدومين الجدد |
| 📷 مسح QR | تسجيل الحضور بالكاميرا |
| ⭐ النقاط | إضافة أو خصم نقاط يدوياً |
| 📊 Dashboard | إحصائيات كاملة وفورية |
| 🪪 بطاقات الهوية | طباعة بطاقات لكل المخدومين |
| 📈 التقارير | تصدير Excel و PDF |
| ⚙️ الإعدادات | إدارة حسابات الخدام |

---

### 👤 Student — المخدوم
> يسجّل دخوله برقم هاتفه فقط

| الإمكانية | الوصف |
|-----------|-------|
| 📝 تسجيل | فورم 3 خطوات بسيط |
| 👤 البروفايل | مشاهدة بياناته الكاملة |
| 📱 QR الخاص | يعرضه للخادم كل أحد |
| 📅 الحضور | سجل كامل بالتواريخ |
| ⭐ النقاط | رصيده ومصادره |

---

## 🔄 رحلة المخدوم — Registration Flow

```
1. يفتح /register
       ↓
2. يكمل 3 خطوات
   [البيانات الشخصية] → [الصف الدراسي] → [الصورة]
       ↓
3. يُحفظ في قاعدة البيانات
   status = "0" (pending) · active = false
       ↓
4. يظهر فورًا في /registrations عند الخادم
       ↓
5. الخادم يقرر
   ✅ قبول → status = "1" · active = true · QR يُولد تلقائياً
   ❌ رفض  → status = "-1" · active = false
       ↓
6. المخدوم يقدر يسجل دخول ويشوف QR
```

---

## 📅 نظام الحضور والـ QR

```
⚠️  شروط المسح الصارمة
────────────────────────────────
📅  يوم الأحد فقط
🕕  من 6:00 مساءً إلى 9:00 مساءً
🔒  8 ثوانٍ lock بين كل مسح وآخر
⚡  حد أقصى 30 مسح/دقيقة
🚫  مسح مرة واحدة فقط يومياً per student
```

**Anti-Cheat System:**
- `UNIQUE(student_id, date)` في قاعدة البيانات
- Rate limiting في الكود
- التحقق من نافذة الوقت في Server وClient معاً

---

## 🏆 نظام النقاط

```
4 حضور في الشهر الواحد
         ↓
   +1 نقطة تلقائياً
   (Supabase Database Trigger)
         ↓
   يُسجَّل في points_log
         ↓
   يظهر في Leaderboard
```

**الخادم يستطيع أيضاً:**
- ➕ إضافة نقاط يدوياً (نشاط، حفظ، سلوك...)
- ➖ خصم نقاط مع ذكر السبب
- كل عملية مسجّلة في `points_log` بالتفصيل

---

## 📊 Dashboard — ما يراه الخادم فورًا

```
┌──────────┬──────────┬──────────┬──────────┐
│  المخدومين│  حضور   │  معلقة  │  مفعّلون │
│   الكل   │  اليوم  │  الطلبات │          │
└──────────┴──────────┴──────────┴──────────┘

📈 رسم بياني للحضور الشهري (6 أشهر)

🏆 المتصدرون         🎂 أعياد ميلاد قريبة
┌─────────────┐      ┌─────────────────────┐
│ 🥇 يوسف  8★ │      │ 🎂 مريم — غداً      │
│ 🥈 مريم  6★ │      │ 🎂 بيشوي — بعد 3أيام│
│ 🥉 بيشوي 4★ │      └─────────────────────┘
└─────────────┘
```

---

## 📁 هيكل المشروع

```
church-system/
│
├── 📂 src/
│   ├── 📂 app/                   ← الصفحات (UI فقط)
│   │   ├── login/                ← دخول الخادم
│   │   ├── student-login/        ← دخول المخدوم
│   │   ├── register/             ← تسجيل جديد
│   │   ├── dashboard/            ← لوحة التحكم
│   │   ├── registrations/        ← طلبات الانتظار
│   │   ├── students/             ← إدارة المخدومين
│   │   ├── scanner/              ← مسح QR
│   │   ├── points/               ← النقاط + Leaderboard
│   │   ├── id-cards/             ← بطاقات الهوية
│   │   ├── reports/              ← تقارير + تصدير
│   │   ├── import/               ← استيراد Excel/SQL
│   │   ├── settings/             ← المشرفون والإعدادات
│   │   └── profile/              ← بروفايل المخدوم
│   │
│   ├── 📂 hooks/                 ← State + Effects
│   │   ├── useAuth.ts
│   │   ├── useStudents.ts        ← مع Realtime
│   │   ├── useAttendance.ts      ← مع QR Scanner
│   │   └── usePoints.ts          ← مع Dashboard
│   │
│   ├── 📂 services/              ← Business Logic
│   │   ├── auth.ts
│   │   ├── students.ts
│   │   ├── attendance.ts         ← Anti-Cheat هنا
│   │   ├── points.ts
│   │   └── utils.ts
│   │
│   ├── 📂 components/
│   │   ├── layout/               ← Sidebar + Layout
│   │   ├── ui/                   ← Modal, Pagination, StatCard...
│   │   └── skeletons/            ← Loading states
│   │
│   ├── 📂 lib/
│   │   ├── supabaseClient.ts     ← Client معزول
│   │   └── constants.ts          ← إعدادات وثوابت
│   │
│   └── 📂 types/
│       └── index.ts              ← كل الـ TypeScript Types
│
├── 📂 supabase/
│   ├── schema.sql                ← الجداول + RLS + Triggers
│   └── helpers.sql               ← RPCs + Views + Realtime
│
└── 📂 public/
    ├── manifest.json             ← PWA
    └── offline.html              ← Offline fallback
```

---

## 🗃️ قاعدة البيانات

```sql
students        ← بيانات المخدومين + QR + النقاط
attendance      ← سجل الحضور (UNIQUE per day)
points_log      ← كل تغيير في النقاط بالتفصيل
admins          ← حسابات الخدام
```

**Triggers تلقائية:**
- ✅ توليد QR عند القبول
- ✅ حساب النقاط عند كل 4 حضور
- ✅ تحديث `updated_at` تلقائياً

---

## 🔐 الأمان

| الطبقة | الآلية |
|--------|--------|
| **Database** | Row Level Security على كل جدول |
| **Auth** | Supabase Auth — لا passwords مخزّنة |
| **Admin** | لا signup من الواجهة — إضافة يدوية فقط |
| **Student** | تسجيل دخول برقم الهاتف + فحص status |
| **QR** | Anti-cheat متعدد الطبقات |
| **Secrets** | `.env` فقط — لا أي key في الكود |
| **Storage** | Student photos: Public · ID cards: Private |

---

## 🗺️ خريطة الصفحات

| الصفحة | الرابط | من يستخدمها |
|--------|--------|------------|
| دخول الخادم | `/login` | Admin |
| دخول المخدوم | `/student-login` | Student |
| تسجيل جديد | `/register` | عام |
| لوحة التحكم | `/dashboard` | Admin |
| طلبات الانتظار | `/registrations` | Admin |
| المخدومون | `/students` | Admin |
| مسح QR | `/scanner` | Admin |
| النقاط | `/points` | Admin |
| بطاقات الهوية | `/id-cards` | Admin |
| التقارير | `/reports` | Admin |
| الاستيراد | `/import` | Admin |
| الإعدادات | `/settings` | Admin |
| البروفايل | `/profile` | Student |

---

## 🚀 تشغيل المشروع محلياً

### المتطلبات
- Node.js v18+
- حساب على [Supabase](https://supabase.com)

### الخطوات

```bash
# 1. فك الضغط وادخل الفولدر
cd church-system

# 2. ثبّت الـ packages
npm install

# 3. انسخ ملف البيئة
cp .env.local.example .env.local
```

عبّي `.env.local` بالقيم من Supabase Dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SCAN_START_HOUR=18
NEXT_PUBLIC_SCAN_END_HOUR=21
```

```bash
# 4. شغّل المشروع
npm run dev

# 5. افتح المتصفح
# http://localhost:3000/login
```

---

## ☁️ إعداد Supabase

```bash
# في Supabase SQL Editor، شغّل بالترتيب:
1. supabase/schema.sql    ← الجداول + RLS + Triggers
2. supabase/helpers.sql   ← RPCs + Views + Realtime

# ثم أضف أول Admin:
INSERT INTO admins (name, email, role)
VALUES ('اسمك', 'email@gmail.com', 'super_admin');
```

**Storage Buckets:**
```
student-photos  →  Public  ✅
id-cards        →  Private 🔒
```

---

## 📦 Deploy على Vercel

```bash
# 1. ارفع على GitHub
git init && git add . && git commit -m "init"
git push origin main

# 2. اربطه على vercel.com
# 3. أضف Environment Variables
# 4. Deploy ✅
```

**بعد الـ Deploy، في Supabase:**
```
Authentication → URL Configuration
Site URL: https://your-project.vercel.app
```

---

## 🆘 مشاكل شائعة

| المشكلة | الحل |
|---------|------|
| `Supabase credentials missing` | تأكد من `.env.local` |
| `permission denied` | شغّل `schema.sql` وتأكد من RLS |
| Admin لا يستطيع الدخول | تأكد إن الإيميل في جدول `admins` |
| QR لا يُولَّد | تأكد من trigger `trigger_qr_on_approval` |
| الصور لا تظهر | تأكد إن bucket `student-photos` Public |
| خطأ في npm install | تأكد من Node.js v18+ |

---

<div align="center">

---

**✝ كنيسة الثلاثة فتية القديسين — أسوان**

*Built with ❤️ for the service of God's children*

![Next.js](https://img.shields.io/badge/-Next.js-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/-Vercel-black?style=flat-square&logo=vercel)

</div>

نظام إدارة متكامل لخدمة الإعدادي والثانوي بكنيسة الثلاثة فتية القديسين بأسوان.

---

## 🚀 خطوات الإعداد (Setup)

### 1. Supabase Setup

1. ادخل على [supabase.com](https://supabase.com) وأنشئ مشروع جديد
2. اذهب لـ **SQL Editor** وشغّل الملفات التالية بالترتيب:
   ```
   supabase/schema.sql    ← الجداول + RLS + Triggers
   supabase/helpers.sql   ← RPCs + Views + Realtime
   ```
3. من **Authentication > Users**، أضف أول admin يدوياً
4. شغّل seed في `helpers.sql` لإضافة الأدمن في جدول `admins`
5. من **Storage**، تأكد من إنشاء buckets: `student-photos` و `id-cards`

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

عبّي المتغيرات في `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Install & Run

```bash
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

---

## 📁 هيكل المشروع

```
church-system/
├── src/
│   ├── app/
│   │   ├── login/          ← دخول الأدمن
│   │   ├── student-login/  ← دخول الطلاب
│   │   ├── register/       ← تسجيل جديد (3 خطوات)
│   │   ├── dashboard/      ← لوحة التحكم
│   │   ├── registrations/  ← طلبات الانتظار
│   │   ├── students/       ← إدارة الطلاب
│   │   ├── scanner/        ← مسح QR
│   │   ├── points/         ← النقاط + Leaderboard
│   │   ├── id-cards/       ← بطاقات الهوية
│   │   ├── reports/        ← تقارير + Excel/PDF
│   │   ├── import/         ← استيراد بيانات
│   │   ├── settings/       ← الإعدادات + المشرفون
│   │   └── profile/        ← بروفايل الطالب
│   ├── components/
│   │   ├── layout/         ← AdminSidebar, AdminLayout
│   │   ├── ui/             ← Modal, Pagination, StatCard, StudentPhoto
│   │   └── skeletons/      ← Loading skeletons
│   ├── hooks/
│   │   ├── useAuth.ts      ← Admin + Student auth
│   │   ├── useStudents.ts  ← Students + Realtime
│   │   ├── useAttendance.ts← Attendance + QR Scanner
│   │   └── usePoints.ts    ← Points + Dashboard
│   ├── services/
│   │   ├── auth.ts         ← Auth service
│   │   ├── students.ts     ← Students CRUD
│   │   ├── attendance.ts   ← Attendance + Anti-Cheat
│   │   ├── points.ts       ← Points management
│   │   └── utils.ts        ← Helper functions
│   ├── lib/
│   │   ├── supabaseClient.ts ← Supabase isolated client
│   │   └── constants.ts    ← Stages, rules, config
│   └── types/
│       └── index.ts        ← TypeScript types
├── supabase/
│   ├── schema.sql          ← Database schema
│   └── helpers.sql         ← RPCs + Views
└── public/
    ├── manifest.json       ← PWA manifest
    └── offline.html        ← PWA offline page
```

---

## 🔐 Security Features

| الميزة | التفاصيل |
|--------|----------|
| **RLS Policies** | كل الجداول محمية بـ Row Level Security |
| **Admin Auth** | Supabase Auth (email + password) |
| **Student Auth** | رقم الهاتف فقط (status=1 AND active=true) |
| **QR Anti-Cheat** | 8 ثانية lock + 30 مسح/دقيقة + UNIQUE(student_id, date) |
| **Sunday Only** | المسح يوم الأحد 6م–9م فقط |
| **No Secrets** | env vars فقط، لا secrets في الكود |

---

## 🎯 Core Features

- ✅ تسجيل الطلاب بـ 3 خطوات مع رفع الصورة
- ✅ نظام موافقة/رفض الطلبات مع Realtime
- ✅ QR Code تلقائي عند القبول (Supabase trigger)
- ✅ مسح QR بالكاميرا مع Anti-Cheat كامل
- ✅ 4 حضور/شهر = 1 نقطة تلقائياً (database trigger)
- ✅ Leaderboard + نقاط يدوية (إضافة/خصم)
- ✅ Dashboard مع Charts + أعياد ميلاد
- ✅ بطاقات هوية قابلة للطباعة
- ✅ تقارير + Excel + PDF Export
- ✅ استيراد Excel + SQL مباشر
- ✅ Dark/Light Mode
- ✅ PWA (installable + offline)
- ✅ Responsive (Mobile/Tablet/Desktop)
- ✅ RTL Arabic UI

---

## 🚀 Deploy على Vercel

```bash
# 1. ارفع المشروع على GitHub
# 2. ادخل vercel.com وربطه
# 3. أضف Environment Variables من .env.local
# 4. Deploy!
```

---

## 📱 PWA Installation

على المحمول، افتح الموقع في المتصفح واضغط:
- **iOS**: Share → Add to Home Screen
- **Android**: Menu → Install App

---

*كنيسة الثلاثة فتية القديسين — أسوان © 2024*
