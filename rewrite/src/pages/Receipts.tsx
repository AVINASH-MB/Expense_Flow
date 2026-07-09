import { useEffect, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ReceiptsAPI } from "@/services/endpoints";
import { formatDate } from "@/utils/format";
import type { Receipt } from "@/types";

export function ReceiptsPage() {
  const [rows, setRows] = useState<Receipt[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const load = () => ReceiptsAPI.list().then(setRows);
  useEffect(() => { load(); }, []);
  const upload = async (file: File) => {
    setErr(null); setBusy(true);
    try { await ReceiptsAPI.upload(file); load(); }
    catch (e: any) { setErr(e?.response?.data?.error || "Upload failed"); }
    finally { setBusy(false); }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Receipts</h1>
      <Card>
        <CardHeader title="Upload receipt" subtitle="PNG, JPG, WebP or PDF up to 5 MB" />
        <input ref={ref} type="file" accept="image/*,application/pdf" hidden
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <Button onClick={() => ref.current?.click()} loading={busy}>
          <Upload className="h-4 w-4" /> Choose file
        </Button>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </Card>
      <Card>
        <CardHeader title="Upload history" />
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3">
              <div>
                <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
                  {r.original}
                </a>
                <p className="text-xs text-slate-500">
                  {(r.size_bytes / 1024).toFixed(1)} KB · {formatDate(r.uploaded_at)}
                </p>
              </div>
              <button onClick={() => ReceiptsAPI.remove(r.id).then(load)} className="p-1 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-center text-slate-500">No receipts yet</li>}
        </ul>
      </Card>
    </div>
  );
}
