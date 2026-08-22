import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, fonts, radii, shadow } from '@/constants/design';
import { formatPrice, getCategory, getMarketStatus } from '@/constants/market';
import { getPageGutter, responsive } from '@/constants/responsive';
import { MAX_QUANTITY_PER_LINE, useCart } from '@/store/cart';
import { useProducts } from '@/store/products';

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 900;
  const compact = Platform.OS === 'web' && width < 360;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById } = useProducts();
  const { addToCart, getQuantity, itemCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const product = getProductById(id);

  if (!product) {
    return (
      <View style={styles.screen}>
        <ModernHeader title="Sweet" showBack />
        <View style={styles.missing}><Text style={styles.missingTitle}>This sweet is no longer on the menu.</Text></View>
      </View>
    );
  }

  const category = getCategory(product.category);
  const maxAvailable = Math.min(MAX_QUANTITY_PER_LINE, product.stockQuantity);
  const alreadyInCart = getQuantity(product.id);
  const status = getMarketStatus();

  const handleAdd = () => {
    addToCart(product, quantity);
    Alert.alert('Added to your box', `${quantity} × ${product.name} is ready when you are.`);
    setQuantity(1);
  };

  return (
    <View style={styles.screen}>
      <ModernHeader title={product.name} showBack cartCount={itemCount} onCart={() => router.push('/cart')} onSwitchRole={() => router.replace('/role-selection' as never)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, responsive.mediumPage, desktop && styles.contentDesktop, { paddingHorizontal: getPageGutter(width), paddingBottom: insets.bottom + 34 }]}>
        <View style={[styles.imageWrap, compact && styles.imageWrapCompact, desktop && styles.imageWrapDesktop]}>
          {product.image ? <Image source={{ uri: product.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} /> : <View style={styles.imageFallback}><AppIcon name={category.icon} size={60} color={colors.ink} /></View>}
          <View style={styles.imageBadge}><Text style={styles.imageBadgeText}>{product.isNew ? 'JUST ARRIVED' : category.label.toUpperCase()}</Text></View>
        </View>
        <View style={[styles.body, desktop && styles.bodyDesktop]}>
          <View style={styles.tagRow}>
            <View style={styles.tag}><AppIcon name={category.icon} size={14} color={colors.ink} /><Text style={styles.tagText}>{category.label}</Text></View>
            {product.isNew ? <View style={[styles.tag, styles.tagCoral]}><AppIcon name="sparkle" size={14} color={colors.coralDark} /><Text style={styles.tagCoralText}>New</Text></View> : null}
          </View>
          <Text style={[styles.title, compact && styles.titleCompact]}>{product.name}</Text>
          <View style={styles.priceRow}><Text style={styles.price}>{formatPrice(product.price)}</Text><Text style={styles.unit}>per {product.unit}</Text></View>
          {product.weight ? <Text style={styles.weight}>{product.weight}</Text> : null}
          {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

          <View style={styles.infoCard}>
            <View style={styles.infoLine}><AppIcon name={status.isOpen ? 'storeOpen' : 'storeClosed'} size={18} color={status.isOpen ? colors.ink : colors.coralDark} /><Text style={styles.infoText}>{status.message}</Text></View>
            <View style={styles.infoLine}><AppIcon name="checkCircle" size={18} color={product.available ? colors.ink : colors.coralDark} /><Text style={styles.infoText}>{product.available ? `${product.stockQuantity} available today` : 'Currently sold out'}</Text></View>
            {alreadyInCart > 0 ? <View style={styles.infoLine}><AppIcon name="cartAdded" size={18} color={colors.coralDark} /><Text style={styles.infoText}>{alreadyInCart} already in your box</Text></View> : null}
          </View>

          <View style={styles.quantityHeader}><Text style={styles.quantityLabel}>How many?</Text><View style={styles.stepper}><GSPressable onPress={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} style={styles.stepperButton as never}><AppIcon name="minus" size={15} color={colors.ink} /></GSPressable><Text style={styles.quantity}>{quantity}</Text><GSPressable onPress={() => setQuantity((value) => Math.min(maxAvailable, value + 1))} disabled={quantity >= maxAvailable} style={[styles.stepperButton, styles.stepperFilled] as never}><AppIcon name="plus" size={15} color={colors.white} /></GSPressable></View></View>
          <GSPressable onPress={handleAdd} disabled={!product.available || product.stockQuantity < 1} style={[styles.addButton, (!product.available || product.stockQuantity < 1) && styles.disabled] as never}><AppIcon name="cartAdd" size={19} color={colors.white} /><Text style={styles.addButtonText}>Add to box · {formatPrice(product.price * quantity)}</Text></GSPressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 18, gap: 18 },
  contentDesktop: { flexDirection: 'row', alignItems: 'stretch', gap: 28, paddingTop: 32 },
  imageWrap: { height: 330, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.sage, position: 'relative', ...shadow.card },
  imageWrapCompact: { height: 270, borderRadius: 15 },
  imageWrapDesktop: { width: '48%', height: 540, borderRadius: 20 },
  imageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageBadge: { position: 'absolute', left: 15, top: 15, backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 7 },
  imageBadgeText: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 9, letterSpacing: 1.1 },
  body: { gap: 12 },
  bodyDesktop: { flex: 1, padding: 30, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20 },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radii.pill, backgroundColor: colors.sage, paddingHorizontal: 10, paddingVertical: 7 },
  tagText: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 11 },
  tagCoral: { backgroundColor: colors.cream },
  tagCoralText: { color: colors.coralDark, fontFamily: fonts.semibold, fontSize: 11 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.45 },
  titleCompact: { fontSize: 30, lineHeight: 34 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  price: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 24 },
  unit: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 12 },
  weight: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 12 },
  description: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 15, lineHeight: 24, marginTop: 2 },
  infoCard: { backgroundColor: colors.paper, borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 11, marginTop: 4 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  infoText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 12, flex: 1 },
  quantityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  quantityLabel: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperButton: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepperFilled: { backgroundColor: colors.ink, borderColor: colors.ink },
  quantity: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 16, minWidth: 18, textAlign: 'center' },
  addButton: { height: 55, borderRadius: radii.button, backgroundColor: colors.coral, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 2 },
  addButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  disabled: { opacity: 0.45 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missingTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 17, textAlign: 'center' },
});
