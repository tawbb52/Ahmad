# Xtream IPTV Admin Dashboard

لوحة تحكم أساسية لإدارة خدمة Xtream IPTV تشمل:

- Dashboard للإحصائيات (المستخدمون النشطون / القنوات والبث / الإيرادات اليومية)
- إدارة المستخدمين والاشتراكات والجلسات النشطة
- إدارة القنوات والبث المباشر وجودة البث (SD/HD/FHD)
- نظام دفع وفواتير (Stripe/PayPal) مع تقارير إيرادات
- نظام أمان: JWT + تشفير كلمات المرور + تتبع محاولات الوصول

## الملفات

```text
/home/runner/work/Ahmad/Ahmad/
├── index.html           # واجهة لوحة التحكم (Bootstrap + RTL)
├── style.css            # تنسيقات الواجهة
├── script.js            # منطق الواجهة والإحصائيات
├── api.py               # REST API بسيطة بلغة Python
├── database_schema.sql  # نموذج قاعدة البيانات (PostgreSQL/MySQL-compatible style)
└── README.md
```

## تشغيل الواجهة

افتح الملف `index.html` في المتصفح.

## تشغيل API

```bash
cd /home/runner/work/Ahmad/Ahmad
python3 api.py
```

سيرفر API يعمل على:
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET/POST/PUT/DELETE /api/users`
- `GET/POST /api/channels`
- `GET /api/streams`
- `POST /api/payments`
- `GET /api/invoices`
- `GET /api/security/access-logs`

> ملاحظة: جميع الـ endpoints (عدا `health` و `login`) تتطلب ترويسة Authorization مع JWT صالح.

## نموذج قاعدة البيانات

شغّل ملف `database_schema.sql` على PostgreSQL أو MySQL (قد تحتاج تعديلات بسيطة حسب المحرك) لإنشاء الجداول المطلوبة:
- users, subscriptions, user_sessions
- channels, live_streams
- payments, invoices
- access_logs
