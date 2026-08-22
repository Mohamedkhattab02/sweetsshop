/** Android / web search: Material's familiar filled search field. */

import { View } from 'react-native';
import { Searchbar, Text, useTheme } from 'react-native-paper';

import type { MarketSearchProps } from '@/components/market/market-search.types';
import { iconSource } from '@/components/ui/icon-source';

export function MarketSearch({ value, onChangeText, resultCount }: MarketSearchProps) {
  const theme = useTheme();

  return (
    <View className="gap-2">
      <Searchbar
        value={value}
        onChangeText={onChangeText}
        placeholder="Search sweets, boxes, coffee..."
        icon={iconSource('search')}
        clearIcon={value ? iconSource('close') : undefined}
        elevation={0}
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 18,
        }}
        inputStyle={{ minHeight: 0 }}
        accessibilityLabel="Search the sweets menu"
      />
      {value.trim() ? (
        <Text
          variant="labelMedium"
          className="px-1"
          style={{ color: theme.colors.onSurfaceVariant }}>
          {resultCount ?? 0} {resultCount === 1 ? 'sweet' : 'sweets'} found
        </Text>
      ) : null}
    </View>
  );
}
