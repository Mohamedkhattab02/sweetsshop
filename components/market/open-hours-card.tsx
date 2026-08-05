/**
 * The opening-hours banner shown at the top of the main page.
 *
 * Collapsed it shows whether the market is open right now and today's hours;
 * tapping it expands the full week. The status recomputes on a timer so the
 * banner stays correct if the screen is left open across an opening time.
 *
 * The container is a `GlassSurface`: Liquid Glass tinted green/red on iOS, a
 * tonal Material container on Android. Text uses `onSurface` so it stays
 * legible over either.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { AppIcon } from '@/components/ui/app-icon';
import { GlassSurface } from '@/components/ui/glass-surface';
import {
  DAY_NAMES_SHORT,
  OPENING_HOURS,
  formatDayHours,
  getMarketStatus,
  type MarketStatus,
} from '@/constants/market';

const REFRESH_INTERVAL_MS = 30_000;

/** iOS systemGreen / systemRed, held back to a wash the glass can carry. */
const OPEN_TINT = 'rgba(52, 199, 89, 0.16)';
const CLOSED_TINT = 'rgba(255, 59, 48, 0.16)';

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
  const onSurface = theme.colors.onSurface;

  return (
    <GlassSurface
      variant="regular"
      interactive
      tintColor={status.isOpen ? OPEN_TINT : CLOSED_TINT}
      androidElevation={0}
      androidBackgroundColor={
        status.isOpen ? theme.colors.primaryContainer : theme.colors.errorContainer
      }
      style={styles.surface}>
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
              <Text variant="titleMedium" style={{ color: onSurface }}>
                {status.isOpen ? 'Open now' : 'Closed'}
              </Text>
              <Text variant="bodySmall" style={{ color: onSurface }}>
                {status.message.replace(/^(Open now|Closed) · /, '')}
              </Text>
            </View>
            <AppIcon name={expanded ? 'chevronUp' : 'chevronDown'} size={22} color={onSurface} />
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
                      style={[styles.dayLabel, { color: onSurface }, isToday && styles.todayLabel]}>
                      {DAY_NAMES_SHORT[day]}
                      {isToday ? ' • today' : ''}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={[{ color: onSurface }, isToday && styles.todayLabel]}>
                      {formatDayHours(hours)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </TouchableRipple>
    </GlassSurface>
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
