package com.quran.apps.adzan;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.ServiceCompat;
import com.quran.apps.MainActivity;
import com.quran.apps.R;

/**
 * Memutar adzan lewat VOLUME ALARM (tetap berbunyi saat HP senyap/getar, seperti jam weker)
 * sebagai layanan latar depan, dengan notifikasi berisi tombol "Hentikan".
 */
public class AdzanPlayerService extends Service {

    private static final String TAG = "AdzanAlarm";

    static final String ACTION_PLAY = "com.quran.apps.adzan.PLAY";
    static final String ACTION_STOP = "com.quran.apps.adzan.STOP";

    static final String EXTRA_ID = "id";
    static final String EXTRA_SOUND = "sound";
    static final String EXTRA_TITLE = "title";
    static final String EXTRA_BODY = "body";
    static final String EXTRA_PRAYER = "prayer";
    static final String EXTRA_AT = "at";

    /** Channel notifikasi saat adzan diputar: tanpa suara (suara diputar sendiri oleh layanan ini). */
    private static final String CHANNEL_PLAYING = "adzan_playing";
    private static final int NOTIFICATION_ID = 7_100;

    private MediaPlayer player;
    private NotificationCompat.Builder builder;
    private String prayer = "";
    private long startedAt = 0;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : null;
        if (ACTION_STOP.equals(action)) {
            if (player != null) AdzanLog.add(this, "dihentikan-pengguna", "setelah " + playedSeconds() + " dtk");
            finish(true);
            return START_NOT_STICKY;
        }
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        String title = intent.getStringExtra(EXTRA_TITLE);
        String body = intent.getStringExtra(EXTRA_BODY);
        String sound = intent.getStringExtra(EXTRA_SOUND);
        prayer = intent.getStringExtra(EXTRA_PRAYER) != null ? intent.getStringExtra(EXTRA_PRAYER) : "";

        ensureChannel(this);
        builder = new NotificationCompat.Builder(this, CHANNEL_PLAYING)
            .setSmallIcon(R.drawable.ic_stat_adzan)
            .setContentTitle(title != null ? title : "Waktu sholat telah tiba")
            .setContentText(body != null && !body.isEmpty() ? body : "Adzan sedang berkumandang")
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setContentIntent(openAppIntent(this))
            .setDeleteIntent(stopIntent(this))
            .addAction(0, "Hentikan", stopIntent(this));

        try {
            int type = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ? ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK : 0;
            ServiceCompat.startForeground(this, NOTIFICATION_ID, builder.build(), type);
        } catch (RuntimeException e) {
            // Mis. sistem menolak layanan latar depan: tetap tampilkan notifikasi bersuara alarm
            Log.w(TAG, "startForeground gagal, memakai notifikasi cadangan", e);
            AdzanLog.add(this, "startForeground-gagal", e.getClass().getSimpleName() + ": " + e.getMessage());
            postFallbackNotification(this, intent);
            stopSelf();
            return START_NOT_STICKY;
        }

        AdzanLog.add(this, "pemutar-mulai", prayer + ", suara " + sound + ", " + audioInfo());
        play(sound != null ? sound : "adzan_makkah");
        AdzanAlarmPlugin.emit("adzanStarted", prayer);
        return START_NOT_STICKY;
    }

    private void play(String sound) {
        releasePlayer();
        try {
            int resId = getResources().getIdentifier(sound, "raw", getPackageName());
            if (resId == 0) resId = getResources().getIdentifier("adzan_makkah", "raw", getPackageName());
            Uri uri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/" + resId);

            player = new MediaPlayer();
            player.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
            );
            player.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
            player.setDataSource(this, uri);
            player.setOnCompletionListener(mp -> {
                AdzanLog.add(this, "adzan-selesai", "diputar " + playedSeconds() + " dtk");
                finish(false);
            });
            player.setOnErrorListener((mp, what, extra) -> {
                Log.w(TAG, "MediaPlayer error " + what + "/" + extra);
                AdzanLog.add(this, "pemutar-error", what + "/" + extra);
                finish(false);
                return true;
            });
            player.setOnPreparedListener(mp -> {
                mp.start();
                startedAt = System.currentTimeMillis();
                AdzanLog.add(this, "adzan-berbunyi", audioInfo());
            });
            player.prepareAsync();
        } catch (Exception e) {
            Log.e(TAG, "Gagal memutar adzan", e);
            AdzanLog.add(this, "gagal-memutar", e.getClass().getSimpleName() + ": " + e.getMessage());
            finish(false);
        }
    }

    /**
     * Selesai: hentikan suara. Bila adzan selesai dengan sendirinya, notifikasi tetap tinggal (tanpa
     * tombol) sebagai penanda waktu sholat; bila dihentikan pengguna, notifikasi ikut ditutup.
     */
    private void finish(boolean byUser) {
        releasePlayer();
        if (byUser || builder == null) {
            ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE);
        } else {
            ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_DETACH);
            builder.setOngoing(false).clearActions().setContentText("Waktu sholat telah tiba").setAutoCancel(true);
            try {
                NotificationManagerCompat.from(this).notify(NOTIFICATION_ID, builder.build());
            } catch (SecurityException ignored) {
                // izin notifikasi dicabut
            }
        }
        AdzanAlarmPlugin.emit("adzanStopped", prayer);
        stopSelf();
    }

    private void releasePlayer() {
        if (player == null) return;
        try {
            if (player.isPlaying()) player.stop();
        } catch (IllegalStateException ignored) {
            // belum siap
        }
        player.release();
        player = null;
    }

    /** Volume alarm, mode dering, dan mode Jangan Ganggu saat ini (untuk diagnosa). */
    private String audioInfo() {
        try {
            android.media.AudioManager am = (android.media.AudioManager) getSystemService(Context.AUDIO_SERVICE);
            NotificationManager nm = getSystemService(NotificationManager.class);
            String ringer;
            int mode = am.getRingerMode();
            if (mode == android.media.AudioManager.RINGER_MODE_SILENT) ringer = "senyap";
            else if (mode == android.media.AudioManager.RINGER_MODE_VIBRATE) ringer = "getar";
            else ringer = "normal";
            int dnd = nm != null ? nm.getCurrentInterruptionFilter() : -1;
            return "volume alarm " + am.getStreamVolume(android.media.AudioManager.STREAM_ALARM) + "/"
                + am.getStreamMaxVolume(android.media.AudioManager.STREAM_ALARM) + ", mode " + ringer + ", DND " + dnd;
        } catch (RuntimeException e) {
            return "info audio tidak tersedia";
        }
    }

    private long playedSeconds() {
        return startedAt > 0 ? (System.currentTimeMillis() - startedAt) / 1000 : 0;
    }

    @Override
    public void onDestroy() {
        // Layanan dimatikan sistem saat adzan masih diputar -> penyebab adzan terpotong / tidak terdengar
        if (player != null) AdzanLog.add(this, "dihentikan-sistem", "setelah " + playedSeconds() + " dtk");
        releasePlayer();
        super.onDestroy();
    }

    static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = context.getSystemService(NotificationManager.class);
        if (nm == null || nm.getNotificationChannel(CHANNEL_PLAYING) != null) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_PLAYING, "Adzan (alarm)", NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Notifikasi saat adzan diputar sebagai alarm");
        channel.setSound(null, null);
        channel.enableVibration(true);
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        nm.createNotificationChannel(channel);
    }

    static PendingIntent stopIntent(Context context) {
        Intent stop = new Intent(context, AdzanPlayerService.class).setAction(ACTION_STOP);
        return PendingIntent.getService(context, 1, stop, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static PendingIntent openAppIntent(Context context) {
        Intent open = new Intent(context, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(context, 2, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Hentikan adzan yang sedang diputar (dari aplikasi). */
    static void stop(Context context) {
        Intent stop = new Intent(context, AdzanPlayerService.class).setAction(ACTION_STOP);
        try {
            context.startService(stop);
        } catch (RuntimeException ignored) {
            // layanan tidak berjalan
        }
    }

    /**
     * Cadangan bila layanan pemutar tidak boleh dijalankan: notifikasi pada channel bertipe ALARM
     * (dibuat di MainActivity) yang membunyikan adzan lewat suara channel.
     */
    static void postFallbackNotification(Context context, Intent source) {
        AdzanLog.add(context, "notifikasi-cadangan", "suara lewat channel notifikasi alarm");
        String sound = source.getStringExtra(EXTRA_SOUND);
        String channel = "adzan_shubuh".equals(sound) ? "adzan_subuh_alarm" : (sound != null ? sound : "adzan_makkah") + "_alarm";
        String title = source.getStringExtra(EXTRA_TITLE);
        String body = source.getStringExtra(EXTRA_BODY);
        Notification n = new NotificationCompat.Builder(context, channel)
            .setSmallIcon(R.drawable.ic_stat_adzan)
            .setContentTitle(title != null ? title : "Waktu sholat telah tiba")
            .setContentText(body != null ? body : "")
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(openAppIntent(context))
            .build();
        try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID + 1, n);
        } catch (SecurityException ignored) {
            // izin notifikasi dicabut
        }
    }
}
