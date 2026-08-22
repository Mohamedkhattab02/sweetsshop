import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, fonts, radii, shadow } from '@/constants/design';
import { buildGoogleMapsUrl } from '@/constants/maps';
import { formatPrice } from '@/constants/market';
import { responsive } from '@/constants/responsive';
import { openGoogleMaps } from '@/services/maps';
import { useCart, type FulfillmentMethod } from '@/store/cart';

const PHONE_ALLOWED = /^[0-9+()\-.\s]+$/;

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 1040;
  const { lines, itemCount, subtotal, isEmpty, placeOrder } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>('pickup');
  const [submitted, setSubmitted] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '').length;
  const nameError = name.trim().length < 2 ? 'Add the name for this order.' : null;
  const phoneError = !phone.trim()
    ? 'Add a phone number so we can confirm it.'
    : !PHONE_ALLOWED.test(phone.trim()) || phoneDigits < 7
      ? 'That phone number looks too short.'
      : null;
  const formattedAddress = useMemo(
    () => [
      street.trim() && houseNumber.trim() ? `${street.trim()} ${houseNumber.trim()}` : street.trim(),
      apartment.trim() ? `Apartment ${apartment.trim()}` : '',
      floor.trim() ? `Floor ${floor.trim()}` : '',
    ].filter(Boolean).join(', '),
    [apartment, floor, houseNumber, street]
  );
  const streetError = fulfillment === 'delivery' && street.trim().length < 2
    ? 'Add the street name for courier delivery.'
    : null;
  const houseNumberError = fulfillment === 'delivery' && !houseNumber.trim()
    ? 'Add the house number so the courier can find you.'
    : null;
  const addressError = streetError || houseNumberError;
  const isValid = !nameError && !phoneError && !addressError;

  const setCurrentLocation = async () => {
    setLocationBusy(true);
    setLocationMessage(null);
    try {
      const nextPermission = permission?.granted ? permission : await requestPermission();
      if (!nextPermission.granted) {
        setLocationMessage('Location permission is needed for the precise Google Maps pin.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(current);
      setLocationMessage('Precise Google Maps pin saved for this order.');
    } catch {
      setLocationMessage('We could not get a location fix. You can still use the written address.');
    } finally {
      setLocationBusy(false);
    }
  };

  const submit = () => {
    setSubmitted(true);
    if (!isValid) return;
    setIsPlacingOrder(true);
    const deliveryAddress = fulfillment === 'delivery'
      ? {
          street,
          houseNumber,
          floor,
          apartment,
          notes,
          formatted: formattedAddress,
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude,
          mapsUrl: buildGoogleMapsUrl(
            location ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : undefined,
            formattedAddress
          ),
        }
      : undefined;
    const order = placeOrder({ name, phone, address: formattedAddress, deliveryAddress }, fulfillment);
    router.replace(`/order/${order.id}` as never);
  };

  if (isEmpty && !isPlacingOrder) {
    return (
      <View style={styles.screen}>
        <ModernHeader title="Checkout" showBack />
        <View style={styles.empty}><Text style={styles.emptyTitle}>There is nothing to order yet.</Text><GSPressable onPress={() => router.replace('/(tabs)' as never)} style={styles.primaryButton as never}><Text style={styles.primaryButtonText}>Browse the menu</Text></GSPressable></View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ModernHeader title="Almost yours" subtitle="A few details and we’ll get started" showBack onSwitchRole={() => router.replace('/role-selection' as never)} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, responsive.mediumPage, { paddingBottom: insets.bottom + 35 }]}>
          <View style={[styles.checkoutGrid, desktop && styles.checkoutGridDesktop]}>
          <View style={[styles.summaryCard, desktop && styles.summaryCardDesktop]}>
            <View style={styles.summaryTop}><View><Text style={styles.summaryKicker}>YOUR BOX</Text><Text style={styles.summaryTitle}>{itemCount} little joys</Text></View><Text style={styles.summaryTotal}>{formatPrice(subtotal)}</Text></View>
            <View style={styles.summaryItems}>{lines.map((line) => <View key={line.product.id} style={styles.summaryLine}><Text numberOfLines={1} style={styles.summaryName}>{line.quantity} × {line.product.name}</Text><Text style={styles.summaryPrice}>{formatPrice(line.product.price * line.quantity)}</Text></View>)}</View>
            <View style={styles.summaryFulfillment}><AppIcon name={fulfillment === 'delivery' ? 'address' : 'store'} size={15} color={colors.gold} /><Text style={styles.summaryFulfillmentText}>{fulfillment === 'delivery' ? 'Courier delivery' : 'Pickup at Nour counter'}</Text></View>
          </View>

          <View style={[styles.formColumn, desktop && styles.formColumnDesktop]}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>How should we get it to you?</Text></View>
          <View style={[styles.fulfillmentRow, desktop && styles.fulfillmentRowDesktop]}>
            <FulfillmentChoice
              selected={fulfillment === 'pickup'}
              icon="store"
              title="Pick it up"
              description="Ready at the Nour counter"
              onPress={() => setFulfillment('pickup')}
            />
            <FulfillmentChoice
              selected={fulfillment === 'delivery'}
              icon="address"
              title="Send a courier"
              description="Track it to your door"
              onPress={() => setFulfillment('delivery')}
            />
          </View>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your details</Text><Text style={styles.required}>Required fields *</Text></View>
          <Field label="Full name" icon="person" value={name} onChange={setName} placeholder="Your name" error={submitted ? nameError : null} />
          <Field label="Phone number" icon="phone" value={phone} onChange={setPhone} placeholder="+972 50 000 0000" keyboardType="phone-pad" error={submitted ? phoneError : null} />
          {fulfillment === 'delivery' ? (
            <>
              <LocationPicker
                location={location}
                busy={locationBusy}
                message={locationMessage}
                onPress={setCurrentLocation}
              />
              <View style={styles.addressFields}>
                <View style={styles.addressColumn}><Field label="Street" icon="address" value={street} onChange={setStreet} placeholder="Street name" error={submitted ? streetError : null} required /></View>
                <View style={styles.addressColumn}><Field label="House number" icon="info" value={houseNumber} onChange={setHouseNumber} placeholder="12" keyboardType="numeric" error={submitted ? houseNumberError : null} required /></View>
              </View>
              <View style={styles.addressFields}>
                <View style={styles.addressColumn}><Field label="Floor" icon="info" value={floor} onChange={setFloor} placeholder="3" keyboardType="numeric" /></View>
                <View style={styles.addressColumn}><Field label="Apartment" icon="info" value={apartment} onChange={setApartment} placeholder="8" keyboardType="numeric" /></View>
              </View>
              <Field label="Notes for the courier" icon="info" value={notes} onChange={setNotes} placeholder="Entrance code, landmark, or anything helpful" multiline hint={formattedAddress ? `Address preview: ${formattedAddress}` : 'The courier will see these notes with the map pin.'} />
            </>
          ) : (
            <View style={styles.pickupNote}><View style={styles.pickupIcon}><AppIcon name="store" size={18} color={colors.ink} /></View><View style={styles.pickupCopy}><Text style={styles.pickupTitle}>Pickup location</Text><Text style={styles.pickupText}>Nour Sweets counter · We&apos;ll confirm when your box is ready.</Text></View></View>
          )}

          <View style={styles.promise}><View style={styles.promiseIcon}><AppIcon name="checkCircle" size={18} color={colors.ink} /></View><View style={styles.promiseCopy}><Text style={styles.promiseTitle}>Your order is in good hands</Text><Text style={styles.promiseText}>We’ll call to confirm timing before we start preparing.</Text></View></View>
          <GSPressable onPress={submit} style={styles.placeButton as never}><Text style={styles.placeText}>Place order · {formatPrice(subtotal)}</Text><AppIcon name="check" size={18} color={colors.white} /></GSPressable>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function FulfillmentChoice({ selected, icon, title, description, onPress }: { selected: boolean; icon: 'store' | 'address'; title: string; description: string; onPress: () => void }) {
  return <GSPressable onPress={onPress} style={[styles.fulfillmentChoice, selected && styles.fulfillmentChoiceSelected] as never}><View style={[styles.choiceIcon, selected && styles.choiceIconSelected]}><AppIcon name={icon} size={18} color={selected ? colors.white : colors.ink} /></View><View style={styles.choiceCopy}><Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>{title}</Text><Text style={[styles.choiceDescription, selected && styles.choiceDescriptionSelected]}>{description}</Text></View>{selected ? <AppIcon name="checkCircle" size={18} color={colors.gold} /> : null}</GSPressable>;
}

function LocationPicker({ location, busy, message, onPress }: { location: Location.LocationObject | null; busy: boolean; message: string | null; onPress: () => void }) {
  return <View style={styles.locationCard}>
    <View style={styles.locationHeader}><View style={styles.locationIcon}><AppIcon name="address" size={19} color={colors.ink} /></View><View style={styles.locationCopy}><Text style={styles.locationTitle}>{location ? 'Google Maps pin is ready' : 'Set your delivery pin'}</Text><Text style={styles.locationText}>{location ? 'Your courier will navigate to this exact location.' : 'Use your current location for a more accurate handoff.'}</Text></View>{location ? <View style={styles.pinReady}><AppIcon name="check" size={12} color={colors.ink} /></View> : null}</View>
    <GSPressable onPress={onPress} style={styles.locationButton as never}><AppIcon name="address" size={16} color={colors.white} /><Text style={styles.locationButtonText}>{busy ? 'Finding your location…' : location ? 'Refresh my location' : 'Use my current location'}</Text></GSPressable>
    {location ? <GSPressable onPress={() => openGoogleMaps({ latitude: location.coords.latitude, longitude: location.coords.longitude })} style={styles.previewButton as never}><Text style={styles.previewText}>Preview this pin in Google Maps</Text><AppIcon name="chevronDown" size={14} color={colors.coralDark} style={styles.arrow} /></GSPressable> : null}
    {location ? <Text style={styles.coordinates}>{location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}</Text> : null}
    {message ? <Text style={styles.locationMessage}>{message}</Text> : null}
  </View>;
}

function Field({ label, icon, value, onChange, placeholder, multiline = false, keyboardType, hint, error, required = false }: { label: string; icon: 'person' | 'phone' | 'address' | 'info'; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'phone-pad' | 'numeric'; hint?: string; error?: string | null; required?: boolean }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}{required || label !== 'Delivery address' ? ' *' : ''}</Text>
      <View style={[styles.inputWrap, error && styles.inputError]}><AppIcon name={icon} size={19} color={error ? colors.danger : colors.inkSoft} /><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#95A19B" keyboardType={keyboardType} multiline={multiline} numberOfLines={multiline ? 3 : 1} style={[styles.input, multiline && styles.multiline]} /></View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 22 },
  checkoutGrid: { gap: 18 },
  checkoutGridDesktop: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 28 },
  formColumn: { gap: 17 },
  formColumnDesktop: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 26, ...shadow.card },
  summaryCard: { backgroundColor: colors.ink, borderRadius: 18, padding: 18, gap: 16 },
  summaryCardDesktop: { width: 340, padding: 22 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  summaryKicker: { color: colors.gold, fontFamily: fonts.extraBold, fontSize: 10, letterSpacing: 1.5 },
  summaryTitle: { color: colors.white, fontFamily: fonts.bold, fontSize: 18, marginTop: 4 },
  summaryTotal: { color: colors.gold, fontFamily: fonts.extraBold, fontSize: 23 },
  summaryItems: { gap: 8, paddingTop: 13, borderTopWidth: 1, borderTopColor: '#365048' },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  summaryName: { color: '#C9D5CE', fontFamily: fonts.medium, fontSize: 12, flex: 1 },
  summaryPrice: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  summaryFulfillment: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 4 },
  summaryFulfillmentText: { color: colors.gold, fontFamily: fonts.bold, fontSize: 11 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 1 },
  sectionTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 20 },
  required: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10 },
  fulfillmentRow: { gap: 10 },
  fulfillmentRowDesktop: { flexDirection: 'row' },
  fulfillmentChoice: { flex: 1, minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 12 },
  fulfillmentChoiceSelected: { borderColor: colors.ink, backgroundColor: colors.ink },
  choiceIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  choiceIconSelected: { backgroundColor: '#2B4840' },
  choiceCopy: { flex: 1, gap: 2 },
  choiceTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  choiceTitleSelected: { color: colors.white },
  choiceDescription: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10 },
  choiceDescriptionSelected: { color: '#B8C9C0' },
  locationCard: { backgroundColor: colors.paper, borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 10 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1, gap: 2 },
  locationTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 13 },
  locationText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, lineHeight: 15 },
  pinReady: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#E5F6EA', alignItems: 'center', justifyContent: 'center' },
  locationButton: { height: 43, borderRadius: radii.button, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  locationButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
  previewButton: { height: 34, borderRadius: 11, backgroundColor: colors.cream, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  previewText: { color: colors.coralDark, fontFamily: fonts.bold, fontSize: 10 },
  arrow: { transform: [{ rotate: '-90deg' }] },
  coordinates: { color: colors.inkSoft, fontSize: 9, textAlign: 'center' },
  locationMessage: { color: colors.inkSoft, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  addressFields: { flexDirection: 'row', gap: 10 },
  addressColumn: { flex: 1 },
  fieldWrap: { gap: 6 },
  fieldLabel: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  inputWrap: { minHeight: 54, borderRadius: radii.input, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9 },
  inputError: { borderColor: '#E8A19A' },
  input: { flex: 1, color: colors.ink, fontFamily: fonts.medium, fontSize: 14, minHeight: 52 },
  multiline: { minHeight: 86, paddingTop: 15, textAlignVertical: 'top' },
  hint: { color: colors.inkSoft, fontSize: 10, paddingHorizontal: 2 },
  error: { color: colors.danger, fontSize: 10, paddingHorizontal: 2 },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.sage, borderRadius: 14, padding: 13 },
  promiseIcon: { width: 33, height: 33, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  promiseCopy: { flex: 1, gap: 2 },
  promiseTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  promiseText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, lineHeight: 15 },
  pickupNote: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.sage, borderRadius: 14, padding: 13 },
  pickupIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  pickupCopy: { flex: 1, gap: 2 },
  pickupTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  pickupText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, lineHeight: 15 },
  placeButton: { minHeight: 55, borderRadius: radii.button, backgroundColor: colors.coral, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 1 },
  placeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  emptyTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 17 },
  primaryButton: { backgroundColor: colors.coral, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 12 },
  primaryButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
});
