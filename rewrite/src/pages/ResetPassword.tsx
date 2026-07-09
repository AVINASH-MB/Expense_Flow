import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthAPI } from "@/services/endpoints";

export function ResetPasswordPage() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  if (!token) return (
    <AuthLayout title="Invalid link">
      <p className="text-sm text-slate-600">This reset link is invalid or has expired.</p>
      <Link to="/forgot-password" className="mt-4 inline-block text-brand-600 hover:underline text-sm">Request a new one</Link>
    </AuthLayout>
  );
  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password">
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault(); setErr(null); setLoading(true);
        try { await AuthAPI.reset(token, password); nav("/login", { replace: true }); }
        catch (e: any) { setErr(e?.response?.data?.error || "Reset failed"); }
        finally { setLoading(false); }
      }}>
        <Input label="New password" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" className="w-full" loading={loading}>Update password</Button>
      </form>
    </AuthLayout>
  );
}
