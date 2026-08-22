import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';

import { ModernSweetCard } from '@/components/market/modern-sweet-card';
import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, fonts, radii, shadow } from '@/constants/design';
import { CATEGORIES, getMarketStatus } from '@/constants/market';
import { getPageGutter, responsive } from '@/constants/responsive';
import { useCart } from '@/store/cart';
import { useProducts, type Product } from '@/store/products';

const heroImage = require('@/assets/images/nour-sweets-web-hero-v2.png');

export default function CustomerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { itemCount, unreadNotificationCount } = useCart();
  const { products, selectedCategories, toggleCategory, clearCategories } = useProducts();
  const [query, setQuery] = useState('');
  const status = getMarketStatus();
  const isWeb = Platform.OS === 'web';
  const desktop = isWeb && width >= 980;
  const compactPhone = isWeb && width < 360;
  const availableWidth = width - (desktop ? 264 : 0);
  const pageGutter = getPageGutter(availableWidth);
  const gridWidth = availableWidth - pageGutter * 2;
  const columnCount = isWeb
    ? gridWidth >= 1040
      ? 4
      : gridWidth >= 700
        ? 3
        : gridWidth >= 330
          ? 2
          : 1
    : 2;

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const searchMatch =
        !normalized ||
        [product.name, product.description, product.weight]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(normalized));
      return categoryMatch && searchMatch;
    });
  }, [products, query, selectedCategories]);

  const bestSellers = products.filter((product) => product.available).slice(0, 5);
  const gridRows: Product[][] = [];
  for (let index = 0; index < filteredProducts.length; index += columnCount) {
    gridRows.push(filteredProducts.slice(index, index + columnCount));
  }

  return (
    <View className="flex-1 bg-[#FBFAF7]" style={styles.screen}>
      <ModernHeader
        eyebrow="NOUR SWEETS"
        title="The fresh counter"
        subtitle="Handcrafted this morning, ready for your table"
        cartCount={itemCount}
        onCart={() => router.push('/cart')}
        notificationCount={unreadNotificationCount('customer')}
        onNotifications={() => router.push('/notifications?audience=customer' as never)}
        onSwitchRole={() => router.replace('/role-selection' as never)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, responsive.page, { paddingHorizontal: pageGutter, paddingBottom: insets.bottom + 34 }]}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.heroLayout, desktop && styles.heroLayoutDesktop]}>
          <Animated.View entering={FadeInUp.duration(650)} style={[styles.hero, compactPhone && styles.heroCompact, desktop && styles.heroDesktop, shadow.floating]}>
            <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={styles.heroShade} />
            <View style={[styles.heroCopy, compactPhone && styles.heroCopyCompact, desktop && styles.heroCopyDesktop]}>
              <View style={styles.heroPill}>
                <View style={styles.liveDot} />
                <Text style={styles.heroPillText}>{status.isOpen ? 'OPEN TODAY' : 'ORDER AHEAD'}</Text>
              </View>
              <Text style={[styles.heroTitle, compactPhone && styles.heroTitleCompact, desktop && styles.heroTitleDesktop]}>Fresh from our ovens.{`\n`}Ready for your table.</Text>
              <Text style={[styles.heroSubtitle, desktop && styles.heroSubtitleDesktop]}>Build a thoughtful box from today’s small-batch selection.</Text>
              <GSPressable
                onPress={() => router.push('/(tabs)/cart' as never)}
                accessibilityRole="button"
                className="active:opacity-70"
                style={styles.heroCta as never}>
                <Text style={styles.heroCtaText}>Build your box</Text>
                <AppIcon name="chevronDown" size={16} color={colors.ink} style={styles.heroArrow} />
              </GSPressable>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(550)} style={[styles.statusCard, desktop && styles.statusCardDesktop]}>
            <View style={styles.statusTop}>
              <View style={[styles.statusIcon, { backgroundColor: status.isOpen ? colors.sage : colors.cream }]}>
                <AppIcon
                  name={status.isOpen ? 'storeOpen' : 'storeClosed'}
                  size={19}
                  color={status.isOpen ? colors.ink : colors.coralDark}
                />
              </View>
              <View style={styles.statusCopy}>
                <Text style={styles.statusTitle}>{status.isOpen ? 'The counter is glowing' : 'We’ll be back soon'}</Text>
                <Text style={styles.statusSub}>{status.message}</Text>
              </View>
              {!desktop ? <AppIcon name="chevronDown" size={16} color={colors.inkSoft} style={styles.rotateRight} /> : null}
            </View>
            {desktop ? (
              <View style={styles.serviceList}>
                <ServiceRow icon="sparkle" title="Made fresh today" detail="Small batches, full flavor" />
                <ServiceRow icon="store" title="Pickup or delivery" detail="Choose what works for you" />
                <ServiceRow icon="clock" title="Easy order updates" detail="Follow every step" />
              </View>
            ) : null}
          </Animated.View>
        </View>

        <View style={[styles.discoveryPanel, isWeb && availableWidth >= 600 && styles.discoveryPanelWeb]}>
        <View style={styles.searchBox}>
          <AppIcon name="search" size={20} color={colors.inkSoft} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your favorite sweet"
            placeholderTextColor="#84928C"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <GSPressable onPress={() => setQuery('')} style={styles.clearSearch as never}>
              <AppIcon name="close" size={15} color={colors.inkSoft} />
            </GSPressable>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>THE COUNTER</Text>
            <Text style={styles.sectionTitle}>Shop by mood</Text>
          </View>
          {selectedCategories.length > 0 ? (
            <GSPressable onPress={clearCategories} style={styles.clearButton as never}>
              <Text style={styles.clearText}>Clear</Text>
            </GSPressable>
          ) : null}
        </View>

        {desktop ? (
          <View style={[styles.categoryRow, styles.categoryRowWrapped]}>
            {CATEGORIES.slice(0, 8).map((category) => {
              const selected = selectedCategories.includes(category.id);
              return (
                <GSPressable
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}
                  accessibilityRole="button"
                  className="active:opacity-70"
                  style={[styles.categoryChip, selected && styles.categoryChipSelected] as never}>
                  <AppIcon name={category.icon} size={15} color={selected ? colors.white : colors.ink} />
                  <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{category.label}</Text>
                </GSPressable>
              );
            })}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {CATEGORIES.slice(0, 8).map((category) => {
              const selected = selectedCategories.includes(category.id);
              return (
                <GSPressable
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}
                  accessibilityRole="button"
                  className="active:opacity-70"
                  style={[styles.categoryChip, selected && styles.categoryChipSelected] as never}>
                  <AppIcon name={category.icon} size={15} color={selected ? colors.white : colors.ink} />
                  <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{category.label}</Text>
                </GSPressable>
              );
            })}
          </ScrollView>
        )}
        </View>

        {!query && selectedCategories.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(170).duration(550)}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionKicker}>PEOPLE ARE LOVING</Text>
                <Text style={styles.sectionTitle}>Best sellers</Text>
              </View>
              <Text style={styles.countLabel}>{bestSellers.length} picks</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRail}>
              {bestSellers.map((product) => (
                <ModernSweetCard
                  key={product.id}
                  product={product}
                  compact
                  onPress={() => router.push(`/product/${product.id}` as never)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        ) : null}

        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View>
            <Text style={styles.sectionKicker}>{query || selectedCategories.length ? 'YOUR SEARCH' : 'THE FULL MENU'}</Text>
            <Text style={styles.sectionTitle}>{query || selectedCategories.length ? 'Sweet results' : 'Everything fresh'}</Text>
          </View>
          <Text style={styles.countLabel}>{filteredProducts.length} treats</Text>
        </View>

        {gridRows.length > 0 ? (
          <View style={[styles.grid, compactPhone && styles.gridCompact]}>
            {gridRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={[styles.gridRow, compactPhone && styles.gridRowCompact]}>
                {row.map((product) => (
                  <ModernSweetCard
                    key={product.id}
                    product={product}
                    onPress={() => router.push(`/product/${product.id}` as never)}
                  />
                ))}
                {Array.from({ length: columnCount - row.length }, (_, fillerIndex) => (
                  <View key={`filler-${fillerIndex}`} style={styles.gridFiller} />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <AppIcon name="sparkle" size={30} color={colors.coral} />
            <Text style={styles.emptyTitle}>No sweets found</Text>
            <Text style={styles.emptyCopy}>Try a different search or browse every category.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ServiceRow({ icon, title, detail }: { icon: 'sparkle' | 'store' | 'clock'; title: string; detail: string }) {
  return (
    <View style={styles.serviceRow}>
      <View style={styles.serviceIcon}><AppIcon name={icon} size={17} color={colors.ink} /></View>
      <View style={styles.serviceCopy}>
      <Text style={styles.serviceTitle}>{title}</Text>
        <Text style={styles.serviceDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 18, gap: 24 },
  heroLayout: { gap: 16 },
  heroLayoutDesktop: { flexDirection: 'row', alignItems: 'stretch', gap: 18 },
  hero: { minHeight: 330, borderRadius: 20, overflow: 'hidden', position: 'relative', backgroundColor: colors.ink },
  heroCompact: { minHeight: 290, borderRadius: 16 },
  heroDesktop: { flex: 1.9, minHeight: 460, borderRadius: 22 },
  heroShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(18, 27, 22, 0.1)' },
  heroCopy: { flex: 1, justifyContent: 'flex-end', padding: 24, gap: 10, maxWidth: 610 },
  heroCopyCompact: { padding: 18, gap: 8 },
  heroCopyDesktop: { padding: 40, gap: 13 },
  heroPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 7 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A9E7BA' },
  heroPillText: { color: '#F3F7F4', fontFamily: fonts.extraBold, fontSize: 9, letterSpacing: 1.1 },
  heroTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 38, lineHeight: 41, letterSpacing: -0.6 },
  heroTitleCompact: { fontSize: 31, lineHeight: 34 },
  heroTitleDesktop: { fontSize: 56, lineHeight: 58, letterSpacing: -1.1 },
  heroSubtitle: { color: '#E4EBE7', fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, maxWidth: 300 },
  heroSubtitleDesktop: { fontSize: 15, lineHeight: 23, maxWidth: 420 },
  heroCta: { alignSelf: 'flex-start', marginTop: 5, backgroundColor: colors.white, borderRadius: radii.button, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroCtaText: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  heroArrow: { transform: [{ rotate: '-90deg' }] },
  statusCard: { backgroundColor: colors.white, borderRadius: radii.card, padding: 13, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  statusCardDesktop: { flex: 0.68, borderRadius: 20, padding: 22, justifyContent: 'space-between' },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  statusIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusCopy: { flex: 1, gap: 2 },
  statusTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 13 },
  statusSub: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11 },
  rotateRight: { transform: [{ rotate: '-90deg' }] },
  serviceList: { gap: 5, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 13 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  serviceIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  serviceCopy: { flex: 1, gap: 2 },
  serviceTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  serviceDetail: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, lineHeight: 14 },
  discoveryPanel: { gap: 18 },
  discoveryPanelWeb: { backgroundColor: colors.white, borderRadius: 18, padding: 24, borderWidth: 1, borderColor: colors.line },
  searchBox: { height: 56, borderRadius: radii.input, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9, marginTop: 2 },
  searchInput: { flex: 1, color: colors.ink, fontFamily: fonts.medium, fontSize: 14, height: 56 },
  clearSearch: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionKicker: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 10, letterSpacing: 1.6, marginBottom: 4 },
  sectionTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 23, letterSpacing: -0.55 },
  countLabel: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11, paddingBottom: 3 },
  clearButton: { padding: 5 },
  clearText: { color: colors.coralDark, fontFamily: fonts.bold, fontSize: 12 },
  categoryRow: { gap: 9, paddingVertical: 1, paddingRight: 20 },
  categoryRowWrapped: { flexDirection: 'row', flexWrap: 'wrap', paddingRight: 0 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 10, borderWidth: 1, borderColor: colors.line },
  categoryChipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  categoryText: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 11 },
  categoryTextSelected: { color: colors.white },
  productRail: { gap: 16, paddingVertical: 5, paddingRight: 20 },
  grid: { gap: 18 },
  gridCompact: { gap: 12 },
  gridRow: { flexDirection: 'row', gap: 18 },
  gridRowCompact: { gap: 12 },
  gridFiller: { flex: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: radii.card, borderWidth: 1, borderColor: colors.line, padding: 34, gap: 8 },
  emptyTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 17 },
  emptyCopy: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 13, textAlign: 'center' },
});
