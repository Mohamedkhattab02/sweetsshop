/**
 * Semantic icon tokens.
 *
 * Every icon in the app is named by what it *means*, and each token carries a
 * Material Community Icons name for Android and an SF Symbol for iOS. This is
 * what lets the two platforms look native without screens knowing which set is
 * in play — see `components/ui/app-icon.tsx`.
 *
 * The `sf` names are typechecked against `sf-symbols-typescript`, so a symbol
 * that does not exist fails the build rather than rendering an empty box.
 */

import type { SFSymbol } from 'sf-symbols-typescript';

export type IconToken = {
  /** MaterialCommunityIcons name, used on Android and web. */
  md: string;
  /** SF Symbol name, used on iOS. */
  sf: SFSymbol;
};

export const ICONS = {
  chevronUp: { md: 'chevron-up', sf: 'chevron.up' },
  chevronDown: { md: 'chevron-down', sf: 'chevron.down' },
  back: { md: 'arrow-left', sf: 'chevron.backward' },
  close: { md: 'close', sf: 'xmark' },

  cart: { md: 'cart-outline', sf: 'cart' },
  cartFilled: { md: 'cart', sf: 'cart.fill' },
  cartAdd: { md: 'cart-plus', sf: 'cart.badge.plus' },
  cartAdded: { md: 'cart-check', sf: 'checkmark.circle.fill' },
  cartEmpty: { md: 'delete-sweep-outline', sf: 'trash' },

  plus: { md: 'plus', sf: 'plus' },
  minus: { md: 'minus', sf: 'minus' },
  delete: { md: 'delete-outline', sf: 'trash' },

  photoAdd: { md: 'image-plus', sf: 'photo.badge.plus' },
  gallery: { md: 'image-multiple', sf: 'photo.on.rectangle' },
  camera: { md: 'camera', sf: 'camera.fill' },

  tag: { md: 'tag-outline', sf: 'tag' },
  store: { md: 'storefront-outline', sf: 'storefront' },
  storeOpen: { md: 'store-check', sf: 'storefront.fill' },
  storeClosed: { md: 'store-clock', sf: 'clock.badge.exclamationmark' },

  checkout: { md: 'clipboard-check-outline', sf: 'list.clipboard' },
  check: { md: 'check', sf: 'checkmark' },
  checkCircle: { md: 'check-circle-outline', sf: 'checkmark.circle' },

  person: { md: 'account-outline', sf: 'person' },
  phone: { md: 'phone-outline', sf: 'phone' },
  address: { md: 'map-marker-outline', sf: 'mappin.and.ellipse' },
  clock: { md: 'clock-outline', sf: 'clock' },
  info: { md: 'information-outline', sf: 'info.circle' },
  sparkle: { md: 'star-four-points', sf: 'sparkles' },
  addProduct: { md: 'plus-box-outline', sf: 'plus.app' },
} as const satisfies Record<string, IconToken>;

export type IconName = keyof typeof ICONS;
