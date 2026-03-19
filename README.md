# ✝ كنيسة الثلاثة فتية القديسين — نظام الإدارة
### Church Management SaaS — أسوان

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
