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
import { api } from '../../src/services/api';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestToken = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }

    try {
      setErrorMessage('');
      setIsLoading(true);
      const res = await api.forgotPassword(email.trim());
      setStatusMessage(res.message);
      if (res.debugResetToken) {
        setToken(res.debugResetToken);
      }
      setStep('reset');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request reset token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token.trim() || !newPassword || newPassword.length < 6) {
      setErrorMessage('Please enter valid token and a password of at least 6 characters.');
      return;
    }

    try {
      setErrorMessage('');
      setIsLoading(true);
      const res = await api.resetPassword({ token: token.trim(), newPassword });
      alert(res.message || 'Password successfully updated!');
      router.replace('/auth/login');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <View style={[styles.logoIcon, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
            <Ionicons name="key-outline" size={28} color={theme.primary} />
          </View>
          <Text style={[styles.brandText, { color: theme.text }]}>Reset Password</Text>
          <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
            Recover your LinkHub account password
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {statusMessage ? (
            <View style={[styles.statusBox, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
              <Ionicons name="information-circle" size={16} color={theme.primary} />
              <Text style={[styles.statusText, { color: theme.primary }]}>{statusMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={[styles.errorBox, { backgroundColor: theme.dangerMuted, borderColor: theme.danger }]}>
              <Ionicons name="alert-circle" size={16} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
            </View>
          ) : null}

          {step === 'request' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Account Email Address</Text>
                <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
                  <Ionicons name="mail-outline" size={18} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleRequestToken}
                disabled={isLoading}
                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#090B10" />
                ) : (
                  <Text style={styles.submitBtnText}>Request Reset Token</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Reset Token</Text>
                <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
                  <Ionicons name="finger-print-outline" size={18} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={token}
                    onChangeText={setToken}
                    placeholder="Enter security token"
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>New Password (min 6 chars)</Text>
                <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New password"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={isLoading}
                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#090B10" />
                ) : (
                  <Text style={styles.submitBtnText}>Set New Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
    fontSize: 13,
    textAlign: 'center'
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  statusText: {
    fontSize: 12,
    flex: 1
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
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4
  },
  submitBtnText: {
    color: '#090B10',
    fontSize: 14,
    fontWeight: '800'
  }
});
