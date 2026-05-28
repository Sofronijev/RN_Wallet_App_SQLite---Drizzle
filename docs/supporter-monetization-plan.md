# SpendyFly Supporter Tier — Monetization Plan

## Context

SpendyFly is currently 100% free on Google Play with a very small initial user base (~3–5 users). The developer wants to introduce optional monetization without gating any functional feature — ever. Every feature, including the upcoming Upcoming Payments feature, ships **free for everyone with no caps or limits**.

Chosen shape: a single lifetime one-time **"SpendyFly Supporter"** IAP that unlocks **cosmetic-only** perks themed around the app's name — a fly mascot, a supporter badge, fly animations, an alternate app icon, and a reserved accent color. The IAP is a thank-you channel for happy users, not a paywall.

Intended outcome:
- Every feature stays free for everyone, including the new **Upcoming Payments** feature (see [docs/upcoming-payments-plan.md](docs/upcoming-payments-plan.md)) — no caps, no limits, no trial, no paywall on any functional behavior.
- A single lifetime IAP (~$4.99) unlocks cosmetic-only perks: fly animations, Supporter badge, alternate app icon, Honey Gold accent color.
- Gifting via native Google Play / App Store promo codes. No in-app redemption UI in v1.
- Existing users lose nothing and keep every feature they have today.
- Refunds auto-revoke the cosmetic entitlement via RevenueCat webhooks. Functional behavior never changes on refund because nothing functional was ever gated.

This plan sits alongside the upcoming payments plan and does not alter its free-for-all scope.

---

## Decisions already made

| Question | Answer |
|---|---|
| Pricing model | Lifetime one-time purchase. No subscriptions. |
| Price | ~$4.99 USD lifetime (impulse-purchase tier, signals "supporter" not "premium software") |
| Cross-platform sync | None. Purchase on Android does not unlock iOS and vice versa. |
| IAP library | RevenueCat (`react-native-purchases`). Abstracts both stores, handles receipts, refund webhooks, restore flow. Free up to ~$2.5k MTR. |
| Trial | None needed — nothing is gated. |
| Grandfathering | Not needed — no functional feature is gated, so nothing is taken from existing users. |
| Gifting | Native Google Play + App Store promo codes. No in-app redemption UI in v1. |
| Functional gating | **Zero.** Every feature is free. The Supporter IAP unlocks cosmetic perks only. |

---

## What supporters get (cosmetic only)

Ship incrementally. The easiest ones first make the supporter tier feel substantive even before animations land.

### v1 (minimum viable supporter tier)
- **"SpendyFly Supporter 🪰" badge** in Settings — small gold fly icon next to app version + "Supporter since [date]" text.
- **Alternate app icon**: gold-tinted fly variant. Android and iOS both support programmatic alt icons.
- **Honey Gold accent color** — reserved theme accent option in `ThemeProvider`, only visible to supporters.

### v2 (animated flourishes)
- **Fly zips across the Balance screen header** — periodic flyby animation on app open and after adding a transaction. `react-native-reanimated` (already installed per CLAUDE.md) with `withTiming` + `translateX` + a small wing-flap rotation. ~40 lines.
- **Fly lands on the total balance** when balance updates. Tiny landing animation, then flies off after ~1s.
- **Empty-state fly** — when the transactions list is empty, a fly buzzes lazily across the screen instead of a static placeholder.
- **Loading-state fly** — a circling fly replaces the default spinner during data fetches.
- **Upcoming Payments fly flourish** — since that feature is also free, sprinkle a fly there too: when a scheduled payment goes from pending → paid, a fly briefly appears and flies off carrying a coin. Feels on-brand, not gatekeep-y.

### v3 (fancier / Lottie)
- Lottie fly animations for more elaborate movement (add `lottie-react-native`, source/commission assets).
- **"Founding Fly"** — a slightly different fly (e.g. a tiny crown) for the first 50 supporters. Mild prestige, rewards early believers. Track via purchase date on RevenueCat customer info.
- **Transaction-add flourish** — a tiny fly flies off carrying a coin when a transaction is created.
- **Custom fly-themed category icons** — optional variant set for the default categories.
- **Seasonal flies** — Santa fly in December, pumpkin fly in October, heart fly in February. Auto-enable for supporters on relevant dates.

**Always respect a "Show supporter animations: On / Off" toggle.** Default On for supporters (they paid for the fly), but let people who find motion distracting disable it.

---

## Store setup

### Google Play Console
1. Monetize → In-app products → create **Managed product** (non-consumable).
2. Product ID: `spendyfly_supporter_lifetime`.
3. Price: $4.99 (Google auto-converts to local currencies).
4. Status: Active.
5. Update app listing to mention "In-app purchases" (Google usually auto-flags).
6. Privacy policy URL must exist before IAP can go live.

### App Store Connect (when/if shipping iOS)
1. Features → In-App Purchases → create **Non-Consumable**.
2. Product ID: `spendyfly_supporter_lifetime` (same ID across platforms for cleaner RevenueCat config).
3. Price tier matching $4.99.
4. Submit for review alongside the app.

### RevenueCat
1. Create account at revenuecat.com.
2. New project; add Android + iOS apps; import products from each store.
3. Create single Entitlement: `supporter`.
4. Attach both platforms' products to `supporter`.
5. Copy the public API keys into the app (env or app.json).

### Gifting (promo codes)
- Google Play: Monetize → Promotions → Promo codes. One-time codes are unlimited; vanity codes (e.g. `LAUNCH2026`) have a usage cap you set.
- Apple: App Store Connect → Features → Promo Codes. Limited to ~100 per app per quarter.
- Users redeem through the native store apps. Add `StoreKit.presentCodeRedemptionSheet` later if demand.

---

## Files to add

| Path | Purpose |
|---|---|
| `app/modules/supporter/revenueCat.ts` | Thin SDK wrapper: `initialize`, `getCustomerInfo`, `purchaseSupporter`, `restorePurchases`. |
| `app/modules/supporter/useIsSupporter.ts` | Hook exposing supporter entitlement state from the RevenueCat cache. |
| `app/context/SupporterContext.tsx` | Provider fronting `useIsSupporter()` so every subscriber shares the same state. |
| `app/features/supporter/ui/SupporterScreen.tsx` | Support screen (not a paywall — opened only from explicit user action). Headline "Unlock the Fly 🪰." Buttons: Purchase, Restore Purchases, Close. Copy emphasizes "support the developer + cool cosmetics" not "unlock features." |
| `app/features/supporter/ui/SupporterBadge.tsx` | Gold-fly badge reused in Settings. |
| `app/features/supporter/ui/FlyAnimation.tsx` | Reusable animated fly with variants: `headerFlyBy`, `balanceLanding`, `emptyStateBuzz`, `loadingCircle`, `paidInstance`. |
| `app/features/supporter/ui/HoneyGoldPalette.ts` | Additional accent palette gated behind supporter state. |
| `app/assets/icons/fly-supporter/*` | Alt app icon assets (iOS icon set + Android adaptive icon). |

## Files to modify

| Path | Change |
|---|---|
| [package.json](package.json) | Add `react-native-purchases`. Use `yarn` (memory note: project uses yarn, not npm). |
| [app.json](app.json) | Add RevenueCat plugin + alt app icon config. |
| [App.tsx](App.tsx) | Initialize RevenueCat on mount; wrap children in `SupporterProvider`. |
| [app/theme/ThemeContext.tsx](app/theme/ThemeContext.tsx) | Expose Honey Gold accent as a conditional option (supporter-only). |
| `app/features/settings/...` | Add a "Support SpendyFly 🪰" row. Free users: opens SupporterScreen. Supporters: shows animated badge + "Supporter since [date]". |
| [app/navigation/routes.ts](app/navigation/routes.ts) | Register `SupporterScreen: undefined`. |
| [app/navigation/AppNavigator.tsx](app/navigation/AppNavigator.tsx) | Register as a modal screen. |
| `app/context/DashboardOptions/dashboardSettingStorage.ts` | Add `showSupporterAnimations: boolean` (default `true`). |

**Notably NOT modified**: none of the Upcoming Payments code needs gating logic. That feature ships as planned in [docs/upcoming-payments-plan.md](docs/upcoming-payments-plan.md) with no caps, no paywalls, no supporter checks on any functional behavior. The only touch point in Upcoming Payments is the optional `paidInstance` fly flourish in v2, which is purely visual.

---

## Implementation order

Each phase is independently shippable and testable.

### Phase 1 — Store + RevenueCat paperwork (no code)
1. Create IAP product in Google Play Console.
2. Create RevenueCat account, import product, create `supporter` entitlement.
3. Add a test account to Google Play internal testing track.
4. Verify product visible in sandbox. Budget a few days for store review.

### Phase 2 — SDK wiring
1. `yarn add react-native-purchases`, update app.json, prebuild.
2. Implement `app/modules/supporter/revenueCat.ts`.
3. Build `SupporterContext` + `useIsSupporter()` hook (reads cache, subscribes to updates).
4. Initialize RevenueCat in [App.tsx](App.tsx).
5. Sandbox test: purchase test product, verify `isSupporter` flips, restore works after reinstall.

### Phase 3 — Support screen + entry point
1. Build `SupporterScreen` — headline, static fly illustration, Purchase + Restore Purchases + Close buttons. Copy reads like a thank-you, not a sales pitch.
2. Register in navigation.
3. Add "Support SpendyFly 🪰" row in Settings. This is the **only** entry point — never auto-opened.

### Phase 4 — Minimum viable cosmetic perks
1. Gold fly SVG for `SupporterBadge`.
2. Alt app icon assets + config.
3. Honey Gold theme option in `ThemeContext`, gated by `useIsSupporter()`.

### Phase 5 — First animated perks
1. `FlyAnimation` component in reanimated. Variant: `headerFlyBy`.
2. Render on Balance screen header, gated on supporter + animation setting.
3. Add `showSupporterAnimations` toggle to dashboard settings.

### Phase 6 — More flourishes (optional, incremental)
1. `balanceLanding` variant on balance updates.
2. `emptyStateBuzz` variant on empty transaction lists.
3. `loadingCircle` variant replacing spinners.
4. `paidInstance` variant in Upcoming Payments when an instance flips to paid.
5. "Founding Fly" logic — flag first 50 supporters by purchase date, show crowned fly variant.

### Phase 7 — Polish (later if desired)
1. Lottie integration for complex animations.
2. Seasonal flies (date-gated).
3. In-app code redemption via `StoreKit.presentCodeRedemptionSheet`.
4. Fly-themed category icon set.

---

## Components to reuse

- **`react-native-reanimated`** — already installed and set up (babel plugin must stay last per CLAUDE.md). Use for all fly animations.
- **`ThemeProvider` / `useThemedStyles`** ([app/theme/ThemeContext.tsx](app/theme/ThemeContext.tsx)) — extend to expose Honey Gold as a supporter-only accent option.
- **`ShadowBoxView`** ([app/components/ShadowBoxView/index.tsx](app/components/ShadowBoxView/index.tsx)) — wrap SupporterScreen sections for visual consistency.
- **`ActionSheetProvider`** (already in [App.tsx](App.tsx)) — use for any supporter-related confirmation sheets.
- **`expo-secure-store`** — for tiny bits of local state (e.g., `hasSeenSupporterSettingsPromo`). No new dependency.

---

## Things to consider

- **Refund behavior**: RevenueCat's webhook revokes `supporter` on next app launch. Cosmetic perks disable silently. **No functional behavior changes**, because none of it was ever gated. The user just loses the fly, badge, alt icon, and Honey Gold theme. No angry reviews possible.
- **Restore Purchases is mandatory on iOS.** Apple rejects apps without it. Always include.
- **Anonymous ID caveat**: RevenueCat's anonymous App User ID does not survive reinstall onto a different device. Google Play remembers the purchase at the account level, so Restore Purchases recovers it cleanly. Document in SupporterScreen: *"Using a new device? Tap Restore Purchases."*
- **No nagging, ever**: the SupporterScreen appears **only** when the user explicitly taps "Support SpendyFly" in Settings. No auto-prompts, no "you've used the app for 30 days, consider supporting" popups, no upsells after actions. The whole point of this model is that it's purely opt-in.
- **Animation default**: On for supporters, Off for free users (they shouldn't see animations they didn't pay for; the free UI stays calm). Free users never see any fly — the cosmetic tier has to feel distinct.
- **Privacy policy update required** once IAP is live — disclose that RevenueCat processes purchase metadata. RevenueCat provides template language.
- **iOS is out of scope** if shipping Android-only. Same product ID can be created in App Store Connect later when expanding.
- **Store listing**: Google Play auto-flags the app as containing IAP once the product is live. Optionally mention "Supporter tier available" in the store description for transparency.
- **Don't label IAP as a "donation"** in Google Play product descriptions or paywall copy — Google reserves that wording for registered nonprofits. Framing as "Supporter tier — unlocks cosmetic perks (fly animations, badge, app icon, accent color)" is fine and categorizes it correctly as a digital goods purchase.
- **Charging for cosmetic-only is store-legal on both platforms.** Apps like Reeder, Overcast, and dozens of indie utilities do this exact model.

---

## Things deliberately NOT in v1

- Subscriptions.
- Cross-platform entitlement sync.
- Any time-based trial.
- Any functional gating anywhere (no caps on upcoming payments, wallets, categories, transactions, export, or anything else).
- Grandfathering logic (nothing is being taken away from anyone).
- Accounts, login, or cloud backup.
- In-app promo code redemption UI.
- More than one tier. Supporter or free, nothing else.
- Upsell prompts, usage-based nudges, "unlock more" banners. The Settings row is the only entry point, full stop.

---

## Verification

Manual end-to-end checklist after each major phase:

1. IAP product is Active in Google Play Console and visible to the internal testing track.
2. RevenueCat dashboard shows the product; fresh test account returns empty entitlements.
3. Purchase flow: tap Purchase → Play Store sheet → pay with test card → `isSupporter` flips to `true` → Supporter badge appears in Settings immediately, Honey Gold theme option becomes selectable, alt app icon becomes available.
4. Restore: reinstall app → tap Restore Purchases → entitlement restored within a second.
5. Refund: issue refund from Play Console → launch app → entitlement gone → cosmetic perks silently disabled → functional behavior unchanged everywhere.
6. Free-user sanity check: every feature in the app (wallets, transactions, categories, export, PIN, themes, **upcoming payments including creating the 4th, 10th, 100th schedule**) works identically to before. No gating anywhere.
7. Animations: `headerFlyBy` plays on Balance header for supporters only; does not render for free users regardless of settings.
8. Settings toggle: disabling "Show supporter animations" removes all fly animations globally for the supporter.
9. Regression pass: no functional change for any existing or upcoming-payments user flow.
10. Gift: generate a Google Play promo code → redeem in Play Store app on a fresh device → launch app → entitlement active immediately, cosmetic perks appear.
11. No-nag check: use the app for an hour without touching Settings. Never should a supporter prompt appear anywhere else.
