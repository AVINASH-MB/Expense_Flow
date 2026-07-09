# ExpenseFlow (Rewrite)

React 19 + TypeScript + Vite frontend and Express + MySQL backend.

## Quick start

```bash
# Backend
cd server
cp .env.example .env      # set DB + JWT + SMTP values
npm install
npm run db:init           # loads schema.sql
npm run dev               # http://localhost:4000

# Frontend (new terminal, from repo root)
cp .env.example .env      # VITE_API_URL=http://localhost:4000
npm install
npm run dev               # http://localhost:5173
```

## Stack

- React 19, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, Recharts, Framer Motion, React Hook Form, Lucide React
- Node.js, Express, MySQL (mysql2), JWT + bcrypt, Multer, Nodemailer

## Structure

```
src/                Frontend
  assets/ components/{dashboard,charts,forms,layout,auth,ui}/
  context/ hooks/ pages/ routes/ services/ types/ utils/
  App.tsx main.tsx index.css
server/             Backend
  config/ controllers/ middleware/ models/ routes/ services/
  uploads/ utils/ server.js
```
