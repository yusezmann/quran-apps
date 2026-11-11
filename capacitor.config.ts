import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quran.apps',
  appName: 'Quran Apps',
  webDir: 'out',
  plugins: {
    LocalNotifications: {
      // Ikon kecil notifikasi adzan (android/app/src/main/res/drawable/ic_stat_adzan.xml)
      smallIcon: 'ic_stat_adzan',
      iconColor: '#16a34a',
    },
  },
};

export default config;
