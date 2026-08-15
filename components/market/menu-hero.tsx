/**
 * Android / web menu introduction.
 *
 * This intentionally uses Material surfaces instead of trying to imitate iOS
 * glass. The result is a compact, high-contrast opening block that works well
 * with Material 3's tonal elevation and dynamic type.
 */

import { StyleSheet, View } from 'react-native';
import { Badge, Surface, Text, useTheme } from 'react-native-paper';

import { AppIcon } from '@/components/ui/app-icon';

export function MenuHero() {
  const theme = useTheme();

  return (
    <Surface
      elevation={1}
      style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}
      accessible
      accessibilityLabel="Nour Sweets menu introduction">
      <View style={[styles.iconCircle, { backgroundColor: theme.colors.surface }]}>
        <AppIcon name="sparkle" size={28} color={theme.colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
          NOUR SWEETS · SMALL BATCHES
        </Text>
        <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer }}>
          A little piece of home
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
          Classic Arabic sweets, made fresh for sharing.
        </Text>
      </View>
      <Badge
        size={28}
        style={[styles.badge, { backgroundColor: theme.colors.tertiaryContainer }]}
        theme={{ colors: { primary: theme.colors.onTertiaryContainer } }}>
        100%
      </Badge>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 142,
    borderRadius: 28,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
  },
});
