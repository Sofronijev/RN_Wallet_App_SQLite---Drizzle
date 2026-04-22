# Upcoming Payments / Bill Reminders

## Context

SpendyFly currently tracks past transactions but has no concept of "money I owe in the future." The user wants to be reminded of upcoming bills, see their recurring payments on the dashboard at a glance, mark partial payments against them, and get local notifications before/on the due date (and when a payment is missed). The feature must stay local-first (no server) and reuse the existing `TransactionForm` so the add flow stays one button.

Intended outcome:
- Dashboard shows up to **3 individual Instance rows** — missed ones first (oldest → newest), then the earliest unpaid upcoming instance per UpcomingPayment. No future-period clutter.
- A **"Show all" button on the dashboard** opens a full list of the same set (all missed + next-per-payment instances), no 3-row cap. Still no future scrolling — only actionable instances.
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
- It was missed (overdue sweep created the row)
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
| Dashboard model | Individual Instance rows. Shows **all missed** (oldest → newest) + **earliest unpaid upcoming per payment**, sorted chronologically, capped at 3. "Show all" button on the dashboard opens the full same set of Instances without the cap. |
| Settings entry | A separate "All scheduled payments" row in Settings opens a list of **UpcomingPayments** (recurring templates) for management — distinct from the dashboard's instance-focused "Show all". |
| Detail screen | Tap any Instance row (dashboard or Show-all) or any row in the Settings list → Upcoming Payment detail screen (rule header + next due + history list + edit/pause/archive/delete actions). |
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
UpcomingPaymentsSection  (≤3 Instance rows: all missed + earliest pending per UpcomingPayment, chronological)
  │
  ├─ row shows: upcomingPayment.name, instance.dueDate, amount (or "Variable"), late/missed badge
  ├─ tap row (anywhere except Pay button) → detail screen
  ├─ action: [Pay] / [Enter & Pay]
  │           │
  │           ▼
  │     Creates Transaction (normal balance flow)
  │     + Contribution row linking Transaction → Instance
  │     + If instance reaches 100%, mark paid & cancel its notifications
  │     + Materialize next period so the pipeline stays full
  │
  └─ [Show all] button → UpcomingPaymentsAllScreen (same Instance query, no limit)

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
| `status` | text enum | `pending` \| `paid` \| `missed` \| `canceled` |
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
3. **On overdue sweep (app launch)** — for each active upcoming payment, compute virtual due dates that are in the past. Any that don't have a matching Instance row get materialized as `status=missed`, and the missed notification fires.

Everything else remains virtual. A period that is 2 years out and has never been paid, missed, or had notifications scheduled against it will have no row.

### Dashboard query

```sql
-- All missed instances, across all active upcoming payments
SELECT * FROM UpcomingPaymentInstances i
JOIN UpcomingPayments p ON p.id = i.upcomingPaymentId
WHERE p.isActive = 1 AND i.status = 'missed'

UNION ALL

-- Earliest pending instance per active upcoming payment
SELECT * FROM UpcomingPaymentInstances i
JOIN UpcomingPayments p ON p.id = i.upcomingPaymentId
WHERE p.isActive = 1
  AND i.status = 'pending'
  AND i.id = (
    SELECT MIN(id) FROM UpcomingPaymentInstances
    WHERE upcomingPaymentId = p.id AND status = 'pending'
  )

ORDER BY dueDate ASC
LIMIT 3   -- omit LIMIT for the "Show all" screen
```

**Why this shape**: missed instances are each actionable on their own (user must pay each late bill). But pending instances beyond "the next one" are just notification placeholders — no reason to clutter the dashboard with Feb, Mar, Apr rent when Feb is what the user needs to look at.

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

## Files to add

| Path | Purpose |
|---|---|
| [db/schema.ts](db/schema.ts) | Add 3 new tables + relations (modification) |
| `drizzle/NNNN_upcoming_payments.sql` | Auto-generated via `yarn db:generate` |
| `app/services/upcomingPaymentQueries.ts` | DB service functions (mirrors [app/services/transactionQueries.ts](app/services/transactionQueries.ts)) |
| `app/queries/upcomingPayments.ts` | React Query hooks (mirrors [app/queries/transactions.ts](app/queries/transactions.ts)) |
| `app/modules/notifications/` | Thin wrapper around expo-notifications: `requestPermission`, `scheduleForInstance`, `cancelForInstance`, `setupChannel` |
| `app/modules/upcomingPayments/instanceGenerator.ts` | Pure fn: given an UpcomingPayment + date range, return virtual dueDate ISO strings. Uses date-fns. |
| `app/modules/upcomingPayments/upcomingPaymentMath.ts` | Helpers: `getNextDueDate`, `mergeVirtualAndReal` (for detail/history view). Pure, unit-testable. |
| `app/features/balance/ui/BalanceTab/UpcomingPaymentsSection.tsx` | Dashboard section — up to 3 Instance rows + "Show all" button |
| `app/features/balance/ui/BalanceTab/UpcomingPaymentRow.tsx` | Row: icon, upcoming payment name, instance dueDate, amount (or "Variable"), late/missed badge, Pay button. Tapping row (outside the button) navigates to the detail screen. |
| `app/features/balance/ui/UpcomingPayments/UpcomingPaymentsAllScreen.tsx` | Full list of **Instances** — same query as dashboard (all missed + next-per-payment) with no limit. Entry: "Show all" button on dashboard. |
| `app/features/balance/ui/UpcomingPayments/UpcomingPaymentsListScreen.tsx` | Flat list of all **UpcomingPayments** (active + archived) for management. Entry: Settings row "All scheduled payments". |
| `app/components/ProgressBar/index.tsx` | Simple themed bar (for the detail screen, when a fixed-amount instance has partial payments) |
| `app/features/balance/ui/TransactionForm/fields/RepetitionPicker.tsx` | Sheet picker: None / Daily / Weekly / Monthly / Yearly / Custom |
| `app/features/balance/ui/TransactionForm/fields/EndDatePicker.tsx` | Radio: "No end date" / "Ends on [date]". Shown when mode=upcoming and recurrence≠none. |
| `app/features/balance/ui/TransactionForm/fields/NotificationSettings.tsx` | Inline sub-form: daysBefore / notifyOnDue / notifyOnMissed |
| `app/features/balance/ui/TransactionForm/fields/ModeToggle.tsx` | Top-of-form "Regular / Upcoming" segmented control |
| `app/features/balance/ui/TransactionForm/fields/VariableAmountToggle.tsx` | Checkbox: "Amount varies each period" + helper text. Hides amount input when on. |
| `app/features/balance/ui/UpcomingPayments/UpcomingPaymentDetailScreen.tsx` | Tap an upcoming payment → header (rule + next due) + history list (past instances) + actions (edit, pause, archive, delete) |
| `app/features/balance/ui/UpcomingPayments/PaySheet.tsx` | Bottom sheet for Pay / Pay partial / Enter & Pay. Handles the 3 flavors in one place. Includes a wallet picker (defaults to currently selected wallet) and a currency-mismatch warning banner when the picked wallet's currency differs from the bill's `currencyCode`. |

## Files to modify

| Path | Change |
|---|---|
| [package.json](package.json) | Add `expo-notifications` (use `yarn`, not npm) |
| [app.json](app.json) | Add `expo-notifications` plugin entry |
| [app/features/balance/ui/TransactionForm/TransactionForm.tsx](app/features/balance/ui/TransactionForm/TransactionForm.tsx) | Add ModeToggle at top; when mode=upcoming, show name/recurrence/endDate/variable-toggle/notification fields; submit handler branches between `addTransactionMutation` and a new `addUpcomingPaymentMutation` |
| [app/features/balance/modules/transactionFormValidation.ts](app/features/balance/modules/transactionFormValidation.ts) | Extend `TransactionFromInputs` with upcoming-only fields; use Yup `.when('mode', ...)` for conditional validation (amount required unless `isVariableAmount=1`, custom interval fields required when recurrence=custom, endDate > firstDueDate) |
| [app/features/balance/ui/BalanceTab/BalanceScreen.tsx](app/features/balance/ui/BalanceTab/BalanceScreen.tsx) | Conditionally render `<UpcomingPaymentsSection />` gated by `dashboardOptions.showUpcomingPayments` |
| [app/context/DashboardOptions/dashboardSettingStorage.ts](app/context/DashboardOptions/dashboardSettingStorage.ts) | Add `showUpcomingPayments: boolean` (default `true`) to type + defaults |
| [app/features/settings/.../DashboardSettings.tsx](app/features/settings) | Add toggle row for the new option |
| [app/navigation/routes.ts](app/navigation/routes.ts) | Add `UpcomingPaymentDetail: { upcomingPaymentId: number }`, `UpcomingPaymentsAll: undefined`, `UpcomingPaymentsList: undefined` routes |
| [app/navigation/AppNavigator.tsx](app/navigation/AppNavigator.tsx) | Register all three new screens |
| [app/features/settings/.../SettingsScreen.tsx](app/features/settings) | Add a row: "All scheduled payments" → navigates to `UpcomingPaymentsListScreen` |
| [app/queries/index.ts](app/queries/index.ts) | Add query keys: `upcomingPayments`, `upcomingInstances`, `upcomingContributions` |
| [App.tsx](App.tsx) | On mount: setup notification channel + run "mark overdue instances" sweep |

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

### Phase 1 — DB + types (no UI yet)
1. Add the 3 tables to [db/schema.ts](db/schema.ts), including composite unique index on `(upcomingPaymentId, dueDate)`.
2. Add Drizzle relations.
3. `yarn db:generate` → verify generated SQL in `drizzle/`.
4. Export inferred types (`NewUpcomingPayment`, `Instance`, etc.) from [db/index.ts](db/index.ts).
5. Launch app → confirm migration runs cleanly ([App.tsx:23](App.tsx#L23)).

### Phase 2 — Pure logic + service layer
1. Write `instanceGenerator(upcomingPayment, from, to)` — pure, returns ISO date strings. Unit-testable.
2. Write `upcomingPaymentMath`: `getNextDueDate`, `getMissedCount`, `mergeVirtualAndReal`. Pure.
3. Write service functions in `app/services/upcomingPaymentQueries.ts`: `addUpcomingPayment`, `materializeInstance(upcomingPaymentId, dueDate)`, `getActiveUpcomingPayments`, `getUpcomingPaymentHistory`, `addContribution`, `markInstanceStatus`, `markOverdueSweep`.
4. Write query hooks in `app/queries/upcomingPayments.ts` following the [transactions.ts](app/queries/transactions.ts) pattern (invalidate the new keys + `transactions` + `wallets` on anything that creates a real Transaction).

### Phase 3 — Read-only dashboard section
1. Build `UpcomingPaymentRow` (no actions yet — just display). Row is per-Instance; it joins to its parent UpcomingPayment for name/icon/amount-or-Variable.
2. Build `UpcomingPaymentsSection` — runs the dashboard query (all missed + earliest pending per upcoming payment, chronological, LIMIT 3). Empty state if none.
3. Wire into [BalanceScreen](app/features/balance/ui/BalanceTab/BalanceScreen.tsx) behind a feature flag.
4. Build `UpcomingPaymentsAllScreen` — same Instance query, no limit. Wire it to the "Show all" button on the dashboard.
5. Manually seed an upcoming payment + instances via Drizzle Studio to verify rendering (one missed, one pending — confirm order).

### Phase 4 — Form extension (add flow)
1. `ModeToggle` at the top of [TransactionForm](app/features/balance/ui/TransactionForm/TransactionForm.tsx).
2. `RepetitionPicker`.
3. `EndDatePicker` (hidden when recurrence=none).
4. `NotificationSettings` (inline, not a separate screen).
5. `VariableAmountToggle` — when checked, hide amount input and submit with `amount=NULL`.
6. Extend validation schema conditionally.
7. Submit handler branch: mode=upcoming → `addUpcomingPayment` + materialize first ~3 instances (with NULL `expectedAmount` when the parent's `amount` is NULL).

### Phase 5 — Pay now / Pay partial / Enter & Pay
1. Build `PaySheet` that handles all three flavors (pay-full, pay-partial, enter-amount). The sheet always targets a specific Instance.
2. Pay button on an Instance row opens the sheet. The sheet:
   - Creates a Transaction + Contribution against that Instance.
   - If the Instance reaches 100% (fixed amount) or any Contribution exists (variable), flips status to `paid`, cancels its notifications, and materializes the next period (so the pipeline stays full).
3. Tapping the row outside the button → navigates to detail screen (not the sheet).
4. Verify: wallet balance updates, transaction appears in history, dashboard row either stays (partial) or is replaced by the next instance (fully paid).

### Phase 6 — Notifications
1. Add `expo-notifications` → [package.json](package.json), [app.json](app.json), `yarn` + prebuild.
2. Write `app/modules/notifications/` wrapper.
3. Ask permission on first upcoming payment creation.
4. Schedule on Instance materialization; cancel on pay-complete / edit / delete.
5. Launch-time "mark overdue" sweep (materializes past-due virtual periods as `missed`).

### Phase 7 — Detail + List + settings
1. `UpcomingPaymentDetailScreen` — header (name, rule, next due) + history list (paid + missed instances with their Contributions/Transactions) + actions (edit, pause/resume, archive, delete).
2. `UpcomingPaymentsListScreen` — flat list of all UpcomingPayments (active + archived sections). Wire the Settings "All scheduled payments" row to it.
3. Add `showUpcomingPayments` to [dashboardSettingStorage](app/context/DashboardOptions/dashboardSettingStorage.ts) + toggle in DashboardSettings.
4. Global notification-enable toggle in settings (respected by the schedule helper).

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
- Year-wide calendar view (year overview gets virtual generation — add a screen for it in v2).

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
9. Create an upcoming payment dated yesterday → app-launch sweep materializes it as `missed`, row shows the warning badge.
10. Force-quit the app, wait past a scheduled notification time → notification fires.
11. Toggle `showUpcomingPayments` off in DashboardSettings → section disappears.
12. Tap a row → detail screen shows the rule + history of past Instances with their Transactions. Delete the upcoming payment → Instances + Contributions gone, but the real Transactions from steps 5/6 still exist in history and wallet balance is unchanged.
