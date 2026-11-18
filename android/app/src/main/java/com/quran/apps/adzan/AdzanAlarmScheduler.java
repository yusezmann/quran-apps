package com.quran.apps.adzan;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import com.quran.apps.MainActivity;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Menjadwalkan adzan sebagai ALARM sungguhan (seperti jam weker), bukan notifikasi biasa.
 *
 * Kenapa: suara notifikasi di banyak merek HP dibisukan saat HP senyap / tidur lama (Doze),
 * walau channel-nya bertipe alarm. Di sini Android membangunkan aplikasi tepat waktu lewat
 * {@link AlarmManager#setAlarmClock}, lalu {@link AdzanPlayerService} memutar adzan sendiri
 * lewat volume alarm.
 *
 * Daftar alarm disimpan di SharedPreferences agar bisa dipulihkan setelah HP dinyalakan ulang
 * atau aplikasi di-update (lihat {@link AdzanAlarmReceiver}).
 */
public final class AdzanAlarmScheduler {

    private static final String TAG = "AdzanAlarm";
    private static final String PREFS = "adzan_alarms";
    private static final String KEY_ALARMS = "alarms";
    static final String ACTION_FIRE = "com.quran.apps.adzan.FIRE";

    /** ID khusus tes; tidak disimpan di daftar jadwal. */
    public static final int TEST_ID = 999_001;

    private AdzanAlarmScheduler() {}

    /** Ganti seluruh jadwal adzan dengan daftar baru. */
    public static synchronized void replaceAll(Context context, JSONArray alarms) {
        cancelStored(context);
        prefs(context).edit().putString(KEY_ALARMS, alarms.toString()).apply();
        scheduleStored(context);
        AdzanLog.add(context, "jadwal", alarms.length() + " alarm, tepat=" + canScheduleExact(context) + nextInfo(alarms));
    }

    private static String nextInfo(JSONArray alarms) {
        long now = System.currentTimeMillis();
        long next = Long.MAX_VALUE;
        String prayer = "";
        for (int i = 0; i < alarms.length(); i++) {
            JSONObject a = alarms.optJSONObject(i);
            if (a == null) continue;
            long at = a.optLong("at");
            if (at > now && at < next) {
                next = at;
                prayer = a.optString("prayer");
            }
        }
        if (next == Long.MAX_VALUE) return "";
        return ", berikutnya " + prayer + " " + android.text.format.DateFormat.format("dd/MM HH:mm", next);
    }

    /** Hapus semua jadwal adzan. */
    public static synchronized void cancelAll(Context context) {
        cancelStored(context);
        prefs(context).edit().remove(KEY_ALARMS).apply();
    }

    /** Pasang ulang jadwal yang tersimpan (setelah reboot / update aplikasi). */
    public static synchronized void scheduleStored(Context context) {
        JSONArray alarms = load(context);
        long now = System.currentTimeMillis();
        for (int i = 0; i < alarms.length(); i++) {
            JSONObject a = alarms.optJSONObject(i);
            if (a == null) continue;
            if (a.optLong("at", 0) <= now) continue;
            scheduleOne(context, a);
        }
    }

    /** Jadwalkan satu alarm. */
    public static void scheduleOne(Context context, JSONObject alarm) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        int id = alarm.optInt("id");
        long at = alarm.optLong("at");
        PendingIntent fire = firePendingIntent(context, id, alarm);
        try {
            if (canScheduleExact(context)) {
                // setAlarmClock: prioritas tertinggi, tidak ditunda Doze, dan boleh memulai layanan pemutar
                PendingIntent show = PendingIntent.getActivity(
                    context,
                    id,
                    new Intent(context, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP),
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, show), fire);
            } else {
                // Izin alarm tepat ditolak pengguna: tetap dijadwalkan (bisa terlambat beberapa menit)
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, fire);
            }
        } catch (SecurityException e) {
            Log.w(TAG, "Alarm tepat tidak diizinkan, memakai alarm biasa", e);
            AdzanLog.add(context, "izin-alarm-ditolak", String.valueOf(e.getMessage()));
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, fire);
        }
    }

    public static boolean canScheduleExact(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true;
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        return am != null && am.canScheduleExactAlarms();
    }

    public static int storedCount(Context context) {
        return load(context).length();
    }

    private static void cancelStored(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        JSONArray alarms = load(context);
        for (int i = 0; i < alarms.length(); i++) {
            JSONObject a = alarms.optJSONObject(i);
            if (a == null) continue;
            am.cancel(firePendingIntent(context, a.optInt("id"), a));
        }
    }

    private static PendingIntent firePendingIntent(Context context, int id, JSONObject alarm) {
        Intent intent = new Intent(context, AdzanAlarmReceiver.class).setAction(ACTION_FIRE);
        intent.putExtra(AdzanPlayerService.EXTRA_ID, id);
        intent.putExtra(AdzanPlayerService.EXTRA_SOUND, alarm.optString("sound", "adzan_makkah"));
        intent.putExtra(AdzanPlayerService.EXTRA_TITLE, alarm.optString("title", "Waktu sholat telah tiba"));
        intent.putExtra(AdzanPlayerService.EXTRA_BODY, alarm.optString("body", ""));
        intent.putExtra(AdzanPlayerService.EXTRA_PRAYER, alarm.optString("prayer", ""));
        intent.putExtra(AdzanPlayerService.EXTRA_AT, alarm.optLong("at"));
        return PendingIntent.getBroadcast(context, id, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static JSONArray load(Context context) {
        String raw = prefs(context).getString(KEY_ALARMS, "[]");
        try {
            return new JSONArray(raw);
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
