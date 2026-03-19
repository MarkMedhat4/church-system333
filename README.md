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
المخدوم يسجّل ← الخادم يقبل ← QR يُولَّد تلقائياً ← الحضور يُسجَّل ← نقاط تُحسب
```

---

## ✨ المميزات الرئيسية

| المميزة | التفاصيل |
|---------|----------|
| 🔐 **تسجيل متدرج** | فورم 3 خطوات مع رفع الصورة |
| ✅ **نظام موافقة** | الخادم يقبل/يرفض مع إشعار فوري |
| 📱 **QR ذكي** | يُولَّد تلقائياً عند القبول، مضاد للغش |
| 📊 **Dashboard حي** | إحصائيات فورية بدون Refresh |
| 🏆 **نقاط تلقائية** | كل 4 حضور = نقطة بدون تدخل يدوي |
| 🎂 **أعياد الميلاد** | تنبيهات للأسبوع القادم + جدول الشهر |
| 🪪 **بطاقات هوية** | طباعة مع QR لكل مخدوم |
| 📥 **استيراد جماعي** | Excel أو SQL مباشرة |
| 🌙 **Dark Mode** | تبديل فوري |
| 📲 **PWA** | قابل للتثبيت على الموبايل |

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

## 👥 الخدام (Admins)

| الاسم | البريد الإلكتروني | الصلاحية |
|-------|------------------|----------|
| مارك مدحت | markmadhat03@gmail.com | `super_admin` — مسح QR في أي وقت |
| مستر جرجس | gerges@gmail.com | `admin` — مسح الأحد 6م–9م |
| مستر جورج | george@gmail.com | `admin` — مسح الأحد 6م–9م |

> **super_admin** = صلاحية كاملة بدون قيود وقت أو يوم

---

## 👤 المخدومون (Students)

- تسجيل دخول برقم الهاتف فقط
- مشاهدة البيانات والحضور والنقاط
- عرض وتحميل QR الخاص
- تعديل البيانات الشخصية والصورة

---

## 🔄 رحلة المخدوم — Registration Flow

```
1. يفتح /register
       ↓
2. يكمل 3 خطوات
   [البيانات الشخصية] → [الصف الدراسي] → [الصورة]
       ↓
3. يُحفظ في قاعدة البيانات
   status = "0" (معلق) · active = false
       ↓
4. يظهر فوراً في /registrations عند الخادم
       ↓
5. الخادم يقرر
   ✅ قبول → status = "1" · active = true · QR يُولَّد تلقائياً
   ❌ رفض  → status = "-1" · active = false
       ↓
6. المخدوم يسجّل دخول ويشوف QR
```

---

## 📅 نظام الحضور والـ QR

```
⚠️  شروط المسح الرسمية
────────────────────────────────────────
📅  يوم الأحد فقط
🕕  من 6:00 مساءً إلى 9:00 مساءً
🔒  8 ثوانٍ lock بين كل مسح وآخر
⚡  حد أقصى 30 مسح / دقيقة
🚫  مسح مرة واحدة فقط في اليوم لكل مخدوم

🛡️  super_admin (مارك مدحت) ← بدون أي قيود
```

**Anti-Cheat System:**
- `UNIQUE(student_id, date)` في قاعدة البيانات
- Rate limiting في الكود
- فحص نافذة الوقت في Client و Server معاً

---

## 🏆 نظام النقاط

```
4 حضور في نفس الشهر
         ↓
   +1 نقطة تلقائياً
   (Supabase Database Trigger)
         ↓
   يُسجَّل في points_log
         ↓
   يظهر في Leaderboard
```

**الخادم يستطيع أيضاً:**
- ➕ إضافة نقاط يدوياً مع ذكر السبب
- ➖ خصم نقاط مع ذكر السبب
- كل عملية مسجّلة في `points_log` بالتفصيل

---

## 📊 Dashboard — ما يراه الخادم فوراً

```
┌──────────┬──────────┬──────────┬──────────┐
│  المخدومين│  حضور   │  معلقة  │  مفعّلون │
│   الكل   │  اليوم  │  الطلبات │          │
└──────────┴──────────┴──────────┴──────────┘

📈 رسم بياني للحضور الشهري (6 أشهر)

🏆 المتصدرون          🎂 أعياد ميلاد قريبة
┌──────────────┐      ┌──────────────────────┐
│ 🥇 اسم   8★  │      │ 🎂 اسم — غداً        │
│ 🥈 اسم   6★  │      │ 🎂 اسم — بعد 3 أيام  │
└──────────────┘      └──────────────────────┘
```

---

## 📁 هيكل المشروع

```
church-system/
│
├── 📂 src/
│   ├── 📂 app/                    ← الصفحات (UI فقط)
│   │   ├── login/                 ← دخول الخادم
│   │   ├── student-login/         ← دخول المخدوم (بالهاتف)
│   │   ├── register/              ← تسجيل جديد (3 خطوات)
│   │   ├── dashboard/             ← لوحة التحكم
│   │   ├── registrations/         ← طلبات الانتظار
│   │   ├── students/              ← إدارة المخدومين
│   │   ├── scanner/               ← مسح QR بالكاميرا
│   │   ├── points/                ← النقاط + Leaderboard
│   │   ├── id-cards/              ← بطاقات الهوية
│   │   ├── reports/               ← تقارير + Excel/PDF
│   │   ├── import/                ← استيراد Excel/SQL
│   │   ├── settings/              ← المشرفون والإعدادات
│   │   └── profile/               ← بروفايل المخدوم
│   │
│   ├── 📂 hooks/                  ← State + Effects
│   │   ├── useAuth.ts
│   │   ├── useStudents.ts         ← مع Realtime
│   │   ├── useAttendance.ts       ← مع QR Scanner
│   │   └── usePoints.ts           ← مع Dashboard
│   │
│   ├── 📂 services/               ← Business Logic
│   │   ├── auth.ts
│   │   ├── students.ts
│   │   ├── attendance.ts          ← Anti-Cheat هنا
│   │   ├── points.ts
│   │   └── utils.ts
│   │
│   ├── 📂 components/
│   │   ├── layout/                ← Sidebar + Layout
│   │   ├── ui/                    ← Modal, Pagination, StatCard...
│   │   └── skeletons/             ← Loading states
│   │
│   ├── 📂 lib/
│   │   ├── supabaseClient.ts      ← Client معزول
│   │   └── constants.ts           ← إعدادات وثوابت
│   │
│   └── 📂 types/
│       └── index.ts               ← كل الـ TypeScript Types
│
├── 📂 supabase/
│   ├── schema.sql                 ← الجداول + RLS + Triggers
│   └── helpers.sql                ← RPCs + Views + Realtime
│
└── 📂 public/
    ├── manifest.json              ← PWA
    └── offline.html               ← Offline fallback
```

---

## 🗃️ قاعدة البيانات

```sql
students     ← بيانات المخدومين + QR + النقاط
attendance   ← سجل الحضور  (UNIQUE per student per day)
points_log   ← كل تغيير في النقاط بالتفصيل
admins       ← حسابات الخدام
```

**Triggers تلقائية:**
- ✅ توليد QR عند قبول المخدوم
- ✅ إضافة نقطة عند كل 4 حضور في الشهر
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
| **Storage** | student-photos: Public · id-cards: Private |

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
| استيراد بيانات | `/import` | Admin |
| الإعدادات | `/settings` | Admin |
| البروفايل | `/profile` | Student |

---

## 🚀 تشغيل المشروع محلياً

```bash
# 1. ادخل الفولدر
cd church-system

# 2. ثبّت الـ packages
npm install

# 3. انسخ ملف البيئة
cp .env.local.example .env.local
```

عبّي `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SCAN_START_HOUR=18
NEXT_PUBLIC_SCAN_END_HOUR=21
```

```bash
# 4. شغّل
npm run dev

# 5. افتح
# http://localhost:3000/login
```

---

## ☁️ إعداد Supabase

```sql
-- شغّل بالترتيب في SQL Editor
-- 1. supabase/schema.sql
-- 2. supabase/helpers.sql

-- أضف الخدام
INSERT INTO admins (name, email, role) VALUES
  ('مارك مدحت',  'markmadhat03@gmail.com', 'super_admin'),
  ('مستر جرجس', 'gerges@gmail.com',        'admin'),
  ('مستر جورج',  'george@gmail.com',         'admin');
```

**Storage Buckets:**
```
student-photos  →  Public  ✅
id-cards        →  Private 🔒
```

---

## 📦 Deploy على Vercel

```bash
git init && git add . && git commit -m "init"
git push origin main
# اربطه على vercel.com وأضف Environment Variables
```

**بعد Deploy في Supabase:**
```
Authentication → URL Configuration
Site URL: https://your-project.vercel.app
```

---

## 🆘 مشاكل شائعة

| المشكلة | الحل |
|---------|------|
| الموقع بطيء عند الدخول | Supabase Free ينام — طبيعي في أول request |
| `permission denied` | شغّل `schema.sql` وتأكد من RLS |
| Admin لا يستطيع الدخول | تأكد إن الإيميل موجود في جدول `admins` |
| QR لا يُولَّد | تأكد من trigger `trigger_qr_on_approval` |
| الصور لا تظهر | تأكد إن bucket `student-photos` Public |
| رقم الهاتف مش شغال | تأكد إن الرقم بـ 11 رقم يبدأ بـ 01 |

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
