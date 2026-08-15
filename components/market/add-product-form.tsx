/**
 * Android / web: the add-product form in Material 3.
 *
 * Outlined text fields with floating labels, filter chips for the category,
 * segmented buttons for the unit, a dashed media drop zone, and a Snackbar for
 * feedback. iOS resolves `add-product-form.ios.tsx`, which is the same form in
 * Apple's inset-grouped idiom.
 *
 * Both views share `useAddProductForm`, so validation and image picking cannot
 * drift apart between platforms.
 */

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  HelperText,
  IconButton,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { iconSource } from '@/components/ui/icon-source';
import { useScreenHeaderInset } from '@/components/ui/screen-header';
import { CATEGORIES, CURRENCY_SYMBOL } from '@/constants/market';
import {
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  UNIT_OPTIONS,
  useAddProductForm,
} from '@/hooks/use-add-product-form';
import type { Unit } from '@/store/products';

export function AddProductForm() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerInset = useScreenHeaderInset(true);

  const [snackbar, setSnackbar] = useState<string | null>(null);
  const form = useAddProductForm({ onNotify: setSnackbar });

  const handleSubmit = () => {
    const product = form.submit();
    if (product) setSnackbar(`"${product.name}" was added to the menu.`);
  };

  return (
    <>
      <KeyboardAvoidingView style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: headerInset + 8, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled">
          {/* ------------------------------ Photo ----------------------------- */}
          <View style={styles.section}>
            <Text variant="titleMedium">Photo</Text>

            {form.image ? (
              <View style={styles.previewWrapper}>
                <Image source={{ uri: form.image }} style={styles.preview} contentFit="cover" />
                <IconButton
                  icon={iconSource('close')}
                  mode="contained"
                  size={20}
                  onPress={form.removeImage}
                  accessibilityLabel="Remove the selected photo"
                  style={styles.removeButton}
                />
              </View>
            ) : (
              <TouchableRipple
                onPress={form.pickFromLibrary}
                accessibilityRole="button"
                accessibilityLabel="Choose a sweet photo from your gallery"
                style={[
                  styles.dropzone,
                  {
                    borderColor: form.showError('image')
                      ? theme.colors.error
                      : theme.colors.outline,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}>
                <View style={styles.dropzoneInner}>
                  <AppIcon name="photoAdd" size={40} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Tap to choose a sweet photo
                  </Text>
                </View>
              </TouchableRipple>
            )}

            <View style={styles.photoButtons}>
              <Button
                mode="contained-tonal"
                icon={iconSource('gallery')}
                onPress={form.pickFromLibrary}
                style={styles.flex}>
                Photo library
              </Button>
              <Button
                mode="contained-tonal"
                icon={iconSource('camera')}
                onPress={form.takePhoto}
                style={styles.flex}>
                Take photo
              </Button>
            </View>

            {form.showError('image') ? (
              <HelperText type="error" visible padding="none">
                {form.errors.image}
              </HelperText>
            ) : null}
          </View>

          {/* ------------------------------- Name ----------------------------- */}
          <View style={styles.section}>
            <TextInput
              mode="outlined"
              label="Sweet name *"
              value={form.name}
              onChangeText={form.setName}
              placeholder="e.g. Pistachio maamoul"
              maxLength={NAME_MAX_LENGTH}
              error={form.showError('name')}
              left={<TextInput.Icon icon={iconSource('tag')} />}
            />
            <HelperText type={form.showError('name') ? 'error' : 'info'} visible padding="none">
              {form.showError('name')
                ? form.errors.name
                : `${form.trimmedName.length}/${NAME_MAX_LENGTH}`}
            </HelperText>
          </View>

          {/* ----------------------------- Category --------------------------- */}
          <View style={styles.section}>
            <Text variant="titleMedium">Sweet category *</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((option) => {
                const isSelected = form.category === option.id;
                return (
                  <Chip
                    key={option.id}
                    mode="outlined"
                    icon={isSelected ? undefined : iconSource(option.icon)}
                    selected={isSelected}
                    showSelectedOverlay
                    onPress={() => form.setCategory(isSelected ? null : option.id)}>
                    {option.label}
                  </Chip>
                );
              })}
            </View>
            {form.showError('category') ? (
              <HelperText type="error" visible padding="none">
                {form.errors.category}
              </HelperText>
            ) : null}
          </View>

          {/* ------------------------------ Price ----------------------------- */}
          <View style={styles.section}>
            <TextInput
              mode="outlined"
              label="Price per unit *"
              value={form.price}
              onChangeText={form.setPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              error={form.showError('price')}
              left={<TextInput.Affix text={CURRENCY_SYMBOL} />}
            />
            {form.showError('price') ? (
              <HelperText type="error" visible padding="none">
                {form.errors.price}
              </HelperText>
            ) : null}

            <Text variant="labelLarge" style={styles.unitLabel}>
              Sold as
            </Text>
            <SegmentedButtons
              value={form.unit}
              onValueChange={(value) => form.setUnit(value as Unit)}
              buttons={UNIT_OPTIONS}
              density="medium"
            />
          </View>

          {/* --------------------------- Description -------------------------- */}
          <View style={styles.section}>
            <TextInput
              mode="outlined"
              label="Description (optional)"
              value={form.description}
              onChangeText={form.setDescription}
              multiline
              numberOfLines={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
              style={styles.multiline}
            />
          </View>

          <Button
            mode="contained"
            icon={iconSource('cartAdd')}
            onPress={handleSubmit}
            disabled={form.submitted && !form.isValid}
            contentStyle={styles.submitContent}
            style={styles.submit}>
            Add to menu
          </Button>

          <Text
            variant="bodySmall"
            style={[styles.footnote, { color: theme.colors.onSurfaceVariant }]}>
            New sweets are kept in memory for this sample app and reset when the app restarts.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar !== null}
        onDismiss={() => setSnackbar(null)}
        duration={4000}
        action={{ label: 'View menu', onPress: () => router.navigate('/') }}>
        {snackbar}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  section: {
    gap: 8,
  },
  dropzone: {
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneInner: {
    alignItems: 'center',
    gap: 8,
  },
  previewWrapper: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitLabel: {
    marginTop: 4,
  },
  multiline: {
    minHeight: 96,
  },
  submit: {
    marginTop: 8,
  },
  submitContent: {
    paddingVertical: 6,
  },
  footnote: {
    textAlign: 'center',
    marginTop: 4,
  },
});
