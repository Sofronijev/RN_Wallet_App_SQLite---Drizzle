const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = (base) => {
  if (IS_DEV) return `${base}.dev`;
  if (IS_PREVIEW) return `${base}.preview`;
  return base;
};

const getAppName = () => {
  if (IS_DEV) return 'SpendyFly (Dev)';
  if (IS_PREVIEW) return 'SpendyFly (Preview)';
  return 'SpendyFly';
};

export default {
  expo: {
    name: getAppName(),
    slug: 'spendy-fly',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './app/assets/ios-light.png',
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier('com.sofronijev.spendyFly'),
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './app/assets/adaptive-icon.png',
        backgroundColor: '#EEF5F1',
      },
      icon: './app/assets/ios-light.png',
      softwareKeyboardLayoutMode: 'pan',
      package: getUniqueIdentifier('com.misurapps.spendyfly'),
    },
    web: {
      favicon: './app/assets/adaptive-icon.png',
    },
    extra: {
      eas: {
        projectId: '6928b3f1-f181-4c14-a110-d718064f777c',
      },
    },
    plugins: [
      'expo-secure-store',
      [
        'expo-splash-screen',
        {
          image: './app/assets/splash-icon.png',
          backgroundColor: '#FFFFFF',
          dark: {
            backgroundColor: '#162A26',
          },
          imageWidth: 220,
        },
      ],
      '@react-native-community/datetimepicker',
      'expo-sharing',
      'expo-sqlite',
    ],
  },
};
