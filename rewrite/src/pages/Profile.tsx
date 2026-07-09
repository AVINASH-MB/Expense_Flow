import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { AuthAPI } from "@/services/endpoints";

export function ProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <Card>
        <CardHeader title="Personal information" />
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault(); setBusy(true); setMsg(null);
          try {
            await AuthAPI.updateProfile({ name, email, ...(password ? { password } : {}) });
            await refresh(); setPassword(""); setMsg("Saved");
          } catch (e: any) { setMsg(e?.response?.data?.error || "Failed"); }
          finally { setBusy(false); }
        }}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="New password (optional)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {msg && <p className="text-sm text-slate-600">{msg}</p>}
          <Button type="submit" loading={busy}>Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
