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
        if (AdzanAlarmScheduler.ACTION_FIRE.equals(action)) {
            long at = intent.getLongExtra(AdzanPlayerService.EXTRA_AT, 0);
            long late = at > 0 ? (System.currentTimeMillis() - at) / 1000 : 0;
            AdzanLog.add(context, "alarm-tiba", intent.getStringExtra(AdzanPlayerService.EXTRA_PRAYER) + ", telat " + late + " dtk");
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
        // BOOT_COMPLETED, MY_PACKAGE_REPLACED, TIME_SET, TIMEZONE_CHANGED
        AdzanLog.add(context, "pulihkan-jadwal", String.valueOf(action));
        AdzanAlarmScheduler.scheduleStored(context);
    }
}
