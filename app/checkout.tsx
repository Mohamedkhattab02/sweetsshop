/**
 * Checkout — the order details form.
 *
 * Name and phone number are required; the address is optional, and leaving it
 * blank turns the order into a collection at the market.
 */

import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Divider,
  HelperText,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatPrice } from '@/constants/market';
import { useCart } from '@/store/cart';

/** Accepts the usual international shapes: +1 (555) 010-9999, 0555 010 999, … */
const PHONE_ALLOWED = /^[0-9+()\-.\s]+$/;
const MIN_PHONE_DIGITS = 7;

export default function CheckoutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lines, itemCount, subtotal, isEmpty, placeOrder } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // `placeOrder` empties the cart, which would otherwise flip this screen to
  // its empty state for one frame before the confirmation screen takes over.
  const isNavigatingAway = useRef(false);

  /* ----------------------------- validation ----------------------------- */

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const phoneDigits = trimmedPhone.replace(/\D/g, '').length;

  const phoneError = (() => {
    if (trimmedPhone.length === 0) return 'Enter a phone number so we can confirm your order.';
    if (!PHONE_ALLOWED.test(trimmedPhone)) return 'Use digits, spaces and + ( ) - only.';
    if (phoneDigits < MIN_PHONE_DIGITS) return 'That phone number looks too short.';
    return null;
  })();

  const errors = {
    name: trimmedName.length < 2 ? 'Enter the name for the order.' : null,
    phone: phoneError,
  };
  const isValid = Object.values(errors).every((error) => error === null);
  const showError = (field: keyof typeof errors) => submitted && errors[field] !== null;

  /* ------------------------------- actions ------------------------------ */

  const handlePlaceOrder = () => {
    setSubmitted(true);
    if (!isValid) return;

    isNavigatingAway.current = true;
    const order = placeOrder({ name: trimmedName, phone: trimmedPhone, address });
    // `replace` so Back from the confirmation does not return to this form.
    router.replace(`/order/${order.id}`);
  };

  /* -------------------------------- view -------------------------------- */

  if (isEmpty && !isNavigatingAway.current) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header elevated={false} style={{ backgroundColor: theme.colors.background }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Checkout" />
        </Appbar.Header>
        <View style={styles.empty}>
          <Text variant="titleMedium">There is nothing to order yet.</Text>
          <Button mode="contained-tonal" onPress={() => router.navigate('/')}>
            Browse the market
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated={false} style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} accessibilityLabel="Back to the cart" />
        <Appbar.Content title="Checkout" />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled">
          {/* ---------------------------- Summary --------------------------- */}
          <Surface
            elevation={0}
            style={[styles.summary, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleMedium">Order summary</Text>
            {lines.map((line) => (
              <View key={line.product.id} style={styles.summaryLine}>
                <Text variant="bodyMedium" style={styles.summaryName} numberOfLines={1}>
                  {`${line.quantity} × ${line.product.name}`}
                </Text>
                <Text variant="bodyMedium">{formatPrice(line.product.price * line.quantity)}</Text>
              </View>
            ))}
            <Divider style={styles.summaryDivider} />
            <View style={styles.summaryLine}>
              <Text variant="titleMedium">
                {`Total · ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
              </Text>
              <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                {formatPrice(subtotal)}
              </Text>
            </View>
          </Surface>

          {/* --------------------------- Your details ----------------------- */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Your details
          </Text>

          <View style={styles.field}>
            <TextInput
              mode="outlined"
              label="Full name *"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              textContentType="name"
              maxLength={60}
              error={showError('name')}
              left={<TextInput.Icon icon="account-outline" />}
            />
            {showError('name') ? (
              <HelperText type="error" visible padding="none">
                {errors.name}
              </HelperText>
            ) : null}
          </View>

          <View style={styles.field}>
            <TextInput
              mode="outlined"
              label="Phone number *"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={24}
              placeholder="+1 555 010 9999"
              error={showError('phone')}
              left={<TextInput.Icon icon="phone-outline" />}
            />
            <HelperText type={showError('phone') ? 'error' : 'info'} visible padding="none">
              {showError('phone') ? errors.phone : 'We call this number to confirm your order.'}
            </HelperText>
          </View>

          <View style={styles.field}>
            <TextInput
              mode="outlined"
              label="Delivery address (optional)"
              value={address}
              onChangeText={setAddress}
              autoComplete="street-address"
              multiline
              numberOfLines={3}
              maxLength={200}
              style={styles.multiline}
              left={<TextInput.Icon icon="map-marker-outline" />}
            />
            <HelperText type="info" visible padding="none">
              {address.trim().length > 0
                ? 'We will deliver to this address.'
                : 'Leave this blank to collect your order at the market.'}
            </HelperText>
          </View>

          <Button
            mode="contained"
            icon="check-circle-outline"
            onPress={handlePlaceOrder}
            disabled={submitted && !isValid}
            contentStyle={styles.placeContent}
            style={styles.place}>
            {`Place order · ${formatPrice(subtotal)}`}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  summary: {
    borderRadius: 20,
    padding: 16,
    gap: 8,
    marginBottom: 8,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryName: {
    flex: 1,
  },
  summaryDivider: {
    marginVertical: 4,
  },
  sectionTitle: {
    marginTop: 4,
  },
  field: {
    gap: 2,
  },
  multiline: {
    minHeight: 88,
  },
  place: {
    marginTop: 12,
  },
  placeContent: {
    paddingVertical: 6,
  },
});
