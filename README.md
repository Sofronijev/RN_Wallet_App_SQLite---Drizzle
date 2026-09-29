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
| `yarn ota_preview` | Publish a JS-only OTA update to the `preview` channel (see [OTA Updates](#ota-updates-eas-update)). |
| `yarn ota_prod` | Publish a JS-only OTA update to the `production` channel (Play Store builds). |
| `yarn ota_rollback` | Roll back the latest OTA update on a branch (interactive). |
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

## OTA Updates (EAS Update)

JS/asset-only changes can ship without a store release. An update reaches every installed build with the same **runtime version** (= app `version` in `app.config.js`) on the matching **channel** (set per profile in `eas.json`).

Flow:

1. Bump the code-push label in `package.json` `version` (`1.1.1-cp1` → `1.1.1-cp2` …) — it's shown in About. Leave `app.config.js` `version` as-is (that's the runtime version). When you bump the real version, set both to the plain version (e.g. `1.1.2`). Commit.
2. `yarn ota_preview -m "message"` → test on a Preview APK built with `yarn apk_eas` (local `yarn apk` builds don't have a channel and won't receive updates).
3. `yarn ota_prod -m "1.1.1-cp1: message"` → goes to Play Store builds. Put the label in the message so it's visible on expo.dev too.
4. Open the app, close it, open again — updates download on one launch and apply on the next.

If something breaks: `yarn ota_rollback` and pick the previous update or the embedded one (the JS shipped in the build). Rollback restores code only, not user data in SQLite.

**Bump `version` and make a new store build instead of an OTA** when you add/upgrade a native dependency, upgrade the Expo SDK, or change `app.config.js` plugins/native config. Otherwise older builds with the same version can receive a JS bundle that doesn't match their native code and crash.

Docs: [EAS Update](https://docs.expo.dev/eas-update/introduction/) · [Runtime versions](https://docs.expo.dev/eas-update/runtime-versions/) · [Rollbacks](https://docs.expo.dev/eas-update/rollbacks/)

## Installing on Your Phone

1. Plug the phone in via USB, enable USB debugging in Developer Options.
2. Close any running Android emulator (otherwise the build may install there instead).
3. Run `adb devices` to confirm the phone shows up.
4. Run `yarn apk`.

If you have multiple targets attached, add `--device` to the script to get an interactive picker, or pass `--device <serial>`.

## Architecture

See [CLAUDE.md](./CLAUDE.md) for details on data flow, state management, database schema, navigation, and conventions.
