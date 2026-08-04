/**
 * One line in the cart: product thumbnail, unit price, a quantity stepper and
 * the line total.
 *
 * At a quantity of one the decrement button turns into a delete button, so
 * removing a line never needs a separate control.
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { formatPrice, getCategory } from '@/constants/market';
import { MAX_QUANTITY_PER_LINE, type CartLine } from '@/store/cart';

type Props = {
  line: CartLine;
  onChangeQuantity: (quantity: number) => void;
  onRemove: () => void;
  onPress?: () => void;
};

export function CartLineRow({ line, onChangeQuantity, onRemove, onPress }: Props) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const { product, quantity } = line;
  const category = getCategory(product.category);
  const showPlaceholder = !product.image || failed;
  const atMax = quantity >= MAX_QUANTITY_PER_LINE;

  return (
    <TouchableRipple onPress={onPress} style={styles.row} accessibilityRole="button">
      <View style={styles.rowInner}>
        {showPlaceholder ? (
          <View style={[styles.thumb, { backgroundColor: theme.colors.secondaryContainer }]}>
            <MaterialCommunityIcons
              name={category.icon as never}
              size={28}
              color={theme.colors.onSecondaryContainer}
            />
          </View>
        ) : (
          <Image
            source={{ uri: product.image }}
            style={styles.thumb}
            contentFit="cover"
            accessibilityLabel={product.name}
            onError={() => setFailed(true)}
          />
        )}

        <View style={styles.details}>
          <Text variant="titleSmall" numberOfLines={2}>
            {product.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {`${formatPrice(product.price)} / ${product.unit}`}
          </Text>

          <View style={styles.stepper}>
            <IconButton
              icon={quantity === 1 ? 'delete-outline' : 'minus'}
              mode="outlined"
              size={16}
              style={styles.stepperButton}
              onPress={() => (quantity === 1 ? onRemove() : onChangeQuantity(quantity - 1))}
              accessibilityLabel={
                quantity === 1 ? `Remove ${product.name} from the cart` : `Decrease ${product.name}`
              }
            />
            <Text variant="titleMedium" style={styles.quantity}>
              {quantity}
            </Text>
            <IconButton
              icon="plus"
              mode="outlined"
              size={16}
              disabled={atMax}
              style={styles.stepperButton}
              onPress={() => onChangeQuantity(quantity + 1)}
              accessibilityLabel={`Increase ${product.name}`}
            />
          </View>
        </View>

        <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
          {formatPrice(product.price * quantity)}
        </Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  stepperButton: {
    margin: 0,
  },
  quantity: {
    minWidth: 36,
    textAlign: 'center',
  },
});
