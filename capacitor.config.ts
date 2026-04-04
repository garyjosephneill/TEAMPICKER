import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.garyjosephneill.lazygaffer',
  appName: 'Lazy Gaffer',
  webDir: 'dist',
  ios: {
    scrollEnabled: true
  }
};

export default config;
