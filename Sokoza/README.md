# Sokoza Phase 1

Phase 1 foundation for Sokoza: a mobile-first Juja demand-discovery platform.

## Included

- Next.js + React + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Responsive public homepage
- "What do you need in Juja?" request screen
- Community demand/poll UI
- Admin dashboard shell
- Database models for users, requests, categories, areas, polls and votes
- PWA manifest
- Sokoza Trust & Growth brand palette

## Setup

1. Extract this ZIP.
2. Open the folder in VS Code.
3. Run:

```bash
npm install
```

4. Copy `.env.example` to `.env` and replace the PostgreSQL password/database details.

5. Create a PostgreSQL database named `sokoza_db`.

6. Run:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

7. Open:

- Public site: http://localhost:3000
- Request UI: http://localhost:3000/request
- Admin foundation: http://localhost:3000/admin

## Important
This ZIP is the Phase 1 foundation. The request form and voting buttons are UI-only in this milestone. Authentication/authorization and live moderation must be implemented before exposing the admin route publicly.

## Next milestone
Phase 1B:
- authentication
- CUSTOMER/ADMIN authorization
- live request submission
- private admin inbox
- approve/reject/edit
- publish polls
- real voting
