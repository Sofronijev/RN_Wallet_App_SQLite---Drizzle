# Releasing SpendyFly

There are two kinds of release:

| | Store release | OTA release (code push) |
|---|---|---|
| **When** | New/upgraded native package, Expo SDK upgrade, `app.config.js` plugin or native config change | JS/TS and asset changes only |
| **Version** | `1.1.2` | `1.1.2-cp1`, `1.1.2-cp2` … |
| **Reaches users** | Via Play Store update | On the next app launch after download (open → close → open) |

The runtime version is the `version` in `app.config.js`. An OTA reaches every installed build with that runtime version, so **never ship native changes as an OTA**: the JS won't match the native code and the app will crash.

Always build or publish from a **committed and pushed** state, and tag that exact commit.

## Store release

1. Set the same plain version in `app.config.js` and `package.json`, e.g. `1.1.2`.
2. Commit and push.
3. Optional: test with a preview build: `yarn apk_eas`.
4. `yarn apk_prod`, then upload the `.aab` to Google Play Console.
5. Tag and release:
   ```bash
   git tag -a v1.1.2 -m "Play Store build 1.1.2"
   git push origin v1.1.2
   gh release create v1.1.2 --title "1.1.2" --generate-notes
   ```

## OTA release

1. Bump only `package.json` `version` to the next label, e.g. `1.1.2-cp1`. It shows in About. Leave `app.config.js` alone.
2. Commit and push.
3. Test on preview (needs a preview APK from `yarn apk_eas` with the same version; local `yarn apk` builds don't receive updates):
   ```bash
   yarn ota_preview -m "1.1.2-cp1: short description"
   ```
   Open → close → open the preview app and check that About shows `1.1.2-cp1`.
4. Publish to production:
   ```bash
   yarn ota_prod -m "1.1.2-cp1: short description"
   ```
5. Tag and release. Don't tick "pre-release"; it's live.
   ```bash
   git tag -a v1.1.2-cp1 -m "OTA: short description"
   git push origin v1.1.2-cp1
   gh release create v1.1.2-cp1 --title "1.1.2-cp1 (OTA)" --notes "What changed"
   ```

## If an OTA breaks something

```bash
yarn ota_rollback
```

Pick the previous update, or the embedded one (the JS that shipped in the store build). The rollback also arrives on the next launch. It restores **code only**; user data in SQLite is not reverted.

## Links

- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [Runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)
- [Rollbacks](https://docs.expo.dev/eas-update/rollbacks/)
