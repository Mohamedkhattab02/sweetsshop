/**
 * iOS category rail: compact native-feeling pills with no Material chrome.
 * The horizontal rail stays light and touchable under the floating header.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { CATEGORIES, type CategoryId } from '@/constants/market';
import { IOSColors } from '@/constants/ios-colors';

type Props = {
  selected: CategoryId[];
  onToggle: (category: CategoryId) => void;
  onClear: () => void;
  counts: Record<CategoryId, number>;
};

export function CategoryFilter({ selected, onToggle, onClear, counts }: Props) {
  const noneSelected = selected.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Browse the menu</Text>
        {!noneSelected ? <Text style={styles.selection}>{selected.length} selected</Text> : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        decelerationRate="fast">
        <FilterPill label="All" selected={noneSelected} onPress={onClear} />
        {CATEGORIES.map((category) => (
          <FilterPill
            key={category.id}
            label={category.label}
            count={counts[category.id] ?? 0}
            icon={category.icon}
            selected={selected.includes(category.id)}
            onPress={() => onToggle(category.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function FilterPill({
  label,
  count,
  icon,
  selected,
  onPress,
}: {
  label: string;
  count?: number;
  icon?: Parameters<typeof AppIcon>[0]['name'];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count === undefined ? label : `${label}, ${count} sweets`}
      style={({ pressed }) => [
        styles.pill,
        selected && styles.selectedPill,
        pressed && styles.pressed,
      ]}>
      {icon && !selected ? <AppIcon name={icon} size={16} color={IOSColors.secondaryLabel} /> : null}
      <Text style={[styles.pillLabel, selected && styles.selectedLabel]}>{label}</Text>
      {count !== undefined ? (
        <Text style={[styles.count, selected && styles.selectedCount]}>{count}</Text>
      ) : null}
    </Pressable>
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
  heading: {
    color: IOSColors.label,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  selection: {
    color: IOSColors.secondaryLabel,
    fontSize: 13,
    fontWeight: '600',
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
  },
  selectedPill: {
    backgroundColor: IOSColors.accent,
  },
  pressed: {
    opacity: 0.55,
    transform: [{ scale: 0.98 }],
  },
  pillLabel: {
    color: IOSColors.label,
    fontSize: 15,
    fontWeight: '600',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
  count: {
    color: IOSColors.secondaryLabel,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedCount: {
    color: 'rgba(255,255,255,0.82)',
  },
});
