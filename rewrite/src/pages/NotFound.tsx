import { Link } from "react-router-dom";
export function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6">
      <div className="text-center">
        <p className="text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="mt-6 inline-block rounded-lg bg-brand-600 text-white px-4 h-10 leading-10">Back to dashboard</Link>
      </div>
    </div>
  );
}
