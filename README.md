# Backend

This repository contains the backend for the project. This README explains how to configure environment variables and run the project locally.

## Environment

A sample file with safe example values is provided at `.env.example`. Copy it to `.env` and update values before running the app:

```bash
cp .env.example .env
# then edit .env with your editor
```

Important environment variables (also listed in `.env.example`):

- NODE_ENV — environment (development | production)
- PORT — port the server listens on
- DATABASE_URL — PostgreSQL connection string used by Prisma
- USER_JWT_SECRET — secret used to sign user JWTs (use a strong random string)
- ADMIN_JWT_SECRET — secret used to sign admin JWTs (use a strong random string)
- OPENAI_API_KEY — API key for the AI provider (keep secret)
- AI_PROVIDER — provider name (default: `openai`)
- AI_TEMPERATURE — model sampling temperature (0.0 - 1.0)
- AI_MAX_TOKENS — max tokens to request from AI provider
- BCRYPT_SALT_ROUNDS — bcrypt rounds for hashing (integer)
- INIT_ADMIN — set to `true` to initialize a superadmin (requires SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD)
- SUPERADMIN_EMAIL — email for initial admin
- SUPERADMIN_PASSWORD — password for initial admin
- LOG_LEVEL — pino logging level (trace | debug | info | warn | error | fatal)

Notes and best practices

- Never commit real secrets or API keys to source control. Use secret managers or environment-specific stores for production.
- In production set `NODE_ENV=production` and ensure `DATABASE_URL`, `USER_JWT_SECRET`, `ADMIN_JWT_SECRET`, and `OPENAI_API_KEY` are set to secure values.
- Only enable `INIT_ADMIN=true` when you intend to create an initial superadmin; make sure `SUPERADMIN_PASSWORD` is strong and then disable the initialization.

## Install and run

This project uses TypeScript compiled to `dist` and Node to run the compiled output.

1. Install dependencies:

```bash
npm install
```

2. Build & run in development (this project exposes a `dev` script in `package.json`):

```bash
npm run dev
```

The `dev` script runs `tsc -b && node dist/index.js` — it compiles TypeScript and then runs the compiled Node app.

# Backend

This repository contains the backend for the project. This README explains how to configure environment variables and run the project locally.

## Environment

A sample file with safe example values is provided at `.env.example`. Copy it to `.env` and update values before running the app:

```bash
cp .env.example .env
# then edit .env with your editor
```

Important environment variables (also listed in `.env.example`):

- NODE_ENV — environment (development | production)
- PORT — port the server listens on
- DATABASE_URL — PostgreSQL connection string used by Prisma
- USER_JWT_SECRET — secret used to sign user JWTs (use a strong random string)
- ADMIN_JWT_SECRET — secret used to sign admin JWTs (use a strong random string)
- OPENAI_API_KEY — API key for the AI provider (keep secret)
- AI_PROVIDER — provider name (default: `openai`)
- AI_TEMPERATURE — model sampling temperature (0.0 - 1.0)
- AI_MAX_TOKENS — max tokens to request from AI provider
- BCRYPT_SALT_ROUNDS — bcrypt rounds for hashing (integer)
- INIT_ADMIN — set to `true` to initialize a superadmin (requires SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD)
- SUPERADMIN_EMAIL — email for initial admin
- SUPERADMIN_PASSWORD — password for initial admin
- LOG_LEVEL — pino logging level (trace | debug | info | warn | error | fatal)

Notes and best practices

- Never commit real secrets or API keys to source control. Use secret managers or environment-specific stores for production.
- In production set `NODE_ENV=production` and ensure `DATABASE_URL`, `USER_JWT_SECRET`, `ADMIN_JWT_SECRET`, and `OPENAI_API_KEY` are set to secure values.
- Only enable `INIT_ADMIN=true` when you intend to create an initial superadmin; make sure `SUPERADMIN_PASSWORD` is strong and then disable the initialization.

## Install and run

This project uses TypeScript compiled to `dist` and Node to run the compiled output.

1. Install dependencies:

```bash
npm install
```

2. Build & run in development (this project exposes a `dev` script in `package.json`):

```bash
npm run dev
```

The `dev` script runs `tsc -b && node dist/index.js` — it compiles TypeScript and then runs the compiled Node app.

## File structure

The current project layout (reflects the workspace at the time of writing):

```
docker-compose.yml
package.json
tsconfig.json
prisma/
	schema.prisma
	migrations/
		migration_lock.toml
		20251014161315_init/
			migration.sql
		20251025111719_achievemets_projects/
			migration.sql
		20251025191138_project_schema_changed/
			migration.sql
		20251108091659_admin/
			migration.sql
src/
	config.ts
	index.ts
	lib/
		logger.ts
		schema.ts
	middlewares/
		auth.ts
	routes/
		admin.ts
		ai.ts
		event.ts
		user.ts
	services/
		ai/
			pipeline.ts
			agents/
				enrichment-agent.ts
				generator-agent.ts
				propmts.ts
				techstack-agent.ts
				todo-agent.ts
				validator-agent.ts
		auth/
			todo.md
```

> Note: this structure reflects the current repository snapshot and may change as features are added.

## Database / Prisma

The project uses Prisma. If you change the Prisma schema, run migrations with the Prisma CLI. Example (make sure `DATABASE_URL` is set correctly in your environment):

```bash
npx prisma migrate dev
# or to apply migrations in other environments
npx prisma migrate deploy
```

If you need to inspect the database locally, you can run:

```bash
npx prisma studio
```

## Troubleshooting

- If the app errors on startup about missing environment variables, double-check your `.env` and that `NODE_ENV` is set appropriately. For `production`, the code validates that several secrets and the database URL are present and will throw errors otherwise.

## Contributing

Please follow the repository conventions and open issues or PRs on GitHub.

---

If you'd like, I can also add a small npm script to copy `.env.example` to `.env` (e.g., `setup:env`) or generate strong example secrets for the `.env.example`. Let me know which you'd prefer.
