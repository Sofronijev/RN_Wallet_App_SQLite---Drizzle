# Upcoming Payments / Bill Reminders

## Status (2026-04-23)

**Architectural deviation from the original plan**: we went with a **separate `UpcomingPaymentForm`** under [app/features/upcomingPayments/](app/features/upcomingPayments/) instead of adding a `ModeToggle` to the existing `TransactionForm`. Everything below that assumes the single-form approach should be read as historical context — the separate-form path is the current design.

### Done
- DB schema (`upcomingPayments`, `upcomingPaymentInstances`, `upcomingPaymentContributions`) + migrations + inferred types.
- Service layer CRUD: [app/services/upcomingPaymentQueries.ts](app/services/upcomingPaymentQueries.ts) — add / update / soft-delete / cancel-instance / restore-instance / list / by-id / instances-with-contributions / section query.
- React Query hooks: [app/queries/upcomingPayments.ts](app/queries/upcomingPayments.ts).
- Separate `UpcomingPaymentForm` with RepetitionPicker, EndDatePicker, NotificationSettings, VariableAmountToggle, LockedInfoBox, validation, `deriveEditInitialValues`.
- Dashboard: `UpcomingPaymentsSection` + `UpcomingPaymentRow` + `UpcomingPaymentCard`.
- Detail screen: `UpcomingPaymentDetails` + `HistoryRow`.
- Settings management list: `UpcomingPaymentsSettings`.
- `showUpcomingPayments` dashboard toggle wired through `dashboardSettingStorage`.
- Navigation routes: `UpcomingPayment`, `UpcomingPaymentDetails`, `UpcomingPaymentsSettings`.

### Remaining
1. **Pay flow (Phase 5)** — blocker for shipping. No `PaySheet`, no `addContribution` / `markInstanceStatus` service fns, no transaction creation on pay. `openPaySheet` handlers are TODO stubs in [UpcomingPaymentRow.tsx:34](app/features/upcomingPayments/ui/UpcomingPaymentRow.tsx#L34) and [UpcomingPaymentDetails.tsx:99](app/features/upcomingPayments/ui/UpcomingPaymentDetails.tsx#L99).
2. **Sparse materialization** — `addUpcomingPayment` only inserts the first instance ([upcomingPaymentQueries.ts:20](app/services/upcomingPaymentQueries.ts#L20)); no `materializeInstance`, no top-up on pay, no ~3-period runway.
3. **Recurrence helper** — no `getNextDueDate(rule, afterDate)` exists. Needed by pay-flow top-up, overdue sweep, and the detail screen's "Next due" header. Recurrence math is currently inlined in `computeTotalCount` inside the service.
4. **Overdue materialization sweep** — no launch-time pass that materializes past virtual periods as `pending` rows so they can be paid and notified on. Missed status itself is **not** persisted — `isInstanceMissed` derives it at read time from `status === "pending" && dueDate < today`.
5. **`UpcomingPaymentsAllScreen`** — the dashboard "Show all" target (uncapped version of the section query) is not built.
6. **Notifications (Phase 6)** — entirely missing: `expo-notifications` not in [package.json](package.json) / [app.json](app.json), no `app/modules/notifications/` wrapper, no scheduling, no cancel-on-pay, no permission prompt. The `notifyDaysBefore` / `notifyOnDueDay` / `notifyOnMissed` columns are captured in the form but nothing reads them.
7. **`ProgressBar`** — not built; needed for partial-payment progress on the detail screen.
8. **`App.tsx` bootstrap** — no notification channel setup, no overdue-materialization sweep on mount.

---

## Context

SpendyFly currently tracks past transactions but has no concept of "money I owe in the future." The user wants to be reminded of upcoming bills, see their recurring payments on the dashboard at a glance, mark partial payments against them, and get local notifications before/on the due date (and when a payment is missed). The feature must stay local-first (no server) and reuse the existing `TransactionForm` so the add flow stays one button.

Intended outcome:
- Dashboard shows individual Instance rows for **this month only**, plus any **missed** instances from prior months (oldest → newest first, then this month's pending chronologically). No future-month clutter.
- A separate **"All scheduled payments" row in Settings** opens a list of the UpcomingPayments themselves (the recurring templates) for management — edit / pause / archive / delete.
- A single "+" button opens the existing form with a "Regular / Upcoming" toggle at the top.
- Paying (full or partial) creates a real `Transaction` linked back to the upcoming payment — so normal balance math is unaffected and history is preserved.
- Tapping an instance opens the **Upcoming Payment detail screen** for its parent — shows the rule, the next due, full history, and actions (edit / pause / archive / delete).
- Local scheduled notifications fire N days before and on the due date, plus a missed-payment alert.

---

## Recurrence Model — Decided: UpcomingPayments + sparse Instances

`UpcomingPayments` (the rule, one row per bill) + `Instances` (sparse — only materialized when a period has real state) + `Contributions` (links Instance ↔ real Transaction).

Key idea: **future periods are virtual by default**, computed on-the-fly from the parent UpcomingPayment. An Instance row only exists when there's something to remember about that specific period:
- It was paid (fully or partially)
- It is past-due and needs to be payable / notifiable (overdue sweep materializes it as `pending`; the UI flags it as missed via `isInstanceMissed`)
- It has notification IDs scheduled against it
- It had a per-period override (edited amount for that one period)

This keeps the DB tiny, makes year-view trivial (just compute virtually), and preserves history accurately.

---

## Decisions already made

| Question | Answer |
|---|---|
| Add-button UX | One "+" button → one form with a "Regular / Upcoming" mode toggle at the top. Extra fields appear when Upcoming is selected. |
| Repetition options | None, Daily, Weekly, Monthly, Yearly, **Custom (every N days/weeks/months)** |
| End-date handling | Single `endDate` column (nullable). NULL = forever. Form offers two radio choices: "No end date" or "Ends on [date]". No separate count/mode columns — compute end date at creation if user thinks in counts. |
| Dashboard model | Individual Instance rows. Shows **all missed from prior months** (oldest → newest) + **every pending instance with a due date in the current month**, sorted chronologically. No future-month rows. |
| Settings entry | A separate "All scheduled payments" row in Settings opens a list of **UpcomingPayments** (recurring templates) for management — distinct from the dashboard's instance-focused "Show all". |
| Detail screen | Tap any Instance row (dashboard) or any row in the Settings list → Upcoming Payment detail screen (rule header + next due + history list + edit/pause/archive/delete actions). |
| Variable-amount bills | Signaled by `amount IS NULL`. Shows "Variable" label + "Enter & Pay" button; user enters amount at payment time. No partials for variable bills in v1. |
| v1 scope | Partial payments + progress bar (fixed-amount only), local notifications (day-of + N days early), missed-payment notification, dashboard toggle |

---

## Architecture overview

```
User taps "+"
  │
  ▼
TransactionForm  (mode: 'transaction' | 'upcoming')
  │
  ├─ mode='transaction' → existing path, unchanged
  │
  └─ mode='upcoming'    → inserts UpcomingPayment row
                          → schedules notifications for the next N periods
                            (each notification creates an Instance row to hold its ID)

Dashboard
  │
  ▼
UpcomingPaymentsSection  (Instance rows: all prior-month missed + every current-month pending, chronological)
  │
  ├─ row shows: upcomingPayment.name, instance.dueDate, amount (or "Variable"), late/missed badge
  ├─ tap row (anywhere except Pay button) → detail screen
  └─ action: [Pay] / [Enter & Pay]
              │
              ▼
        Creates Transaction (normal balance flow)
        + Contribution row linking Transaction → Instance
        + If instance reaches 100%, mark paid & cancel its notifications
        + Materialize next period so the pipeline stays full

Settings → "All scheduled payments" → UpcomingPaymentsListScreen
  │
  ▼
  - Flat list of all UpcomingPayments (active + archived)
  - Each row: name, rule summary, next due, active/archived badge
  - Tap → detail screen

Upcoming Payment detail screen  (tap any instance row)
  │
  ▼
  - Header: name, rule ("Monthly · no end date"), next due
  - History: list of past Instances (paid / missed) with their Transactions
  - Actions: Edit, Pause, Archive, Delete
```

---

## Database schema

Add to [db/schema.ts](db/schema.ts). Generate migration with `yarn db:generate`.

### `UpcomingPayments` (the rule)

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `name` | text(255) NOT NULL | e.g. "Rent", "Netflix" |
| `amount` | real nullable | expected amount per period; NULL = variable-amount bill (electricity-style) |
| `categoryId` | integer FK → Categories | reuse existing picker |
| `typeId` | integer FK → Types (nullable) | |
| `currencyCode` | text(10) NOT NULL | ISO code of the bill's currency (e.g. `USD`, `EUR`). The rule is **not** tied to a wallet — each payment event picks its own wallet at pay time. |
| `currencySymbol` | text(10) default "" | display symbol, snapshotted from the currency list at creation |
| `userId` | integer FK → Users, default 1 | |
| `firstDueDate` | text (ISO) NOT NULL | anchor for recurrence math |
| `endDate` | text (ISO) nullable | NULL = no end date (forever); otherwise the last valid due date |
| `recurrence` | text enum | `none` \| `daily` \| `weekly` \| `monthly` \| `yearly` \| `custom` |
| `customIntervalValue` | integer nullable | e.g. 3 |
| `customIntervalUnit` | text enum nullable | `day` \| `week` \| `month` |
| `notifyDaysBefore` | integer nullable | NULL = no advance reminder; otherwise 1–5 = N days before. Independent of `notifyOnDueDay`. |
| `notifyOnDueDay` | integer (bool) default 1 | Day-of reminder. Independent of `notifyDaysBefore` — either, both, or neither can fire. |
| `notifyOnMissed` | integer (bool) default 1 | |
| `isActive` | integer (bool) default 1 | soft-archive when user ends an upcoming payment |
| `createdAt` | text default CURRENT_TIMESTAMP | |

### `UpcomingPaymentInstances` (sparse — only when a period has state)

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `upcomingPaymentId` | integer FK → UpcomingPayments ON DELETE CASCADE | |
| `dueDate` | text (ISO) NOT NULL | unique per upcomingPaymentId (composite unique index) |
| `expectedAmount` | real nullable | snapshotted from UpcomingPayment.amount at materialization time; NULL when the parent is a variable-amount bill |
| `status` | text enum | `pending` \| `paid` \| `canceled`. **No `missed` status** — missed is derived at read time by `isInstanceMissed` (`status === "pending" && dueDate < today`). |
| `paidAt` | text (ISO) nullable | set when `status` flips to `paid` |
| `canceledAt` | text (ISO) nullable | mirrors paidAt for the canceled case |
| `notificationIds` | text nullable | JSON array of expo-notifications IDs |

**Composite unique index on `(upcomingPaymentId, dueDate)`** — prevents duplicate materialization if two code paths both try to create the same period.

### `UpcomingPaymentContributions` (links Instance ↔ real Transaction)

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `instanceId` | integer FK → Instances ON DELETE CASCADE | |
| `transactionId` | integer FK → Transactions ON DELETE CASCADE | |
| `amount` | real NOT NULL | positive, partial payments allowed (fixed-amount upcoming payments only) |
| `createdAt` | text default CURRENT_TIMESTAMP | |

**Why Contributions as a separate table**: same Transaction might in the future belong to multiple concepts; clean cascade — delete the upcoming payment → instances go → contributions go → real Transactions remain untouched (balance math stays correct). Follows the Transfer table precedent (see [app/queries/transfers.ts:87-128](app/queries/transfers.ts#L87-L128)).

---

## Sparse materialization — when Instance rows get created

Instance rows are **not** pre-generated for every future period. They are created only on these triggers:

1. **On upcoming payment creation** — materialize the first ~3 periods so notifications have somewhere to store their IDs. These rows start as `status=pending`.
2. **On pay (full or partial)** — if no Instance row exists for the due date being paid, create one. Attach the Contribution. When the instance flips to `paid`, materialize the *next* period after it (so there's always a pending pipeline).
3. **On overdue sweep (app launch)** — for each active upcoming payment, compute virtual due dates that are in the past. Any that don't have a matching Instance row get materialized as `status=pending` (the UI then derives "missed" from the past `dueDate`), and the missed notification fires.

Everything else remains virtual. A period that is 2 years out and has never been paid, missed, or had notifications scheduled against it will have no row.

### Dashboard query

Missed is a frontend concept (`status === "pending" && dueDate < today`), so one SQL predicate covers both cases: every active pending row whose `dueDate` is before the start of next month. Prior-period pending rows render as missed; current-month ones render as upcoming.

```sql
SELECT * FROM UpcomingPaymentInstances i
JOIN UpcomingPayments p ON p.id = i.upcomingPaymentId
WHERE p.isActive = 1
  AND i.status = 'pending'
  AND i.dueDate < :startOfNextMonth
ORDER BY dueDate ASC
```

**Why this shape**: missed instances are each actionable on their own (user must pay each late bill). Showing the entire current month gives the user a clear picture of what's due before the month ends, while keeping future months out of view. Chronological order naturally places prior-period (missed) rows at the top.

---

## Notifications

- **Package**: `expo-notifications` — not yet installed. Add to [package.json](package.json), add plugin to [app.json](app.json). Expo SDK 55 supports local scheduling without any push server.
- **Android permission**: `POST_NOTIFICATIONS` (Android 13+) handled automatically by the plugin.
- **Android channel**: create one "upcoming-payments" channel on first permission grant.
- **Permission prompt**: ask on first upcoming-payment creation (not on app launch — don't front-load permissions).
- **Scheduling**: on Instance materialization, schedule up to 3 local notifications (N-days-before, day-of, and the "missed" one for the day after). Store the returned IDs as JSON in `Instances.notificationIds`.
- **Cancelling**: on pay-complete / instance edit / instance delete, cancel by stored IDs and reschedule if needed.
- **Top-up**: when the last materialized Instance flips to paid/missed, materialize the next period and schedule its notifications — keeps a ~3-period runway at all times.
- **iOS killed-app caveat**: local notifications still fire when scheduled in advance (the OS holds them). Safe.
- **Missed-payment belt-and-braces**: app-launch "mark overdue" sweep — covers the edge case where a notification was dismissed without action.

No `expo-task-manager` or `expo-background-fetch` needed for v1.

---

## Files — current state

### Done (actual paths)

| Path | Notes |
|---|---|
| [db/schema.ts](db/schema.ts) | 3 tables + relations + composite unique index |
| [app/services/upcomingPaymentQueries.ts](app/services/upcomingPaymentQueries.ts) | CRUD + cancel/restore-instance + section query |
| [app/queries/upcomingPayments.ts](app/queries/upcomingPayments.ts) | React Query hooks + invalidation helper |
| [app/features/upcomingPayments/ui/UpcomingPaymentsSection.tsx](app/features/upcomingPayments/ui/UpcomingPaymentsSection.tsx) | Dashboard section (note: under `features/upcomingPayments/`, not `features/balance/`) |
| [app/features/upcomingPayments/ui/UpcomingPaymentRow.tsx](app/features/upcomingPayments/ui/UpcomingPaymentRow.tsx) | Row (Pay handler is a TODO stub) |
| [app/features/upcomingPayments/ui/UpcomingPaymentCard.tsx](app/features/upcomingPayments/ui/UpcomingPaymentCard.tsx) | Card variant |
| [app/features/upcomingPayments/ui/UpcomingPaymentDetails.tsx](app/features/upcomingPayments/ui/UpcomingPaymentDetails.tsx) | Detail screen (Pay handlers are TODO stubs) |
| [app/features/upcomingPayments/ui/details/HistoryRow.tsx](app/features/upcomingPayments/ui/details/HistoryRow.tsx) | History row |
| [app/features/upcomingPayments/ui/UpcomingPaymentsSettings.tsx](app/features/upcomingPayments/ui/UpcomingPaymentsSettings.tsx) | Settings management list (replaces the planned `UpcomingPaymentsListScreen`) |
| [app/features/upcomingPayments/ui/UpcomingPaymentForm/UpcomingPaymentForm.tsx](app/features/upcomingPayments/ui/UpcomingPaymentForm/UpcomingPaymentForm.tsx) | **Separate form**, not a ModeToggle on TransactionForm |
| [app/features/upcomingPayments/ui/UpcomingPaymentForm/fields/RepetitionPicker.tsx](app/features/upcomingPayments/ui/UpcomingPaymentForm/fields/RepetitionPicker.tsx) | |
| [app/features/upcomingPayments/ui/UpcomingPaymentForm/fields/EndDatePicker.tsx](app/features/upcomingPayments/ui/UpcomingPaymentForm/fields/EndDatePicker.tsx) | |
| [app/features/upcomingPayments/ui/UpcomingPaymentForm/fields/NotificationSettings.tsx](app/features/upcomingPayments/ui/UpcomingPaymentForm/fields/NotificationSettings.tsx) | Form captures columns — nothing reads them yet |
| [app/features/upcomingPayments/ui/UpcomingPaymentForm/fields/VariableAmountToggle.tsx](app/features/upcomingPayments/ui/UpcomingPaymentForm/fields/VariableAmountToggle.tsx) | |
| [app/features/upcomingPayments/ui/UpcomingPaymentForm/LockedInfoBox.tsx](app/features/upcomingPayments/ui/UpcomingPaymentForm/LockedInfoBox.tsx) | |
| [app/features/upcomingPayments/modules/upcomingPaymentFormValidation.ts](app/features/upcomingPayments/modules/upcomingPaymentFormValidation.ts) | |
| [app/features/upcomingPayments/modules/upcomingPaymentStatus.ts](app/features/upcomingPayments/modules/upcomingPaymentStatus.ts) | Derives missed at read time |
| [app/features/upcomingPayments/modules/deriveEditInitialValues.ts](app/features/upcomingPayments/modules/deriveEditInitialValues.ts) | |
| [app/features/upcomingPayments/modules/types.ts](app/features/upcomingPayments/modules/types.ts) | |
| [app/context/DashboardOptions/dashboardSettingStorage.ts](app/context/DashboardOptions/dashboardSettingStorage.ts) | `showUpcomingPayments` added |
| [app/navigation/routes.ts](app/navigation/routes.ts) | Routes: `UpcomingPayment`, `UpcomingPaymentDetails`, `UpcomingPaymentsSettings` |

### Still to add

| Path | Purpose |
|---|---|
| `app/modules/upcomingPayments/upcomingPaymentRecurrence.ts` | Pure `getNextDueDate(rule, afterDate)` — switches on `recurrence` and returns the next ISO due date via date-fns. ~15 lines. |
| `app/modules/notifications/` | `expo-notifications` wrapper: `requestPermission`, `scheduleForInstance`, `cancelForInstance`, `setupChannel` |
| `app/features/upcomingPayments/ui/PaySheet.tsx` | Bottom sheet: Pay / Pay partial / Enter & Pay + wallet picker + currency-mismatch banner |
| `app/components/ProgressBar/index.tsx` | Themed progress bar for fixed-amount partial payments |

### Still to modify

| Path | Change |
|---|---|
| [package.json](package.json) | Add `expo-notifications` via `yarn` |
| [app.json](app.json) | Add `expo-notifications` plugin entry |
| [app/services/upcomingPaymentQueries.ts](app/services/upcomingPaymentQueries.ts) | Add `materializeInstance`, `addContribution`, `markInstanceStatus`, `runOverdueMaterialization`. `getUpcomingInstancesForSection` already returns active pending rows with `dueDate < startOfNextMonth`, ordered chronologically. |
| [app/services/upcomingPaymentQueries.ts:20](app/services/upcomingPaymentQueries.ts#L20) | On create, materialize ~3 periods of runway instead of only `firstDueDate` |
| [app/queries/upcomingPayments.ts](app/queries/upcomingPayments.ts) | Add pay-flow mutations; invalidate `transactions` + `wallets` keys |
| [App.tsx](App.tsx) | Setup notification channel + overdue sweep on mount |

## Components to reuse (avoid rewriting)

- **[TransactionRow](app/components/TransactionRow/index.tsx)** pattern (not the component itself) — icon / content / amount layout.
- **[ShadowBoxView](app/components/ShadowBoxView/index.tsx)** — dashboard section wrapper.
- **[CategoryIcon](app/components/CategoryIcon/index.tsx)** — the icon bubble.
- **[CurrencySheet](app/components/ActionSheet/CurrencySheet/index.tsx)** — reuse for the currency picker on the upcoming-payment form; the PaySheet uses WalletPicker at pay time.
- **[DatePickerInput](app/features/balance/ui/TransactionForm)** — for `firstDueDate` and `endDate`.
- **[useThemedStyles](app/theme/useThemedStyles.ts)** — for all styles, including late=red (`theme.colors.redDark`) and progress fill (`theme.colors.primary`).
- **date-fns** — already installed, use `addDays/addWeeks/addMonths/addYears` for virtual generation.

---

## Implementation order

Each phase is independently useful and testable. Stop, try it, move on.

### Phase 1 — DB + types ✅ DONE

### Phase 2 — Pure logic + service layer ⚠️ PARTIAL
**Done**: service functions (add / update / soft-delete / cancel-instance / restore-instance / list / by-id / instances-with-contributions / section); React Query hooks with invalidation.
**Remaining**:
- `app/modules/upcomingPayments/upcomingPaymentRecurrence.ts` — pure `getNextDueDate(rule, afterDate)`. Used by pay-flow top-up, overdue sweep, and detail-screen "Next due" header.
- Services: `materializeInstance(upcomingPaymentId, dueDate)`, `addContribution`, `markInstanceStatus`, `runOverdueMaterialization`. The overdue sweep walks `getNextDueDate` from the last materialized instance until it passes today, inserting each past period as `status=pending` (UI handles the missed presentation).
- ~~Fix `getUpcomingInstancesForSection`~~ **Done** — query returns active pending rows with `dueDate < startOfNextMonth`, ordered by `dueDate ASC`.
- Ensure pay-related mutations invalidate `transactions` + `wallets` keys when added.

### Phase 3 — Read-only dashboard section ✅ DONE
Built: `UpcomingPaymentRow`, `UpcomingPaymentsSection`, dashboard flag wiring, corrected section query (pending with `dueDate < startOfNextMonth`, chronological — missed derived on the frontend via `isInstanceMissed`).

### Phase 4 — Form (add flow) ✅ DONE (via separate form)
Delivered as a standalone [UpcomingPaymentForm](app/features/upcomingPayments/ui/UpcomingPaymentForm/UpcomingPaymentForm.tsx) with its own validation, not as a `ModeToggle` on `TransactionForm`. Fields built: RepetitionPicker, EndDatePicker, NotificationSettings, VariableAmountToggle, LockedInfoBox.
**Gap**: first-insert only materializes one Instance; should materialize ~3 once `materializeInstance` exists.

### Phase 5 — Pay now / Pay partial / Enter & Pay ❌ NOT STARTED (ship blocker)
1. Build `PaySheet` (handles pay-full, pay-partial, enter-amount in one place) + wallet picker + currency-mismatch banner.
2. Service: `addContribution` creates Transaction + Contribution atomically; if Instance reaches 100% (or any contribution for variable), flip to `paid`, cancel notifications, materialize next period.
3. Wire the Pay button on `UpcomingPaymentRow` ([line 34](app/features/upcomingPayments/ui/UpcomingPaymentRow.tsx#L34)) and the detail screen actions ([UpcomingPaymentDetails.tsx:99](app/features/upcomingPayments/ui/UpcomingPaymentDetails.tsx#L99), [:103](app/features/upcomingPayments/ui/UpcomingPaymentDetails.tsx#L103)).
4. Build `ProgressBar` for the detail screen partial-payment display.
5. Verify: wallet balance updates, transaction appears in history, dashboard row stays (partial) or is replaced (fully paid).

### Phase 6 — Notifications ❌ NOT STARTED
1. Add `expo-notifications` to [package.json](package.json) via `yarn` + plugin entry in [app.json](app.json) + prebuild.
2. Write `app/modules/notifications/` wrapper: `requestPermission`, `scheduleForInstance`, `cancelForInstance`, `setupChannel`.
3. Ask permission on first upcoming-payment creation (not at app launch).
4. Schedule on Instance materialization; cancel on pay-complete / edit / delete.
5. Launch-time overdue sweep in [App.tsx](App.tsx) — materializes past-due virtual periods as `pending` (the UI derives missed via `isInstanceMissed`). No status flip on already-materialized rows — they stay `pending` until paid or canceled.
6. Read the existing `notifyDaysBefore` / `notifyOnDueDay` / `notifyOnMissed` columns (they're already captured by the form).

### Phase 7 — Detail + List + settings ✅ DONE
`UpcomingPaymentDetails` (rule header + history + edit/delete), `UpcomingPaymentsSettings` (management list), `showUpcomingPayments` toggle — all shipped.
**Nice-to-have remaining**: global notification-enable toggle in settings (belongs with Phase 6).

---

## Things to think about / potential pitfalls

- **iOS killed-app nuance**: pre-scheduled notifications still fire. Dynamic scheduling from a killed state does not. Design sticks to pre-scheduling — safe.
- **Timezone**: all dates should be stored as ISO in local timezone (matching existing convention in [db/schema.ts](db/schema.ts)). `scheduleNotificationAsync` accepts a Date — pass a local-time Date from the ISO string.
- **Amount edits on a recurring upcoming payment**: apply to future periods only. Past Instances keep their snapshotted `expectedAmount`. Newly-materialized instances pick up the new amount. Virtual (not-yet-materialized) future periods inherit whatever `amount` the parent UpcomingPayment has at materialization time.
- **Variable-amount bills** (e.g. electricity):
  - Schema: `amount` NULL on the UpcomingPayment. Materialized Instances have `expectedAmount` NULL too.
  - Form UX: "Amount varies each period" checkbox hides the amount input and shows a "Variable amount" badge.
  - Dashboard row: shows `Variable` where the amount would be; no progress bar. Button copy: **"Enter & Pay"**.
  - Pay: amount input required in the sheet; entered amount becomes both Transaction and Contribution amount; Instance flips to `paid` in one shot (no partials for variable in v1).
  - History: past Instances show their actual paid amount from Contributions, not the null expectedAmount.
- **End date semantics**: `endDate` is the last valid due date. `instanceGenerator` stops emitting once `dueDate > endDate`. An upcoming payment with all periods past its end date shows no next-due; the row can be auto-archived or hidden (Phase 7 decision).
- **Delete upcoming payment**: CASCADE drops Instances + Contributions, but real Transactions remain (correct — user already paid that money).
- **Pay across rollover**: because Instances are keyed by `(upcomingPaymentId, dueDate)`, a $500 partial toward Jan + another $500 paid in Feb can both attach to the Jan instance unambiguously. User explicitly picks which period they're paying via the sheet.
- **Missed + next coexisting**: if the upcoming payment has missed Instances AND a future period, the row shows the future period as "Next due" and a chip/badge like `⚠ 1 missed`. Tap the badge → sheet opens targeting the earliest missed instance.
- **Notification permission denied**: feature still works — just no notifications. Show a one-line hint in settings.
- **Custom repetition validation**: `customIntervalValue > 0`, `customIntervalUnit` required — Yup `.when('recurrence', ...)`.
- **Empty state**: dashboard section hides itself when there are zero active upcoming payments (don't show an empty card).
- **Race-safe materialization**: `materializeInstance` must handle "already exists" gracefully (the composite unique index prevents duplicates; service function does `INSERT ... ON CONFLICT DO NOTHING` or a pre-check).
- **Wallet vs. currency split**: the UpcomingPayment owns `currencyCode`/`currencySymbol`, never `walletId`. Every Contribution's Transaction owns its own wallet — so a single Instance can be paid across multiple wallets naturally. The PaySheet picks any wallet, defaulting to the currently-selected one, and renders a warning banner when `selectedWallet.currencyCode !== upcomingPayment.currencyCode` (e.g. *"Bill is in USD; wallet is EUR. Enter the amount in USD — conversion isn't handled yet."*). No FX math in v1; the user types the bill-denominated number and the wallet is debited by that number.

## Things deliberately NOT in v1

- Recurring transfers between wallets (can add once the transaction version works).
- Sharing / exporting upcoming payments.
- Per-category notification preferences.
- Smart "you usually pay this on the 3rd" predictions.
- iCal / Google Calendar sync.
- Push notifications (app stays local-first).
- Loan-style "X payments remaining" semantics (can add `endCount` later if users ask).
- Month-only / year-wide calendar views — dashboard is scoped to current month + prior-month missed.

---

## Verification

End-to-end check list (manual — no test runner configured):

1. `yarn db:generate` produces a clean migration file.
2. App launches, `useMigrations` succeeds ([App.tsx:23](App.tsx#L23)), Drizzle Studio shows the 3 new tables.
3. Tap "+" → toggle to "Upcoming" → create a monthly $1000 "Rent" starting tomorrow, no end date. Row appears on dashboard showing "Next: [tomorrow] · Monthly · no end date · $1000".
4. Drizzle Studio: 1 UpcomingPayment row, ~3 pending Instance rows (materialized for notifications).
5. Tap Pay → sheet opens → enter $400 as partial → wallet balance drops by $400, a Transaction appears in recent transactions, Contribution row exists, Instance status still `pending`.
6. Tap Pay again → $600 → Instance flips to `paid`, its notifications are canceled, dashboard row now shows next month's due date.
7. Create a variable-amount "Electricity" upcoming payment — dashboard shows "Variable" + "Enter & Pay". Tap → sheet requires amount input → submit $180 → Instance flips to `paid` in one step.
8. Create a monthly upcoming payment with an end date 3 months out. After 4 periods elapse, it has no next-due and disappears from the dashboard (or shows as archived per Phase 7).
9. Create an upcoming payment dated yesterday → app-launch sweep materializes it as `pending`, `isInstanceMissed` flags it, row shows the warning badge.
10. Force-quit the app, wait past a scheduled notification time → notification fires.
11. Toggle `showUpcomingPayments` off in DashboardSettings → section disappears.
12. Tap a row → detail screen shows the rule + history of past Instances with their Transactions. Delete the upcoming payment → Instances + Contributions gone, but the real Transactions from steps 5/6 still exist in history and wallet balance is unchanged.
