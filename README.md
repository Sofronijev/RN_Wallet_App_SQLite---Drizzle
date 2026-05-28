# SpendyFly

A React Native (Expo SDK 54) expense tracking app with local-first SQLite storage via Drizzle ORM. All data is stored on-device — nothing is sent to a server.

## Getting Started

```bash
yarn install
yarn start
```

Then press `a` (Android) or `i` (iOS) in the Expo CLI, or run `yarn android` / `yarn ios` directly.

## Commands

| Command | What it does |
|---|---|
| `yarn start` | Start Expo dev server (Metro bundler + QR for Expo Go / dev client). |
| `yarn android` | Build & install a **debug** APK on the connected Android device/emulator. Fast, dev-mode, requires Metro running. |
| `yarn ios` | Build & install a **debug** build on the iOS simulator. |
| `yarn apk` | Build a **release** APK locally and install it side-by-side as a separate app (see [Build Variants](#build-variants)). |
| `yarn apk_eas` | Build a **preview** APK in the cloud via EAS (side-by-side variant, internal distribution). |
| `yarn apk_prod` | Build the **production** Android App Bundle via EAS — this is what goes to the Play Store. |
| `yarn prebuild` | Regenerate the native `android/` and `ios/` projects from `app.config.js` and Expo plugins. |
| `yarn db:generate` | Generate a Drizzle migration after editing `db/schema.ts`. |
| `yarn db:customMigrate` | Generate an empty custom migration file you can fill in manually. |

No test runner is configured.

## Build Variants

The project uses Expo's [app variants](https://docs.expo.dev/build-reference/variants) pattern. The `APP_VARIANT` environment variable selects which variant `app.config.js` produces:

| `APP_VARIANT` | App name | Android package | iOS bundle ID | Triggered by |
|---|---|---|---|---|
| `development` | SpendyFly (Dev) | `com.misurapps.spendyfly.dev` | `com.sofronijev.spendyFly.dev` | (reserved for future dev-client builds) |
| `preview` | SpendyFly (Preview) | `com.misurapps.spendyfly.preview` | `com.sofronijev.spendyFly.preview` | `yarn apk`, `yarn apk_eas` |
| *(unset)* | SpendyFly | `com.misurapps.spendyfly` | `com.sofronijev.spendyFly` | `yarn apk_prod` |

Because each variant has a unique package name, Android treats them as **separate apps** — the Preview build installs alongside the Play Store version with its own icon and its own database.

### Gotchas

- `yarn apk` runs `expo prebuild --clean -p android` first, which **wipes and regenerates the `android/` folder**. Any manual edits inside `android/` not reflected in `app.config.js` or an Expo plugin will be lost. Run `git status` after prebuild to spot unintended changes.
- The Preview build is signed with the **debug keystore**, not your Play Store upload key. Fine for personal testing, but you cannot ship it to the store.
- `cross-env` is required because Windows shells don't honor `VAR=value cmd` inline. It's already in `devDependencies`.
- Switching between variants (e.g. running `yarn apk` after `yarn android`) needs a fresh `prebuild --clean` because the package name is baked into native code at prebuild time. The `apk` script handles this automatically.

## Installing on Your Phone

1. Plug the phone in via USB, enable USB debugging in Developer Options.
2. Close any running Android emulator (otherwise the build may install there instead).
3. Run `adb devices` to confirm the phone shows up.
4. Run `yarn apk`.

If you have multiple targets attached, add `--device` to the script to get an interactive picker, or pass `--device <serial>`.

## Architecture

See [CLAUDE.md](./CLAUDE.md) for details on data flow, state management, database schema, navigation, and conventions.
