# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpendyFly — a React Native (Expo SDK 54) expense tracking app with local-first SQLite storage via Drizzle ORM. All data stays on-device.

## Commands

```bash
yarn start              # Start Expo dev server
expo run:android        # Run on Android device/emulator
expo run:ios            # Run on iOS simulator
yarn apk                # Build release APK locally
yarn apk_eas            # Build preview APK via EAS
yarn apk_prod           # Build production app-bundle via EAS
yarn prebuild           # Generate native projects
yarn db:generate        # Generate Drizzle migrations from schema changes
yarn db:customMigrate   # Generate custom migration file
```

No test runner is configured.

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
