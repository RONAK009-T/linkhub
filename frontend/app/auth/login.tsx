import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!loginInput.trim() || !password) {
      setErrorMessage('Please fill in both fields.');
      return;
    }

    try {
      setErrorMessage('');
      setIsLoading(true);
      await login(loginInput.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage('');
      setIsGoogleLoading(true);
      await loginWithGoogle();
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Close / Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Brand Banner */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoIcon, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
            <Ionicons name="flash" size={32} color={theme.primary} />
          </View>
          <Text style={[styles.brandText, { color: theme.text }]}>
            Link<Text style={{ color: theme.primary }}>Hub</Text>
          </Text>
          <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
            Sign in to start temporary 60-second social chats & lounges
          </Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {errorMessage ? (
            <View style={[styles.errorBox, { backgroundColor: theme.dangerMuted, borderColor: theme.danger }]}>
              <Ionicons name="alert-circle" size={16} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Username / Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Username or Email</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
              <Ionicons name="person-outline" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={loginInput}
                onChangeText={setLoginInput}
                placeholder="e.g. alex_gamer or alex@linkhub.com"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
              <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#090B10" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={16} color="#090B10" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading}
            style={[styles.googleBtn, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={[styles.googleBtnText, { color: theme.text }]}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Link to Register */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={[styles.registerLink, { color: theme.primary }]}>Create one here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center'
  },
  closeBtn: {
    alignSelf: 'flex-start',
    padding: 6,
    marginBottom: 10
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  errorText: {
    fontSize: 12,
    flex: 1
  },
  inputGroup: {
    gap: 6
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 12,
    fontWeight: '700'
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '600'
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4
  },
  submitBtnText: {
    color: '#090B10',
    fontSize: 14,
    fontWeight: '800'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4
  },
  divider: {
    flex: 1,
    height: 1
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700'
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20
  },
  footerText: {
    fontSize: 13
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700'
  }
});
