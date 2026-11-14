package com.quran.apps;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /**
     * Channel notifikasi adzan bertipe ALARM (dipakai bila pengguna menyalakan
     * "Tetap bunyikan adzan saat mode senyap").
     *
     * Plugin @capacitor/local-notifications selalu membuat channel dengan suara bertipe
     * NOTIFICATION, yang ikut senyap saat HP dalam mode senyap/getar. Suara bertipe ALARM
     * diputar lewat volume alarm (seperti jam weker) sehingga tetap berbunyi, dan umumnya
     * diizinkan saat mode Jangan Ganggu.
     *
     * ID harus sama dengan lib/adzan/settings.ts (ADZAN_SOUNDS[..].alarmChannelId).
     * Suara channel tidak bisa diubah setelah dibuat, jadi ID ini terpisah dari channel biasa.
     */
    private static final String[][] ALARM_CHANNELS = {
        { "adzan_makkah_alarm", "Adzan Makkah (mode senyap)", "adzan_makkah" },
        { "adzan_mesir_alarm", "Adzan Mesir (mode senyap)", "adzan_mesir" },
        { "adzan_subuh_alarm", "Adzan Subuh (mode senyap)", "adzan_shubuh" },
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createAdzanAlarmChannels();
    }

    private void createAdzanAlarmChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager == null) return;

        AudioAttributes alarmAudio = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();

        for (String[] c : ALARM_CHANNELS) {
            NotificationChannel channel = new NotificationChannel(c[0], c[1], NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("Adzan tetap berbunyi walau HP dalam mode senyap");
            channel.setSound(
                Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/" + c[2]),
                alarmAudio
            );
            channel.enableVibration(true);
            channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(channel); // tidak berefek bila channel sudah ada
        }
    }
}
