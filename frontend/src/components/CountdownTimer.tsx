import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface CountdownTimerProps {
  remainingSeconds: number;
  totalSeconds?: number;
}

export default function CountdownTimer({ remainingSeconds, totalSeconds = 60 }: CountdownTimerProps) {
  const { theme } = useTheme();

  const progress = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));

  // Determine dynamic accent color based on urgency
  let timerColor = theme.primary;
  let isUrgent = false;

  if (remainingSeconds <= 15) {
    timerColor = theme.danger;
    isUrgent = true;
  } else if (remainingSeconds <= 30) {
    timerColor = theme.warning;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: `${timerColor}22`, borderColor: `${timerColor}55` }]}>
        <Ionicons name={isUrgent ? 'flame' : 'timer-outline'} size={12} color={timerColor} />
        <Text style={[styles.timerText, { color: timerColor, fontWeight: isUrgent ? '700' : '600' }]}>
          {remainingSeconds}s
        </Text>
      </View>

      {/* Mini Progress Track */}
      <View style={[styles.progressTrack, { backgroundColor: `${theme.textSecondary}33` }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progress * 100}%`,
              backgroundColor: timerColor
            }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    gap: 3,
    minWidth: 54
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1
  },
  timerText: {
    fontSize: 10,
    fontVariant: ['tabular-nums']
  },
  progressTrack: {
    width: 48,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 2
  }
});
