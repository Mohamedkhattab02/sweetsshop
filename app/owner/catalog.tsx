import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, fonts, radii, shadow } from '@/constants/design';
import { formatPrice, getCategory } from '@/constants/market';
import { responsive } from '@/constants/responsive';
import { useProducts, type Product } from '@/store/products';

export default function OwnerCatalogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 1120;
  const { products, updateProduct } = useProducts();
  const [query, setQuery] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const normalized = query.trim().toLocaleLowerCase();
  const filtered = useMemo(() => products.filter((product) => (!normalized || product.name.toLocaleLowerCase().includes(normalized)) && (!onlyLowStock || product.stockQuantity < 5)), [normalized, onlyLowStock, products]);

  return (
    <View style={styles.screen}>
      <ModernHeader eyebrow="OWNER WORKSPACE" title="Catalog" subtitle={`${products.length} sweets on your counter`} onSwitchRole={() => router.replace('/role-selection' as never)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, responsive.mediumPage, { paddingBottom: insets.bottom + 28 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.actionRow}><View style={styles.search}><AppIcon name="search" size={18} color={colors.inkSoft} /><TextInput value={query} onChangeText={setQuery} placeholder="Search menu" placeholderTextColor="#95A19B" style={styles.searchInput} /></View><GSPressable onPress={() => router.push('/owner/add-product' as never)} style={styles.addButton as never}><AppIcon name="plus" size={19} color={colors.white} /></GSPressable></View>
        <View style={styles.filters}><GSPressable onPress={() => setOnlyLowStock((value) => !value)} style={[styles.filterPill, onlyLowStock && styles.filterSelected] as never}><AppIcon name="info" size={14} color={onlyLowStock ? colors.white : colors.coralDark} /><Text style={[styles.filterText, onlyLowStock && styles.filterTextSelected]}>Low stock only</Text></GSPressable><Text style={styles.resultCount}>{filtered.length} shown</Text></View>
        <View style={styles.insight}><View style={styles.insightIcon}><AppIcon name="sparkle" size={17} color={colors.coralDark} /></View><View style={styles.insightCopy}><Text style={styles.insightTitle}>Keep the shelf feeling abundant</Text><Text style={styles.insightText}>Tap the stock controls to update quantities in real time.</Text></View></View>
        <View style={[styles.list, desktop && styles.listDesktop]}>{filtered.map((product) => <View key={product.id} style={desktop ? styles.productCell : undefined}><ProductRow product={product} onUpdate={updateProduct} /></View>)}</View>
        {filtered.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>Nothing matches that search</Text><Text style={styles.emptyText}>Try another name or turn off the low stock filter.</Text></View> : null}
      </ScrollView>
    </View>
  );
}

function ProductRow({ product, onUpdate }: { product: Product; onUpdate: (id: string, updates: Partial<Product>) => void }) {
  const category = getCategory(product.category);
  const low = product.stockQuantity < 5;
  return <View style={styles.productRow}><Image source={{ uri: product.image }} style={styles.thumb} contentFit="cover" /><View style={styles.productCopy}><Text style={styles.productName} numberOfLines={1}>{product.name}</Text><Text style={styles.productCategory}>{category.label} · {formatPrice(product.price)}</Text><View style={styles.stockLine}><Text style={[styles.stockLabel, low && styles.stockLow]}>{product.stockQuantity} in stock</Text><View style={styles.stepper}><GSPressable onPress={() => onUpdate(product.id, { stockQuantity: Math.max(0, product.stockQuantity - 1) })} style={styles.stockButton as never}><AppIcon name="minus" size={13} color={colors.ink} /></GSPressable><GSPressable onPress={() => onUpdate(product.id, { stockQuantity: Math.min(99, product.stockQuantity + 1), available: true })} style={[styles.stockButton, styles.stockPlus] as never}><AppIcon name="plus" size={13} color={colors.white} /></GSPressable></View></View></View><View style={styles.productActions}><Switch value={product.available} onValueChange={(value) => onUpdate(product.id, { available: value })} trackColor={{ false: '#D8DFDA', true: colors.mint }} thumbColor={product.available ? colors.ink : '#F7F8F7'} /><Text style={[styles.availability, product.available ? styles.available : styles.soldOut]}>{product.available ? 'Live' : 'Hidden'}</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 22, gap: 16 },
  actionRow: { flexDirection: 'row', gap: 10 },
  search: { flex: 1, height: 52, backgroundColor: colors.white, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, color: colors.ink, fontFamily: fonts.medium, fontSize: 13, height: 52 },
  addButton: { width: 52, height: 52, borderRadius: radii.button, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 11, paddingVertical: 8 },
  filterSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { color: colors.coralDark, fontFamily: fonts.bold, fontSize: 11 },
  filterTextSelected: { color: colors.white },
  resultCount: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11 },
  insight: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.cream, borderRadius: 14, borderWidth: 1, borderColor: colors.coralSoft, padding: 12 },
  insightIcon: { width: 33, height: 33, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  insightCopy: { flex: 1, gap: 2 },
  insightTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  insightText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, lineHeight: 15 },
  list: { gap: 10 },
  listDesktop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: 12 },
  productCell: { width: '48%', flexGrow: 1 },
  productRow: { backgroundColor: colors.white, borderRadius: 15, borderWidth: 1, borderColor: colors.line, padding: 10, flexDirection: 'row', gap: 11, alignItems: 'center', ...shadow.card },
  thumb: { width: 72, height: 76, borderRadius: 11, backgroundColor: colors.sage },
  productCopy: { flex: 1, gap: 4 },
  productName: { color: colors.ink, fontFamily: fonts.bold, fontSize: 13 },
  productCategory: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10 },
  stockLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  stockLabel: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10 },
  stockLow: { color: colors.coralDark, fontFamily: fonts.bold },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stockButton: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stockPlus: { backgroundColor: colors.ink, borderColor: colors.ink },
  productActions: { alignItems: 'center', gap: 1 },
  availability: { fontFamily: fonts.bold, fontSize: 9 },
  available: { color: colors.ink },
  soldOut: { color: colors.coralDark },
  empty: { backgroundColor: colors.white, borderRadius: 22, padding: 25, alignItems: 'center', gap: 6 },
  emptyTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15 },
  emptyText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 12, textAlign: 'center' },
});
