"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Modal, Switch } from "antd"
import { AlertTriangle, BellRing, CheckCircle2, Download, Play, Square } from "lucide-react"
import { toast } from "sonner"
import {
  ADZAN_SOUNDS,
  PRAYERS,
  PRAYER_LABEL,
  REMINDER_OPTIONS,
  SELECTABLE_SOUNDS,
  useAdzanSettings,
  useAdzanUi,
  type AdzanSoundId,
} from "@/lib/adzan/settings"
import { onAdzanEnded, playAdzanSound, stopAdzanSound } from "@/lib/adzan/player"
import {
  exactAlarmStatus,
  getNativeStatus,
  isNativeApp,
  onNativeStatus,
  openExactAlarmSetting,
  requestNativePermission,
  scheduleTestNotification,
  type NativeScheduleStatus,
} from "@/lib/adzan/native"

const APK_URL = "https://github.com/yusezmann/quran-apps/releases/latest/download/quran-apps.apk"

/** Pengaturan adzan: aktif/nonaktif, per waktu sholat, suara, pengingat. */
export default function AdzanSettingsModal() {
  const open = useAdzanUi((s) => s.settingsOpen)
  const close = useAdzanUi((s) => s.closeSettings)
  const settings = useAdzanSettings()
  const [native] = useState(isNativeApp)
  const [previewing, setPreviewing] = useState<AdzanSoundId | null>(null)
  const [exactAlarm, setExactAlarm] = useState<"granted" | "denied" | "unknown">("unknown")
  const [nativeStatus, setNativeStatus] = useState<NativeScheduleStatus>(getNativeStatus)
  const [testing, setTesting] = useState(false)

  useEffect(() => onNativeStatus(setNativeStatus), [])
  // Perbarui status izin alarm saat kembali dari Pengaturan Android
  useEffect(() => {
    if (!open || !native) return
    const refresh = () => document.visibilityState === "visible" && exactAlarmStatus().then(setExactAlarm)
    document.addEventListener("visibilitychange", refresh)
    return () => document.removeEventListener("visibilitychange", refresh)
  }, [open, native])

  const runTest = async () => {
    setTesting(true)
    try {
      await scheduleTestNotification(settings.sound)
      toast.success("Notifikasi uji akan berbunyi dalam 10 detik. Coba kunci layar sekarang.")
    } catch (e: any) {
      toast.error("Tes gagal: " + (e?.message ?? "error tidak diketahui"))
    } finally {
      setTimeout(() => setTesting(false), 10_000)
    }
  }

  useEffect(() => onAdzanEnded(() => setPreviewing(null)), [])
  useEffect(() => {
    if (open && native && settings.enabled) exactAlarmStatus().then(setExactAlarm)
  }, [open, native, settings.enabled])

  const stopPreview = () => {
    stopAdzanSound()
    setPreviewing(null)
  }

  const togglePreview = async (id: AdzanSoundId) => {
    if (previewing === id) return stopPreview()
    const result = await playAdzanSound(id)
    setPreviewing(result === "playing" ? id : null)
  }

  // Izin diminta saat pengguna menyalakan adzan (gesture), bukan otomatis saat halaman dibuka
  const setEnabled = async (on: boolean) => {
    if (!on) return settings.update({ enabled: false })

    if (native) {
      const granted = await requestNativePermission().catch(() => false)
      if (!granted) {
        toast.error("Izin notifikasi ditolak. Aktifkan di Pengaturan Android agar adzan bisa berbunyi.")
        return
      }
    } else if (typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission().catch(() => "denied")
    }
    settings.update({ enabled: true })
    toast.success("Adzan diaktifkan")
  }

  return (
    <Modal
      title="Pengaturan Adzan"
      open={open}
      onCancel={() => {
        stopPreview()
        close()
      }}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-5">
        {/* Aktif / nonaktif */}
        <label className="flex items-center justify-between gap-4 rounded-xl bg-green-50 p-3">
          <span className="leading-snug">
            <span className="block font-semibold text-gray-900">Aktifkan adzan</span>
            <span className="text-sm text-gray-600">Bunyikan adzan saat masuk waktu sholat</span>
          </span>
          <Switch checked={settings.enabled} onChange={setEnabled} aria-label="Aktifkan adzan" />
        </label>

        <fieldset disabled={!settings.enabled} className={settings.enabled ? "" : "opacity-50"}>
          {/* Per waktu sholat */}
          <legend className="mb-2 text-sm font-semibold text-gray-900">Waktu sholat</legend>
          <div className="grid grid-cols-1 gap-1">
            {PRAYERS.map((prayer) => (
              <label key={prayer} className="flex items-center justify-between rounded-lg px-1 py-1.5">
                <span className="text-gray-800">
                  {PRAYER_LABEL[prayer]}
                  {prayer === "subuh" && <span className="ml-2 text-xs text-gray-500">memakai Adzan Subuh</span>}
                </span>
                <Switch
                  size="small"
                  checked={settings.prayers[prayer]}
                  disabled={!settings.enabled}
                  onChange={(on) => settings.togglePrayer(prayer, on)}
                  aria-label={`Adzan ${PRAYER_LABEL[prayer]}`}
                />
              </label>
            ))}
          </div>

          {/* Suara */}
          <p className="mb-2 mt-5 text-sm font-semibold text-gray-900">Suara adzan</p>
          <div className="space-y-2">
            {[...SELECTABLE_SOUNDS, "subuh" as const].map((id) => {
              const selectable = SELECTABLE_SOUNDS.includes(id)
              const selected = settings.sound === id
              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    selected ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  {selectable ? (
                    <input
                      type="radio"
                      name="adzan-sound"
                      id={`sound-${id}`}
                      checked={selected}
                      disabled={!settings.enabled}
                      onChange={() => settings.update({ sound: id })}
                      className="h-4 w-4 accent-green-600"
                    />
                  ) : (
                    <span className="h-4 w-4" />
                  )}
                  <label htmlFor={`sound-${id}`} className="flex-1 leading-snug text-gray-800">
                    {ADZAN_SOUNDS[id].label}
                    {!selectable && <span className="block text-xs text-gray-500">Otomatis untuk waktu Subuh</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => togglePreview(id)}
                    disabled={false}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-green-500 hover:text-green-700"
                  >
                    {previewing === id ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {previewing === id ? "Stop" : "Coba"}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Pengingat */}
          <label htmlFor="adzan-reminder" className="mb-2 mt-5 block text-sm font-semibold text-gray-900">
            Pengingat sebelum waktu sholat
          </label>
          <select
            id="adzan-reminder"
            value={settings.reminderMinutes}
            disabled={!settings.enabled}
            onChange={(e) => settings.update({ reminderMinutes: Number(e.target.value) as never })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
          >
            {REMINDER_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m === 0 ? "Tidak ada" : `${m} menit sebelumnya`}
              </option>
            ))}
          </select>
        </fieldset>

        {/* Keterbatasan & izin */}
        {native && settings.enabled && exactAlarm === "denied" && (
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="leading-snug">
              Izin <b>alarm tepat waktu</b> belum aktif, adzan bisa terlambat beberapa menit.{" "}
              <button type="button" onClick={openExactAlarmSetting} className="font-semibold underline">
                Izinkan
              </button>
            </div>
          </div>
        )}
        {native && settings.enabled && (
          <div className="space-y-3 rounded-xl border border-gray-200 p-3 text-sm">
            <NativeStatusLine status={nativeStatus} />
            <button
              type="button"
              onClick={runTest}
              disabled={testing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-green-600 px-3 py-2 font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
            >
              <BellRing className="h-4 w-4" />
              {testing ? "Menunggu notifikasi uji..." : "Tes notifikasi adzan (10 detik)"}
            </button>
            <p className="leading-snug text-xs text-gray-500">
              Jika tes tidak berbunyi: pastikan notifikasi aplikasi diizinkan, mode senyap/Jangan Ganggu mati,
              dan nonaktifkan <b>penghemat baterai</b> untuk aplikasi ini (Pengaturan → Aplikasi → Quran Apps →
              Baterai → Tidak dibatasi).
            </p>
          </div>
        )}
        {!native && (
          <div className="rounded-xl bg-gray-50 p-3 text-sm leading-snug text-gray-600">
            Di browser, adzan hanya berbunyi <b>selama aplikasi terbuka</b>. Agar adzan tetap berbunyi saat layar mati,
            gunakan aplikasi Android.
            <Link href={APK_URL} className="mt-2 flex items-center gap-1.5 font-semibold text-green-700 hover:underline">
              <Download className="h-4 w-4" /> Unduh aplikasi Android
            </Link>
          </div>
        )}
      </div>
    </Modal>
  )
}

function NativeStatusLine({ status }: { status: NativeScheduleStatus }) {
  if (status.state === "scheduled") {
    const at = status.next ? new Date(status.next.at) : null
    return (
      <p className="flex items-start gap-2 leading-snug text-gray-700">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
        <span>
          {status.count} adzan terjadwal di HP ini
          {status.next && at && (
            <>
              {" "}
              · berikutnya <b>{status.next.title.replace("Waktu ", "")}</b>{" "}
              {at.toLocaleString("id-ID", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
            </>
          )}
          {!status.exact && <span className="block text-xs text-amber-700">Mode alarm biasa (bisa terlambat beberapa menit)</span>}
        </span>
      </p>
    )
  }
  if (status.state === "no-permission")
    return (
      <p className="flex items-start gap-2 leading-snug text-red-700">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Izin notifikasi belum diberikan. Matikan lalu nyalakan lagi &quot;Aktifkan adzan&quot;, atau izinkan di Pengaturan Android.
      </p>
    )
  if (status.state === "error")
    return (
      <p className="flex items-start gap-2 leading-snug text-red-700">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Gagal menjadwalkan adzan: {status.message}
      </p>
    )
  return <p className="leading-snug text-gray-500">Menyiapkan jadwal adzan...</p>
}
