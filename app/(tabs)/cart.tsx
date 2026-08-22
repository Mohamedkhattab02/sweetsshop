import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, fonts, radii, shadow } from '@/constants/design';
import { formatPrice, getMarketStatus } from '@/constants/market';
import { responsive } from '@/constants/responsive';
import { useCart, type CartLine } from '@/store/cart';

export default function CustomerCartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 1120;
  const { lines, itemCount, subtotal, isEmpty, setQuantity, removeFromCart, clearCart } = useCart();
  const status = getMarketStatus();

  const askToClear = () => {
    Alert.alert('Empty your box?', `This removes all ${itemCount} items from your cart.`, [
      { text: 'Keep them', style: 'cancel' },
      { text: 'Empty cart', style: 'destructive', onPress: clearCart },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ModernHeader
        eyebrow="YOUR NOUR"
        title="Your box"
        subtitle={isEmpty ? 'A little room for something lovely' : `${itemCount} little joys selected`}
        onSwitchRole={() => router.replace('/role-selection' as never)}
      />
      {isEmpty ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyOrb}>
            <AppIcon name="cart" size={38} color={colors.ink} />
          </View>
          <Text style={styles.emptyTitle}>Your box is waiting</Text>
          <Text style={styles.emptyText}>Fill it with the things that make a coffee break better.</Text>
          <GSPressable onPress={() => router.replace('/(tabs)' as never)} style={styles.primaryButton as never}>
            <Text style={styles.primaryButtonText}>Browse the counter</Text>
            <AppIcon name="chevronDown" size={16} color={colors.white} style={styles.arrow} />
          </GSPressable>
        </View>
      ) : (
        <View style={[styles.cartLayout, desktop && styles.cartLayoutDesktop]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, desktop ? styles.desktopContent : responsive.mediumPage, { paddingBottom: desktop ? 40 : insets.bottom + 182 }]}
          style={styles.cartScroll}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Selected for you</Text>
            <GSPressable onPress={askToClear} style={styles.clearButton as never}>
              <AppIcon name="delete" size={15} color={colors.coralDark} />
              <Text style={styles.clearText}>Clear</Text>
            </GSPressable>
          </View>
          <View style={styles.lines}>
            {lines.map((line) => (
                <CartLineItem
                key={line.product.id}
                line={line}
                onChange={(quantity) => setQuantity(line.product.id, quantity)}
                onRemove={() => removeFromCart(line.product.id)}
                onPress={() => router.push(`/product/${line.product.id}` as never)}
              />
            ))}
          </View>

          <View style={styles.noteCard}>
            <View style={styles.noteIcon}>
              <AppIcon name="sparkle" size={17} color={colors.coralDark} />
            </View>
            <View style={styles.noteCopy}>
              <Text style={styles.noteTitle}>Made fresh for you</Text>
              <Text style={styles.noteText}>{status.isOpen ? 'We’ll start preparing once your order is confirmed.' : status.message}</Text>
            </View>
          </View>
        </ScrollView>
        {desktop ? (
          <View style={styles.summaryRail}>
            <CheckoutSummary itemCount={itemCount} subtotal={subtotal} onCheckout={() => router.push('/checkout')} desktop />
          </View>
        ) : null}
        </View>
      )}

      {!isEmpty && !desktop ? (
        <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={[styles.checkoutBarInner, responsive.mediumPage]}>
            <CheckoutSummary itemCount={itemCount} subtotal={subtotal} onCheckout={() => router.push('/checkout')} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CheckoutSummary({ itemCount, subtotal, onCheckout, desktop = false }: { itemCount: number; subtotal: number; onCheckout: () => void; desktop?: boolean }) {
  return (
    <View style={desktop ? styles.desktopSummary : styles.mobileSummary}>
      {desktop ? <View><Text style={styles.summaryKicker}>YOUR ORDER</Text><Text style={styles.summaryTitle}>Order summary</Text></View> : null}
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>Total · {itemCount} items</Text>
          <Text style={styles.totalHint}>Taxes included</Text>
        </View>
        <Text style={styles.total}>{formatPrice(subtotal)}</Text>
      </View>
      {desktop ? (
        <View style={styles.summaryPromise}>
          <View style={styles.promiseLine}><AppIcon name="sparkle" size={15} color={colors.coralDark} /><Text style={styles.promiseText}>Prepared fresh after confirmation</Text></View>
          <View style={styles.promiseLine}><AppIcon name="checkCircle" size={15} color={colors.ink} /><Text style={styles.promiseText}>Pickup or courier delivery</Text></View>
        </View>
      ) : null}
      <GSPressable onPress={onCheckout} style={styles.checkoutButton as never}>
        <Text style={styles.checkoutText}>Continue to details</Text>
        <AppIcon name="chevronDown" size={18} color={colors.white} style={styles.arrow} />
      </GSPressable>
    </View>
  );
}

function CartLineItem({
  line,
  onChange,
  onRemove,
  onPress,
}: {
  line: CartLine;
  onChange: (quantity: number) => void;
  onRemove: () => void;
  onPress: () => void;
}) {
  return (
    <GSPressable onPress={onPress} className="active:opacity-75" style={styles.line as never}>
      <Image source={{ uri: line.product.image }} style={styles.thumb} contentFit="cover" />
      <View style={styles.lineMain}>
        <View style={styles.lineTitleRow}>
          <View style={styles.lineCopy}>
            <Text numberOfLines={2} style={styles.lineName}>{line.product.name}</Text>
            <Text style={styles.lineMeta}>{line.product.weight ?? `Per ${line.product.unit}`}</Text>
          </View>
          <GSPressable onPress={onRemove} style={styles.removeButton as never}>
            <AppIcon name="close" size={14} color={colors.inkSoft} />
          </GSPressable>
        </View>
        <View style={styles.lineBottom}>
          <Text style={styles.linePrice}>{formatPrice(line.product.price * line.quantity)}</Text>
          <View style={styles.stepper}>
            <GSPressable onPress={() => onChange(line.quantity - 1)} style={styles.stepperButton as never}>
              <AppIcon name="minus" size={14} color={colors.ink} />
            </GSPressable>
            <Text style={styles.quantity}>{line.quantity}</Text>
            <GSPressable onPress={() => onChange(line.quantity + 1)} style={[styles.stepperButton, styles.stepperFilled] as never}>
              <AppIcon name="plus" size={14} color={colors.white} />
            </GSPressable>
          </View>
        </View>
      </View>
    </GSPressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  cartLayout: { flex: 1 },
  cartLayoutDesktop: { flexDirection: 'row', alignItems: 'stretch' },
  cartScroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, gap: 20 },
  desktopContent: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 40, paddingTop: 28 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emptyOrb: { width: 92, height: 92, borderRadius: 34, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 22, textAlign: 'center' },
  emptyText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 300 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.coral, borderRadius: radii.button, paddingHorizontal: 16, paddingVertical: 13, marginTop: 7 },
  primaryButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  arrow: { transform: [{ rotate: '-90deg' }] },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 22 },
  clearButton: { flexDirection: 'row', gap: 5, alignItems: 'center', padding: 6 },
  clearText: { color: colors.coralDark, fontFamily: fonts.bold, fontSize: 12 },
  lines: { gap: 11 },
  line: { backgroundColor: colors.white, borderRadius: radii.card, borderWidth: 1, borderColor: colors.line, padding: 10, flexDirection: 'row', gap: 12, ...shadow.card },
  thumb: { width: 88, height: 96, borderRadius: 12, backgroundColor: colors.sage },
  lineMain: { flex: 1, justifyContent: 'space-between', paddingVertical: 3, gap: 13 },
  lineTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  lineCopy: { flex: 1, gap: 5 },
  lineName: { color: colors.ink, fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 },
  lineMeta: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10 },
  removeButton: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center' },
  lineBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linePrice: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 15 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepperButton: { width: 27, height: 27, borderRadius: 10, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepperFilled: { backgroundColor: colors.ink, borderColor: colors.ink },
  quantity: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 13, minWidth: 14, textAlign: 'center' },
  noteCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.coralSoft },
  noteIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  noteCopy: { flex: 1, gap: 2 },
  noteTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  noteText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11, lineHeight: 16 },
  checkoutBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 15, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line },
  checkoutBarInner: { width: '100%', paddingHorizontal: 20, gap: 11 },
  mobileSummary: { gap: 11 },
  summaryRail: { width: 380, padding: 32, borderLeftWidth: 1, borderLeftColor: colors.line, backgroundColor: colors.white },
  desktopSummary: { backgroundColor: colors.paper, borderRadius: 18, padding: 22, gap: 18, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  summaryKicker: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 9, letterSpacing: 1.5 },
  summaryTitle: { color: colors.ink, fontFamily: fonts.display, fontSize: 26, marginTop: 4 },
  summaryPromise: { gap: 10, borderTopWidth: 1, borderTopColor: '#EACFC5', paddingTop: 15 },
  promiseLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promiseText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, flex: 1 },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: colors.ink, fontFamily: fonts.bold, fontSize: 13 },
  totalHint: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, marginTop: 2 },
  total: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 22 },
  checkoutButton: { height: 52, borderRadius: radii.button, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  checkoutText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
});
