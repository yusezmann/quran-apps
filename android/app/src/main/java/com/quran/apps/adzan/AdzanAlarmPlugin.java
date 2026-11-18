package com.quran.apps.adzan;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Jembatan JS ↔ alarm adzan native (lihat lib/adzan/alarm.ts).
 *
 * schedule({ alarms: [{ id, at (ms), sound, title, body, prayer }] }) — ganti seluruh jadwal
 * cancelAll() · stop() · test({ sound, delayMs }) · status() → { count, exact }
 * Event: "adzanStarted" / "adzanStopped" { prayer } — agar banner di aplikasi ikut tampil/tutup.
 */
@CapacitorPlugin(name = "AdzanAlarm")
public class AdzanAlarmPlugin extends Plugin {

    private static AdzanAlarmPlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    /** Kirim event ke JS bila aplikasi sedang terbuka. */
    static void emit(String event, String prayer) {
        AdzanAlarmPlugin p = instance;
        if (p == null) return;
        JSObject data = new JSObject();
        data.put("prayer", prayer);
        p.notifyListeners(event, data);
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        JSArray alarms = call.getArray("alarms");
        if (alarms == null) {
            call.reject("alarms wajib diisi");
            return;
        }
        try {
            JSONArray clean = new JSONArray();
            for (int i = 0; i < alarms.length(); i++) {
                JSONObject a = alarms.getJSONObject(i);
                JSONObject c = new JSONObject();
                c.put("id", a.getInt("id"));
                c.put("at", a.getLong("at"));
                c.put("sound", a.optString("sound", "adzan_makkah"));
                c.put("title", a.optString("title", ""));
                c.put("body", a.optString("body", ""));
                c.put("prayer", a.optString("prayer", ""));
                clean.put(c);
            }
            AdzanAlarmScheduler.replaceAll(getContext(), clean);
            call.resolve(statusObject());
        } catch (JSONException e) {
            call.reject("Data alarm tidak valid: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        AdzanAlarmScheduler.cancelAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        AdzanPlayerService.stop(getContext());
        call.resolve();
    }

    @PluginMethod
    public void test(PluginCall call) {
        try {
            long delay = call.getLong("delayMs", 10_000L);
            JSONObject a = new JSONObject();
            a.put("id", AdzanAlarmScheduler.TEST_ID);
            a.put("at", System.currentTimeMillis() + delay);
            a.put("sound", call.getString("sound", "adzan_makkah"));
            a.put("title", call.getString("title", "Tes adzan"));
            a.put("body", call.getString("body", "Jika Anda mendengar adzan ini, alarm adzan berfungsi."));
            a.put("prayer", "");
            AdzanAlarmScheduler.scheduleOne(getContext(), a);
            call.resolve(statusObject());
        } catch (JSONException e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void status(PluginCall call) {
        call.resolve(statusObject());
    }

    private JSObject statusObject() {
        JSObject r = new JSObject();
        r.put("count", AdzanAlarmScheduler.storedCount(getContext()));
        r.put("exact", AdzanAlarmScheduler.canScheduleExact(getContext()));
        return r;
    }
}
