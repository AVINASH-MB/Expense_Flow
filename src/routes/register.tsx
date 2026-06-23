import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, SubmitButton } from "@/components/auth/AuthLayout";
import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — ExpenseFlow" }, { name: "description", content: "Create your free ExpenseFlow account." }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setErr(e.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever. No credit card required."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-foreground hover:underline">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoComplete="name" />
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
        {err && <p className="text-sm text-brand-rose">{err}</p>}
        <SubmitButton loading={loading}>Create account</SubmitButton>
        <p className="text-center text-xs text-muted-foreground">By signing up, you agree to our Terms and Privacy Policy.</p>
      </form>
    </AuthLayout>
  );
}
