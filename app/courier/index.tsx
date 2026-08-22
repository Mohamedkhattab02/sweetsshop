import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, fonts, radii, shadow } from '@/constants/design';
import { formatPrice } from '@/constants/market';
import { responsive } from '@/constants/responsive';
import { openGoogleMaps } from '@/services/maps';
import {
  CURRENT_COURIER,
  type DeliveryStatus,
  type Order,
  useCart,
} from '@/store/cart';

const deliveryLabels: Record<DeliveryStatus, string> = {
  unassigned: 'Waiting for a courier',
  claimed: 'Accepted by you',
  picked_up: 'Picked up from shop',
  on_the_way: 'On the way',
  delivered: 'Handed to customer',
};

const nextDeliveryStep: Partial<Record<DeliveryStatus, { status: DeliveryStatus; label: string }>> = {
  claimed: { status: 'picked_up', label: 'Confirm pickup' },
  picked_up: { status: 'on_the_way', label: 'Start route' },
  on_the_way: { status: 'delivered', label: 'Confirm handoff' },
};

export default function CourierDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 980;
  const {
    availableDeliveries,
    courierOrders,
    claimDelivery,
    updateDeliveryStatus,
    updateCourierLocation,
    unreadNotificationCount,
  } = useCart();
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [liveLocation, setLiveLocation] = useState<Location.LocationObject | null>(null);

  const activeOrders = useMemo(
    () => courierOrders.filter((order) => order.deliveryStatus !== 'delivered'),
    [courierOrders]
  );
  const activeOrder = activeOrders[0];
  const activeOrderId = activeOrder?.id;
  const completedOrders = courierOrders.filter((order) => order.deliveryStatus === 'delivered');

  useEffect(() => {
    if (!permission?.granted || !activeOrderId) return undefined;

    let mounted = true;
    let subscription: Location.LocationSubscription | undefined;

    const startTracking = async () => {
      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15000,
            distanceInterval: 25,
          },
          (location) => {
            if (!mounted) return;
            setLiveLocation(location);
            updateCourierLocation(activeOrderId, {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              updatedAt: Date.now(),
              label: 'Live courier location',
            });
          }
        );
      } catch {
        // The courier can still progress the delivery if location is denied
        // or temporarily unavailable.
      }
    };

    void startTracking();
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [activeOrderId, permission?.granted, updateCourierLocation]);

  const enableLocation = async () => {
    const nextPermission = permission?.granted ? permission : await requestPermission();
    if (!nextPermission?.granted) return;

    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLiveLocation(location);
      if (activeOrder) {
        updateCourierLocation(activeOrder.id, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          updatedAt: Date.now(),
          label: 'Live courier location',
        });
      }
    } catch {
      // Keep the location card in its ready state if the device has no fix yet.
    }
  };

  return (
    <View style={styles.screen}>
      <ModernHeader
        eyebrow="COURIER DESK"
        title={`Hi, ${CURRENT_COURIER.name.split(' ')[0]}`}
        subtitle="Your route, handoffs, and delivery updates"
        notificationCount={unreadNotificationCount('courier')}
        onNotifications={() => router.push('/notifications?audience=courier' as never)}
        onSwitchRole={() => router.replace('/role-selection' as never)}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, responsive.mediumPage, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.topGrid, desktop && styles.topGridDesktop]}>
        <Animated.View entering={FadeInUp.duration(600)} style={[styles.welcomeCard, desktop && styles.welcomeCardDesktop]}>
          <View style={styles.welcomeIcon}>
            <AppIcon name="address" size={22} color={colors.gold} />
          </View>
          <View style={styles.welcomeCopy}>
            <Text style={styles.welcomeKicker}>TODAY&apos;S ROUTE</Text>
            <Text style={styles.welcomeTitle}>{activeOrders.length === 1 ? '1 active delivery' : `${activeOrders.length} active deliveries`}</Text>
            <Text style={styles.welcomeText}>
              {unreadNotificationCount('courier')} new update{unreadNotificationCount('courier') === 1 ? '' : 's'} across the shop.
            </Text>
          </View>
        </Animated.View>

        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.locationIcon}>
              <AppIcon name="address" size={19} color={colors.ink} />
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.cardTitle}>Live location sharing</Text>
              <Text style={styles.cardSub}>
                {liveLocation ? 'The customer and shop can see your latest position.' : 'Share your position while you are on an active route.'}
              </Text>
            </View>
            <View style={[styles.livePill, liveLocation && styles.livePillActive]}>
              <View style={[styles.liveDot, liveLocation && styles.liveDotActive]} />
              <Text style={[styles.liveText, liveLocation && styles.liveTextActive]}>{liveLocation ? 'LIVE' : 'OFF'}</Text>
            </View>
          </View>
          <GSPressable onPress={enableLocation} style={styles.locationButton as never}>
            <Text style={styles.locationButtonText}>{permission?.granted ? 'Refresh location' : 'Enable location'}</Text>
            <AppIcon name="chevronDown" size={15} color={colors.ink} style={styles.arrow} />
          </GSPressable>
          {liveLocation ? (
            <Text style={styles.coordinates}>
              {liveLocation.coords.latitude.toFixed(5)}, {liveLocation.coords.longitude.toFixed(5)} · updated just now
            </Text>
          ) : null}
        </View>
        </View>

        {activeOrders.length > 0 ? (
          <Section title="Your active route" kicker="IN PROGRESS">
            {activeOrders.map((order, index) => (
              <Animated.View key={order.id} entering={FadeInDown.delay(index * 70).duration(450)}>
                <DeliveryCard order={order} onAdvance={(status) => updateDeliveryStatus(order.id, status)} />
              </Animated.View>
            ))}
          </Section>
        ) : null}

        <Section title="Available deliveries" kicker="READY TO CLAIM" count={availableDeliveries.length}>
          {availableDeliveries.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}><AppIcon name="checkCircle" size={24} color={colors.ink} /></View>
              <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
              <Text style={styles.emptyText}>New delivery requests will appear here as customers choose courier service.</Text>
            </View>
          ) : (
            availableDeliveries.map((order, index) => (
              <Animated.View key={order.id} entering={FadeInDown.delay(index * 70).duration(450)}>
                <DeliveryCard order={order} onClaim={() => claimDelivery(order.id)} />
              </Animated.View>
            ))
          )}
        </Section>

        {completedOrders.length > 0 ? (
          <Section title="Completed handoffs" kicker="DELIVERY HISTORY" count={completedOrders.length}>
            {completedOrders.slice(0, 4).map((order) => <DeliveryCard key={order.id} order={order} compact />)}
          </Section>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Section({ title, kicker, count, children }: { title: string; kicker: string; count?: number; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionKicker}>{kicker}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {typeof count === 'number' ? <Text style={styles.sectionCount}>{count} {count === 1 ? 'order' : 'orders'}</Text> : null}
      </View>
      <View style={styles.sectionList}>{children}</View>
    </View>
  );
}

function DeliveryCard({ order, onClaim, onAdvance, compact = false }: { order: Order; onClaim?: () => void; onAdvance?: (status: DeliveryStatus) => void; compact?: boolean }) {
  const next = order.deliveryStatus ? nextDeliveryStep[order.deliveryStatus] : undefined;
  const deliveryAddress = order.customer.deliveryAddress;
  const mapPoint = deliveryAddress?.latitude !== undefined && deliveryAddress.longitude !== undefined
    ? { latitude: deliveryAddress.latitude, longitude: deliveryAddress.longitude }
    : undefined;
  return (
    <View style={[styles.deliveryCard, shadow.card, compact && styles.compactCard]}>
      <View style={styles.deliveryTop}>
        <View style={styles.deliveryIcon}><AppIcon name="address" size={18} color={colors.ink} /></View>
        <View style={styles.deliveryCopy}>
          <Text style={styles.deliveryReference}>{order.reference}</Text>
          <Text style={styles.deliveryCustomer}>{order.customer.name} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</Text>
        </View>
        <Text style={styles.deliveryTotal}>{formatPrice(order.total)}</Text>
      </View>
      <View style={styles.addressRow}>
        <AppIcon name="address" size={15} color={colors.coralDark} />
        <Text style={styles.addressText} numberOfLines={2}>{order.customer.address || 'Customer address not added'}</Text>
      </View>
      {deliveryAddress ? <View style={styles.addressDetails}><Text style={styles.addressDetailsText}>{deliveryAddress.floor ? `Floor ${deliveryAddress.floor}` : 'Floor not provided'}{deliveryAddress.apartment ? ` · Apartment ${deliveryAddress.apartment}` : ''}</Text>{deliveryAddress.notes ? <Text style={styles.addressNotes}>{deliveryAddress.notes}</Text> : null}</View> : null}
      {!compact ? <GSPressable onPress={() => openGoogleMaps(mapPoint, order.customer.address)} style={styles.mapsButton as never}><AppIcon name="address" size={16} color={colors.white} /><Text style={styles.mapsButtonText}>Open destination in Google Maps</Text><AppIcon name="chevronDown" size={14} color={colors.white} style={styles.arrow} /></GSPressable> : null}
      <View style={styles.deliveryMeta}>
        <View style={styles.statusPill}><Text style={styles.statusText}>{deliveryLabels[order.deliveryStatus ?? 'unassigned']}</Text></View>
        {!compact && onClaim ? (
          <GSPressable onPress={onClaim} style={styles.claimButton as never}>
            <Text style={styles.claimText}>Accept delivery</Text>
            <AppIcon name="chevronDown" size={14} color={colors.white} style={styles.arrow} />
          </GSPressable>
        ) : null}
      </View>
      {!compact && next && onAdvance ? (
        <GSPressable onPress={() => onAdvance(next.status)} style={styles.advanceButton as never}>
          <Text style={styles.advanceText}>{next.label}</Text>
          <AppIcon name="check" size={15} color={colors.ink} />
        </GSPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 22, gap: 22 },
  topGrid: { gap: 18 },
  topGridDesktop: { flexDirection: 'row', alignItems: 'stretch', paddingTop: 14 },
  welcomeCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.ink, borderRadius: 18, padding: 18 },
  welcomeCardDesktop: { flex: 0.8, minHeight: 178, borderRadius: 20, padding: 25 },
  welcomeIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#2B4840', alignItems: 'center', justifyContent: 'center' },
  welcomeCopy: { flex: 1, gap: 3 },
  welcomeKicker: { color: colors.gold, fontFamily: fonts.extraBold, fontSize: 9, letterSpacing: 1.4 },
  welcomeTitle: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 18 },
  welcomeText: { color: '#C5D1CB', fontFamily: fonts.medium, fontSize: 11, lineHeight: 16 },
  locationCard: { flex: 1.2, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 17, gap: 12, ...shadow.card },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { width: 39, height: 39, borderRadius: 14, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1, gap: 2 },
  cardTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 13 },
  cardSub: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, lineHeight: 15 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radii.pill, backgroundColor: colors.cloud, paddingHorizontal: 8, paddingVertical: 6 },
  livePillActive: { backgroundColor: '#E5F6EA' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.inkSoft },
  liveDotActive: { backgroundColor: '#31A45A' },
  liveText: { color: colors.inkSoft, fontFamily: fonts.extraBold, fontSize: 9 },
  liveTextActive: { color: '#247843' },
  locationButton: { height: 42, borderRadius: radii.button, backgroundColor: colors.sage, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  locationButtonText: { color: colors.ink, fontFamily: fonts.bold, fontSize: 11 },
  arrow: { transform: [{ rotate: '-90deg' }] },
  coordinates: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, textAlign: 'center' },
  section: { gap: 11 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionKicker: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 9, letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 21, letterSpacing: -0.5 },
  sectionCount: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, paddingBottom: 3 },
  sectionList: { gap: 11 },
  deliveryCard: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 12 },
  compactCard: { opacity: 0.78 },
  deliveryTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deliveryIcon: { width: 37, height: 37, borderRadius: 13, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  deliveryCopy: { flex: 1, gap: 3 },
  deliveryReference: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 14 },
  deliveryCustomer: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10 },
  deliveryTotal: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 13 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, backgroundColor: colors.cloud, borderRadius: 12, padding: 10 },
  addressText: { flex: 1, color: colors.ink, fontFamily: fonts.medium, fontSize: 11, lineHeight: 16 },
  addressDetails: { gap: 3, paddingHorizontal: 2 },
  addressDetailsText: { color: colors.inkSoft, fontSize: 10 },
  addressNotes: { color: colors.coralDark, fontSize: 10, lineHeight: 15 },
  mapsButton: { height: 42, borderRadius: radii.button, backgroundColor: colors.coral, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  mapsButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
  deliveryMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  statusPill: { alignSelf: 'flex-start', borderRadius: radii.pill, backgroundColor: colors.sage, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: { color: colors.ink, fontFamily: fonts.bold, fontSize: 9 },
  claimButton: { flex: 1, height: 39, borderRadius: 13, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  claimText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
  advanceButton: { height: 40, borderRadius: 13, backgroundColor: colors.sage, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  advanceText: { color: colors.ink, fontFamily: fonts.bold, fontSize: 11 },
  emptyCard: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 22, padding: 25, gap: 8, ...shadow.card },
  emptyIcon: { width: 53, height: 53, borderRadius: 19, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 16 },
  emptyText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11, lineHeight: 17, textAlign: 'center', maxWidth: 300 },
});
