import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { colors, fonts, radii, shadow } from '@/constants/design';
import type { IconName } from '@/constants/icons';

const heroImage = require('@/assets/images/nour-sweets-web-hero-v2.png');

const roles: {
  title: string;
  description: string;
  cta: string;
  icon: IconName;
  onPress: 'customer' | 'owner' | 'courier';
}[] = [
  {
    title: 'Shop the counter',
    description: 'Browse today’s sweets, build a box, and follow your order from the kitchen to you.',
    cta: 'Enter the shop',
    icon: 'storeOpen',
    onPress: 'customer',
  },
  {
    title: 'Manage the shop',
    description: 'Keep the menu, stock, incoming orders, and daily performance in one focused workspace.',
    cta: 'Open owner workspace',
    icon: 'checkout',
    onPress: 'owner',
  },
  {
    title: 'Deliver an order',
    description: 'Claim a delivery, share route progress, and make every handoff feel effortless.',
    cta: 'Open courier desk',
    icon: 'address',
    onPress: 'courier',
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 1040;

  const enter = (role: 'customer' | 'owner' | 'courier') => {
    if (role === 'customer') router.replace('/(tabs)' as never);
    if (role === 'owner') router.replace('/owner' as never);
    if (role === 'courier') router.replace('/courier' as never);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          desktop && styles.contentDesktop,
          { paddingTop: insets.top + (desktop ? 24 : 16), paddingBottom: insets.bottom + 20 },
        ]}>
        <Animated.View entering={FadeInUp.duration(520)} style={styles.topbar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandLetter}>N</Text></View>
            <View>
              <Text style={styles.brand}>NOUR SWEETS</Text>
              <Text style={styles.brandSub}>Handcrafted joy, made fresh</Text>
            </View>
          </View>
          {desktop ? (
            <View style={styles.openNote}>
              <View style={styles.liveDot} />
              <Text style={styles.openText}>The online counter is open</Text>
            </View>
          ) : null}
        </Animated.View>

        <View style={[styles.main, desktop && styles.mainDesktop]}>
          <Animated.View entering={FadeInUp.delay(80).duration(580)} style={[styles.visualPanel, desktop && styles.visualPanelDesktop, shadow.floating]}>
            <Image
              source={heroImage}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessibilityLabel="A bright counter filled with handcrafted Middle Eastern sweets"
            />
            <View style={styles.imageShade} />
            <View style={styles.visualCopy}>
              <Text style={styles.visualKicker}>MADE THIS MORNING</Text>
              <Text style={[styles.visualTitle, desktop && styles.visualTitleDesktop]}>A little celebration,{`\n`}whenever you need one.</Text>
              <Text style={styles.visualText}>Small-batch sweets, thoughtful boxes, and a smoother way to order.</Text>
              <View style={styles.proofRow}>
                <Proof value="20+" label="fresh favorites" />
                <View style={styles.proofDivider} />
                <Proof value="3" label="simple workspaces" />
                <View style={styles.proofDivider} />
                <Proof value="Live" label="order updates" />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(130).duration(580)} style={[styles.rolePanel, desktop && styles.rolePanelDesktop]}>
            <View style={styles.intro}>
              <Text style={styles.kicker}>CHOOSE YOUR SPACE</Text>
              <Text style={[styles.title, desktop && styles.titleDesktop]}>How are you joining Nour today?</Text>
              <Text style={styles.copy}>Each workspace is tailored to the task, with no sign-up or password required.</Text>
            </View>

            <View style={styles.choices}>
              {roles.map((role, index) => (
                <RoleCard key={role.onPress} {...role} primary={index === 0} onSelect={() => enter(role.onPress)} />
              ))}
            </View>

            <View style={styles.assurance}>
              <AppIcon name="checkCircle" size={17} color={colors.coralDark} />
              <Text style={styles.assuranceText}>Fast, accessible, and designed for every screen.</Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

function Proof({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.proof}>
      <Text style={styles.proofValue}>{value}</Text>
      <Text style={styles.proofLabel}>{label}</Text>
    </View>
  );
}

function RoleCard({
  title,
  description,
  icon,
  cta,
  primary,
  onSelect,
}: {
  title: string;
  description: string;
  icon: IconName;
  cta: string;
  primary: boolean;
  onSelect: () => void;
}) {
  return (
    <GSPressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="active:opacity-85"
      style={[styles.roleCard, primary && styles.roleCardPrimary] as never}>
      <View style={[styles.roleIcon, primary && styles.roleIconPrimary]}>
        <AppIcon name={icon} size={22} color={primary ? colors.white : colors.ink} />
      </View>
      <View style={styles.roleCopy}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleDescription}>{description}</Text>
        <Text style={[styles.roleCtaText, primary && styles.roleCtaTextPrimary]}>{cta}</Text>
      </View>
      <View style={[styles.roleAction, primary && styles.roleActionPrimary]}>
        <AppIcon name="chevronDown" size={16} color={primary ? colors.white : colors.ink} style={styles.arrow} />
      </View>
    </GSPressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  scroll: { flex: 1 },
  content: { flexGrow: 1, width: '100%', paddingHorizontal: 20, gap: 18 },
  contentDesktop: { maxWidth: 1420, alignSelf: 'center', paddingHorizontal: 40, gap: 28 },
  topbar: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandMark: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  brandLetter: { color: colors.white, fontFamily: fonts.display, fontSize: 28, lineHeight: 31 },
  brand: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 13, letterSpacing: 1.8 },
  brandSub: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, marginTop: 2 },
  openNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 9 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#35A965' },
  openText: { color: colors.inkSoft, fontFamily: fonts.semibold, fontSize: 11 },
  main: { flex: 1, gap: 22 },
  mainDesktop: { flexDirection: 'row', alignItems: 'stretch', minHeight: 680, paddingBottom: 12 },
  visualPanel: { minHeight: 390, borderRadius: 20, overflow: 'hidden', position: 'relative', backgroundColor: colors.ink },
  visualPanelDesktop: { flex: 1.05, minHeight: 680 },
  imageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(21, 30, 25, 0.18)' },
  visualCopy: { flex: 1, justifyContent: 'flex-end', padding: 24, gap: 10, maxWidth: 610 },
  visualKicker: { color: '#F6E7BF', fontFamily: fonts.extraBold, fontSize: 10, letterSpacing: 1.8 },
  visualTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 35, lineHeight: 39, letterSpacing: -0.5 },
  visualTitleDesktop: { fontSize: 54, lineHeight: 57, letterSpacing: -1.1 },
  visualText: { color: '#EEF3EF', fontFamily: fonts.medium, fontSize: 14, lineHeight: 22, maxWidth: 470 },
  proofRow: { flexDirection: 'row', alignItems: 'stretch', gap: 14, marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.24)' },
  proof: { flex: 1, gap: 2 },
  proofValue: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 18 },
  proofLabel: { color: '#DCE6E0', fontFamily: fonts.medium, fontSize: 9, lineHeight: 13 },
  proofDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  rolePanel: { gap: 20, paddingBottom: 10 },
  rolePanelDesktop: { flex: 0.95, justifyContent: 'center', paddingHorizontal: 34, paddingVertical: 24 },
  intro: { gap: 8 },
  kicker: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 10, letterSpacing: 1.8 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 36, lineHeight: 40, letterSpacing: -0.5 },
  titleDesktop: { fontSize: 48, lineHeight: 51, letterSpacing: -0.9 },
  copy: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 14, lineHeight: 22, maxWidth: 540 },
  choices: { gap: 10 },
  roleCard: { minHeight: 118, backgroundColor: colors.white, borderRadius: radii.card, borderWidth: 1, borderColor: colors.line, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 },
  roleCardPrimary: { borderColor: colors.coralSoft, backgroundColor: '#FFFBF9' },
  roleIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  roleIconPrimary: { backgroundColor: colors.coral },
  roleCopy: { flex: 1, gap: 4 },
  roleTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 16, lineHeight: 21 },
  roleDescription: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11, lineHeight: 17 },
  roleCtaText: { color: colors.ink, fontFamily: fonts.bold, fontSize: 10, marginTop: 3 },
  roleCtaTextPrimary: { color: colors.coralDark },
  roleAction: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.cloud, alignItems: 'center', justifyContent: 'center' },
  roleActionPrimary: { backgroundColor: colors.ink },
  arrow: { transform: [{ rotate: '-90deg' }] },
  assurance: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assuranceText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11 },
});
