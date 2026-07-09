import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <AuthLayout title="Create account" subtitle="Start tracking in seconds">
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault(); setErr(null); setLoading(true);
        try { await register(f.name, f.email, f.password); nav("/dashboard", { replace: true }); }
        catch (e: any) { setErr(e?.response?.data?.error || "Registration failed"); }
        finally { setLoading(false); }
      }}>
        <Input label="Name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input label="Email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Input label="Password" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" className="w-full" loading={loading}>Create account</Button>
        <p className="text-sm text-center">Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Sign in</Link></p>
      </form>
    </AuthLayout>
  );
}
