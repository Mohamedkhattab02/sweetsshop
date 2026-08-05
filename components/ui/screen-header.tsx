/**
 * Android / web: a Material 3 top app bar.
 *
 * It sits in normal flow and is opaque, which is what Material specifies, so
 * screens need no extra content padding — hence `useScreenHeaderInset` is 0
 * here. The iOS variant is a floating glass bar and returns a real inset.
 */

import { StyleSheet, View } from 'react-native';
import { Appbar, Badge, useTheme } from 'react-native-paper';

import { iconSource } from '@/components/ui/icon-source';
import type { HeaderAction, ScreenHeaderProps } from '@/components/ui/screen-header.types';

export type { HeaderAction, ScreenHeaderProps };

/** The Material top app bar is in flow, so content needs no offset. */
export function useScreenHeaderInset(_large = false) {
  return 0;
}

export function ScreenHeader({ title, onBack, actions = [] }: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <Appbar.Header elevated={false} style={{ backgroundColor: theme.colors.background }}>
      {onBack ? <Appbar.BackAction onPress={onBack} accessibilityLabel="Go back" /> : null}
      <Appbar.Content title={title} />
      {actions.map((action) => (
        <ActionButton key={action.label} action={action} />
      ))}
    </Appbar.Header>
  );
}

function ActionButton({ action }: { action: HeaderAction }) {
  const theme = useTheme();
  const showBadge = typeof action.badge === 'number' && action.badge > 0;

  // Paper's Appbar renders unknown children through untouched, so wrapping an
  // action to hang a badge off it is safe (see Appbar's renderAppbarContent).
  return (
    <View>
      <Appbar.Action
        icon={iconSource(action.icon)}
        accessibilityLabel={action.label}
        onPress={action.onPress}
      />
      {showBadge ? (
        <Badge
          size={18}
          style={[
            styles.badge,
            { backgroundColor: theme.colors.error, color: theme.colors.onError },
          ]}>
          {action.badge as number}
        </Badge>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
  },
});
