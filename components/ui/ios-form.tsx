/**
 * iOS "inset grouped" form primitives — the layout language of Settings,
 * Contacts and Mail: a grouped background, rounded section cards, 44pt rows,
 * separators inset to the text, and grey caption text above and below.
 *
 * IMPORTANT: iOS-only. This module reads `PlatformColor`, which throws on
 * Android, so it must only ever be imported from a `.ios.tsx` file. It has no
 * platform suffix of its own purely so TypeScript can resolve the import path.
 */

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { IOSColors } from '@/constants/ios-colors';

/** Standard UIKit metrics. */
export const ROW_HEIGHT = 44;
export const SECTION_RADIUS = 10;
export const SECTION_INSET = 16;
/** Separators start after the row's leading label, never at the card edge. */
const SEPARATOR_INSET = 16;

/* -------------------------------------------------------------------------- */
/*                                   Section                                  */
/* -------------------------------------------------------------------------- */

export function FormSection({
  header,
  footer,
  footerTone = 'default',
  children,
  style,
}: {
  header?: string;
  footer?: string;
  /** `error` turns the footer red, the iOS way of reporting a bad field. */
  footerTone?: 'default' | 'error';
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.sectionBlock}>
      {header ? <Text style={styles.sectionHeader}>{header.toUpperCase()}</Text> : null}
      <View style={[styles.sectionCard, style]}>{children}</View>
      {footer ? (
        <Text style={[styles.sectionFooter, footerTone === 'error' && styles.sectionFooterError]}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

/** Hairline separator between rows, inset like UIKit's. */
export function FormSeparator() {
  return <View style={styles.separator} />;
}

/* -------------------------------------------------------------------------- */
/*                                     Row                                    */
/* -------------------------------------------------------------------------- */

/**
 * A row with a leading label and trailing content — the iOS field layout,
 * where the label sits to the left of the value rather than floating above it
 * the way a Material outlined field does.
 */
export function FormRow({
  label,
  children,
  onPress,
  accessibilityLabel,
  align = 'center',
}: {
  label?: string;
  children?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  align?: 'center' | 'top';
}) {
  const content = (
    <View style={[styles.row, align === 'top' && styles.rowTop]}>
      {label ? <Text style={styles.rowLabel}>{label}</Text> : null}
      <View style={styles.rowContent}>{children}</View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => (pressed ? styles.rowPressed : undefined)}>
      {content}
    </Pressable>
  );
}

/**
 * A selectable row with a trailing checkmark — how iOS presents a
 * one-of-several choice inline (Settings › General › Language, and friends).
 */
export function FormCheckRow({
  label,
  selected,
  onPress,
  leading,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  leading?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => (pressed ? styles.rowPressed : undefined)}>
      <View style={styles.row}>
        {leading ? <View style={styles.checkLeading}>{leading}</View> : null}
        <Text style={styles.rowValueText}>{label}</Text>
        <View style={styles.rowSpacer} />
        {selected ? <AppIcon name="check" size={17} color={IOSColors.accent} /> : null}
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Segmented control                              */
/* -------------------------------------------------------------------------- */

/**
 * A UISegmentedControl look-alike: a recessed grey track with a raised white
 * pill on the selected segment. Material's equivalent is a row of outlined
 * buttons with a checkmark, which is why this does not simply reuse it.
 */
export function FormSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}) {
  return (
    <View style={styles.segmentTrack} accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
            style={[styles.segment, isSelected && styles.segmentSelected]}>
            <Text style={[styles.segmentLabel, isSelected && styles.segmentLabelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Button                                   */
/* -------------------------------------------------------------------------- */

/** A filled iOS action button: 50pt tall, 14pt corners, 17pt semibold label. */
export function FormButton({
  title,
  onPress,
  disabled,
  tone = 'filled',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'filled' | 'plain';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        tone === 'filled' ? styles.buttonFilled : styles.buttonPlain,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}>
      <Text style={tone === 'filled' ? styles.buttonFilledLabel : styles.buttonPlainLabel}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: 22,
  },
  sectionHeader: {
    fontSize: 13,
    color: IOSColors.secondaryLabel,
    marginLeft: SECTION_INSET + 4,
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  sectionCard: {
    marginHorizontal: SECTION_INSET,
    borderRadius: SECTION_RADIUS,
    backgroundColor: IOSColors.secondaryGroupedBackground,
    overflow: 'hidden',
  },
  sectionFooter: {
    fontSize: 13,
    color: IOSColors.secondaryLabel,
    marginHorizontal: SECTION_INSET + 4,
    marginTop: 7,
    lineHeight: 18,
  },
  sectionFooterError: {
    color: IOSColors.badge,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: IOSColors.separator,
    marginLeft: SEPARATOR_INSET,
  },
  row: {
    minHeight: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SEPARATOR_INSET,
  },
  rowTop: {
    alignItems: 'flex-start',
    paddingTop: 11,
    paddingBottom: 11,
  },
  rowPressed: {
    backgroundColor: IOSColors.fill,
  },
  rowLabel: {
    fontSize: 17,
    color: IOSColors.label,
    marginRight: 12,
    minWidth: 96,
  },
  rowContent: {
    flex: 1,
  },
  rowValueText: {
    fontSize: 17,
    color: IOSColors.label,
  },
  rowSpacer: {
    flex: 1,
  },
  checkLeading: {
    marginRight: 10,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: IOSColors.fill,
    borderRadius: 9,
    padding: 2,
    gap: 2,
  },
  segment: {
    flex: 1,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: IOSColors.secondaryGroupedBackground,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: IOSColors.label,
  },
  segmentLabelSelected: {
    fontWeight: '600',
  },
  buttonFilled: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: IOSColors.accent,
  },
  buttonPlain: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonFilledLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonPlainLabel: {
    fontSize: 17,
    color: IOSColors.accent,
  },
});
