/**
 * iOS: a Liquid Glass navigation bar.
 *
 * Unlike the Material top app bar, this one *floats* — it is absolutely
 * positioned so the list scrolls underneath it and the glass has something to
 * refract. Screens offset their scroll content by `useScreenHeaderInset()`.
 *
 * Top-level screens pass `large` for the iOS large-title treatment: a compact
 * 44pt control row with the title in 34pt bold beneath it.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GlassSurface } from '@/components/ui/glass-surface';
import type { HeaderAction, ScreenHeaderProps } from '@/components/ui/screen-header.types';
import { IOSColors } from '@/constants/ios-colors';

export type { HeaderAction, ScreenHeaderProps };

const BAR_HEIGHT = 44;
const LARGE_TITLE_HEIGHT = 52;

/** How far a screen must push its scroll content down to clear the glass bar. */
export function useScreenHeaderInset(large = false) {
  const insets = useSafeAreaInsets();
  return insets.top + BAR_HEIGHT + (large ? LARGE_TITLE_HEIGHT : 0);
}

export function ScreenHeader({ title, large = false, onBack, actions = [] }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <GlassSurface
      variant="regular"
      style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.side}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <AppIcon name="back" size={19} color={IOSColors.accent} />
              <Text style={styles.backLabel}>Back</Text>
            </Pressable>
          ) : null}
        </View>

        {/* A compact centred title, exactly as UIKit lays one out. Large-title
            screens show their title below instead. */}
        {!large ? (
          <Text style={styles.compactTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={styles.flex} />
        )}

        <View style={[styles.side, styles.sideRight]}>
          {actions.map((action) => (
            <BarAction key={action.label} action={action} />
          ))}
        </View>
      </View>

      {large ? (
        <View style={styles.largeTitleRow}>
          <Text style={styles.largeTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
      ) : null}
    </GlassSurface>
  );
}

function BarAction({ action }: { action: HeaderAction }) {
  const showBadge = typeof action.badge === 'number' && action.badge > 0;

  return (
    <Pressable
      onPress={action.onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <AppIcon name={action.icon} size={22} color={IOSColors.accent} />
      {showBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {action.badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Paints above the scrolling content regardless of sibling order.
    zIndex: 10,
  },
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  flex: {
    flex: 1,
  },
  side: {
    minWidth: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  sideRight: {
    minWidth: 96,
    justifyContent: 'flex-end',
    gap: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLabel: {
    fontSize: 17,
    color: IOSColors.accent,
  },
  pressed: {
    opacity: 0.4,
  },
  compactTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: IOSColors.label,
  },
  action: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeTitleRow: {
    height: LARGE_TITLE_HEIGHT,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
    color: IOSColors.label,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: IOSColors.badge,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
