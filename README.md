# Project & Agency Fee Calculator

A local web application that helps **freelancers and small agency leads** price projects and understand how costs, taxes, margins, and discounts affect their earnings. Built with React, Vite, Tailwind CSS, Vitest, and decimal.js.

## Project overview

Freelancers can estimate a gross quote, deduct project expenses, set aside tax withholding, and see their final take-home pay. Agency leads can build a client quote from subcontractor costs and a target gross margin, then evaluate the impact of a client discount on profit and effective margin.

This calculator was chosen because it addresses a practical business decision in a focused, reviewable application. It demonstrates two distinct user perspectives, precise financial calculations, live state updates, accessible forms, input validation, and automated acceptance tests without requiring cloud infrastructure.

### Features

- Two perspectives: **Solo Freelancer (Quote & Take-Home)** and **Agency Lead (Cost & Margin Builder)**.
- Immediate recalculation with USD amounts, thousand separators, and two decimal places.
- Inline validation and suppressed derived outputs when inputs are invalid.
- Warnings when freelancer expenses exceed revenue or agency discounts push a quote below contractor cost.
- Effective agency margin after discounts.
- Fixed/flat fee and hourly contractor billing modes, with retained inputs and a live hourly cost baseline.
- Decimal-only text fields that preserve large numbers without scientific notation.
- Responsive desktop/mobile layout, labeled inputs, keyboard navigation, and visible focus indicators.
- Independent form state for each mode and **Reset to Defaults** for the active mode.
- No external cloud services, API keys, or runtime network requests.

## Prerequisites

- **Node.js 20+**, with npm installed. Node 20 is specified in `.nvmrc`; use a version supported by the installed tooling (Node 20, 22, or 24+).
- A modern web browser.
- Internet access for the initial npm dependency installation. After installation, the application runs locally without cloud services.

Check your environment:

```sh
node --version
npm --version
```

If you use nvm, `nvm install` followed by `nvm use` selects the version in `.nvmrc`.

## Quick start

Run these commands from the project directory containing `package.json`.

### 1. Install dependencies

```sh
npm install
```

The repository includes `package-lock.json`. The project-local `.npmrc` disables automatic peer installation to work around an observed npm optional-peer resolution crash. Required React and Vite peers are explicitly declared in `package.json`.

### 2. Start the local development server

```sh
npm run dev
```

Open the **Local** URL printed by Vite, normally `http://localhost:5173`. Stop the server with `Ctrl+C`.

### 3. Run the automated test suite

```sh
npm test
```

Vitest runs all tests once and exits. For tests that rerun as files change:

```sh
npm run test:watch
```

### Production build and local preview

```sh
npm run build
npm run preview
```

The build writes static assets to `dist/`. Open the preview URL printed in the terminal.

## Baseline examples

Use **Reset to Defaults** to restore the active mode's example. Switching modes preserves each mode's current inputs; resetting one mode does not reset the other.

| Perspective | Default inputs | Expected results |
| --- | --- | --- |
| Freelancer | 40 hours, $75/hour, $300 expenses, 20% tax | $3,000 gross, $2,700 pre-tax net, $540 tax, $2,160 take-home |
| Agency lead | $4,000 subcontractor cost, 20% margin, 0% discount | $5,000 client quote, $1,000 gross profit, 20% effective margin |

## Product Documentation

The product requirements are organized into three linked documents:

- [App Roles](docs/app-roles.md) defines the target users, their responsibilities, supported workflows, and constraints.
- [Jobs To Be Done](docs/jobs-to-be-done.md) describes the situations, goals, and desired outcomes for each role.
- [User Stories & Acceptance Criteria](docs/user-stories.md) translates those jobs into user-facing requirements, implementation status, and measurable acceptance scenarios.

Traceability follows **Roles → Jobs → User Stories → Acceptance Criteria**. Each job identifies its role, each user story references the job it serves and the relevant role, and its acceptance criteria specify the observable behavior needed to verify that requirement. This chain connects user needs to implementation and test expectations.

## Project structure

```text
src/
  components/
    shared/          InputCard.jsx and Breakdown.jsx
    freelancer/      FreelancerCalculator.jsx and FreelancerBreakdown.jsx
    agency/          AgencyCalculator.jsx and AgencyBreakdown.jsx
    CalculatorApp.jsx  Role switcher and retained form state
  logic/
    shared/          Decimal math, validation, formatting, and input utilities
    freelanceLogic.js  Freelancer calculations and defaults
    agencyLogic.js     Fixed/hourly agency calculations and defaults
  tests/
    freelance.test.js  US-1 and freelancer domain tests
    agency.test.js     US-2 and agency billing-mode tests
    shared.test.js     Cross-domain guards and formatting
    input.test.js      Decimal input sanitization
    views.test.jsx     Rendered views and effective-margin tests
  App.jsx            Root application component
  main.jsx           React entry point
  index.css          Tailwind import and base styles
docs/                Product documentation
transcripts/         Session summaries and verification records
vite.config.js       React, Tailwind, and Vitest configuration
```

## Domain assumptions and calculation rules

### Freelancer

```text
Gross revenue = hours × hourly rate
Pre-tax net = gross revenue − overhead expenses
Tax amount = max(0, pre-tax net) × tax rate / 100
Take-home net = pre-tax net − tax amount
```

- Hours must be greater than zero. Hourly rate and overhead expenses may be zero but cannot be negative.
- Tax rate is a user-supplied flat withholding estimate between 0% and 100% inclusive. The application does not calculate jurisdiction-specific tax brackets or deductions.
- Expenses are deducted before tax withholding. Negative net income incurs **zero tax withholding** and remains a loss in the take-home result.
- A deficit warning uses the unrounded pre-tax net.

### Agency lead

```text
Standard client price = subcontractor cost / (1 − target margin / 100)
Agency gross profit = standard client price − subcontractor cost
Final client price = standard client price × (1 − client discount / 100)
Effective profit = final client price − subcontractor cost
Effective margin % = effective profit / final client price × 100
```

- Pricing uses **financial gross margin**, not markup. A $4,000 cost at 20% margin produces a $5,000 quote, rather than the $4,800 quote produced by a 20% markup.
- Fixed billing uses a positive `flatSubcontractorCost`. Hourly billing uses positive `subcontractorHours` multiplied by nonnegative `subcontractorHourlyRate`, without intermediate currency rounding. Only active-mode cost fields are validated; both modes retain inputs during switching. Target margin must be nonnegative and strictly below 100%.
- A zero hourly rate produces zero revenue and profit, no below-cost warning, and an undefined effective margin. The Hourly / Day Rate view expects hours and an hourly rate; convert day rates before entering them.
- Client discount is between 0% and 100% inclusive and applies to the standard quote. A blank optional discount in the UI means zero; direct domain calls must supply the field explicitly.
- Agency gross profit describes the standard quote before discount; effective profit describes the discounted quote.
- When discount exceeds target margin, the final quote falls below contractor pass-through cost.
- A 100% discount produces zero revenue, negative effective profit, and an undefined effective margin, displayed as **N/A (zero client price)**.
- Agency calculations use algebraically equivalent ratio formulas to avoid cancellation errors after repeating division.

### Precision, formatting, and validation

- Currency is USD. Monetary results are **decimal strings**, rounded half-up to two decimal places only at the output boundary.
- decimal.js uses an isolated 512-significant-digit configuration. Intermediate arithmetic does not use JavaScript floating-point numbers. Pass original decimal strings to the domain API; it cannot recover precision already lost in a caller's numeric expression.
- Domain inputs accept finite numbers or decimal strings, including scientific notation. Safety limits are 200 input characters, 100 significant digits, and decimal exponents from −100 through 100.
- The UI accepts digits and a single decimal point. It removes pasted dollar signs, grouping commas, and whitespace. Letters, signs, exponent notation, and additional decimal points are rejected without changing the previous value.
- The domain API independently rejects negative, missing, malformed, and non-finite inputs. UI sanitization does not replace domain validation.
- Invalid domain results contain field-specific `{ field, message }` errors, null monetary fields, and false warning flags. **Zero hours is the exception:** gross is `"0.00"` with the error `Estimated hours must be greater than 0`. The UI suppresses all derived results whenever validation errors exist.
- Negative inputs return `Values cannot be negative`; agency margins at or above 100% return `Agency margin must be less than 100%`.
- Warning flags use unrounded values. A very small loss may display as $0.00 while still triggering a warning. Independently rounded breakdown amounts can differ by one cent when summed.
- Invalid currency formatting displays an em dash instead of NaN or Infinity.

Full API contracts are documented in [docs/calculator.md](docs/calculator.md).

## Verification

The latest verified automated run passed **99 tests across five test files**. Coverage includes US-1 freelancer and US-2 agency acceptance scenarios, exact validation messages, zero-hours handling, deficits, margin limits, discount boundaries, malformed inputs, decimal precision, rounding, formatting, sanitization, and rendered validation/warning states. This test count is a recorded result, not a claim of 100% code coverage.

The production build passed. Local headless Chrome checks verified large-number entry, invalid-edit rejection, Tab navigation, role selection with arrow keys, visible focus indicators, resets in both modes, warning removal, and no runtime errors. At a 375px mobile viewport, the tested large-number input and page did not overflow horizontally. These browser checks used temporary tooling outside the repository; `npm test` runs the committed Vitest suite.

Verification used the installed Node 24 runtime because the shell's default Node 10 was incompatible with this project's prerequisites.

## AI tool and model disclosure

- **Tool:** OpenAI Codex coding agent in this IDE-connected session. Repository files were created and edited through its workspace tools, and commands were run through its terminal tools.
- **Model:** The session instructions identify the agent as **based on GPT-6**. The exact deployed model identifier or variant is not exposed in the available session metadata, so a more specific model name cannot be verified.
- **AI involvement:** Project scaffolding, calculation logic, React components, tests, documentation, debugging changes, and verification commands were produced by the agent in response to the user's requirements.

This disclosure does not identify the tool as Claude Code or claim a model variant that the session does not establish.

## Code modification audit

The workspace was empty when this session began. All code additions and modifications recorded in this conversation were made by the AI agent. **No manually edited code lines were reported or observed in the session.** This is a session-based audit; editor activity outside the recorded conversation cannot be independently certified.

The following line ranges identify the current AI-authored source, test, and configuration content at the time of this README update:

| File | AI-authored lines | Purpose |
| --- | --- | --- |
| `src/App.jsx` | 1–5 | Root application component |
| `src/main.jsx` | 1–5 | React entry point |
| `src/index.css` | 1–6 | Tailwind and base styles |
| `src/components/CalculatorApp.jsx` | 1–39 | Role selection, form state, and resets |
| `src/components/shared/InputCard.jsx` | 1–20 | Accessible decimal inputs |
| `src/components/shared/Breakdown.jsx` | 1–24 | Shared result cards and warnings |
| `src/components/freelancer/FreelancerCalculator.jsx` | 1–24 | Freelancer input form |
| `src/components/freelancer/FreelancerBreakdown.jsx` | 1–12 | Freelancer results |
| `src/components/agency/AgencyCalculator.jsx` | 1–43 | Fixed/hourly agency input form |
| `src/components/agency/AgencyBreakdown.jsx` | 1–11 | Agency results |
| `src/logic/freelanceLogic.js` | 1–33 | Freelancer domain calculations and defaults |
| `src/logic/agencyLogic.js` | 1–70 | Agency domain calculations and defaults |
| `src/logic/shared/decimal.js` | 1–18 | Isolated decimal math and parsing |
| `src/logic/shared/validation.js` | 1–22 | Shared validation primitives |
| `src/logic/shared/formatters.js` | 1–39 | Currency and number formatting |
| `src/logic/shared/input.js` | 1–6 | Input sanitization |
| `src/tests/freelance.test.js` | 1–68 | US-1 and freelancer tests |
| `src/tests/agency.test.js` | 1–96 | US-2 and agency tests |
| `src/tests/shared.test.js` | 1–37 | Validation and formatting tests |
| `src/tests/input.test.js` | 1–9 | Sanitization tests |
| `src/tests/views.test.jsx` | 1–79 | Rendered view tests |
| `vite.config.js` | 1–11 | Build and test configuration |
| `index.html` | 1–13 | HTML shell |
| `package.json` | 1–26 | Dependencies and scripts |
| `.npmrc` | 1–3 | npm resolver workaround |
| `.nvmrc` | 1–1 | Node version |
| `.gitignore` | 1–6 | Generated-file exclusions |

`README.md`, `docs/`, and `transcripts/` were also AI-authored. The obsolete `.gitkeep` placeholders were removed. `package-lock.json` was generated by npm from the AI-authored dependency declarations; installed dependencies and `dist/` build artifacts were generated by their respective tools, rather than manually written.

The records in [transcripts/](transcripts/) are concise session summaries, not verbatim chat exports. Line ranges above are a snapshot and should be updated after subsequent source changes.

## Current scope

The application runs locally and keeps inputs in React memory. Inputs survive role switching but are lost on page reload. It does not provide saved projects, authentication, invoicing, multi-currency support, or cloud synchronization.
