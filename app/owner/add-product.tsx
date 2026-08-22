import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { CATEGORIES, type CategoryId } from '@/constants/market';
import { colors, fonts, radii, shadow } from '@/constants/design';
import { responsive } from '@/constants/responsive';
import { useProducts } from '@/store/products';

export default function OwnerAddProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addProduct } = useProducts();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('12');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>('baklava');

  const save = () => {
    const numericPrice = Number(price);
    if (name.trim().length < 2 || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert('A little more detail', 'Add a product name and a price to continue.');
      return;
    }
    addProduct({ name, category, price: numericPrice, image: '', description, stockQuantity: Number(stock) || 0, available: true });
    router.replace('/owner/catalog' as never);
  };

  return (
    <View style={styles.screen}>
      <ModernHeader title="New sweet" subtitle="Add a new favorite to the counter" showBack />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, responsive.narrowPage, { paddingBottom: insets.bottom + 30 }]}>
          <View style={styles.intro}><View style={styles.introIcon}><AppIcon name="addProduct" size={23} color={colors.ink} /></View><View style={styles.introCopy}><Text style={styles.introTitle}>Make room for something lovely</Text><Text style={styles.introText}>It will appear on the customer menu as soon as you save.</Text></View></View>
          <Field label="Sweet name" value={name} onChange={setName} placeholder="e.g. Pistachio Cloud" />
          <View style={styles.twoFields}><View style={styles.half}><Field label="Price" value={price} onChange={setPrice} placeholder="68" keyboardType="decimal-pad" /></View><View style={styles.half}><Field label="Opening stock" value={stock} onChange={setStock} placeholder="12" keyboardType="number-pad" /></View></View>
          <View style={styles.fieldWrap}><Text style={styles.label}>Category</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>{CATEGORIES.slice(0, 8).map((item) => <GSPressable key={item.id} onPress={() => setCategory(item.id)} style={[styles.category, category === item.id && styles.categorySelected] as never}><AppIcon name={item.icon} size={14} color={category === item.id ? colors.white : colors.ink} /><Text style={[styles.categoryText, category === item.id && styles.categoryTextSelected]}>{item.label}</Text></GSPressable>)}</ScrollView></View>
          <Field label="Short description" value={description} onChange={setDescription} placeholder="What makes this sweet special?" multiline />
          <View style={styles.imageHint}><AppIcon name="photoAdd" size={18} color={colors.coralDark} /><Text style={styles.imageHintText}>Photos can be added later from the product editor.</Text></View>
          <GSPressable onPress={save} style={styles.saveButton as never}><Text style={styles.saveText}>Add to menu</Text><AppIcon name="check" size={18} color={colors.white} /></GSPressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, multiline = false, keyboardType }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'decimal-pad' | 'number-pad' }) {
  return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#95A19B" multiline={multiline} keyboardType={keyboardType} style={[styles.input, multiline && styles.multiline]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 22, gap: 18 },
  intro: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.sage, borderRadius: 14, padding: 14 },
  introIcon: { width: 37, height: 37, borderRadius: 13, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  introCopy: { flex: 1, gap: 2 },
  introTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  introText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, lineHeight: 15 },
  twoFields: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  fieldWrap: { gap: 6 },
  label: { color: colors.ink, fontFamily: fonts.bold, fontSize: 12 },
  input: { height: 54, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, color: colors.ink, fontFamily: fonts.medium, fontSize: 14, paddingHorizontal: 14, ...shadow.card },
  multiline: { height: 104, paddingTop: 14, textAlignVertical: 'top' },
  categoryRow: { gap: 8 },
  category: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.white, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 11, paddingVertical: 9 },
  categorySelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  categoryText: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 10 },
  categoryTextSelected: { color: colors.white },
  imageHint: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.cream, borderRadius: 13, borderWidth: 1, borderColor: colors.coralSoft, padding: 12 },
  imageHintText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11, flex: 1 },
  saveButton: { height: 54, borderRadius: radii.button, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  saveText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
});
