/** iOS search: an inset, translucent field with native clear affordance. */

import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MarketSearchProps } from '@/components/market/market-search.types';
import { AppIcon } from '@/components/ui/app-icon';
import { IOSColors } from '@/constants/ios-colors';

export function MarketSearch({ value, onChangeText, resultCount }: MarketSearchProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View className="gap-2">
      <Pressable
        className="h-11 flex-row items-center rounded-2xl px-3"
        style={({ pressed }) => [styles.search, pressed && styles.pressed]}
        onPress={() => inputRef.current?.focus()}
        accessibilityRole="search"
        accessibilityLabel="Search the sweets menu">
        <AppIcon name="search" size={20} color={IOSColors.secondaryLabel} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search the menu"
          placeholderTextColor={IOSColors.tertiaryLabel}
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={styles.input}
          accessibilityLabel="Search sweets"
        />
        {value ? (
          <Pressable
            className="h-7 w-7 items-center justify-center rounded-full"
            style={styles.clear}
            onPress={() => onChangeText('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search">
            <AppIcon name="close" size={14} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </Pressable>
      {value.trim() ? (
        <Text className="px-1 text-[13px] font-semibold" style={styles.result}>
          {resultCount ?? 0} {resultCount === 1 ? 'sweet' : 'sweets'} found
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: IOSColors.label,
    paddingHorizontal: 9,
    paddingVertical: 0,
  },
  clear: {
    backgroundColor: IOSColors.secondaryLabel,
  },
  result: {
    color: IOSColors.secondaryLabel,
  },
  pressed: {
    opacity: 0.75,
  },
});
