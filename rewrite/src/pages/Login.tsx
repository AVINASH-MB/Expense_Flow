import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={async (e) => {
        e.preventDefault(); setErr(null); setLoading(true);
        try { await login(email, password); nav(loc.state?.from || "/dashboard", { replace: true }); }
        catch (e: any) { setErr(e?.response?.data?.error || "Login failed"); }
        finally { setLoading(false); }
      }} className="space-y-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" className="w-full" loading={loading}>Sign in</Button>
        <div className="flex justify-between text-sm">
          <Link to="/forgot-password" className="text-brand-600 hover:underline">Forgot password?</Link>
          <Link to="/register" className="text-brand-600 hover:underline">Create account</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
