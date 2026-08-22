import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { colors, fonts, radii } from '@/constants/design';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cartCount?: number;
  onCart?: () => void;
  notificationCount?: number;
  onNotifications?: () => void;
  onSwitchRole?: () => void;
  showBack?: boolean;
};

export function ModernHeader({
  eyebrow,
  title,
  subtitle,
  cartCount,
  onCart,
  notificationCount,
  onNotifications,
  onSwitchRole,
  showBack = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        <GSPressable
          onPress={showBack ? () => router.back() : onSwitchRole}
          accessibilityRole="button"
          accessibilityLabel={showBack ? 'Go back' : 'Switch role'}
          className="active:opacity-60"
          style={styles.logoButton as never}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>{showBack ? '‹' : 'N'}</Text>
          </View>
        </GSPressable>

        <View style={styles.heading}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.actions}>
          {onNotifications ? (
            <GSPressable
              onPress={onNotifications}
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              className="active:opacity-60"
              style={styles.iconButton as never}>
              <AppIcon name="notifications" size={20} color={colors.ink} />
              {notificationCount && notificationCount > 0 ? (
                <View style={styles.count}>
                  <Text style={styles.countText}>{notificationCount}</Text>
                </View>
              ) : null}
            </GSPressable>
          ) : null}
          {onSwitchRole ? (
            <GSPressable
              onPress={onSwitchRole}
              accessibilityRole="button"
              accessibilityLabel="Exit to role selection"
              className="active:opacity-60"
              style={styles.ownerPill as never}>
              <AppIcon name="close" size={13} color={colors.coralDark} />
              <Text style={styles.ownerPillText}>EXIT</Text>
            </GSPressable>
          ) : null}
          {onCart ? (
            <GSPressable
              onPress={onCart}
              accessibilityRole="button"
              accessibilityLabel="Open cart"
              className="active:opacity-60"
              style={styles.iconButton as never}>
              <AppIcon name="cart" size={21} color={colors.ink} />
              {cartCount && cartCount > 0 ? (
                <View style={styles.count}>
                  <Text style={styles.countText}>{cartCount}</Text>
                </View>
              ) : null}
            </GSPressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 20,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    gap: 12,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1240 : undefined,
    alignSelf: 'center',
  },
  logoButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 25,
    lineHeight: 28,
  },
  heading: {
    flex: 1,
    gap: 1,
  },
  eyebrow: {
    color: colors.coralDark,
    fontSize: 10,
    fontFamily: fonts.extraBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontFamily: fonts.extraBold,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.inkSoft,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  count: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: fonts.extraBold,
  },
  ownerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.coralSoft,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  ownerPillText: {
    color: colors.coralDark,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
});
