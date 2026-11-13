import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationResult {
  latitude: number;
  longitude: number;
}

interface LocationOptions {
  /** true = GPS presisi (lebih lambat & boros); false = jaringan/Wi-Fi, cukup untuk menentukan kota */
  highAccuracy?: boolean;
  /** Boleh memakai posisi tersimpan yang usianya di bawah ini (ms) */
  maximumAge?: number;
}

/** Ambil lokasi; meminta izin bila belum ada (panggil dari aksi pengguna, mis. tombol). */
export const getCurrentLocation = async (
  { highAccuracy = true, maximumAge = 0 }: LocationOptions = {},
): Promise<LocationResult> => {
  if (Capacitor.isNativePlatform()) {
    // Jalankan menggunakan plugin GPS Native (HP)
    const permission = await Geolocation.checkPermissions();
    if (permission.location !== 'granted') {
      await Geolocation.requestPermissions();
    }

    const position: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: highAccuracy,
      timeout: 10000,
      maximumAge,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } else {
    // Jalankan menggunakan GPS Web Browser standar
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation tidak didukung di browser Anda"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: highAccuracy, timeout: 10000, maximumAge }
      );
    });
  }
};

/**
 * Apakah izin lokasi SUDAH diberikan — tanpa memunculkan dialog izin.
 * Dipakai pengecekan lokasi otomatis agar tidak pernah meminta izin secara tiba-tiba.
 */
export const hasLocationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const { location } = await Geolocation.checkPermissions();
      return location === 'granted';
    }
    if (!navigator.permissions?.query) return false;
    const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return status.state === 'granted';
  } catch {
    return false;
  }
};
