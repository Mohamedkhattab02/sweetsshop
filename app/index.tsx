import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSButton, GSPressable } from '@/components/ui/gluestack';
import { colors, radii, shadow } from '@/constants/design';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 960;

  const enterCustomer = () => router.replace('/(tabs)' as never);
  const enterOwner = () => router.replace('/owner' as never);
  const enterCourier = () => router.replace('/courier' as never);

  return (
    <View style={styles.screen}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.paper }]} />
      <View pointerEvents="none" style={styles.decorOne} />
      <View pointerEvents="none" style={styles.decorTwo} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 18 }]}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(700)} style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandLetter}>N</Text>
          </View>
          <View>
            <Text style={styles.brand}>USER SWEETS</Text>
            <Text style={styles.brandSub}>A little joy, every day</Text>
          </View>
        </Animated.View>

        <View style={[styles.main, desktop && styles.mainDesktop]}>
          <Animated.View entering={FadeInUp.delay(110).duration(700)} style={[styles.intro, desktop && styles.introDesktop]}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerLine} />
              <Text style={styles.kicker}>WELCOME IN</Text>
            </View>
            <Text style={[styles.title, desktop && styles.titleDesktop]}>How will you use User Sweets today?</Text>
            <Text style={[styles.copy, desktop && styles.copyDesktop]}>
              Choose your space. No sign up, no password — just the experience you need.
            </Text>
            {desktop ? (
              <View style={styles.promiseRow}>
                <View style={styles.promiseIcon}><AppIcon name="check" size={14} color={colors.ink} /></View>
                <Text style={styles.promiseText}>One shop, three focused workspaces.</Text>
              </View>
            ) : null}
          </Animated.View>

          <View style={[styles.choices, desktop && styles.choicesDesktop]}>
          <Animated.View entering={FadeInDown.delay(220).duration(650)} style={styles.choiceWrap}>
            <RoleCard
              title="I’m here for sweets"
              description="Browse the fresh counter, build a box, and follow your order."
              icon="storeOpen"
              tone="dark"
              onPress={enterCustomer}
              cta="Enter shop"
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(320).duration(650)} style={styles.choiceWrap}>
            <RoleCard
              title="I run the shop"
              description="Manage today’s menu, stock, and every order in one place."
              icon="checkout"
              tone="light"
              onPress={enterOwner}
              cta="Open workspace"
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(420).duration(650)} style={styles.choiceWrap}>
            <RoleCard
              title="I deliver the joy"
              description="Claim delivery orders, share your route, and confirm the handoff."
              icon="address"
              tone="light"
              onPress={enterCourier}
              cta="Open courier desk"
            />
          </Animated.View>
          </View>
        </View>

        <Animated.View entering={FadeInUp.delay(600).duration(650)} style={styles.footer}>
          <AppIcon name="sparkle" size={15} color={colors.gold} />
          <Text style={styles.footerText}>Made for the moments worth sharing</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function RoleCard({
  title,
  description,
  icon,
  tone,
  onPress,
  cta,
}: {
  title: string;
  description: string;
  icon: 'storeOpen' | 'checkout' | 'address';
  tone: 'dark' | 'light';
  onPress: () => void;
  cta: string;
}) {
  const dark = tone === 'dark';
  const backgroundColor = dark ? colors.ink : colors.white;
  const textColor = dark ? colors.white : colors.ink;
  const mutedColor = dark ? '#B8C9C0' : colors.inkSoft;

  return (
    <GSPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="active:opacity-85"
      style={[styles.roleCard, shadow.card, { backgroundColor }] as never}>
      <View style={[styles.roleIcon, { backgroundColor: dark ? '#2B4840' : colors.sage }]}>
        <AppIcon name={icon} size={25} color={dark ? colors.gold : colors.ink} />
      </View>
      <View style={styles.roleCopy}>
        <Text style={[styles.roleTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.roleDescription, { color: mutedColor }]}>{description}</Text>
      </View>
      <View style={styles.roleFooter}>
        <GSButton
          onPress={onPress}
          className="active:opacity-70"
          style={[styles.roleCta, { backgroundColor: dark ? colors.coral : colors.ink }] as never}>
          <GSButton.Text style={styles.roleCtaText}>{cta}</GSButton.Text>
          <AppIcon name="chevronDown" size={16} color={colors.white} style={styles.arrow} />
        </GSButton>
        <AppIcon name="sparkle" size={16} color={dark ? colors.gold : colors.coral} />
      </View>
    </GSPressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  scroll: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 1240 : undefined, alignSelf: 'center', paddingHorizontal: Platform.OS === 'web' ? 32 : 22, justifyContent: 'space-between' },
  decorOne: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#F5D9C4',
    top: -80,
    right: -70,
    opacity: 0.45,
  },
  decorTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.sage,
    bottom: -50,
    left: -70,
    opacity: 0.65,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: { color: colors.gold, fontFamily: 'Georgia', fontSize: 27, fontWeight: '700' },
  brand: { color: colors.ink, fontSize: 13, fontWeight: '900', letterSpacing: 2.4 },
  brandSub: { color: colors.inkSoft, fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
  main: { flex: 1 },
  mainDesktop: { flexDirection: 'row', alignItems: 'center', gap: 68, paddingVertical: 48 },
  intro: { marginTop: 24, gap: 10 },
  introDesktop: { flex: 0.82, marginTop: 0, paddingRight: 12 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  kickerLine: { width: 24, height: 2, borderRadius: 1, backgroundColor: colors.coral },
  kicker: { color: colors.coralDark, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  title: { color: colors.ink, fontFamily: 'Georgia', fontSize: 38, lineHeight: 43, fontWeight: '700', letterSpacing: -1 },
  titleDesktop: { fontSize: 58, lineHeight: 62, letterSpacing: -1.8, maxWidth: 510 },
  copy: { color: colors.inkSoft, fontSize: 15, lineHeight: 22, maxWidth: 335 },
  copyDesktop: { fontSize: 17, lineHeight: 27, maxWidth: 470 },
  promiseRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14 },
  promiseIcon: { width: 28, height: 28, borderRadius: 10, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  promiseText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  choices: { gap: 14, marginTop: 22 },
  choicesDesktop: { flex: 1.18, marginTop: 0, gap: 12 },
  choiceWrap: { width: '100%' },
  roleCard: { borderRadius: radii.card, padding: 17, gap: 15 },
  roleIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  roleCopy: { gap: 5 },
  roleTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  roleDescription: { fontSize: 13, lineHeight: 19, maxWidth: 310 },
  roleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  roleCta: { minHeight: 40, borderRadius: 13, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  roleCtaText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  arrow: { transform: [{ rotate: '-90deg' }] },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 20 },
  footerText: { color: colors.inkSoft, fontSize: 11, letterSpacing: 0.3 },
});
