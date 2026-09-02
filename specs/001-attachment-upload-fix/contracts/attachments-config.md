# Contract: Attachments Config Schema (`maxFileSize`)

This is the implementer-facing contract affected by this feature — the OpenMRS config schema
entry that deployments can override, exposed by `packages/esm-patient-attachments-app`.

## Contract

```jsonc
// config.json (implementer override — unaffected by this feature; shown for reference)
{
  "@openmrs/esm-patient-attachments-app": {
    "maxFileSize": 15 // implementer's own value, in MB, overrides the platform default
  }
}
```

| Property | Type | Default (this feature) | Constraint | Notes |
|---|---|---|---|---|
| `maxFileSize` | `number` | `10` (was `1`) | `> 0` | Maximum accepted upload size, in MB. An explicit implementer value in `config.json` always takes precedence over the platform default — this feature changes only the default, not the override mechanism. |

## Backward compatibility

- Deployments that have **not** set `maxFileSize` will silently start accepting larger files
  (up to 10MB instead of 1MB) after upgrade — this is the intended fix and is a widening, not a
  breaking, change.
- Deployments that **have** explicitly set `maxFileSize` (to any value, larger or smaller than
  10MB) see no change in behavior.
- The property name, type, and validator are unchanged, so no consumer of the config schema
  needs to change how it reads or overrides this value.

## UI contract: attachment review submit control

Not a network/API contract, but a UI behavioral contract worth stating explicitly since it's
the second half of this feature:

- The "Add attachment" submit control in the review/caption step MUST remain visible and
  operable within the viewport at all times while that step is open, on any supported viewport
  size, regardless of on-screen keyboard state (FR-001).
- Submitting MUST be possible either by activating that control directly, or — on desktop,
  unchanged — via the keyboard "Enter" key while focus is in the form (FR-002, FR-003).
