/**
 * iOS: the add-product form in Apple's inset-grouped idiom.
 *
 * Every choice here is the iOS counterpart of a Material decision made in
 * `add-product-form.tsx`:
 *
 *   Material 3                       iOS
 *   ─────────────────────────────    ──────────────────────────────────────
 *   Outlined field, floating label   Grouped row, label left of the value
 *   Dashed media drop zone           Photo well + `ActionSheetIOS`
 *   Filter chips                     Checkmark rows, one per category
 *   Segmented buttons                UISegmentedControl-style track
 *   Helper text under the field      Grey section footer, red when invalid
 *   Snackbar                         `Alert`
 *
 * Behaviour comes from `useAddProductForm`, shared with the Android view.
 */

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ActionSheetIOS,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import {
  FormButton,
  FormCheckRow,
  FormRow,
  FormSection,
  FormSegmentedControl,
  FormSeparator,
} from '@/components/ui/ios-form';
import { useScreenHeaderInset } from '@/components/ui/screen-header';
import { IOSColors } from '@/constants/ios-colors';
import { CATEGORIES, CURRENCY_SYMBOL } from '@/constants/market';
import {
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  UNIT_OPTIONS,
  useAddProductForm,
} from '@/hooks/use-add-product-form';

export function AddProductForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerInset = useScreenHeaderInset(true);
  // NativeTabs is drawn above the route content on iOS. Keep the final
  // action comfortably above the Liquid Glass tab bar and home indicator.
  const bottomTabClearance = Math.max(insets.bottom + 64, 96);

  const form = useAddProductForm({
    onNotify: (message) => Alert.alert('Camera unavailable', message),
  });

  /** The iOS way to offer a choice of sources — a sheet from the bottom. */
  const presentPhotoOptions = () => {
    const options = form.image
      ? ['Take Photo', 'Choose from Library', 'Remove Photo', 'Cancel']
      : ['Take Photo', 'Choose from Library', 'Cancel'];
    const removeIndex = form.image ? 2 : -1;
    const cancelIndex = form.image ? 3 : 2;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: cancelIndex,
        destructiveButtonIndex: form.image ? removeIndex : undefined,
        title: 'Sweet photo',
      },
      (index) => {
        if (index === 0) form.takePhoto();
        else if (index === 1) form.pickFromLibrary();
        else if (index === removeIndex) form.removeImage();
      }
    );
  };

  const handleSubmit = () => {
    const product = form.submit();
    if (!product) return;
    Alert.alert('Added to the menu', `"${product.name}" is now listed.`, [
      { text: 'Add another', style: 'cancel' },
      { text: 'View menu', onPress: () => router.navigate('/') },
    ]);
  };

  const selectedCategory = CATEGORIES.find((option) => option.id === form.category);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
      <ScrollView
        style={styles.groupedBackground}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerInset + 16, paddingBottom: bottomTabClearance },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive">
        {/* ------------------------------- Photo ------------------------------ */}
        <FormSection
          header="Photo"
          footer={form.showError('image') ? form.errors.image! : 'Tap the photo to change it.'}
          footerTone={form.showError('image') ? 'error' : 'default'}>
          <Pressable
            onPress={presentPhotoOptions}
            accessibilityRole="button"
            accessibilityLabel={form.image ? 'Change the sweet photo' : 'Add a sweet photo'}
            style={({ pressed }) => [styles.photoWell, pressed && styles.photoWellPressed]}>
            {form.image ? (
              <Image source={{ uri: form.image }} style={styles.photo} contentFit="cover" />
            ) : (
              <View style={styles.photoEmpty}>
                <AppIcon name="photoAdd" size={38} color={IOSColors.secondaryLabel} />
                <Text style={styles.photoEmptyLabel}>Add Photo</Text>
              </View>
            )}
          </Pressable>
        </FormSection>

        {/* ------------------------------ Details ----------------------------- */}
        <FormSection
          header="Details"
          footer={
            form.showError('name')
              ? form.errors.name!
              : form.showError('price')
                ? form.errors.price!
                : undefined
          }
          footerTone="error">
          <FormRow label="Name">
            <TextInput
              value={form.name}
              onChangeText={form.setName}
              placeholder="Organic strawberries"
              placeholderTextColor={IOSColors.tertiaryLabel}
              maxLength={NAME_MAX_LENGTH}
              style={styles.fieldInput}
              returnKeyType="next"
              accessibilityLabel="Sweet name"
            />
          </FormRow>

          <FormSeparator />

          <FormRow label="Price">
            <View style={styles.priceRow}>
              <Text style={styles.currency}>{CURRENCY_SYMBOL}</Text>
              <TextInput
                value={form.price}
                onChangeText={form.setPrice}
                placeholder="0.00"
                placeholderTextColor={IOSColors.tertiaryLabel}
                keyboardType="decimal-pad"
                style={styles.fieldInput}
                accessibilityLabel="Price"
              />
            </View>
          </FormRow>

          <FormSeparator />

          <FormRow label="Sold as">
            <FormSegmentedControl
              options={UNIT_OPTIONS}
              value={form.unit}
              onChange={form.setUnit}
            accessibilityLabel="Unit the sweet is sold by"
            />
          </FormRow>
        </FormSection>

        {/* ----------------------------- Category ----------------------------- */}
        <FormSection
          header="Category"
          footer={
            form.showError('category')
              ? form.errors.category!
              : selectedCategory
                ? `Listed under ${selectedCategory.label}.`
                : 'Choose where this sweet appears on the menu.'
          }
          footerTone={form.showError('category') ? 'error' : 'default'}>
          {CATEGORIES.map((option, index) => (
            <View key={option.id}>
              {index > 0 ? <FormSeparator /> : null}
              <FormCheckRow
                label={option.label}
                selected={form.category === option.id}
                onPress={() =>
                  form.setCategory(form.category === option.id ? null : option.id)
                }
                leading={<AppIcon name={option.icon} size={20} color={IOSColors.accent} />}
              />
            </View>
          ))}
        </FormSection>

        {/* ---------------------------- Description --------------------------- */}
        <FormSection header="Description" footer="Optional.">
          <FormRow align="top">
            <TextInput
              value={form.description}
              onChangeText={form.setDescription}
              placeholder="How it was grown, how it tastes, how to store it…"
              placeholderTextColor={IOSColors.tertiaryLabel}
              multiline
              maxLength={DESCRIPTION_MAX_LENGTH}
              style={[styles.fieldInput, styles.multiline]}
              accessibilityLabel="Description"
            />
          </FormRow>
        </FormSection>

        <View style={styles.actions}>
          <FormButton
            title="Add to Menu"
            onPress={handleSubmit}
            disabled={form.submitted && !form.isValid}
          />
          <Text style={styles.footnote}>
            New sweets are kept in memory for this sample app and reset when the app restarts.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  groupedBackground: {
    backgroundColor: IOSColors.groupedBackground,
  },
  content: {
    paddingBottom: 40,
  },
  photoWell: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoWellPressed: {
    opacity: 0.8,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    alignItems: 'center',
    gap: 8,
  },
  photoEmptyLabel: {
    fontSize: 17,
    color: IOSColors.accent,
  },
  fieldInput: {
    flex: 1,
    fontSize: 17,
    color: IOSColors.label,
    paddingVertical: 0,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currency: {
    fontSize: 17,
    color: IOSColors.secondaryLabel,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  actions: {
    paddingHorizontal: 16,
    gap: 14,
    marginTop: 2,
  },
  footnote: {
    fontSize: 13,
    color: IOSColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 18,
  },
});
