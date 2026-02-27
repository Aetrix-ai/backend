# Aetrix Backend

A comprehensive backend service for the Aetrix portfolio management platform, featuring AI-powered website generation, user authentication, and media management capabilities.

## 🚀 Overview

Aetrix Backend is a TypeScript-based Express.js server that provides:
- **User Authentication & Authorization** - JWT-based auth with role management (Student/Faculty)
- **Portfolio Management** - CRUD operations for projects, achievements, and skills
- **AI-Powered Generation** - LangChain-based agents for intelligent website creation
- **Media Management** - ImageKit integration for image/video uploads
- **GitHub Integration** - Repository management and deployment
- **Public API** - Endpoints for portfolio data access

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ database
- **ImageKit** account (for media storage)
- **OpenAI API** key (for AI features)
- **GitHub** account (optional, for repository integration)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/Aetrix-ai/backend.git
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**

Using Docker Compose (recommended):
```bash
docker-compose up -d
```

Or use your own PostgreSQL instance and update `DATABASE_URL` in `.env`.

5. **Run Prisma migrations**
```bash
npx prisma migrate dev
```

6. **Generate Prisma Client**
```bash
npx prisma generate
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following:

#### **Application Settings**
- `NODE_ENV` - Environment mode (`development` | `production`)
- `PORT` - Server port (default: `3000`)

#### **Database**
- `DATABASE_URL` - PostgreSQL connection string
  ```
  postgresql://user:password@host:port/database?schema=public
  ```

#### **Authentication**
- `USER_JWT_SECRET` - Secret for user JWT tokens (use strong random string)
- `ADMIN_JWT_SECRET` - Secret for admin JWT tokens (use strong random string)
- `BCRYPT_SALT_ROUNDS` - Password hashing rounds (default: `10`)

#### **AI Provider**
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `AI_PROVIDER` - AI provider name (default: `openai`)
- `AI_TEMPERATURE` - Model temperature 0.0-1.0 (default: `0.7`)
- `AI_MAX_TOKENS` - Maximum tokens per request (default: `1500`)

#### **ImageKit (Media Storage)**
- `IMAGEKIT_PUBLIC_KEY` - ImageKit public key
- `IMAGEKIT_PRIVATE_KEY` - ImageKit private key
- `IMAGEKIT_URL_ENDPOINT` - ImageKit URL endpoint

#### **GitHub Integration (Optional)**
- `GITHUB_TOKEN` - GitHub personal access token
- `GITHUB_OWNER` - Default repository owner

#### **Redis (Optional)**
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

#### **Admin Initialization**
- `INIT_ADMIN` - Set to `true` to create initial admin on startup
- `SUPERADMIN_EMAIL` - Initial admin email
- `SUPERADMIN_PASSWORD` - Initial admin password (use strong password)

#### **Logging**
- `LOG_LEVEL` - Pino log level (`trace` | `debug` | `info` | `warn` | `error` | `fatal`)

### Docker Compose Database

The included `docker-compose.yml` provides a PostgreSQL instance:

```yaml
# Default credentials
POSTGRES_USER: aetrix
POSTGRES_PASSWORD: aetrix_password
POSTGRES_DB: aetrix_db_dev
Port: 5432
```

Connection string: `postgresql://aetrix:aetrix_password@localhost:5432/aetrix_db_dev?schema=public`

## 🚦 Running the Application

### Development Mode
```bash
npm run dev
```
Compiles TypeScript and runs the server with hot reload.

### Production Build
```bash
npm run build
npm start
```

### Database Management
```bash
# Run migrations
npx prisma migrate dev

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## 📁 Project Structure

```
aetrix-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration history
├── src/
│   ├── config.ts              # Configuration loader
│   ├── server.ts              # Express server setup
│   ├── index.ts               # Application entry point
│   ├── lib/
│   │   ├── logger.ts          # Pino logger configuration
│   │   └── schema.ts          # Zod validation schemas
│   ├── middlewares/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── user.ts            # User management
│   │   ├── project.ts         # Project CRUD
│   │   ├── achievment.ts      # Achievement CRUD
│   │   ├── media.ts           # Media upload/management
│   │   ├── ai.ts              # AI generation endpoints
│   │   ├── github.ts          # GitHub integration
│   │   ├── vercel.ts          # Vercel deployment
│   │   └── public.ts          # Public portfolio API
│   └── services/
│       ├── ai/
│       │   ├── agent.ts       # Main AI agent
│       │   ├── deep-agent.ts  # DeepAgents integration
│       │   ├── chat.ts        # Chat streaming
│       │   ├── tools.ts       # LangChain tools
│       │   ├── sandbox.ts     # E2B code execution
│       │   └── skills/        # AI agent skills
│       ├── imagekit/
│       │   └── client.ts      # ImageKit SDK wrapper
│       ├── git/
│       │   └── github.ts      # GitHub API client
│       └── redis/
│           └── redis.ts       # Redis client (rate limiting)
├── .env.example               # Environment template
├── docker-compose.yml         # PostgreSQL container
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `POST /user/skills` - Add skills
- `DELETE /user/skills/:id` - Remove skill

### Projects
- `GET /project` - List user projects
- `POST /project` - Create project
- `PUT /project/:id` - Update project
- `DELETE /project/:id` - Delete project

### Achievements
- `GET /achievment` - List achievements
- `POST /achievment` - Create achievement
- `PUT /achievment/:id` - Update achievement
- `DELETE /achievment/:id` - Delete achievement

### Media
- `POST /media/authenticate-upload` - Get ImageKit auth params
- `POST /media/upload` - Upload media file

### AI Generation
- `POST /ai/generate` - Generate website with streaming
- `POST /ai/chat` - Chat with AI agent

### Public API (No Auth Required)
- `GET /public/profile/:id` - Get user profile
- `GET /public/project/:id` - Get user projects
- `GET /public/achievments/:id` - Get user achievements
- `GET /public/skills/:id` - Get user skills

### GitHub Integration
- `POST /github/create-repo` - Create GitHub repository
- `POST /github/push-code` - Push code to repository

## 🤖 AI Features

The backend includes sophisticated AI capabilities powered by LangChain:

### AI Agent Skills
Located in `src/services/ai/skills/`:
- **React Coding** - Generate React components and applications
- **UI Styling** - Apply Tailwind CSS styling
- **Navigate Codebase** - Understand and modify existing code
- **Summarize** - Extract key information from content

### Tools Available to AI
- File system operations (read, write, list)
- Code execution in sandboxed environment (E2B)
- GitHub repository management
- Template rendering
- Dependency management

### Streaming Responses
AI generation endpoints support Server-Sent Events (SSE) for real-time streaming of generated content.

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Keep secrets out of version control
2. **Use strong JWT secrets** - Generate cryptographically secure random strings
3. **Enable HTTPS in production** - Use reverse proxy (nginx, Caddy)
4. **Rotate secrets regularly** - Update API keys and JWT secrets periodically
5. **Validate all inputs** - Zod schemas enforce type safety
6. **Rate limiting** - Implement rate limiting for public endpoints
7. **CORS configuration** - Restrict origins in production

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit

# Lint code
npm run lint
```

## 📊 Database Schema

Key models in Prisma schema:

- **User** - User accounts with authentication
- **Project** - Portfolio projects with media
- **Achievement** - User achievements with media
- **Skill** - User skills with proficiency levels
- **Media** - Uploaded images/videos (ImageKit references)
- **Admin** - Admin users with elevated permissions

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs database

# Restart database
docker-compose restart database
```

### Migration Errors
```bash
# Reset database (⚠️ deletes data)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate
```

### Port Already in Use
```bash
# Change PORT in .env or kill process
lsof -ti:3000 | xargs kill -9
```

### TypeScript Compilation Errors
```bash
# Clean build
rm -rf dist/
npm run build
```

## 📝 Development Workflow

1. Create feature branch from `main`
2. Make changes and test locally
3. Run type checking: `npx tsc --noEmit`
4. Commit with descriptive messages
5. Push and create pull request
6. Wait for CI/CD checks
7. Merge after review

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production database URL
3. Set strong JWT secrets
4. Configure CORS for your frontend domain
5. Enable HTTPS
6. Set up monitoring and logging

### Recommended Platforms
- **Railway** - Easy deployment with PostgreSQL
- **Render** - Free tier available
- **Vercel** - Serverless functions
- **AWS/GCP/Azure** - Full control

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [LangChain Documentation](https://js.langchain.com/)
- [ImageKit Documentation](https://docs.imagekit.io/)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

ISC License - See LICENSE file for details

## 👥 Support

- **Issues**: [GitHub Issues](https://github.com/Aetrix-ai/backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Aetrix-ai/backend/discussions)

---

Built with ❤️ by the Aetrix Team
