package com.quran.apps.adzan;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Catatan diagnosa alarm adzan (disimpan di HP, maks. 60 baris terakhir).
 * Ditampilkan di Pengaturan Adzan agar pengguna bisa menyalin & mengirimkannya bila adzan tidak berbunyi.
 */
final class AdzanLog {

    private static final String PREFS = "adzan_log";
    private static final String KEY = "entries";
    private static final int MAX = 60;

    private AdzanLog() {}

    static synchronized void add(Context context, String event, String detail) {
        Log.i("AdzanAlarm", event + " " + detail);
        try {
            SharedPreferences p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            JSONArray old = new JSONArray(p.getString(KEY, "[]"));
            JSONArray next = new JSONArray();
            int start = Math.max(0, old.length() - (MAX - 1));
            for (int i = start; i < old.length(); i++) next.put(old.get(i));
            JSONObject e = new JSONObject();
            e.put("t", System.currentTimeMillis());
            e.put("ev", event);
            e.put("d", detail);
            next.put(e);
            // commit (bukan apply): proses bisa dihentikan sistem sesaat setelahnya
            p.edit().putString(KEY, next.toString()).commit();
        } catch (JSONException ignored) {
            // abaikan
        }
    }

    static synchronized JSONArray all(Context context) {
        try {
            return new JSONArray(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    static synchronized void clear(Context context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(KEY).commit();
    }
}
