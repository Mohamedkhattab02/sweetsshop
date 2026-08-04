/**
 * The opening-hours banner shown at the top of the main page.
 *
 * Collapsed it shows whether the market is open right now and today's hours;
 * tapping it expands the full week. The status recomputes on a timer so the
 * banner stays correct if the screen is left open across an opening time.
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';

import {
  DAY_NAMES_SHORT,
  OPENING_HOURS,
  formatDayHours,
  getMarketStatus,
  type MarketStatus,
} from '@/constants/market';

const REFRESH_INTERVAL_MS = 30_000;

export function OpenHoursCard() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<MarketStatus>(() => getMarketStatus());
  const [today, setToday] = useState(() => new Date().getDay());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getMarketStatus());
      setToday(new Date().getDay());
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const accent = status.isOpen ? theme.colors.primary : theme.colors.error;
  const container = status.isOpen ? theme.colors.primaryContainer : theme.colors.errorContainer;
  const onContainer = status.isOpen
    ? theme.colors.onPrimaryContainer
    : theme.colors.onErrorContainer;

  return (
    <Surface style={[styles.surface, { backgroundColor: container }]} elevation={0}>
      <TouchableRipple
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={`Opening hours. ${status.message}. Tap to ${expanded ? 'collapse' : 'see the full week'}.`}
        borderless
        style={styles.ripple}>
        <View>
          <View style={styles.headerRow}>
            <View style={[styles.statusDot, { backgroundColor: accent }]} />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={{ color: onContainer }}>
                {status.isOpen ? 'Open now' : 'Closed'}
              </Text>
              <Text variant="bodySmall" style={{ color: onContainer }}>
                {status.message.replace(/^(Open now|Closed) · /, '')}
              </Text>
            </View>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={onContainer}
            />
          </View>

          {expanded ? (
            <View style={styles.week}>
              <Divider style={styles.divider} />
              {OPENING_HOURS.map((hours, day) => {
                const isToday = day === today;
                return (
                  <View key={day} style={styles.weekRow}>
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.dayLabel,
                        { color: onContainer },
                        isToday && styles.todayLabel,
                      ]}>
                      {DAY_NAMES_SHORT[day]}
                      {isToday ? ' • today' : ''}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={[{ color: onContainer }, isToday && styles.todayLabel]}>
                      {formatDayHours(hours)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </TouchableRipple>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  ripple: {
    borderRadius: 20,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  week: {
    marginTop: 12,
  },
  divider: {
    marginBottom: 8,
    opacity: 0.4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayLabel: {
    opacity: 0.85,
  },
  todayLabel: {
    fontWeight: '700',
    opacity: 1,
  },
});
