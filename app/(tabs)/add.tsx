/**
 * Upload a new product.
 *
 * Name, category, price and image are all required; the submit button stays
 * disabled until each one is filled in, and inline errors appear once the user
 * has tried to submit. The product is pushed straight into the in-memory store,
 * so it shows up on the market page immediately.
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
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

import { CATEGORIES, CURRENCY_SYMBOL, type CategoryId } from '@/constants/market';
import { useProducts, type Unit } from '@/store/products';

const UNITS: { value: Unit; label: string }[] = [
  { value: 'each', label: 'Each' },
  { value: 'kg', label: 'Kg' },
  { value: 'lb', label: 'Lb' },
  { value: 'bunch', label: 'Bunch' },
];

const IMAGE_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

export default function AddProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addProduct } = useProducts();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<Unit>('each');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

  /* ----------------------------- validation ----------------------------- */

  const trimmedName = name.trim();
  const parsedPrice = Number(price.replace(',', '.'));
  const priceIsValid = price.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0;

  const errors = {
    name: trimmedName.length < 2 ? 'Enter a product name (at least 2 characters).' : null,
    category: category === null ? 'Choose the category this product belongs to.' : null,
    price: priceIsValid ? null : 'Enter a price greater than 0.',
    image: image === null ? 'A product photo is required.' : null,
  };
  const isValid = Object.values(errors).every((error) => error === null);
  // Only nag after the first submit attempt.
  const showError = (field: keyof typeof errors) => submitted && errors[field] !== null;

  /* ------------------------------- actions ------------------------------ */

  // The system photo picker on modern Android and iOS needs no permission.
  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS);
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    if (!cameraPermission?.granted) {
      const response = await requestCameraPermission();
      if (!response.granted) {
        setSnackbar('Camera permission is needed to take a product photo.');
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const resetForm = () => {
    setName('');
    setCategory(null);
    setPrice('');
    setUnit('each');
    setDescription('');
    setImage(null);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid || category === null || image === null) return;

    addProduct({
      name: trimmedName,
      category,
      price: parsedPrice,
      image,
      unit,
      description,
    });

    resetForm();
    setSnackbar(`"${trimmedName}" was added to the market.`);
  };

  /* -------------------------------- view -------------------------------- */

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated={false} style={{ backgroundColor: theme.colors.background }}>
        <Appbar.Content title="Add a product" />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled">
          {/* ------------------------------ Photo ----------------------------- */}
          <View style={styles.section}>
            <Text variant="titleMedium">Photo</Text>

            {image ? (
              <View style={styles.previewWrapper}>
                <Image source={{ uri: image }} style={styles.preview} contentFit="cover" />
                <IconButton
                  icon="close"
                  mode="contained"
                  size={20}
                  onPress={() => setImage(null)}
                  accessibilityLabel="Remove the selected photo"
                  style={styles.removeButton}
                />
              </View>
            ) : (
              <TouchableRipple
                onPress={pickFromLibrary}
                accessibilityRole="button"
                accessibilityLabel="Choose a product photo from your gallery"
                style={[
                  styles.dropzone,
                  {
                    borderColor: showError('image') ? theme.colors.error : theme.colors.outline,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}>
                <View style={styles.dropzoneInner}>
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={40}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Tap to choose a photo
                  </Text>
                </View>
              </TouchableRipple>
            )}

            <View style={styles.photoButtons}>
              <Button
                mode="contained-tonal"
                icon="image-multiple"
                onPress={pickFromLibrary}
                style={styles.flex}>
                Gallery
              </Button>
              <Button mode="contained-tonal" icon="camera" onPress={takePhoto} style={styles.flex}>
                Camera
              </Button>
            </View>

            {showError('image') ? (
              <HelperText type="error" visible padding="none">
                {errors.image}
              </HelperText>
            ) : null}
          </View>

          {/* ------------------------------- Name ----------------------------- */}
          <View style={styles.section}>
            <TextInput
              mode="outlined"
              label="Product name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Organic strawberries"
              maxLength={60}
              error={showError('name')}
              left={<TextInput.Icon icon="tag-outline" />}
            />
            <HelperText type={showError('name') ? 'error' : 'info'} visible padding="none">
              {showError('name') ? errors.name : `${trimmedName.length}/60`}
            </HelperText>
          </View>

          {/* ----------------------------- Category --------------------------- */}
          <View style={styles.section}>
            <Text variant="titleMedium">Category *</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((option) => {
                const isSelected = category === option.id;
                return (
                  <Chip
                    key={option.id}
                    mode="outlined"
                    icon={isSelected ? undefined : option.icon}
                    selected={isSelected}
                    showSelectedOverlay
                    onPress={() => setCategory(isSelected ? null : option.id)}>
                    {option.label}
                  </Chip>
                );
              })}
            </View>
            {showError('category') ? (
              <HelperText type="error" visible padding="none">
                {errors.category}
              </HelperText>
            ) : null}
          </View>

          {/* ------------------------------ Price ----------------------------- */}
          <View style={styles.section}>
            <TextInput
              mode="outlined"
              label="Price *"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              error={showError('price')}
              left={<TextInput.Affix text={CURRENCY_SYMBOL} />}
            />
            {showError('price') ? (
              <HelperText type="error" visible padding="none">
                {errors.price}
              </HelperText>
            ) : null}

            <Text variant="labelLarge" style={styles.unitLabel}>
              Sold per
            </Text>
            <SegmentedButtons
              value={unit}
              onValueChange={(value) => setUnit(value as Unit)}
              buttons={UNITS}
              density="medium"
            />
          </View>

          {/* --------------------------- Description -------------------------- */}
          <View style={styles.section}>
            <TextInput
              mode="outlined"
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
              style={styles.multiline}
            />
          </View>

          <Button
            mode="contained"
            icon="cart-plus"
            onPress={handleSubmit}
            disabled={submitted && !isValid}
            contentStyle={styles.submitContent}
            style={styles.submit}>
            Add to market
          </Button>

          <Text
            variant="bodySmall"
            style={[styles.footnote, { color: theme.colors.onSurfaceVariant }]}>
            Products are kept in memory for this sample app and reset when the app restarts.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar !== null}
        onDismiss={() => setSnackbar(null)}
        duration={4000}
        action={{ label: 'View market', onPress: () => router.navigate('/') }}>
        {snackbar}
      </Snackbar>
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
