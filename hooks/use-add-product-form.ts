/**
 * All the behaviour behind the "add a product" form: field state, validation,
 * image picking and submission.
 *
 * The two platform views (`add-product-form.tsx` for Material 3 and
 * `add-product-form.ios.tsx` for the iOS grouped form) look nothing alike, but
 * they must behave identically — so the rules live here, once.
 */

import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';

import type { CategoryId } from '@/constants/market';
import { useProducts, type Product, type Unit } from '@/store/products';

export const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: 'each', label: 'Box / tray' },
  { value: 'kg', label: 'Kg' },
  { value: 'lb', label: 'Lb' },
  { value: 'bunch', label: 'Piece set' },
];

export const NAME_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 200;

const IMAGE_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

export type AddProductFormField = 'name' | 'category' | 'price' | 'image';

type Options = {
  /** Platform-appropriate feedback: a Snackbar on Android, an Alert on iOS. */
  onNotify?: (message: string) => void;
};

export function useAddProductForm({ onNotify }: Options = {}) {
  const { addProduct } = useProducts();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<Unit>('each');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

  /* ----------------------------- validation ----------------------------- */

  const trimmedName = name.trim();
  const parsedPrice = Number(price.replace(',', '.'));
  const priceIsValid = price.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0;

  const errors = useMemo(
    () => ({
      name: trimmedName.length < 2 ? 'Enter a sweet name (at least 2 characters).' : null,
      category: category === null ? 'Choose the sweet category.' : null,
      price: priceIsValid ? null : 'Enter a price greater than 0.',
      image: image === null ? 'A sweet photo is required.' : null,
    }),
    [trimmedName, category, priceIsValid, image]
  );

  const isValid = Object.values(errors).every((error) => error === null);

  /** Errors stay quiet until the first submit attempt, then track live. */
  const showError = useCallback(
    (field: AddProductFormField) => submitted && errors[field] !== null,
    [submitted, errors]
  );

  /* ------------------------------ image ------------------------------- */

  // The system photo picker on modern Android and iOS needs no permission.
  const pickFromLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS);
    if (!result.canceled) setImage(result.assets[0].uri);
  }, []);

  const takePhoto = useCallback(async () => {
    if (!cameraPermission?.granted) {
      const response = await requestCameraPermission();
      if (!response.granted) {
        onNotify?.('Camera permission is needed to take a sweet photo.');
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
    if (!result.canceled) setImage(result.assets[0].uri);
  }, [cameraPermission, requestCameraPermission, onNotify]);

  const removeImage = useCallback(() => setImage(null), []);

  /* ------------------------------ submit ------------------------------ */

  const reset = useCallback(() => {
    setName('');
    setCategory(null);
    setPrice('');
    setUnit('each');
    setDescription('');
    setImage(null);
    setSubmitted(false);
  }, []);

  /** Returns the new product, or `null` when the form is not yet valid. */
  const submit = useCallback((): Product | null => {
    setSubmitted(true);
    if (!isValid || category === null || image === null) return null;

    const product = addProduct({
      name: trimmedName,
      category,
      price: parsedPrice,
      image,
      unit,
      description,
    });

    reset();
    return product;
  }, [isValid, category, image, addProduct, trimmedName, parsedPrice, unit, description, reset]);

  return {
    // fields
    name,
    setName,
    category,
    setCategory,
    price,
    setPrice,
    unit,
    setUnit,
    description,
    setDescription,
    image,

    // validation
    errors,
    isValid,
    submitted,
    showError,
    trimmedName,

    // actions
    pickFromLibrary,
    takePhoto,
    removeImage,
    submit,
  };
}
