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
- Recurrence helper [getNextDueDate](app/modules/upcomingPayments/upcomingPaymentRecurrence.ts) + services `ensureNextInstance` / `catchUpUpcomingPaymentInstances` in [upcomingPaymentQueries.ts](app/services/upcomingPaymentQueries.ts). Cancel mutation auto-tops up the next instance. App-launch sweep wired in [App.tsx](App.tsx).
- Stale-payment handling (Phase 5.5): schema column `staleSince`, `BACKFILL_LIMIT = 3` cap in the sweep, `clearStaleFlag` service + `useClearStaleFlagMutation`, [StalePaymentBanner](app/features/upcomingPayments/ui/StalePaymentBanner.tsx) on dashboard, stale chip + "Still using this?" card on [UpcomingPaymentDetails](app/features/upcomingPayments/ui/UpcomingPaymentDetails.tsx), stale badge on [UpcomingPaymentCard](app/features/upcomingPayments/ui/UpcomingPaymentCard.tsx) (used by settings list).

### Remaining
1. **Pay flow (Phase 5)** — blocker for shipping. No `PaySheet`, no `addContribution` / `markInstanceStatus` service fns, no transaction creation on pay. `openPaySheet` handlers are TODO stubs in [UpcomingPaymentRow.tsx:34](app/features/upcomingPayments/ui/UpcomingPaymentRow.tsx#L34) and [UpcomingPaymentDetails.tsx:99](app/features/upcomingPayments/ui/UpcomingPaymentDetails.tsx#L99). Pay-complete must also call `ensureNextInstance` + `clearStaleFlag` if the parent is stale.
2. **`UpcomingPaymentsAllScreen`** — the dashboard "Show all" target (uncapped version of the section query) is not built.
3. **Notifications (Phase 6)** — entirely missing: `expo-notifications` not in [package.json](package.json) / [app.json](app.json), no `app/modules/notifications/` wrapper, no scheduling, no cancel-on-pay, no permission prompt. The `notifyDaysBefore` / `notifyOnDueDay` / `notifyOnMissed` columns are captured in the form but nothing reads them.
4. **`ProgressBar`** — not built; needed for partial-payment progress on the detail screen.
5. **`App.tsx` bootstrap** — overdue sweep is wired ([App.tsx:37](App.tsx#L37)); notification channel setup still missing.

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
| `staleSince` | text (ISO) nullable | set by the sweep when a payment falls more than `BACKFILL_LIMIT` periods behind. NULL = not stale. Cleared on user confirmation or on pay. See [Stale-payment handling](#stale-payment-handling). |
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

1. **On upcoming payment creation** — materialize only the first period (`firstDueDate`) as `status=pending`. No runway, no pre-seeding. Notifications for that single instance are scheduled at creation time.
2. **On pay (full) / cancel** — when the current Instance flips to `paid` or `canceled`, materialize the *next* period so there's always exactly one pending future instance. Partial pays don't trigger this (instance stays `pending`).
3. **On overdue sweep (app launch)** — for each active upcoming payment, walk forward from the latest materialized instance using `getNextDueDate` until the next date is in the future. Any past periods get materialized as `status=pending` (UI derives "missed" from the past `dueDate`). The sweep always ends with exactly one future pending instance.

**One-instance-ahead rule**: we deliberately keep only a single pending instance in flight per upcoming payment. If the user doesn't open the app for months, the overdue sweep collapses the backlog into a handful of missed rows on next launch — we don't want a stale pipeline of pre-scheduled notifications firing while the app hasn't been opened.

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

## Stale-payment handling

### Why
Without a cap, `catchUpUpcomingPaymentInstances` would materialize every missed period since the user last opened the app. A user who's been away 8 months on a monthly bill would see 8 missed rows for one bill — dashboard clutter, notification spam, and in practice most of those bills have been silently canceled (the user stopped using Netflix, closed the gym membership, etc.). We want to cap the sweep and ask the user instead of dumping rows.

### Behavior
- Backfill is capped per payment at `BACKFILL_LIMIT = 3` missed periods (flat across cadences in v1; revisit per-recurrence if it feels off for daily/weekly).
- If the sweep would need to materialize more than `BACKFILL_LIMIT` missed rows to catch up, it materializes only the first `BACKFILL_LIMIT` and sets `staleSince = now` on the parent payment.
- Dashboard row surfaces stale payments via a red **"Needs review"** badge on each missed instance (replaces the "Missed" badge when `staleSince` is set). Tapping the row opens the detail screen.
- The detail screen shows the stale chip in the header + a red-accented **"Still using this?"** card with two actions:
  - **"Still using it"** → fills every missing period from the latest existing instance through the next future boundary, then clears `staleSince`. The user sees every missed row on the dashboard and decides per-row (pay or cancel). No gaps, no silent data loss. Bounded by `MAX_OCCURRENCES` as a safety cap.
  - **"Archive"** → `isActive = false`.
- Paying any instance of a stale payment auto-clears `staleSince` and fills the gap (implicit "still using it"). *(Deferred to Phase 5 pay-flow wiring.)*
- Settings list shows the same stale badge on each row.

### Sweep short-circuit
Once a payment is stale, the app-launch sweep skips it entirely (`if (payment.staleSince != null) continue`). Without this, every relaunch would materialize another `BACKFILL_LIMIT` past instances, trapping the user in a cycle. The flag must be explicitly resolved before the sweep touches the payment again.

### Service changes
- `catchUpUpcomingPaymentInstances`: skip payments with `staleSince != null` (short-circuit). For non-stale payments, loop bounded by `BACKFILL_LIMIT`. If the cap trips (loop exits while `currentLatest < todayIso`), set `staleSince = now` on the payment.
- `clearStaleFlag(upcomingPaymentId)`: loops `ensureNextInstance` until the latest dueDate crosses today (bounded by `MAX_OCCURRENCES`), then nulls `staleSince`. Called by "Still using it" action.
- `addContribution` (future, Phase 5): should call `clearStaleFlag` as a side effect when paying any instance of a stale payment (same full-backfill semantics).

### Decisions
| Question | Answer |
|---|---|
| Cap value | Flat `BACKFILL_LIMIT = 3`. Simple; can split per cadence in v2 if users complain. |
| What "Still using it" does | Generates every missing period from the latest existing instance through the next future boundary, then clears the flag. User decides per-row (pay or cancel). No gaps. |
| Why not just clear the flag? | Clearing only traps the user in a cycle: next launch sees non-stale payment with latest still far in the past → sweep adds 3 more missed → re-flags stale. Full backfill breaks the cycle. |
| Stale state visibility | Dashboard row "Needs review" badge + detail header chip + settings badge. Stale payments stay on the dashboard (no separate banner). |
| Clearing triggers | User confirm ("Still using it"), user archive (`isActive=false`), or paying any instance. |

---

## Notifications

- **Package**: `expo-notifications` — not yet installed. Add to [package.json](package.json), add plugin to [app.json](app.json). Expo SDK 55 supports local scheduling without any push server.
- **Android permission**: `POST_NOTIFICATIONS` (Android 13+) handled automatically by the plugin.
- **Android channel**: create one "upcoming-payments" channel on first permission grant.
- **Permission prompt**: ask on first upcoming-payment creation (not on app launch — don't front-load permissions).
- **Scheduling**: on Instance materialization, schedule up to 3 local notifications for that single instance (N-days-before, day-of, and the "missed" one for the day after). Store the returned IDs as JSON in `Instances.notificationIds`.
- **Cancelling**: on pay-complete / instance edit / instance delete, cancel by stored IDs and reschedule if needed.
- **Top-up**: when the current Instance flips to paid/canceled, materialize the next single period and schedule its notifications. Only ever one pending future instance per upcoming payment — if the user doesn't open the app for a long time, we don't want stale notifications firing for periods they haven't seen yet.
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
| `app/modules/notifications/` | `expo-notifications` wrapper: `requestPermission`, `scheduleForInstance`, `cancelForInstance`, `setupChannel` |
| `app/features/upcomingPayments/ui/PaySheet.tsx` | Bottom sheet: Pay / Pay partial / Enter & Pay + wallet picker + currency-mismatch banner |
| `app/components/ProgressBar/index.tsx` | Themed progress bar for fixed-amount partial payments |

### Still to modify

| Path | Change |
|---|---|
| [package.json](package.json) | Add `expo-notifications` via `yarn` |
| [app.json](app.json) | Add `expo-notifications` plugin entry |
| [app/services/upcomingPaymentQueries.ts](app/services/upcomingPaymentQueries.ts) | Add `addContribution`, `markInstanceStatus`. |
| [app/queries/upcomingPayments.ts](app/queries/upcomingPayments.ts) | Add pay-flow mutations; invalidate `transactions` + `wallets` keys |
| [App.tsx](App.tsx) | Add notification channel setup (sweep already wired) |
| Pay-flow wiring | Pay-complete callback must call `ensureNextInstance` + `clearStaleFlag(parentId)` so stale payments clear when the user pays. |

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

### Phase 2 — Pure logic + service layer ✅ DONE (instance generation)
**Done**:
- CRUD service functions (add / update / soft-delete / cancel-instance / restore-instance / list / by-id / instances-with-contributions / section) + React Query hooks.
- [`getNextDueDate`](app/modules/upcomingPayments/upcomingPaymentRecurrence.ts) pure helper.
- [`ensureNextInstance`](app/services/upcomingPaymentQueries.ts) idempotent next-period insert (race-safe via composite unique index).
- [`catchUpUpcomingPaymentInstances`](app/services/upcomingPaymentQueries.ts) — app-launch sweep that loops `ensureNextInstance` until the latest dueDate reaches today.
- `cancelUpcomingPaymentInstance` auto-calls `ensureNextInstance` so the pipeline stays populated.
- App-launch sweep wired in [App.tsx](App.tsx) with query invalidation.
- `getUpcomingInstancesForSection` returns active pending rows with `dueDate < startOfNextMonth`, ordered chronologically.

**Remaining** (ships with Phase 5 pay flow):
- `addContribution`, `markInstanceStatus` service fns.
- Pay-complete must call `ensureNextInstance` (currently only wired on cancel).
- Pay-related mutations must invalidate `transactions` + `wallets` keys.

### Phase 3 — Read-only dashboard section ✅ DONE
Built: `UpcomingPaymentRow`, `UpcomingPaymentsSection`, dashboard flag wiring, corrected section query (pending with `dueDate < startOfNextMonth`, chronological — missed derived on the frontend via `isInstanceMissed`).

### Phase 4 — Form (add flow) ✅ DONE (via separate form)
Delivered as a standalone [UpcomingPaymentForm](app/features/upcomingPayments/ui/UpcomingPaymentForm/UpcomingPaymentForm.tsx) with its own validation, not as a `ModeToggle` on `TransactionForm`. Fields built: RepetitionPicker, EndDatePicker, NotificationSettings, VariableAmountToggle, LockedInfoBox.
**Note**: first-insert materializes only one Instance (`firstDueDate`) — this is intentional. Top-up happens lazily via `ensureNextInstance` on pay/cancel/app-launch so we never pre-schedule notifications for periods the user hasn't seen.

### Phase 5 — Pay now / Pay partial / Enter & Pay ❌ NOT STARTED (ship blocker)
1. Build `PaySheet` (handles pay-full, pay-partial, enter-amount in one place) + wallet picker + currency-mismatch banner.
2. Service: `addContribution` creates Transaction + Contribution atomically; if Instance reaches 100% (or any contribution for variable), flip to `paid`, cancel notifications, materialize next period.
3. Wire the Pay button on `UpcomingPaymentRow` ([line 34](app/features/upcomingPayments/ui/UpcomingPaymentRow.tsx#L34)) and the detail screen actions ([UpcomingPaymentDetails.tsx:99](app/features/upcomingPayments/ui/UpcomingPaymentDetails.tsx#L99), [:103](app/features/upcomingPayments/ui/UpcomingPaymentDetails.tsx#L103)).
4. Build `ProgressBar` for the detail screen partial-payment display.
5. Verify: wallet balance updates, transaction appears in history, dashboard row stays (partial) or is replaced (fully paid).

### Phase 5.5 — Stale-payment handling ✅ DONE (pending manual verification)

Caps `catchUpUpcomingPaymentInstances` at `BACKFILL_LIMIT = 3` and surfaces stale payments to the user instead of dumping rows. See [Stale-payment handling](#stale-payment-handling) for the design rationale.

**Shipped**:
1. **Schema**: `staleSince text` (nullable) on `UpcomingPayments`. Migration [drizzle/0005_absurd_reavers.sql](drizzle/0005_absurd_reavers.sql) (the previous 0005 was deleted and regenerated to fold the column in without a second migration).
2. **Sweep cap + short-circuit**: [catchUpUpcomingPaymentInstances](app/services/upcomingPaymentQueries.ts) skips payments with `staleSince != null`; for non-stale payments, bounded by `BACKFILL_LIMIT = 3`. Tracks `cappedWithoutCatchingUp`: if the loop exits because iterations hit the cap, it sets `staleSince = now` on the parent payment.
3. **`clearStaleFlag` service**: loops `ensureNextInstance` until the latest dueDate crosses today (bounded by `MAX_OCCURRENCES`), then nulls `staleSince`. This fills every missing period so the user can decide per-row, and leaves a future anchor so the next sweep no-ops.
4. **`useClearStaleFlagMutation` hook**: invalidates `upcomingPayments`, `upcomingInstancesForSection`, and the specific `upcomingPaymentById` key.
5. **`StalePaymentBanner` component**: filters `useGetUpcomingPayments` by `staleSince != null`, renders one card with Still using / Archive actions, returns `null` when empty.
6. **Dashboard mount**: banner rendered above `UpcomingPaymentsSection` in [BalanceScreen](app/features/balance/ui/BalanceTab/BalanceScreen.tsx) behind the same `showUpcomingPayments` flag.
7. **Detail screen**: red "Stale" chip in the header + "Still using this?" card with Still using / Archive buttons (Archive reuses the existing `onDelete` confirm flow).
8. **Settings list badge**: stale badge lives on `UpcomingPaymentCard`, so every row in `UpcomingPaymentsSettings` shows it automatically.

**Deferred to Phase 5** (pay flow):
- `addContribution` must clear `staleSince` as a side effect when paying any instance of a stale payment. The service + mutation are ready; just need the pay-flow caller to invoke `clearStaleFlag(upcomingPaymentId)` after the transaction commits.

**Manual verification** (no test runner):
- **Test 1 — flag trips**: create monthly payment, `firstDueDate` = 10 months ago. Reopen app. Expect: 4 instance rows (original + 3 backfilled), `staleSince` set; dashboard rows show red **Needs review** badge; sweep does **not** re-materialize on subsequent relaunches (short-circuit).
- **Test 2 — "Still using it" fills the gap**: open the stale payment's detail → tap Still using it. Expect: `staleSince` is NULL; all missing periods are materialized (for a 10-month-old monthly bill: ~11 pending rows total — 4 prior + ~7 newly-filled + 1 future); dashboard shows the missed rows for user to decide per-row. Next relaunch: sweep no-ops (latest is in the future).
- **Test 3 — within-cap does not flag**: weekly payment, `firstDueDate` = 2 weeks ago. Reopen → 3 instances, `staleSince` NULL, no "Needs review" badge.
- **Test 4 — archive path**: detail screen → Archive → confirm. Expect `isActive = false`; row removed from dashboard section.
- **Test 5 — detail screen**: open a stale payment. Expect red Stale chip next to name + "Still using this?" card with alert icon + two buttons.
- **Test 6 — settings badge**: open Settings → "All scheduled payments". Every stale row shows the red Stale badge.

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
4. Drizzle Studio: 1 UpcomingPayment row, 1 pending Instance row (only `firstDueDate` is materialized).
5. Tap Pay → sheet opens → enter $400 as partial → wallet balance drops by $400, a Transaction appears in recent transactions, Contribution row exists, Instance status still `pending`.
6. Tap Pay again → $600 → Instance flips to `paid`, its notifications are canceled, dashboard row now shows next month's due date.
7. Create a variable-amount "Electricity" upcoming payment — dashboard shows "Variable" + "Enter & Pay". Tap → sheet requires amount input → submit $180 → Instance flips to `paid` in one step.
8. Create a monthly upcoming payment with an end date 3 months out. After 4 periods elapse, it has no next-due and disappears from the dashboard (or shows as archived per Phase 7).
9. Create an upcoming payment dated yesterday → app-launch sweep materializes it as `pending`, `isInstanceMissed` flags it, row shows the warning badge.
10. Force-quit the app, wait past a scheduled notification time → notification fires.
11. Toggle `showUpcomingPayments` off in DashboardSettings → section disappears.
12. Tap a row → detail screen shows the rule + history of past Instances with their Transactions. Delete the upcoming payment → Instances + Contributions gone, but the real Transactions from steps 5/6 still exist in history and wallet balance is unchanged.
