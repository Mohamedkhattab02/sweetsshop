import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, radii, shadow } from '@/constants/design';
import { formatPrice } from '@/constants/market';
import { responsive } from '@/constants/responsive';
import { useCart } from '@/store/cart';
import { useProducts } from '@/store/products';

export default function OwnerAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products } = useProducts();
  const { orders } = useCart();
  const revenue = orders.filter((order) => order.status !== 'declined').reduce((sum, order) => sum + order.total, 0);
  const average = orders.length ? revenue / orders.length : 0;
  const categories = products.reduce<Record<string, number>>((acc, product) => { acc[product.category] = (acc[product.category] ?? 0) + 1; return acc; }, {});
  const topCategories = Object.entries(categories).sort(([, first], [, second]) => second - first).slice(0, 5);

  return (
    <View style={styles.screen}>
      <ModernHeader eyebrow="OWNER WORKSPACE" title="Insights" subtitle="A clearer view of what’s moving" onSwitchRole={() => router.replace('/role-selection' as never)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, responsive.mediumPage, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.period}><Text style={styles.periodTitle}>All-time snapshot</Text><View style={styles.periodPill}><AppIcon name="clock" size={13} color={colors.inkSoft} /><Text style={styles.periodText}>In this session</Text></View></View>
        <View style={styles.heroMetric}><View style={styles.heroMetricTop}><View style={styles.metricIcon}><AppIcon name="tag" size={19} color={colors.gold} /></View><Text style={styles.heroMetricLabel}>TOTAL REVENUE</Text></View><Text style={styles.heroValue}>{formatPrice(revenue)}</Text><Text style={styles.heroHelper}>{orders.length} orders · {formatPrice(average)} average order</Text><View style={styles.sparkBars}>{[34, 54, 44, 75, 58, 86, 68, 95, 77, 100].map((height, index) => <View key={index} style={[styles.sparkBar, { height: `${height}%`, backgroundColor: index > 6 ? colors.coral : '#3A5A50' }]} />)}</View></View>
        <View style={styles.kpiRow}><Kpi icon="checkout" label="Orders" value={String(orders.length)} /><Kpi icon="store" label="Live items" value={String(products.filter((product) => product.available).length)} /><Kpi icon="sparkle" label="New items" value={String(products.filter((product) => product.isNew).length)} /></View>
        <View style={styles.card}><View style={styles.cardHeader}><View><Text style={styles.kicker}>MENU MIX</Text><Text style={styles.cardTitle}>What fills the shelf</Text></View><AppIcon name="sparkle" size={18} color={colors.coral} /></View>{topCategories.map(([category, count], index) => <View key={category} style={styles.categoryRow}><View style={styles.categoryName}><View style={[styles.categoryDot, { backgroundColor: [colors.coral, colors.gold, colors.ink, '#7DA5A0', '#D49AB3'][index] }]} /><Text style={styles.categoryText}>{category.replace('-', ' ')}</Text></View><View style={styles.barTrack}><View style={[styles.barFill, { width: `${Math.max(18, (count / Math.max(...topCategories.map(([, value]) => value))) * 100)}%`, backgroundColor: [colors.coral, colors.gold, colors.ink, '#7DA5A0', '#D49AB3'][index] }]} /></View><Text style={styles.categoryCount}>{count}</Text></View>)}</View>
        <View style={styles.tip}><View style={styles.tipIcon}><AppIcon name="info" size={17} color={colors.ink} /></View><View style={styles.tipCopy}><Text style={styles.tipTitle}>A small note from your counter</Text><Text style={styles.tipText}>{orders.length ? 'Keep an eye on your best-selling categories and restock before the next rush.' : 'Once your first orders arrive, this space will turn into a living view of your shop.'}</Text></View></View>
      </ScrollView>
    </View>
  );
}

function Kpi({ icon, label, value }: { icon: 'checkout' | 'store' | 'sparkle'; label: string; value: string }) { return <View style={styles.kpi}><View style={styles.kpiIcon}><AppIcon name={icon} size={16} color={colors.coralDark} /></View><Text style={styles.kpiValue}>{value}</Text><Text style={styles.kpiLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 15 },
  period: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  periodTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  periodPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.cloud, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 7 },
  periodText: { color: colors.inkSoft, fontSize: 10, fontWeight: '700' },
  heroMetric: { backgroundColor: colors.ink, borderRadius: 24, padding: 18, minHeight: 190, overflow: 'hidden' },
  heroMetricTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricIcon: { width: 33, height: 33, borderRadius: 12, backgroundColor: '#2B4840', alignItems: 'center', justifyContent: 'center' },
  heroMetricLabel: { color: '#B8C9C0', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  heroValue: { color: colors.white, fontSize: 35, fontWeight: '900', marginTop: 12 },
  heroHelper: { color: '#B8C9C0', fontSize: 11, marginTop: 2 },
  sparkBars: { position: 'absolute', left: 18, right: 18, bottom: 0, height: 55, flexDirection: 'row', alignItems: 'flex-end', gap: 5, opacity: 0.9 },
  sparkBar: { flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpi: { flex: 1, backgroundColor: colors.white, borderRadius: 18, padding: 11, gap: 3, ...shadow.card },
  kpiIcon: { width: 29, height: 29, borderRadius: 10, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  kpiValue: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  kpiLabel: { color: colors.inkSoft, fontSize: 10 },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 16, gap: 14, ...shadow.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  kicker: { color: colors.coralDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 4 },
  cardTitle: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryName: { width: 92, flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryDot: { width: 7, height: 7, borderRadius: 4 },
  categoryText: { color: colors.inkSoft, fontSize: 11, textTransform: 'capitalize' },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.cloud, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  categoryCount: { color: colors.ink, fontSize: 11, fontWeight: '800', width: 16, textAlign: 'right' },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.sage, borderRadius: 19, padding: 13 },
  tipIcon: { width: 33, height: 33, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  tipCopy: { flex: 1, gap: 3 },
  tipTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  tipText: { color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
});
