package com.quran.apps.adzan;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import androidx.core.content.ContextCompat;

/**
 * - Saat alarm adzan tiba: jalankan {@link AdzanPlayerService} (memutar adzan lewat volume alarm).
 * - Setelah HP dinyalakan ulang / aplikasi di-update / jam diubah: pasang ulang jadwal tersimpan
 *   (Android menghapus semua alarm aplikasi pada kejadian-kejadian itu).
 */
public class AdzanAlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (AdzanAlarmScheduler.ACTION_FIRE.equals(action) || AdzanAlarmScheduler.ACTION_FIRE_BACKUP.equals(action)) {
            long at = intent.getLongExtra(AdzanPlayerService.EXTRA_AT, 0);
            long late = at > 0 ? (System.currentTimeMillis() - at) / 1000 : 0;
            String path = AdzanAlarmScheduler.ACTION_FIRE.equals(action) ? "jam weker" : "alarm tepat";
            String prayer = intent.getStringExtra(AdzanPlayerService.EXTRA_PRAYER);
            int id = intent.getIntExtra(AdzanPlayerService.EXTRA_ID, 0);
            // Dua jalur untuk satu adzan: yang kedua diabaikan agar adzan tidak berbunyi dua kali
            if (!markFired(context, id + "@" + at)) {
                AdzanLog.add(context, "duplikat-diabaikan", prayer + " via " + path);
                return;
            }
            AdzanLog.add(context, "alarm-tiba", prayer + " via " + path + ", telat " + late + " dtk");
            Intent service = new Intent(context, AdzanPlayerService.class).setAction(AdzanPlayerService.ACTION_PLAY);
            if (intent.getExtras() != null) service.putExtras(intent.getExtras());
            try {
                ContextCompat.startForegroundService(context, service);
            } catch (RuntimeException e) {
                // Sistem menolak layanan latar depan (mis. alarm tidak tepat waktu): tampilkan notifikasi
                // bersuara alarm sebagai cadangan agar adzan tetap terdengar.
                Log.w("AdzanAlarm", "Layanan pemutar ditolak, memakai notifikasi cadangan", e);
                AdzanLog.add(context, "pemutar-ditolak", e.getClass().getSimpleName() + ": " + e.getMessage());
                AdzanPlayerService.postFallbackNotification(context, intent);
            }
            return;
        }
        // BOOT_COMPLETED, MY_PACKAGE_REPLACED, TIME_SET, TIMEZONE_CHANGED (mulai dari kondisi bersih)
        AdzanLog.add(context, "pulihkan-jadwal", String.valueOf(action));
        AdzanAlarmScheduler.scheduleStored(context);
    }

    /** true bila alarm ini belum pernah diputar (kunci = id@waktu). Menyimpan 20 kunci terakhir. */
    private static synchronized boolean markFired(Context context, String key) {
        android.content.SharedPreferences p = context.getSharedPreferences("adzan_fired", Context.MODE_PRIVATE);
        String fired = p.getString("keys", "");
        if (("|" + fired + "|").contains("|" + key + "|")) return false;
        String[] parts = fired.isEmpty() ? new String[0] : fired.split("\\|");
        StringBuilder next = new StringBuilder();
        for (int i = Math.max(0, parts.length - 19); i < parts.length; i++) next.append(parts[i]).append('|');
        next.append(key);
        p.edit().putString("keys", next.toString()).commit();
        return true;
    }
}
