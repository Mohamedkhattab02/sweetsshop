/**
 * Material 3 filter chips for the category selection on the main page.
 *
 * Multi-select: tapping several chips widens the result set. The leading "All"
 * chip clears the selection and is shown as selected while nothing is filtered.
 */

import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';

import { iconSource } from '@/components/ui/icon-source';
import { CATEGORIES, type CategoryId } from '@/constants/market';

type Props = {
  selected: CategoryId[];
  onToggle: (category: CategoryId) => void;
  onClear: () => void;
  counts: Record<CategoryId, number>;
};

export function CategoryFilter({ selected, onToggle, onClear, counts }: Props) {
  const theme = useTheme();
  const noneSelected = selected.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Text variant="titleMedium">Categories</Text>
        {!noneSelected ? (
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {selected.length} selected
          </Text>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}>
        <Chip
          mode="outlined"
          selected={noneSelected}
          showSelectedOverlay
          onPress={onClear}
          accessibilityLabel="Show all categories"
          style={styles.chip}>
          All
        </Chip>

        {CATEGORIES.map((category) => {
          const isSelected = selected.includes(category.id);
          const count = counts[category.id] ?? 0;
          return (
            <Chip
              key={category.id}
              mode="outlined"
              icon={isSelected ? undefined : iconSource(category.icon)}
              selected={isSelected}
              showSelectedOverlay
              onPress={() => onToggle(category.id)}
              accessibilityLabel={`${category.label}, ${count} products`}
              style={styles.chip}>
              {`${category.label} (${count})`}
            </Chip>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    marginRight: 0,
  },
});
