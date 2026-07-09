import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { NotificationsAPI } from "@/services/endpoints";
import type { Notification } from "@/types";

export function NotificationsPage() {
  const [rows, setRows] = useState<Notification[]>([]);
  const load = () => NotificationsAPI.list().then(setRows);
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Button variant="outline" onClick={() => NotificationsAPI.readAll().then(load)}>Mark all read</Button>
      </div>
      <Card>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((n) => (
            <li key={n.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.read && <Badge tone="brand">New</Badge>}
                    <Badge>{n.type}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{n.message}</p>
                </div>
                <div className="flex gap-2">
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => NotificationsAPI.read(n.id).then(load)}>Read</Button>}
                  <Button size="sm" variant="ghost" onClick={() => NotificationsAPI.remove(n.id).then(load)}>Delete</Button>
                </div>
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-center text-slate-500">No notifications</li>}
        </ul>
      </Card>
    </div>
  );
}
