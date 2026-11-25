package com.quran.apps.update;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Pembaruan APK dari dalam aplikasi (aplikasi tidak lewat Play Store):
 * download({url}) mengunduh APK ke cache sambil mengirim event "progress" {percent},
 * lalu install() membuka layar pemasangan Android (pengguna menekan "Update" — wajib oleh Android).
 * Bila izin "instal aplikasi tidak dikenal" belum diberikan, install() membuka layar izinnya dan
 * mengembalikan {needsPermission: true}; panggil install() lagi setelah pengguna kembali.
 */
@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {

    private File apkFile() {
        File dir = new File(getContext().getCacheDir(), "updates");
        //noinspection ResultOfMethodCallIgnored
        dir.mkdirs();
        return new File(dir, "quran-apps-update.apk");
    }

    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url");
        if (url == null) {
            call.reject("url wajib diisi");
            return;
        }
        new Thread(() -> {
            File target = apkFile();
            File partial = new File(target.getPath() + ".part");
            HttpURLConnection conn = null;
            try {
                // GitHub mengalihkan (302) ke server unduhan; ikuti pengalihan secara manual (maks. 5)
                URL current = new URL(url);
                for (int i = 0; i < 5; i++) {
                    conn = (HttpURLConnection) current.openConnection();
                    conn.setInstanceFollowRedirects(false);
                    conn.setConnectTimeout(20000);
                    conn.setReadTimeout(30000);
                    conn.setRequestProperty("User-Agent", "QuranApps-Updater");
                    int code = conn.getResponseCode();
                    if (code >= 300 && code < 400) {
                        String loc = conn.getHeaderField("Location");
                        conn.disconnect();
                        if (loc == null) throw new Exception("Pengalihan tanpa tujuan");
                        current = new URL(current, loc);
                        continue;
                    }
                    if (code != 200) throw new Exception("Server membalas " + code);
                    break;
                }
                long total = conn.getContentLengthLong();
                long done = 0;
                int lastPercent = -1;
                try (InputStream in = conn.getInputStream(); OutputStream out = new FileOutputStream(partial)) {
                    byte[] buf = new byte[64 * 1024];
                    int n;
                    while ((n = in.read(buf)) != -1) {
                        out.write(buf, 0, n);
                        done += n;
                        if (total > 0) {
                            int percent = (int) (done * 100 / total);
                            if (percent != lastPercent) {
                                lastPercent = percent;
                                JSObject p = new JSObject();
                                p.put("percent", percent);
                                notifyListeners("progress", p);
                            }
                        }
                    }
                }
                if (total > 0 && done != total) throw new Exception("Unduhan terputus");
                //noinspection ResultOfMethodCallIgnored
                target.delete();
                if (!partial.renameTo(target)) throw new Exception("Gagal menyimpan file");
                JSObject r = new JSObject();
                r.put("bytes", done);
                call.resolve(r);
            } catch (Exception e) {
                //noinspection ResultOfMethodCallIgnored
                partial.delete();
                call.reject("Gagal mengunduh: " + e.getMessage());
            } finally {
                if (conn != null) conn.disconnect();
            }
        }).start();
    }

    @PluginMethod
    public void install(PluginCall call) {
        File apk = apkFile();
        if (!apk.exists()) {
            call.reject("File pembaruan belum diunduh");
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
            Intent settings = new Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getContext().getPackageName())
            );
            settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(settings);
            JSObject r = new JSObject();
            r.put("needsPermission", true);
            call.resolve(r);
            return;
        }
        Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            JSObject r = new JSObject();
            r.put("needsPermission", false);
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Tidak dapat membuka pemasang: " + e.getMessage());
        }
    }
}
