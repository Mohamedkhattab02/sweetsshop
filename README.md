# Green Lane Market

A sample market app built with [Expo](https://expo.dev) (SDK 54), [Expo Router](https://docs.expo.dev/router/introduction/)
and [React Native Paper v5](https://callstack.github.io/react-native-paper/), which implements Google's
**Material Design 3** component set.

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

## Running it

```bash
npm install
npx expo start
```

Then open the project in Expo Go, an Android emulator, or an iOS simulator. Everything works in
Expo Go — no custom development build is needed.

## Project layout

```
app/
  _layout.tsx           Paper MD3 theme + product store providers
  (tabs)/
    _layout.tsx         Bottom navigation (Market / Add product)
    index.tsx           Main page: open hours, category filter, product grid
    add.tsx             New-product form with validation and image picker
  product/[id].tsx      Product detail
components/market/      Open-hours banner, category filter, product card
constants/
  market.ts             Categories, the opening schedule, price formatting
  theme.ts              Material 3 colour scheme (light + dark)
store/products.tsx      In-memory product store (React context + reducer)
```

## Notes

This is a sample app, so **there is no database**. Products live in React state via
`store/products.tsx` and reset when the app restarts. Swapping in a real backend means replacing
the reducer inside `ProductsProvider` — the screens only talk to it through the `useProducts()`
hook.

Seed product photos are hotlinked from Unsplash, so the starting catalogue needs a network
connection. Uploaded photos are local `file://` URIs and work offline. If any image fails to load,
the card falls back to a tinted category glyph.
