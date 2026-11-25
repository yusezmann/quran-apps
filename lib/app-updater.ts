import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core"

/**
 * Pembaruan APK dari dalam aplikasi (android/app/src/main/java/com/quran/apps/update).
 * PENTING: objek plugin Capacitor adalah Proxy; jangan di-`await` atau dikembalikan dari fungsi async.
 */
interface AppUpdaterPlugin {
  download(options: { url: string }): Promise<{ bytes: number }>
  install(): Promise<{ needsPermission: boolean }>
  addListener(event: "progress", cb: (data: { percent: number }) => void): Promise<PluginListenerHandle>
}

const AppUpdater = registerPlugin<AppUpdaterPlugin>("AppUpdater")

/** Ada di APK versi baru saja; APK lama memakai cara lama (unduh lewat browser). */
export const inAppUpdateAvailable = () => Capacitor.getPlatform() === "android" && Capacitor.isPluginAvailable("AppUpdater")

/** Unduh APK; `onProgress` menerima 0–100. */
export async function downloadUpdate(url: string, onProgress: (percent: number) => void): Promise<void> {
  const handle = await AppUpdater.addListener("progress", (d) => onProgress(d.percent))
  try {
    await AppUpdater.download({ url })
  } finally {
    await handle.remove()
  }
}

/** Buka layar pemasangan Android. `needsPermission` = pengguna diarahkan ke izin "instal aplikasi tidak dikenal". */
export async function installUpdate(): Promise<{ needsPermission: boolean }> {
  return AppUpdater.install()
}
