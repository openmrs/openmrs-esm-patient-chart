import type { TFunction } from 'i18next';
import {
  assessValue,
  formatReferenceRange,
  type OBSERVATION_INTERPRETATION,
  type Order,
  type ReferenceRanges,
} from '@openmrs/esm-patient-common-lib';

/**
 * Severity tags, ordered most severe first. The order of this array is the tie-breaker used by
 * {@link classifyNotification}: a STAT order that comes back critical is tagged CRITICAL.
 */
export const notificationTags = ['CRITICAL', 'STAT', 'SAMPLE_REJECTED', 'ROUTINE'] as const;

export type NotificationTag = (typeof notificationTags)[number];

const criticalInterpretations: Array<OBSERVATION_INTERPRETATION> = [
  'CRITICALLY_HIGH',
  'CRITICALLY_LOW',
  'OFF_SCALE_HIGH',
  'OFF_SCALE_LOW',
];

const abnormalInterpretations: Array<OBSERVATION_INTERPRETATION> = ['HIGH', 'LOW'];

/** The minimal shape of a resulted observation the rule needs. Kept narrow so it is easy to fake. */
export interface ResultedObservation {
  uuid: string;
  conceptUuid: string;
  display: string;
  panelDisplay?: string;
  value?: string;
  units?: string;
  /** Set when the observation itself carried an interpretation; otherwise derived from ranges. */
  interpretation?: OBSERVATION_INTERPRETATION;
  ranges?: ReferenceRanges;
  effectiveDateTime: string;
}

export interface SmartNotification {
  id: string;
  tag: NotificationTag;
  patientUuid: string;
  conceptUuid: string;
  testLabel: string;
  panelLabel?: string;
  value?: string;
  units?: string;
  interpretation?: OBSERVATION_INTERPRETATION;
  referenceRangeText: string;
  orderNumber: string;
  ordererDisplay: string;
  locationUuid?: string;
  locationDisplay?: string;
  encounterUuid?: string;
  resultDate: string;
  rejectionReason?: string;
}

export interface ClassificationOptions {
  /** Config: also notify for abnormal-but-not-critical values. */
  notifyOnAbnormalNonCritical: boolean;
  /** Whether the clinician ticked "Notify me when resulted" for this patient + concept. */
  optedIn: boolean;
}

const isSet = (value: number | undefined): value is number => value !== null && value !== undefined;

/**
 * Drops critical and absolute bounds that contradict the concept's normal range.
 *
 * `assessValue` accepts `0` as a real bound — its `exist` guard only rejects `null` and `undefined`
 * — so a concept whose `hiCritical` is stored as `0` rather than left unset marks *every* positive
 * result CRITICALLY_HIGH. CRITICAL notifies regardless of opt-in, so a single badly configured
 * concept floods the bell with a notification for every resulted order.
 *
 * A critical-high threshold below the normal range cannot be right, so it is ignored rather than
 * allowed to manufacture a critical. Coherent ranges pass through untouched, which is what keeps
 * this safe: it can only ever remove a false critical, never suppress a real one. Where the concept
 * carries no normal range at all there is nothing to judge coherence against, so the bounds stand.
 */
/**
 * Whether the concept has a normal band we can judge the critical bounds against.
 *
 * A band collapsed to a point — most often `0`/`0` from dictionary fields that were never filled in
 * — tells us nothing about where "critical" begins, so it counts as no band at all.
 */
function hasUsableNormalRange(ranges: ReferenceRanges): boolean {
  const { hiNormal, lowNormal } = ranges;
  if (!isSet(hiNormal) && !isSet(lowNormal)) {
    return false;
  }
  return !(isSet(hiNormal) && isSet(lowNormal) && hiNormal <= lowNormal);
}

export function withCoherentCriticalBounds(ranges: ReferenceRanges | undefined): ReferenceRanges | undefined {
  if (!ranges) {
    return ranges;
  }

  // With nothing to anchor against we cannot tell a real threshold from an unset field left at 0,
  // so every critical and absolute bound is dropped. This is the safe direction: a false CRITICAL
  // ignores the opt-in and cannot be configured off, so it would put a notification on the bell for
  // every single resulted order. A concept in this state can still raise CRITICAL the normal way —
  // from an interpretation the lab itself supplied, which `resolveInterpretation` prefers anyway.
  if (!hasUsableNormalRange(ranges)) {
    return { units: ranges.units };
  }

  const upperReference = ranges.hiNormal ?? ranges.lowNormal;
  const lowerReference = ranges.lowNormal ?? ranges.hiNormal;
  const coherent = { ...ranges };

  if (isSet(upperReference)) {
    if (isSet(coherent.hiCritical) && coherent.hiCritical < upperReference) {
      coherent.hiCritical = undefined;
    }
    if (isSet(coherent.hiAbsolute) && coherent.hiAbsolute < upperReference) {
      coherent.hiAbsolute = undefined;
    }
  }

  if (isSet(lowerReference)) {
    if (isSet(coherent.lowCritical) && coherent.lowCritical > lowerReference) {
      coherent.lowCritical = undefined;
    }
    if (isSet(coherent.lowAbsolute) && coherent.lowAbsolute > lowerReference) {
      coherent.lowAbsolute = undefined;
    }
  }

  return coherent;
}

/**
 * Resolves the interpretation for an observation, preferring one the lab supplied over one we
 * derive from reference ranges.
 */
export function resolveInterpretation(obs: ResultedObservation): OBSERVATION_INTERPRETATION | undefined {
  if (obs.interpretation) {
    return obs.interpretation;
  }
  if (obs.value == null || !obs.ranges) {
    return undefined;
  }
  const numericValue = Number(obs.value);
  if (Number.isNaN(numericValue)) {
    return undefined;
  }
  return assessValue(numericValue, withCoherentCriticalBounds(obs.ranges));
}

export function isCritical(interpretation: OBSERVATION_INTERPRETATION | undefined): boolean {
  return Boolean(interpretation) && criticalInterpretations.includes(interpretation);
}

/** Human-readable interpretation, e.g. `CRITICALLY_LOW` -> "Critically low". */
export function interpretationLabel(interpretation: OBSERVATION_INTERPRETATION | undefined, t: TFunction): string {
  if (!interpretation) {
    return t('noInterpretation', 'No interpretation');
  }
  const words = interpretation.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The notification rule. Returns the tag to surface, or `null` when the result should file
 * silently to the chart — the whole point of the feature is that most results return `null`.
 *
 * Severity wins over provenance: a STAT order returning a critical value is CRITICAL, not STAT.
 */
export function classifyNotification(
  order: Pick<Order, 'urgency' | 'fulfillerStatus'>,
  obs: ResultedObservation | undefined,
  options: ClassificationOptions,
): NotificationTag | null {
  // Rejection is the one trigger that doesn't need a result: there will never be one.
  if (order.fulfillerStatus === 'DECLINED') {
    return 'SAMPLE_REJECTED';
  }

  // Only resulted orders notify. A pending STAT order shows nothing until it has a result.
  if (!obs) {
    return null;
  }

  const interpretation = resolveInterpretation(obs);

  // Critical values always notify, regardless of how the test was ordered, and are not
  // configurable off — that is a patient-safety guarantee, not a preference.
  if (isCritical(interpretation)) {
    return 'CRITICAL';
  }

  if (order.urgency === 'STAT') {
    return 'STAT';
  }

  if (options.optedIn) {
    return 'ROUTINE';
  }

  if (options.notifyOnAbnormalNonCritical && interpretation && abnormalInterpretations.includes(interpretation)) {
    return 'ROUTINE';
  }

  return null;
}

/**
 * Builds the notification a resulted (or rejected) order produces, or `null` when it files silently.
 */
export function toNotification(
  order: Order,
  obs: ResultedObservation | undefined,
  options: ClassificationOptions,
): SmartNotification | null {
  const tag = classifyNotification(order, obs, options);
  if (!tag) {
    return null;
  }

  const interpretation = obs ? resolveInterpretation(obs) : undefined;

  return {
    id: `${order.uuid}:${obs?.uuid ?? 'rejected'}`,
    tag,
    patientUuid: order.patient?.uuid,
    conceptUuid: order.concept?.uuid,
    testLabel: obs?.display ?? order.concept?.display ?? order.display,
    panelLabel: obs?.panelDisplay,
    value: obs?.value,
    units: obs?.units ?? obs?.ranges?.units,
    interpretation,
    referenceRangeText: formatReferenceRange(obs?.ranges ?? null, obs?.units),
    orderNumber: order.orderNumber,
    ordererDisplay: order.orderer?.display ?? order.orderer?.person?.display,
    locationUuid: order.encounter?.location?.uuid,
    locationDisplay: order.encounter?.location?.display,
    encounterUuid: order.encounter?.uuid,
    resultDate: obs?.effectiveDateTime ?? order.dateActivated,
    rejectionReason: tag === 'SAMPLE_REJECTED' ? order.fulfillerComment : undefined,
  };
}

/** Most severe first, then most recent first within a tag. */
export function sortNotifications(notifications: Array<SmartNotification>): Array<SmartNotification> {
  return [...notifications].sort((a, b) => {
    const bySeverity = notificationTags.indexOf(a.tag) - notificationTags.indexOf(b.tag);
    if (bySeverity !== 0) {
      return bySeverity;
    }
    return b.resultDate.localeCompare(a.resultDate);
  });
}
