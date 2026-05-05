# Contributing to OpenMRS ESM Patient Chart (Vinisha's Fork)

Thank you for your interest in contributing! This fork focuses on improvements that matter in real clinical environments — especially in resource-limited settings.

## Ground Rules

1. **Clinical safety first.** Any change that could affect clinical decision-support (vital sign interpretation, normal ranges, BMI thresholds) must cite a primary source (WHO guideline, JNC 8, etc.) in the code comment.

2. **Accessibility is not optional.** Every new UI component must include:
   - Proper `aria-label` or `aria-labelledby`
   - `role` attributes where semantic HTML isn't sufficient
   - `aria-live` for asynchronously updated content
   - Keyboard operability (focus management, tab order)

3. **TypeScript strict.** No `any` types. Use proper interfaces or union types.

4. **Memoize expensive computations.** Use `useMemo` for data transformations in render, and `React.memo` for pure display components.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/vinisha231/openmrs-esm-patient-chart.git
   cd openmrs-esm-patient-chart
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server (you'll need a running OpenMRS backend or use the dev3 demo server):
   ```bash
   yarn start --env.apiUrl=https://dev3.openmrs.org
   ```

4. Run tests:
   ```bash
   yarn test
   ```

5. Build all packages:
   ```bash
   yarn build
   ```

## Adding New Utilities

New clinical utilities should go in:
```
packages/esm-patient-common-lib/src/utils/clinical-utils.ts
```

Every utility must:
- Have a full JSDoc comment explaining what it does, WHY (clinical rationale), and what parameters mean
- Have a TypeScript return type
- Have proper null/undefined handling
- Export from `packages/esm-patient-common-lib/src/index.ts`

Example:
```typescript
/**
 * Calculates the patient's age in whole years.
 *
 * WHY: Precise age calculation is needed for paediatric dosing and
 * reference range adjustments. We handle leap years explicitly because
 * Feb 29 birthdays cause off-by-one errors in naive implementations.
 */
export function calculateAge(birthDate: string | Date | null | undefined, referenceDate?: Date): number | null {
  // ...
}
```

## Adding Normal Range Constants

New reference ranges go in:
```
packages/esm-patient-common-lib/src/utils/normal-ranges.ts
```

Always cite the source in a comment, e.g.:
```typescript
// Source: WHO Global Pulse Oximetry Project, 2011
oxygenSaturation: { criticalLow: 90, low: 95, high: 100, criticalHigh: 100, unit: '%' },
```

## Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) spec:

```
<type>(<scope>): <short description>

<body — optional>
```

Types:
- `feat` — new feature
- `fix` — bug fix
- `a11y` — accessibility improvement
- `perf` — performance improvement
- `types` — TypeScript type improvement
- `ux` — user experience improvement (empty states, messages)
- `docs` — documentation only
- `util` — utility function addition

Examples:
```
a11y: add aria-label to allergies table and action buttons
feat(vitals): add normal range color indicators to vital readings
util: add getBloodPressureInterpretation to common-lib
```

## Pull Requests

1. Create a feature branch: `git checkout -b feat/your-improvement-name`
2. Make your changes
3. Run tests: `yarn test`
4. Push and open a PR against the `main` branch of this fork
5. Fill in the PR template

## Code Review Checklist

- [ ] Does the change have real clinical value?
- [ ] Are all `any` types replaced?
- [ ] Do new components have proper ARIA attributes?
- [ ] Is there a JSDoc comment on each new utility?
- [ ] Does it pass existing tests?
- [ ] Are translation keys added for all new user-visible strings?

## License

All contributions are made under the [Mozilla Public License 2.0](LICENSE).
