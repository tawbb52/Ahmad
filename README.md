# Ahmad iOS Admin Dashboard

لوحة تحكم إدارية RTL احترافية لإدارة مستخدمي تطبيقات iOS، أجهزتهم، اشتراكاتهم، الشهادات، وأكواد التفعيل مع REST API محمي بـ JWT.

## المزايا

- Dashboard رئيسي بإحصائيات المستخدمين، الأجهزة، الاشتراكات، الإيرادات، والشهادات
- إدارة المستخدمين: إضافة، تعديل، حذف، فلترة، Pagination، وتحديث حالة الاشتراك
- إدارة الأجهزة: ربط الأجهزة بالحسابات، تتبع آخر نشاط، وتعطيل/حذف الأجهزة
- إدارة الاشتراكات: عرض الخطط، التجديد اليدوي، التحكم في البداية والنهاية والحالة
- إدارة الشهادات وأكواد التفعيل: CRUD للشهادات وإنشاء/إلغاء أكواد التفعيل
- أمان ومراقبة: صفحة Login، JWT Authentication، أدوار وصلاحيات، وسجل نشاطات
- واجهة عربية Responsive مع Dark/Light Theme وToast Notifications وModal Forms

## هيكل المشروع

```text
ahmad/
├── frontend/
│   ├── index.html
│   ├── users.html
│   ├── devices.html
│   ├── subscriptions.html
│   ├── certificates.html
│   ├── reports.html
│   ├── login.html
│   ├── css/style.css
│   └── js/{app.js,auth.js,api.js}
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── config/
├── database/schema.sql
├── docs/Ahmad.postman_collection.json
├── .env.example
└── package.json
```

## التشغيل المحلي

```bash
npm install
cp .env.example .env
npm start
```

ثم افتح:

- `http://localhost:3000/login.html`

بيانات الدخول الافتراضية:

- البريد: `admin@ahmad.local`
- كلمة المرور: `Admin123!`

## متغيرات البيئة

| المتغير | الوصف |
|---|---|
| `PORT` | منفذ الخادم |
| `JWT_SECRET` | مفتاح توقيع التوكن |
| `ADMIN_EMAIL` | بريد المدير |
| `ADMIN_PASSWORD` | كلمة مرور المدير |
| `DATABASE_URL` | جاهز للربط مع PostgreSQL لاحقًا |

## قاعدة البيانات

- يوجد ملف `database/schema.sql` لتعريف جداول PostgreSQL للإنتاج.
- التطبيق الحالي يعمل ببيانات seeded داخلية لتسهيل العرض والتجربة السريعة.

## API أساسية

- `POST /api/auth/login`
- `GET /api/overview/stats`
- `GET|POST|PUT|DELETE /api/users`
- `GET|POST|PUT|DELETE /api/devices`
- `GET /api/plans`
- `GET /api/subscriptions`
- `POST /api/subscriptions/renew`
- `GET|POST|PUT|DELETE /api/certificates`
- `GET|POST|DELETE /api/codes`
- `GET /api/activity-logs`

## الاختبارات

```bash
npm test
```

الاختبارات تغطي:

- Login وJWT
- حماية المسارات
- CRUD للمستخدمين
- فلترة المستخدمين وتجديد الاشتراكات
- إدارة الشهادات وأكواد التفعيل
