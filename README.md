# Green Lane Market

A sample market app built with [Expo](https://expo.dev) (SDK 54) and
[Expo Router](https://docs.expo.dev/router/introduction/).

It deliberately does **not** look the same on both platforms. Android gets Google's
**Material Design 3** via [React Native Paper v5](https://callstack.github.io/react-native-paper/);
iOS gets Apple's **Liquid Glass**, SF Symbols and a real `UITabBar`. See
[Platform look and feel](#platform-look-and-feel).

## What it does

- **Opening hours at the top of the main page** — a banner shows whether the market is open right
  now and when it next opens or closes. Tap it to expand the full week. It re-checks itself every
  30 seconds.
- **Browse products by category** — Material 3 filter chips across the top of the list. The
  selection is *multi-select*: pick Fruits and Dairy to see both. "All" clears the filter.
- **Upload a new product** — the second tab. Name, category, price and photo are all required;
  the photo comes from the device gallery or the camera. Unit and description are optional. New
  products appear at the top of the market immediately, badged "New".
- **Product detail** — tap any card for the full-size photo, price and description.
- **Cart** — tap the cart button on any product card to add it, or pick a quantity on the detail
  screen. The cart tab carries a live badge. On the cart page each line has a quantity stepper
  (decrementing past one removes it) and a running total.
- **Place an order** — checkout asks for **name** and **phone number** (both required) and a
  **delivery address** (optional; leaving it blank makes the order a collection). Placing an order
  empties the cart and shows a confirmation with an order reference.

## Running it

```bash
npm install
npx expo start
```

Then open the project in Expo Go, an Android emulator, or an iOS simulator. Everything works in
Expo Go — no custom development build is needed.

## Platform look and feel

Screens describe intent — "a header with a title and a cart action", "a raised surface" — and each
platform draws it in its own idiom. The split is done with Metro's platform extensions
(`foo.ios.tsx` beside `foo.tsx`), so neither platform's code ships in the other's bundle.

| | Android | iOS |
|---|---|---|
| Tab bar | Material 3 navigation bar (JS) | Real `UITabBar` via expo-router native tabs → **Liquid Glass** on iOS 26 |
| Header | Material 3 top app bar, opaque, in flow | Floating **Liquid Glass** nav bar with iOS large titles; content scrolls under it |
| Icons | Material Community Icons | **SF Symbols** |
| Colours | MD3 tonal palette | `PlatformColor` — the real UIKit dynamic system colours |
| Open-hours banner, cart total bar | Tonal elevated Material surface | **Liquid Glass**, tinted green/red |
| Product cards | Outlined (MD3) | Elevated, borderless (iOS grouped style) |
| Add-product form | Outlined fields, chips, segmented buttons | **Inset grouped sections** (Settings style) |
| Choosing a photo | Dashed drop zone + Gallery/Camera buttons | Photo well + **`ActionSheetIOS`** |
| Picking a category | Filter chips | **Checkmark rows**, one per category |
| Field errors | Helper text under the field | Red **section footer** |
| Confirmation | Snackbar | **`Alert`** |

### The add-product form

The clearest example of the split. Both platforms share `hooks/use-add-product-form.ts` — all the
field state, validation rules and image picking — so they cannot drift apart in behaviour. Only the
view differs:

- `components/market/add-product-form.tsx` — Material 3: outlined text fields with floating labels,
  filter chips, `SegmentedButtons`, a dashed media drop zone, a Snackbar.
- `components/market/add-product-form.ios.tsx` — iOS: grouped section cards with the label to the
  *left* of the value (not floating above it), an action sheet for Take Photo / Choose from Library /
  Remove, checkmark rows for the category, a `UISegmentedControl`-style track, grey section footers
  that turn red on error, and an `Alert` on success.
- `components/ui/ios-form.tsx` — the reusable iOS grouped primitives (section, row, separator,
  checkmark row, segmented control, filled button) at standard UIKit metrics.

Key files:

- `components/ui/glass-surface.ios.tsx` — the Liquid Glass primitive, with a three-tier fallback:
  `GlassView` on iOS 26 → `BlurView` system material on older iOS → a solid fill when the user has
  **Reduce Transparency** switched on. Android renders a Material surface instead of imitating glass.
- `components/ui/app-icon.ios.tsx` / `.tsx` — one semantic icon token (`constants/icons.ts`) carries
  both a Material name and an SF Symbol. The SF names are typechecked against `sf-symbols-typescript`,
  so a symbol that does not exist fails the build.
- `components/ui/screen-header.ios.tsx` / `.tsx` — the two navigation bars.
- `components/navigation/market-tabs.ios.tsx` / `.tsx` — the two tab bars.
- `constants/ios-colors.ts` — **iOS-only**; `PlatformColor` throws on Android, so this module must
  never be imported from a shared file.

Caveats worth knowing:

- Liquid Glass needs **iOS 26**. Below that the app falls back to `BlurView`, which still looks
  native but is not Liquid Glass.
- `expo-router/unstable-native-tabs` is alpha in SDK 54. Android is deliberately left on the JS
  Material 3 tab bar.
- The native tab bar's `minimizeBehavior="onScrollDown"` is not supported over a `FlatList`, so it
  applies on the form screens but not the market and cart grids. It degrades to doing nothing.
- The iOS large title does not shrink on scroll; it is a static large-title bar.

## Project layout

```
app/
  _layout.tsx           Paper MD3 theme + product and cart providers
  (tabs)/
    _layout.tsx         Bottom navigation (Market / Add product / Cart)
    index.tsx           Main page: open hours, category filter, product grid
    add.tsx             New-product form with validation and image picker
    cart.tsx            Cart page: line items, quantity steppers, total
  product/[id].tsx      Product detail + add to cart
  checkout.tsx          Order form (name, phone, optional address)
  order/[id].tsx        Order confirmation
components/
  market/               Banner, filter, product card, cart row, add-product form (split)
  navigation/           Tab bars (.ios = native UITabBar, .tsx = Material 3)
  ui/                   Platform-split primitives: glass surface, header, icons, iOS form
hooks/
  use-add-product-form.ts  Form state + validation, shared by both platform views
constants/
  market.ts             Categories, the opening schedule, price formatting
  icons.ts              Semantic icon tokens (Material name + SF Symbol)
  theme.ts              Material 3 colour scheme (light + dark)
  ios-colors.ts         UIKit system colours — iOS-only, never import in shared code
store/
  products.tsx          In-memory product store (React context + reducer)
  cart.tsx              Cart lines and placed orders
```

## Notes

This is a sample app, so **there is no database**. Products live in React state via
`store/products.tsx` and reset when the app restarts. Swapping in a real backend means replacing
the reducer inside `ProductsProvider` — the screens only talk to it through the `useProducts()`
hook.

Seed product photos are hotlinked from Unsplash, so the starting catalogue needs a network
connection. Uploaded photos are local `file://` URIs and work offline. If any image fails to load,
the card falls back to a tinted category glyph.
