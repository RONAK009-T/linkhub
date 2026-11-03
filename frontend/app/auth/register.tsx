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

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (username.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      setErrorMessage('');
      setIsLoading(true);
      await register(username.trim(), email.trim(), password, displayName.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setErrorMessage('');
      setIsGoogleLoading(true);
      await loginWithGoogle();
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Google registration failed.');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <View style={[styles.logoIcon, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
            <Ionicons name="sparkles" size={28} color={theme.primary} />
          </View>
          <Text style={[styles.brandText, { color: theme.text }]}>Create LinkHub Account</Text>
          <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
            Unlock temporary self-destructing chats, gaming lounges & bookmarks
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {errorMessage ? (
            <View style={[styles.errorBox, { backgroundColor: theme.dangerMuted, borderColor: theme.danger }]}>
              <Ionicons name="alert-circle" size={16} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Display Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Display Name</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
              <Ionicons name="person-outline" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Neo Gamer"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Username *</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
              <Ionicons name="at-outline" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={username}
                onChangeText={setUsername}
                placeholder="e.g. neo_99"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address *</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
              <Ionicons name="mail-outline" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Password * (min 6 chars)</Text>
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

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#090B10" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Create Account</Text>
                <Ionicons name="checkmark" size={18} color="#090B10" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
          </View>

          {/* Google Sign-Up Button */}
          <TouchableOpacity
            onPress={handleGoogleRegister}
            disabled={isGoogleLoading}
            style={[styles.googleBtn, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={[styles.googleBtnText, { color: theme.text }]}>Sign up with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={[styles.loginLink, { color: theme.primary }]}>Sign in</Text>
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
    marginBottom: 8
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8
  },
  logoIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800'
  },
  brandSubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14
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
    gap: 5
  },
  label: {
    fontSize: 12,
    fontWeight: '700'
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    marginTop: 18
  },
  footerText: {
    fontSize: 13
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700'
  }
});
