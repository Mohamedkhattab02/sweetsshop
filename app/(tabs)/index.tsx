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
import { colors, radii, shadow } from '@/constants/design';
import { CATEGORIES, getMarketStatus } from '@/constants/market';
import { responsive } from '@/constants/responsive';
import { useCart } from '@/store/cart';
import { useProducts, type Product } from '@/store/products';

const heroImage = require('@/assets/images/nour-sweets-shop-hero.png');

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
  const availableWidth = width - (desktop ? 252 : 0);
  const columnCount = isWeb ? (availableWidth >= 1120 ? 4 : availableWidth >= 760 ? 3 : 2) : 2;

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
        eyebrow="User SWEETS"
        title="Good morning, sweet tooth"
        subtitle="Freshly made in the heart of the neighborhood"
        cartCount={itemCount}
        onCart={() => router.push('/cart')}
        notificationCount={unreadNotificationCount('customer')}
        onNotifications={() => router.push('/notifications?audience=customer' as never)}
        onSwitchRole={() => router.replace('/role-selection' as never)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, responsive.page, { paddingBottom: insets.bottom + 34 }]}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.heroLayout, desktop && styles.heroLayoutDesktop]}>
          <Animated.View entering={FadeInUp.duration(650)} style={[styles.hero, desktop && styles.heroDesktop, shadow.floating]}>
            <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={styles.heroShade} />
            <View style={[styles.heroCopy, desktop && styles.heroCopyDesktop]}>
              <View style={styles.heroPill}>
                <View style={styles.liveDot} />
                <Text style={styles.heroPillText}>{status.isOpen ? 'OPEN TODAY' : 'ORDER AHEAD'}</Text>
              </View>
              <Text style={[styles.heroTitle, desktop && styles.heroTitleDesktop]}>Handcrafted{`\n`}happiness.</Text>
              <Text style={[styles.heroSubtitle, desktop && styles.heroSubtitleDesktop]}>A box of small joys, made fresh for your table.</Text>
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

        <View style={[styles.discoveryPanel, isWeb && styles.discoveryPanelWeb]}>
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
          <View style={styles.grid}>
            {gridRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.gridRow}>
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
  content: { paddingHorizontal: 20, gap: 18 },
  heroLayout: { gap: 18 },
  heroLayoutDesktop: { flexDirection: 'row', alignItems: 'stretch', gap: 20 },
  hero: { minHeight: 310, borderRadius: 28, overflow: 'hidden', position: 'relative', backgroundColor: colors.ink },
  heroDesktop: { flex: 1.8, minHeight: 430, borderRadius: 32 },
  heroShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(13, 31, 27, 0.52)' },
  heroCopy: { flex: 1, justifyContent: 'flex-end', padding: 22, gap: 9 },
  heroCopyDesktop: { padding: 38, gap: 12 },
  heroPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 7 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A9E7BA' },
  heroPillText: { color: '#EAF6ED', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  heroTitle: { color: colors.white, fontFamily: 'Georgia', fontSize: 38, lineHeight: 40, fontWeight: '700', letterSpacing: -1 },
  heroTitleDesktop: { fontSize: 57, lineHeight: 58, letterSpacing: -1.8 },
  heroSubtitle: { color: '#D7E3DD', fontSize: 13, lineHeight: 19, maxWidth: 250 },
  heroSubtitleDesktop: { fontSize: 15, lineHeight: 23, maxWidth: 390 },
  heroCta: { alignSelf: 'flex-start', marginTop: 5, backgroundColor: colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroCtaText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  heroArrow: { transform: [{ rotate: '-90deg' }] },
  statusCard: { backgroundColor: colors.white, borderRadius: 19, padding: 12, ...shadow.card },
  statusCardDesktop: { flex: 0.72, borderRadius: 28, padding: 22, justifyContent: 'space-between' },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  statusIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusCopy: { flex: 1, gap: 2 },
  statusTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  statusSub: { color: colors.inkSoft, fontSize: 11 },
  rotateRight: { transform: [{ rotate: '-90deg' }] },
  serviceList: { gap: 5, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 13 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  serviceIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  serviceCopy: { flex: 1, gap: 2 },
  serviceTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  serviceDetail: { color: colors.inkSoft, fontSize: 10, lineHeight: 14 },
  discoveryPanel: { gap: 18 },
  discoveryPanelWeb: { backgroundColor: colors.white, borderRadius: 26, padding: 20, borderWidth: 1, borderColor: colors.line },
  searchBox: { height: 54, borderRadius: 17, backgroundColor: colors.cloud, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9, marginTop: 2 },
  searchInput: { flex: 1, color: colors.ink, fontSize: 14, height: 54 },
  clearSearch: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionKicker: { color: colors.coralDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 4 },
  sectionTitle: { color: colors.ink, fontSize: 23, fontWeight: '800', letterSpacing: -0.6 },
  countLabel: { color: colors.inkSoft, fontSize: 11, paddingBottom: 3 },
  clearButton: { padding: 5 },
  clearText: { color: colors.coralDark, fontSize: 12, fontWeight: '800' },
  categoryRow: { gap: 9, paddingVertical: 1, paddingRight: 20 },
  categoryRowWrapped: { flexDirection: 'row', flexWrap: 'wrap', paddingRight: 0 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.line },
  categoryChipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  categoryText: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  categoryTextSelected: { color: colors.white },
  productRail: { gap: 13, paddingVertical: 5, paddingRight: 20 },
  grid: { gap: 13 },
  gridRow: { flexDirection: 'row', gap: 13 },
  gridFiller: { flex: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 24, padding: 34, gap: 8 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  emptyCopy: { color: colors.inkSoft, fontSize: 13, textAlign: 'center' },
});
