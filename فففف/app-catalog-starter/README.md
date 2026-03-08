# App Catalog Starter

هذا مشروع بداية آمن وقانوني لمنصة **كتالوج تطبيقات** يتكون من:

- `server/` واجهة API بسيطة بإستخدام Node.js + TypeScript + Express
- `admin-web/` لوحة إدارة ويب بإستخدام React + Vite
- `ios-app/` تطبيق iOS بإستخدام SwiftUI لعرض التطبيقات من الـ API
- `docs/` توثيق مختصر للهيكل وواجهات الـ API

## ما الذي يقدمه هذا المشروع؟
- عرض قائمة تطبيقات
- صفحة تفاصيل لكل تطبيق
- لوحة إدارة لإضافة/تعديل/حذف التطبيقات في ملف JSON محلي
- تطبيق iOS يقرأ من السيرفر ويعرض القائمة والتفاصيل

## ما الذي لا يقدمه؟
- لا يحتوي على آليات sideloading أو توقيع شهادات أو تجاوزات تخص أنظمة آبل
- لا يحتوي على متجر بديل أو وظائف نشر خارج قنوات آبل الرسمية

## التشغيل السريع

### 1) تشغيل السيرفر
```bash
cd server
npm install
npm run dev
```
السيرفر يعمل افتراضيًا على:
`http://localhost:4000`

### 2) تشغيل لوحة الإدارة
```bash
cd admin-web
npm install
npm run dev
```
الواجهة تعمل افتراضيًا على:
`http://localhost:5173`

### 3) تشغيل تطبيق iOS
- افتح مجلد `ios-app/AppCatalog` في Xcode
- عدّل رابط الـ API داخل `APIClient.swift` إذا لزم
- شغّل التطبيق على Simulator

## رفعه إلى GitHub
```bash
git init
git add .
git commit -m "Initial app catalog starter"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

## البيئة المقترحة لاحقًا
- قاعدة بيانات PostgreSQL بدل JSON
- تسجيل دخول للإدارة
- تخزين صور/أيقونات على S3 أو Cloudinary
- CI/CD
- توثيق OpenAPI
