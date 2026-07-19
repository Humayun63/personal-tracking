# Design Specification
## Personal Life Management PWA — v0.1 (Landing, Login, Qaza Tracker)

---

## 1. Purpose of this Document

This spec defines the visual and interaction design for the app's foundation (shell + design system) and the first module (**Qaza Tracker**), plus the landing page and login form. It's meant to be handed to a designer (human or AI) to produce wireframes/mockups, or to be implemented directly by a developer without needing to guess at UX decisions.

It intentionally does **not** cover business logic, database schema, or API design — that belongs in the PRD.

---

## 2. Product Context (brief)

- Personal-use web app, installable as a **PWA**.
- Modules are separate, self-contained sections: Finance, Budget, Coaching, Habit Tracker, Blog, **Qaza Tracker**.
- One shared shell: navigation, auth, dashboard.
- Single user for now (owner-only login, email + password, no public registration yet).
- Mobile-first: this app will likely be used most on a phone (e.g., logging a prayer right after performing it), so mobile UX quality matters more than desktop polish at this stage.

---

## 3. Design Principles

1. **Calm, not clinical.** This app touches personal finance, faith, and habits — areas with emotional weight. Avoid cold, spreadsheet-like UI. Warm neutral tones, generous whitespace, soft edges.
2. **Fast logging over deep navigation.** The most common action (e.g., "I just prayed Zuhr, log it") should take one tap from anywhere reasonably close to the module's home screen — not buried in menus.
3. **Progress should feel visible and honest.** No fake gamification. Progress bars/rings should reflect real counts, not motivational fluff.
4. **Respectful of the subject matter.** The Qaza Tracker deals with religious obligation some users may feel guilt or anxiety about. Tone should be encouraging and neutral — never shaming, never urgent/red-alert styling for "prayers owed."
5. **One shell, distinct modules.** Shared nav/header/typography system, but each module can have its own accent color and iconography so they feel distinguishable at a glance.

---

## 4. Design System (Foundation)

### 4.1 Color

Use a neutral base with **per-module accent colors**. This lets the dashboard/nav visually distinguish modules without needing separate design languages.

| Token | Role | Example |
|---|---|---|
| `--bg-base` | App background | off-white / near-black (light/dark mode) |
| `--surface` | Cards, panels | white / dark gray |
| `--text-primary` | Main text | near-black / near-white |
| `--text-secondary` | Muted text | mid gray |
| `--border` | Dividers, card borders | light gray |
| `--accent-finance` | Finance module | e.g. deep green |
| `--accent-budget` | Budget module | e.g. amber |
| `--accent-coaching` | Coaching module | e.g. indigo |
| `--accent-habits` | Habit Tracker module | e.g. teal |
| `--accent-qaza` | Qaza Tracker module | e.g. muted teal-gold (calm, non-alarming) |
| `--accent-blog` | Blog module | e.g. slate blue |
| `--success` | Positive states | green |
| `--warning` | Caution (not for "owed" counts — see principle 4) | amber |

**Dark mode is required from day one** — this app will be used at prayer times, including at night. Don't treat dark mode as a v2 add-on.

### 4.2 Typography

- One primary typeface (system font stack is fine: `-apple-system, Segoe UI, Roboto, sans-serif`) for performance and PWA install consistency.
- Scale: 12 / 14 / 16 / 20 / 24 / 32 px. Base body = 16px (mobile-friendly minimum).
- Numbers (counts, progress, currency) can use a slightly heavier weight or tabular-nums so counters don't jitter when updating.

### 4.3 Spacing & Layout Grid

- 8px base spacing unit.
- Mobile: single-column, full-width cards with 16px side padding.
- Desktop: max content width ~1100px, dashboard becomes a card grid (2–3 columns).

### 4.4 Core Components (shared across modules)

- **App Shell**: top bar (logo/name + module title) + bottom tab bar (mobile) / left sidebar (desktop).
- **Card**: base container for all module widgets — rounded corners (12–16px), subtle shadow or border, consistent padding.
- **Progress Ring/Bar**: used for Qaza Tracker and Habit Tracker alike — shared component, different accent colors.
- **Primary Button, Secondary Button, Icon Button** — standard states (default, hover, pressed, disabled).
- **Counter/Stepper control** — for logging multiple prayers at once (e.g., "+1", "+5", manual entry).
- **Empty state** — friendly, non-shaming copy + illustration/icon for "no data yet" (relevant for Qaza setup before dates are entered).
- **Toast/inline confirmation** — quiet, non-intrusive confirmation on logging an action (no modal interruptions for routine logging).

### 4.5 Iconography

- Simple line icons (e.g., Lucide-style) for nav; each module gets one consistent icon (e.g., a crescent/prayer mat icon for Qaza, not literal religious imagery that could feel heavy-handed).

---

## 5. Navigation & Information Architecture

### 5.1 Site Map

```
/                → Landing page (logged out)
/login           → Login form
/dashboard       → Unified dashboard (logged in, shell home)
/finance         → Finance module
/budget          → Budget module
/coaching        → Coaching module
/habits          → Habit Tracker module
/qaza            → Qaza Tracker module
  /qaza/setup    → First-time setup flow (date selection)
  /qaza          → Main tracker view (once set up)
  /qaza/history  → Log history / calendar view
/blog            → Blog module
```

### 5.2 Navigation Pattern

- **Mobile (primary target):** bottom tab bar with icons for Dashboard + up to 4 most-used modules; overflow "More" tab for the rest. Given Qaza logging is likely frequent, it should be one of the visible bottom tabs, not buried in "More."
- **Desktop:** left sidebar, all modules listed, collapsible.
- **Module switch is always one tap/click away** — no nested menus to reach another module.

---

## 6. Screen Specifications

### 6.1 Landing Page (`/`)

Purpose: minimal, since this is a personal app — but should look intentional, not like a placeholder.

```
┌─────────────────────────────┐
│  [Logo / App Name]           │
│                               │
│   Short one-line tagline      │
│   (e.g. "Your life, in one    │
│   place.")                    │
│                               │
│        [ Log in ]             │
│                               │
└─────────────────────────────┘
```

- Centered, single call-to-action: **Log in** button → `/login`.
- No marketing sections, no pricing, no sign-up (registration is disabled for now — spec should not design a "Sign up" affordance yet, per product decision).
- Should still be installable as a PWA from this screen (install prompt / "Add to Home Screen" affordance where supported).

### 6.2 Login Form (`/login`)

```
┌─────────────────────────────┐
│         [Logo]                │
│                               │
│   Email                       │
│   [_________________]         │
│                               │
│   Password                    │
│   [_________________] [👁]     │
│                               │
│        [ Log in ]             │
│                               │
│   Forgot password?            │
└─────────────────────────────┘
```

- Fields: Email, Password (with show/hide toggle).
- Single primary action: **Log in**.
- "Forgot password" link (even single-user apps benefit from this via Supabase auth reset flow).
- Inline error state below the field (not a modal) for invalid credentials — quiet, not alarming (e.g., muted red text, not a flashing banner).
- No "Sign up" link/affordance (registration is intentionally absent for now).
- Loading state on the button while authenticating (spinner replaces label, button disabled).

### 6.3 Qaza Tracker Module (`/qaza`)

This is the core of this spec. Three states to design:

#### A. First-time Setup (`/qaza/setup`)

Shown once, before any tracking data exists.

```
Step 1 of 2
┌─────────────────────────────┐
│  When did you reach the age   │
│  of religious responsibility  │
│  (bulugh)?                    │
│                               │
│  [ Date Picker ]               │
│                               │
│  Not sure of the exact date?  │
│  You can enter your best       │
│  estimate — you can always     │
│  edit this later.              │
│                               │
│              [ Next → ]        │
└─────────────────────────────┘

Step 2 of 2
┌─────────────────────────────┐
│  When did you start praying    │
│  regularly (the point you       │
│  consider your qaza period      │
│  to end)?                       │
│                               │
│  [ Date Picker ]               │
│                               │
│         [← Back]  [ Calculate ]│
└─────────────────────────────┘
```

- Two sequential steps, not one cluttered form — reduces cognitive load for a decision that may feel emotionally loaded.
- Both fields are plain **date pickers** (not "calculate from birthdate" — per product decision, user enters the actual date directly).
- Reassuring microcopy under each field: dates can be estimates and edited later. This matters — someone doing this calculation may feel uncertain or anxious about precision.
- **Optional advanced settings** (collapsed/expandable, not shown by default):
  - Toggle: "Include Witr in daily count" (on by default, since Hanafi view treats it as wajib — but must be togglable, not assumed for all users)
  - Optional: "Exclude periods (e.g. menstruation)" — a way to input date ranges to exclude from the owed count, for accuracy. Should be presented as an optional, low-friction add-on (a simple "Add exclusion period" link), not a mandatory blocking field.
- On "Calculate," show a **summary/confirmation screen** before committing (see below) rather than jumping straight into the tracker — this is a significant number for some users to see for the first time, and should be presented calmly.

#### B. Confirmation Screen (after setup, before entering main tracker)

```
┌─────────────────────────────┐
│   Here's where you're starting │
│                               │
│   Total days: 4,015            │
│                               │
│   Fajr      4,015              │
│   Zuhr      4,015               │
│   Asr       4,015               │
│   Maghrib   4,015               │
│   Isha      4,015               │
│   Witr      4,015               │
│                               │
│   This is just a starting       │
│   point — you can adjust        │
│   anytime in settings.          │
│                               │
│         [ Start Tracking ]      │
└─────────────────────────────┘
```

- Calm, non-alarming presentation of what could be a large number. No red/warning colors. Plain, neutral, factual tone.
- Framed as "a starting point," reinforcing that this is a long-term, achievable process, not a countdown to dread.

#### C. Main Tracker View (`/qaza`, ongoing use)

This is the highest-frequency screen — designed for speed.

```
┌─────────────────────────────┐
│  Qaza Tracker                  │
│                               │
│  Overall Progress              │
│  [██████░░░░░░░░] 38%          │
│  9,120 of 24,090 completed      │
│                               │
│  ┌───────┐ ┌───────┐ ┌───────┐│
│  │ Fajr  │ │ Zuhr  │ │ Asr   ││
│  │ ◔ 42% │ │ ◔ 35% │ │ ◔ 30% ││
│  │ [+1]  │ │ [+1]  │ │ [+1]  ││
│  └───────┘ └───────┘ └───────┘│
│  ┌───────┐ ┌───────┐ ┌───────┐│
│  │Maghrib│ │ Isha  │ │ Witr  ││
│  │ ◔ 40% │ │ ◔ 36% │ │ ◔ 44% ││
│  │ [+1]  │ │ [+1]  │ │ [+1]  ││
│  └───────┘ └───────┘ └───────┘│
│                               │
│  [ Log multiple... ]           │
│  [ View history ]              │
└─────────────────────────────┘
```

- **6 prayer cards** (or 5 if Witr toggle is off), each showing:
  - Prayer name
  - Individual progress ring (percentage complete for that prayer)
  - A single **[+1]** tap target — the core interaction, must be a large, thumb-friendly tap area (mobile-first)
- **Overall progress bar** at top — combined percentage across all prayer types.
- **"Log multiple..."** — opens a stepper/modal for bulk logging (e.g., logging 20 Fajrs at once after a reflective session), since one-by-one tapping isn't realistic for someone with thousands owed.
- **"View history"** → `/qaza/history` — a log of what's been logged and when, useful for review/undo.
- Tapping [+1] gives quiet inline feedback (small animation on the ring + toast "Fajr logged"), no full-screen confirmation — logging should feel frictionless and frequent, not like a big event each time.
- **Undo** affordance: last action should be undoable (e.g., a small "Undo" in the toast) in case of accidental taps.

#### D. History View (`/qaza/history`)

```
┌─────────────────────────────┐
│  History                      │
│                               │
│  Today                        │
│   Fajr +1        7:12 AM       │
│   Zuhr +3        1:45 PM       │
│                               │
│  Yesterday                    │
│   Isha +5        10:02 PM      │
│  ...                           │
└─────────────────────────────┘
```

- Simple reverse-chronological log grouped by day.
- Supports the "honest progress" principle — user can see actual logging patterns over time, useful for reflection and consistency.

---

## 7. Interaction & Motion Guidelines

- Progress ring/bar updates should **animate smoothly** (300–500ms ease) rather than snap — reinforces the sense of steady progress.
- No celebratory confetti/fireworks on completing a prayer type — keep tone respectful and calm (per Principle 4). A subtle, quiet acknowledgment (e.g., ring turns a soft "complete" color) is enough.
- Bulk logging modal should support quick increments (+1, +5, +10, custom number) since totals can be in the thousands.

---

## 8. PWA-Specific Design Requirements

- App icon + splash screen assets (multiple sizes for iOS/Android).
- Must work full-screen (no browser chrome) when launched from home screen.
- Bottom tab bar should respect safe-area insets (notch/home-indicator on iOS).
- Offline state: if logging is attempted with no connection, queue locally and show a subtle "will sync" indicator rather than blocking the action — logging a prayer shouldn't fail because of connectivity (this affects module design: the +1 action should feel instant regardless of network).

---

## 9. Accessibility

- Minimum tap target size 44x44px (mobile).
- Color is never the only signal (progress rings should also show %, not just fill color).
- Sufficient contrast in both light and dark mode, including on accent colors used for progress rings.
- All icon-only buttons need accessible labels (e.g., screen-reader label "Log one Fajr prayer" on the +1 button).

---

## 10. Open Questions (for you to confirm before final designs / PRD)

1. **Witr default**: Confirm whether Witr should default ON or OFF in the count, or whether it should be a required choice during setup rather than a default.
2. **Exclusion periods**: Confirm whether the "exclude periods" (e.g. menstruation) feature is needed for v1, or can be deferred to a later version.
3. **Calendar system**: Should the day-count between the two dates be calculated in Gregorian days (simplest) or should it account for Hijri calendar months? (Gregorian day-count is recommended for v1 — simplest and accurate for elapsed time regardless of calendar system.)
4. **Editing past dates later**: If the user changes the bulugh date after already logging progress, how should existing logged counts be reconciled? (Worth deciding before building, since it affects both UX and data model.)
5. **Per-module accent colors**: Do you want to pick these yourself, or should the designer propose a palette?

---

*Next step: once this is confirmed, this spec feeds directly into the PRD (data model, Supabase schema, Next.js route structure, module boundaries).*