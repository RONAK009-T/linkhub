import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const googleServices = {
  /**
   * Google Search Integration: Launches secure search query
   */
  searchWeb: async (query: string) => {
    if (!query || !query.trim()) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
    await WebBrowser.openBrowserAsync(url);
  },

  /**
   * Google Maps Integration: Opens coordinates or search location in Google Maps
   */
  openMapsLocation: async (locationQuery: string = 'Gaming lounges near me') => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
    await WebBrowser.openBrowserAsync(url);
  },

  /**
   * Google Analytics: Checks user consent before sending telemetry event
   */
  logEvent: async (eventName: string, params: Record<string, any> = {}) => {
    try {
      const consent = await AsyncStorage.getItem('linkhub_analytics_consent');
      if (consent === 'granted') {
        const gaId = process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID;
        console.log(`[Google Analytics Event: ${eventName}]`, params, gaId ? `(ID: ${gaId})` : '');
      }
    } catch {
      // safe no-op
    }
  },

  setAnalyticsConsent: async (granted: boolean) => {
    await AsyncStorage.setItem('linkhub_analytics_consent', granted ? 'granted' : 'denied');
  },

  getAnalyticsConsent: async (): Promise<boolean> => {
    const consent = await AsyncStorage.getItem('linkhub_analytics_consent');
    return consent === 'granted';
  }
};
