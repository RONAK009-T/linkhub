import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Google Client IDs from environment or configuration
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

/**
 * Initiates Google OAuth Sign-in flow compatible with Web and Android
 */
export async function promptGoogleSignIn(): Promise<{ idToken?: string; accessToken?: string; isMock?: boolean }> {
  try {
    const clientId = Platform.OS === 'android' ? (GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID) : GOOGLE_WEB_CLIENT_ID;

    // If Google Client ID is configured, trigger Google OAuth Discovery Flow
    if (clientId) {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'linkhub',
        path: 'auth/callback'
      });

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Token,
        redirectUri
      });

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke'
      };

      const result = await request.promptAsync(discovery);

      if (result.type === 'success' && result.params) {
        return {
          accessToken: result.params.access_token,
          idToken: result.params.id_token
        };
      } else {
        throw new Error(result.type === 'cancel' ? 'Google Sign-in was cancelled' : 'Google Sign-in was interrupted');
      }
    }

    // Developer / Quick Demo Mode when Client ID isn't entered in .env yet
    console.log('[Google Auth] Running in instant development mode.');
    return {
      accessToken: 'mock_google_user_' + Math.random().toString(36).substring(2, 8) + '@gmail.com',
      isMock: true
    };
  } catch (error: any) {
    console.error('[Google Sign-in Error]', error);
    throw error;
  }
}
