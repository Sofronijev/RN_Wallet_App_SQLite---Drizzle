# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpendyFly — a React Native (Expo SDK 54) expense tracking app with local-first SQLite storage via Drizzle ORM. All data stays on-device.

## Commands

```bash
yarn start              # Start Expo dev server
yarn android            # Build & install DEBUG APK on device/emulator
yarn ios                # Build & install DEBUG on iOS simulator
yarn apk                # Build RELEASE APK locally as Preview variant (side-by-side install)
yarn apk_eas            # Build Preview APK via EAS (side-by-side install)
yarn apk_prod           # Build production app-bundle via EAS (Play Store)
yarn prebuild           # Regenerate native android/ + ios/ projects
yarn db:generate        # Generate Drizzle migrations from schema changes
yarn db:customMigrate   # Generate custom migration file
```

No test runner is configured.

### Build Variants

Project uses Expo's [APP_VARIANT pattern](https://docs.expo.dev/build-reference/variants). Defined in `app.config.js`:

| `APP_VARIANT` | Name | Android package | iOS bundle ID | Used by |
|---|---|---|---|---|
| `development` | SpendyFly (Dev) | `com.misurapps.spendyfly.dev` | `com.sofronijev.spendyFly.dev` | reserved |
| `preview` | SpendyFly (Preview) | `com.misurapps.spendyfly.preview` | `com.sofronijev.spendyFly.preview` | `yarn apk`, `yarn apk_eas` |
| *(unset)* | SpendyFly | `com.misurapps.spendyfly` | `com.sofronijev.spendyFly` | `yarn apk_prod` |

Unique package names let Preview install alongside the Play Store version. `yarn apk` runs `prebuild --clean -p android` first because package name is baked into native code at prebuild time — this regenerates `android/` and wipes any manual edits there. EAS `preview` profile sets `APP_VARIANT=preview` via `eas.json` env.

`cross-env` is required (in devDeps) so the env var works on Windows shells.

## Architecture

### Data Flow

UI Components → Formik Forms → TanStack React Query (mutations/queries in `app/queries/`) → Service layer (`app/services/`) → Drizzle ORM → Expo SQLite

### State Management

- **Server/async state**: TanStack React Query v5 — query hooks live in `app/queries/` (transactions, wallets, categories, types, user, transfers)
- **Local UI state**: React Context providers, all composed in `App.tsx`:
  - `ThemeProvider` — light/dark/auto theme, persisted via expo-secure-store
  - `DashboardOptionsProvider` — dashboard display preferences
  - `PinCodeStatusProvider` — PIN lock authentication state
  - `AlertPromptProvider` — global alert dialogs
  - `ActionSheetProvider` — bottom sheet modals

### Database Schema

Defined in `db/schema.ts` with Drizzle ORM. Six tables: Users, Wallet, Categories, Types, Transactions, Transfer. Migrations auto-run on app start via `useMigrations` in `App.tsx`. After changing `db/schema.ts`, run `yarn db:generate` to create a migration.

### Navigation

React Navigation v7 with nested navigators:
- `RootNavigator` → switches between `AuthNavigator` (PIN screen) and `AppNavigator`
- `AppNavigator` → stack containing `HomeNavigator` (bottom tabs: Balance + Settings) and modal screens (transaction forms, search, wallet/category/PIN settings, export/import)
- Route types defined in `app/navigation/routes.ts`

### Feature Modules

Code is organized by feature in `app/features/`:
- `balance/` — transactions, wallet management, charts (has `modules/` for logic, `ui/` for screens)
- `pinCode/` — PIN authentication
- `settings/` — app settings

Shared UI components in `app/components/`, shared utilities in `app/modules/`.

## Path Aliases

Configured in both `tsconfig.json` and `babel.config.js` (module-resolver):

| Alias | Path |
|-------|------|
| `components/*` | `app/components/*` |
| `constants/*` | `app/constants/*` |
| `feature/*` | `app/feature/*` |
| `modules/*` | `app/modules/*` |
| `navigation/*` | `app/navigation/*` |

Also: `db` resolves to `./db/`, `app/` is used directly for deeper imports like `app/features/`, `app/theme/`, `app/context/`.

## Key Conventions

- Forms use Formik + Yup validation schemas
- Theme-aware styles via `useThemedStyles` hook from `app/theme/ThemeContext`
- `.sql` files are inlined at build time via `babel-plugin-inline-import`
- `react-native-reanimated` plugin must remain **last** in babel plugins
- Drizzle Studio is available in `__DEV__` mode only (`db/DrizzleStudio.ts`)
- EAS builds auto-increment version numbers (configured in `eas.json`)
