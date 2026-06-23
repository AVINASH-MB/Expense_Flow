# ExpenseFlow API — Express + MySQL + JWT

Reference backend for the ExpenseFlow frontend. Implements every endpoint the
frontend in `src/lib/api-services.ts` calls.

## Quick start

```bash
cd server
cp .env.example .env          # then edit DB creds + JWT_SECRET
npm install
mysql -u root -p < schema.sql # creates DB + tables
npm run dev                   # nodemon on http://localhost:4000
```

Then in the frontend root create `.env`:

```
VITE_API_URL=http://localhost:4000
```

Restart the frontend dev server. Register a new account from the app and the
data persists in MySQL.

## Architecture

```
server/
├── schema.sql                 # MySQL DDL — run once
├── src/
│   ├── index.js               # Express app + CORS + JSON + routes
│   ├── db.js                  # mysql2/promise pool
│   ├── middleware/
│   │   ├── auth.js            # JWT verification → req.user = { id, role }
│   │   └── admin.js           # require role = 'admin'
│   ├── services/
│   │   └── alerts.js          # budget-exceeded + goal-achieved generation
│   └── routes/
│       ├── auth.js            # /login /register /forgot-password /me
│       ├── transactions.js    # CRUD + filters
│       ├── budgets.js         # CRUD
│       ├── goals.js           # CRUD
│       ├── notifications.js   # list, mark-read, delete, broadcast (admin)
│       ├── settings.js        # GET/PUT notification preferences
│       └── admin.js           # /users CRUD (admin only)
```

## Auth contract

- `POST /api/auth/register` → `{ user, token }`
- `POST /api/auth/login`    → `{ user, token }`
- `GET  /api/auth/me`       → `user`  (Bearer required)

Token is a JWT signed with `JWT_SECRET`. Frontend stores it in `localStorage`
under `expenseflow.auth` and sends `Authorization: Bearer <token>` on every
request (see `src/lib/api.ts`).

## Tables

`users · transactions · budgets · goals · notifications · settings`
Full DDL in `schema.sql`. Every per-user table has a `user_id` FK with
`ON DELETE CASCADE` and is scoped by `req.user.id` in every query.

## Notes

- Passwords hashed with `bcryptjs` (cost 10).
- Alerts generated server-side: after each transaction insert, recompute the
  current month's category spend and insert a `notifications` row if a budget
  is exceeded (deduplicated by `(user_id, type, ref_key)` unique index).
- The first registered user becomes `admin`; subsequent users are `user`.
  Adjust in `routes/auth.js` to match your policy.
