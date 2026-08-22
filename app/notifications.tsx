import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, shadow } from '@/constants/design';
import { responsive } from '@/constants/responsive';
import { type NotificationAudience, useCart } from '@/store/cart';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { audience: audienceParam } = useLocalSearchParams<{ audience?: string }>();
  const audience: NotificationAudience = audienceParam === 'owner' || audienceParam === 'courier' ? audienceParam : 'customer';
  const { notifications, markNotificationsRead } = useCart();
  const visible = useMemo(() => notifications.filter((notification) => notification.audience === audience), [audience, notifications]);

  useEffect(() => {
    markNotificationsRead(audience);
  }, [audience, markNotificationsRead]);

  return (
    <View style={styles.screen}>
      <ModernHeader title="Notifications" subtitle="A shared timeline for every update" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, responsive.narrowPage, { paddingBottom: insets.bottom + 28 }]}>
        {visible.length === 0 ? (
          <View style={styles.empty}><View style={styles.emptyIcon}><AppIcon name="notifications" size={25} color={colors.ink} /></View><Text style={styles.emptyTitle}>You&apos;re all caught up</Text><Text style={styles.emptyText}>Order and delivery updates will appear here.</Text></View>
        ) : visible.map((notification) => (
          <View key={notification.id} style={[styles.notification, shadow.card]}>
            <View style={styles.notificationIcon}><AppIcon name="notifications" size={18} color={colors.coralDark} /></View>
            <View style={styles.notificationCopy}><Text style={styles.notificationTitle}>{notification.title}</Text><Text style={styles.notificationMessage}>{notification.message}</Text><Text style={styles.notificationTime}>{new Date(notification.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text></View>
          </View>
        ))}
        <View style={styles.syncCard}><AppIcon name="checkCircle" size={18} color={colors.ink} /><Text style={styles.syncText}>Synced with the customer, shop, and courier workspace.</Text></View>
        <View style={styles.backWrap}><Text onPress={() => router.back()} style={styles.backText}>Back to workspace</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 11 },
  notification: { flexDirection: 'row', gap: 11, backgroundColor: colors.white, borderRadius: 19, padding: 14 },
  notificationIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  notificationCopy: { flex: 1, gap: 3 },
  notificationTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  notificationMessage: { color: colors.inkSoft, fontSize: 11, lineHeight: 16 },
  notificationTime: { color: colors.coralDark, fontSize: 9, fontWeight: '700', marginTop: 3 },
  empty: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 23, padding: 30, gap: 9, ...shadow.card },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.inkSoft, fontSize: 12 },
  syncCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.sage, borderRadius: 15, padding: 12, marginTop: 6 },
  syncText: { flex: 1, color: colors.ink, fontSize: 10, lineHeight: 15 },
  backWrap: { alignItems: 'center', padding: 8 },
  backText: { color: colors.coralDark, fontSize: 11, fontWeight: '800' },
});
