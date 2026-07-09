import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthAPI } from "@/services/endpoints";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <AuthLayout title="Forgot password" subtitle="We'll email you a reset link">
      {sent ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          If an account exists for <b>{email}</b>, a reset link is on its way.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault(); setLoading(true);
          try { await AuthAPI.forgot(email); setSent(true); } finally { setLoading(false); }
        }}>
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
        </form>
      )}
      <p className="mt-4 text-sm text-center">
        <Link to="/login" className="text-brand-600 hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
