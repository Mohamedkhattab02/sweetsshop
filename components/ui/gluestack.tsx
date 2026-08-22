/**
 * Small, app-themed primitives built on gluestack-ui v5 creators.
 *
 * Keeping the styled roots here gives the app one place to tune pressed,
 * focus, and disabled states while the screens stay platform-neutral. Uniwind
 * classNames can be passed through to each root as well.
 */

// gluestack-ui v5 publishes its Metro entrypoints as JSX files. Importing the
// creator entry directly keeps Expo Router’s resolver from following the
// package's Node-oriented `main` field (`lib/esm/index.js`).
import { createButton } from '@gluestack-ui/core/lib/esm/button/creator/index.jsx';
import { createPressable } from '@gluestack-ui/core/lib/esm/pressable/creator/index.jsx';
import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

const PressableRoot = forwardRef<any, any>(({ states: _states, dataSet: _dataSet, ...props }, ref) => (
  <Pressable ref={ref} {...props} />
));

const ButtonRoot = forwardRef<any, any>(
  ({ states: _states, dataSet: _dataSet, role: _role, ...props }, ref) => (
    <Pressable ref={ref} {...props} />
  )
);

const ButtonTextRoot = forwardRef<any, any>(({ states: _states, dataSet: _dataSet, ...props }, ref) => (
  <Text ref={ref} {...props} />
));

const ButtonGroupRoot = forwardRef<any, any>(({ states: _states, dataSet: _dataSet, ...props }, ref) => (
  <View ref={ref} {...props} />
));

PressableRoot.displayName = 'GluestackPressableRoot';
ButtonRoot.displayName = 'GluestackButtonRoot';
ButtonTextRoot.displayName = 'GluestackButtonTextRoot';
ButtonGroupRoot.displayName = 'GluestackButtonGroupRoot';

export const GSPressable = createPressable({ Root: PressableRoot });

export const GSButton = createButton({
  Root: ButtonRoot,
  Text: ButtonTextRoot,
  Group: ButtonGroupRoot,
  Spinner: ActivityIndicator,
  Icon: View,
});
