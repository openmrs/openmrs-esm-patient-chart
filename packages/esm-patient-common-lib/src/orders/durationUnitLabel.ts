type Translate = (key: string, defaultValue: string, options: { count: number }) => string;

/**
 * The label of an order's duration unit, agreeing with the duration ("1 week", "2 weeks").
 *
 * A duration unit concept has one name per locale, so "for {{duration}} {{durationUnit}}" reads
 * "for 1 weeks" wherever that name is plural. An implementation can supply the singular and plural
 * forms as translations keyed by the unit's concept UUID — `durationUnit_<uuid>_one` and
 * `durationUnit_<uuid>_other` (plus any other plural forms the language needs) — and they are used
 * with the duration as the count. Without them the concept's display name is used, as before.
 */
export function getDurationUnitLabel(
  t: Translate,
  durationUnits: { uuid?: string; display?: string } | null | undefined,
  duration: number,
): string {
  const conceptName = durationUnits?.display?.toLowerCase() ?? '';
  if (!durationUnits?.uuid) {
    return conceptName;
  }
  return t(`durationUnit_${durationUnits.uuid}`, conceptName, { count: Number(duration) });
}
