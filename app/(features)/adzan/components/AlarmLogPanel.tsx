"use client"

import { useState } from "react"
import { toast } from "sonner"
import { alarmAvailable, alarmLog, clearAlarmLog, type AlarmLogEntry } from "@/lib/adzan/alarm"

const LABEL: Record<string, string> = {
  jadwal: "Jadwal dipasang",
  "alarm-tiba": "Alarm tiba",
  "pemutar-mulai": "Pemutar dijalankan",
  "adzan-berbunyi": "Adzan berbunyi",
  "adzan-selesai": "Adzan selesai",
  "dihentikan-pengguna": "Dihentikan pengguna",
  "dihentikan-sistem": "⚠️ Dihentikan sistem HP",
  "pemutar-ditolak": "⚠️ Pemutar ditolak sistem",
  "startForeground-gagal": "⚠️ Pemutar gagal dijalankan",
  "notifikasi-cadangan": "⚠️ Hanya notifikasi cadangan",
  "pemutar-error": "⚠️ Error pemutar",
  "gagal-memutar": "⚠️ Gagal memutar",
  "izin-alarm-ditolak": "⚠️ Izin alarm ditolak",
  "pulihkan-jadwal": "Jadwal dipulihkan",
  "duplikat-diabaikan": "Jalur kedua (diabaikan)",
}

const fmt = (t: number) =>
  new Date(t).toLocaleString("id-ID", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })

const asText = (entries: AlarmLogEntry[]) =>
  entries.map((e) => `${fmt(e.t)} | ${LABEL[e.ev] ?? e.ev} | ${e.d}`).join("\n")

/**
 * Catatan diagnosa alarm adzan (APK). Bila adzan tidak berbunyi, pengguna bisa menyalin catatan ini
 * untuk mengetahui di langkah mana gagal: alarm tidak tiba, pemutar ditolak, volume nol, dihentikan sistem, dll.
 */
export default function AlarmLogPanel() {
  const [entries, setEntries] = useState<AlarmLogEntry[] | null>(null)
  if (!alarmAvailable()) return null

  const load = async () => setEntries((await alarmLog()).slice(-30).reverse())

  return (
    <details
      className="rounded-xl border border-gray-200 p-3 text-sm"
      onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && load()}
    >
      <summary className="cursor-pointer font-semibold text-gray-700">Catatan diagnosa alarm adzan</summary>
      <p className="mt-2 text-xs leading-snug text-gray-500">
        Bila adzan tidak berbunyi, salin catatan ini dan kirimkan ke pengembang. Terbaru di atas.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={async () => {
            const all = await alarmLog()
            try {
              await navigator.clipboard.writeText(asText(all))
              toast.success("Catatan disalin")
            } catch {
              toast.error("Gagal menyalin; tekan lama teks di bawah untuk menyalin manual")
            }
          }}
          className="rounded-lg bg-green-600 px-3 py-1.5 font-medium text-white"
        >
          Salin
        </button>
        <button type="button" onClick={load} className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700">
          Muat ulang
        </button>
        <button
          type="button"
          onClick={async () => {
            await clearAlarmLog()
            setEntries([])
          }}
          className="rounded-lg px-3 py-1.5 text-gray-500 underline"
        >
          Hapus
        </button>
      </div>
      <ol className="mt-2 max-h-64 space-y-1 overflow-y-auto font-mono text-[11px] leading-snug text-gray-700">
        {entries === null ? (
          <li className="text-gray-400">Memuat...</li>
        ) : entries.length === 0 ? (
          <li className="text-gray-400">Belum ada catatan.</li>
        ) : (
          entries.map((e, i) => (
            <li key={i} className={e.ev.includes("gagal") || e.ev.includes("ditolak") || e.ev.includes("error") || e.ev.includes("sistem") || e.ev.includes("cadangan") ? "text-red-700" : ""}>
              <span className="text-gray-400">{fmt(e.t)}</span> {LABEL[e.ev] ?? e.ev} — {e.d}
            </li>
          ))
        )}
      </ol>
    </details>
  )
}
