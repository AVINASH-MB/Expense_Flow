import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AdminAPI } from "@/services/endpoints";
import { useSettings } from "@/context/SettingsContext";

export function AdminPage() {
  const { format } = useSettings();
  const [rows, setRows] = useState<any[]>([]);
  const [title, setTitle] = useState(""); const [message, setMessage] = useState("");
  const load = () => AdminAPI.users().then(setRows);
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <Card>
        <CardHeader title="Broadcast notification" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} className="md:col-span-2" />
        </div>
        <div className="mt-3">
          <Button onClick={async () => { await AdminAPI.broadcast(title, message); setTitle(""); setMessage(""); }}>Send</Button>
        </div>
      </Card>
      <Card>
        <CardHeader title="Users" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Status</th><th className="text-right">Spend</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td><Badge tone={u.role === "admin" ? "brand" : "neutral"}>{u.role}</Badge></td>
                  <td><Badge tone={u.status === "active" ? "success" : "danger"}>{u.status}</Badge></td>
                  <td className="text-right">{format(u.spend)}</td>
                  <td className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => AdminAPI.deleteUser(u.id).then(load)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
