# API Overview

## Base URL
`http://localhost:4000`

## Endpoints

### GET /health
يفحص حالة السيرفر.

### GET /apps
يعيد جميع التطبيقات.

### GET /apps/:id
يعيد تطبيقًا واحدًا حسب المعرف.

### POST /apps
ينشئ تطبيقًا جديدًا.

Body example:
```json
{
  "name": "My App",
  "bundleId": "com.example.myapp",
  "version": "1.0.0",
  "description": "Example description",
  "iconUrl": "https://example.com/icon.png",
  "websiteUrl": "https://example.com",
  "category": "Utilities"
}
```

### PUT /apps/:id
يعدّل تطبيقًا موجودًا.

### DELETE /apps/:id
يحذف تطبيقًا.
