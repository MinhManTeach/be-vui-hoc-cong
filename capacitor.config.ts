import type { CapacitorConfig } from '@capacitor/cli';

// Store app (App Store / Google Play): the same web build, packed inside a native shell.
const config: CapacitorConfig = {
  appId: 'vn.lopso.bevuihoccong',
  appName: 'Bé Vui Học Cộng',
  webDir: 'dist',
  backgroundColor: '#fffbeb',
  ios: { contentInset: 'always' },
};

export default config;
