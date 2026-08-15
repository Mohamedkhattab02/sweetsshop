/** Android category rail using Material 3 filter-chip semantics. */

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
        <Text variant="titleMedium">Explore flavors</Text>
        {!noneSelected ? (
          <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
            {selected.length} selected
          </Text>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        decelerationRate="fast">
        <Chip
          mode={noneSelected ? 'flat' : 'outlined'}
          selected={noneSelected}
          showSelectedOverlay
          onPress={onClear}
          style={styles.chip}
          accessibilityLabel="Show all sweets">
          All sweets
        </Chip>
        {CATEGORIES.map((category) => {
          const isSelected = selected.includes(category.id);
          return (
            <Chip
              key={category.id}
              mode={isSelected ? 'flat' : 'outlined'}
              icon={isSelected ? undefined : iconSource(category.icon)}
              selected={isSelected}
              showSelectedOverlay
              onPress={() => onToggle(category.id)}
              style={styles.chip}
              accessibilityLabel={`${category.label}, ${counts[category.id] ?? 0} sweets`}>
              {`${category.label} · ${counts[category.id] ?? 0}`}
            </Chip>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  headingRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    marginRight: 0,
  },
});
