import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bomponis.spendwise',
  appName: 'Spendlore',
  webDir: 'dist',
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
      },
    },
    LocalNotifications: {
      smallIcon: "ic_stat_spendlore",
      iconColor: "#7c3aed",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  }
};

export default config;
