# Developer Certificates and UDID Registration System

A comprehensive system for managing developer certificates and UDID (Unique Device Identifier) registration for users.

## Features

- 🔐 Developer Certificate Management
  - Certificate generation and validation
  - Expiration tracking
  - Certificate revocation system
  - Renewal process

- 📱 UDID Registration System
  - User registration with UDID capture
  - Device identification and tracking
  - User profile management
  - Device association

- 👥 User Management
  - User authentication and authorization
  - Role-based access control (Admin, Developer, User)
  - Profile management

- 📊 Dashboard & Monitoring
  - Real-time monitoring
  - Audit logging
  - Analytics

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB
- **Frontend**: React, TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **API Docs**: Swagger/OpenAPI
- **Containerization**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5+
- Docker & Docker Compose (optional)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/tawbb52/developer-certificates-udid.git
cd developer-certificates-udid
```

2. Set up environment variables
```bash
cp .env.example .env
```

3. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Running Locally

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

### Running with Docker

```bash
docker-compose up -d
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

## Project Structure

```
developer-certificates-udid/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.ts
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Certificates
- `GET /api/certificates` - List certificates
- `POST /api/certificates` - Create certificate
- `GET /api/certificates/:id` - Get certificate
- `PUT /api/certificates/:id` - Update certificate
- `DELETE /api/certificates/:id` - Revoke certificate
- `GET /api/certificates/validate` - Validate certificate

### UDID
- `GET /api/udid` - List UDIDs
- `POST /api/udid` - Register UDID
- `GET /api/udid/:id` - Get UDID
- `PUT /api/udid/:id` - Update UDID
- `DELETE /api/udid/:id` - Delete UDID
- `GET /api/udid/validate` - Validate UDID

### Users (Admin only)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Audit Logs (Admin only)
- `GET /api/audit-logs` - Get audit logs

## Environment Configuration

Create a `.env` file:

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/dev-certs-udid
MONGODB_TEST_URI=mongodb://localhost:27017/dev-certs-udid-test

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRY=30d

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

## Testing

### Backend Tests
```bash
cd backend
npm run test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, open an issue on GitHub.

---

**Created by**: tawbb52
**Last Updated**: 2026-07-01