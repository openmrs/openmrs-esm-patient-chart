import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import dayjs from 'dayjs';
import useSWRImmutable from 'swr/immutable';
import { z } from 'zod';
import {
  type FetchResponse,
  openmrsFetch,
  restBaseUrl,
  useConfig,
  useConnectivity,
  useEmrConfiguration,
  useFeatureFlag,
  useSession,
  useVisitTypes,
  type Visit,
} from '@openmrs/esm-framework';
import { time12HourFormatRegex, type amPm } from '@openmrs/esm-patient-common-lib';
import { useDefaultVisitLocation } from '../hooks/useDefaultVisitLocation';
import { useOfflineVisitType } from '../hooks/useOfflineVisitType';
import { type ChartConfig } from '../../config-schema';

export const visitStatuses = ['new', 'ongoing', 'past'] as const;
export type VisitStatus = (typeof visitStatuses)[number];

export type VisitFormData = {
  visitStatus: VisitStatus;
  visitStartDate: Date; // Date object that only contains info for year, month, day
  visitStartTime: string; // hh:mm (note that hh is from 01 to 12, NOT 00 to 23)
  visitStartTimeFormat: amPm;
  visitStopDate: Date; // Date object that only contains info for year, month, day
  visitStopTime: string; // hh:mm (note that hh is from 01 to 12, NOT 00 to 23)
  visitStopTimeFormat: amPm;
  programType: string;
  visitType: string;
  visitLocation: {
    display?: string;
    uuid?: string;
  };
  visitAttributes: {
    [x: string]: string;
  };
};

// *****************
// Copied from form-submission.service.ts
// TODO: consolidate logic for parsing errors from REST API calls
export type FieldError = {
  [key: string]: Array<{ code: string; message: string }>;
};

export type ErrorObject = {
  error: {
    code: string;
    message: string;
    detail: string;
    fieldErrors?: FieldError;
    globalErrors?: Array<{ code: string; message: string }>;
  };
};

export function extractErrorMessagesFromResponse(errorObject: ErrorObject, t: TFunction) {
  const { fieldErrors, globalErrors, message, code } = errorObject?.error ?? {};

  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return Object.values(fieldErrors)
      .flatMap((errors) => errors.map((error) => error.message))
      .join('\n');
  }

  if (globalErrors?.length > 0) {
    return globalErrors.map((error) => error.message).join('\n');
  }

  return message ?? code ?? t('unknownError', 'Unknown error');
}
// *****************

export function useConditionalVisitTypes() {
  const isOnline = useConnectivity();

  const visitTypesHook = isOnline ? useVisitTypes : useOfflineVisitType;

  return visitTypesHook();
}

interface PatientPersonResponse {
  person: {
    birthdate: string | null;
    birthdateEstimated: boolean;
    age: number | null;
  };
}

const patientPersonCustomRep = 'custom:(person:(birthdate,birthdateEstimated,age))';

/**
 * Parses a date string into a local-midnight Date,
 * avoiding timezone drift from `new Date(str)` or dayjs(str).
 * Accepts both 'YYYY-MM-DD' and full ISO datetime strings
 * like '1979-12-08T00:00:00.000+0530' (as returned by the REST API).
 */
function parseLocalDate(dateStr: string): Date | null {
  const datePart = dateStr.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) {
    return null;
  }
  const [y, m, d] = parts.map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Computes the earliest allowed visit start date based on the patient's birthdate.
 * For estimated birthdates, a grace period shifts the boundary earlier,
 * matching the backend's VisitValidator logic.
 */
export function computeEarliestAllowedStartDate(
  birthdate: string | null,
  birthdateEstimated: boolean,
  age: number | null,
): Date | null {
  if (!birthdate) {
    return null;
  }

  const earliest = parseLocalDate(birthdate);
  if (!earliest) {
    return null;
  }

  // When the birthdate is estimated, the backend's VisitValidator applies a grace period
  // that shifts the earliest allowed date further into the past. The grace is half the
  // patient's age (in years), with a minimum of 1 year.
  // @see https://github.com/openmrs/openmrs-core/blob/master/api/src/main/java/org/openmrs/validator/VisitValidator.java
  if (birthdateEstimated && age != null) {
    const graceYears = Math.max(1, Math.floor(age * 0.5));
    earliest.setFullYear(earliest.getFullYear() - graceYears);
  }

  return earliest;
}

// We need a separate REST call here because the FHIR Patient resource doesn't
// include `birthdateEstimated` or `age`, which are required for the grace period
// calculation. The FHIR patient's `birthDate` alone isn't sufficient.
export function useEarliestAllowedVisitStartDate(patientUuid: string) {
  const { data, isLoading } = useSWRImmutable<FetchResponse<PatientPersonResponse>>(
    `${restBaseUrl}/patient/${patientUuid}?v=${patientPersonCustomRep}`,
    openmrsFetch,
  );

  const earliestAllowedStartDate = useMemo(() => {
    if (!data?.data?.person) {
      return null;
    }
    const { birthdate, birthdateEstimated, age } = data.data.person;
    return computeEarliestAllowedStartDate(birthdate, birthdateEstimated, age);
  }, [data]);

  return { earliestAllowedStartDate, isLoading };
}

export function useAllowOverlappingVisits() {
  const isOnline = useConnectivity();
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<{ value: string }>>(
    isOnline ? `${restBaseUrl}/systemsetting/visits.allowOverlappingVisits?v=custom:(value)` : null,
    openmrsFetch,
  );
  return {
    allowOverlappingVisits: error || !data ? true : (data.data.value ?? 'true').toLowerCase() === 'true',
    isLoading,
  };
}

export interface VisitFormCallbacks {
  onVisitCreatedOrUpdated: (visit: Visit) => Promise<any>;
}

export function useVisitFormCallbacks() {
  return useState<Map<string, VisitFormCallbacks>>(new Map());
}

export function createVisitAttribute(visitUuid: string, attributeType: string, value: string) {
  return openmrsFetch(`${restBaseUrl}/visit/${visitUuid}/attribute`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: { attributeType, value },
  });
}

export function updateVisitAttribute(visitUuid: string, visitAttributeUuid: string, value: string) {
  return openmrsFetch(`${restBaseUrl}/visit/${visitUuid}/attribute/${visitAttributeUuid}`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: { value },
  });
}

export function deleteVisitAttribute(visitUuid: string, visitAttributeUuid: string) {
  return openmrsFetch(`${restBaseUrl}/visit/${visitUuid}/attribute/${visitAttributeUuid}`, {
    method: 'DELETE',
  });
}

export function useVisitFormSchemaAndDefaultValues(visitToEdit: Visit, earliestAllowedStartDate?: Date | null) {
  const { t } = useTranslation();
  const { visitAttributeTypes, restrictByVisitLocationTag } = useConfig<ChartConfig>();
  const isEmrApiModuleInstalled = useFeatureFlag('emrapi-module');
  const sessionUser = useSession();
  const sessionLocation = sessionUser?.sessionLocation;
  const defaultVisitLocation = useDefaultVisitLocation(
    sessionLocation,
    restrictByVisitLocationTag && isEmrApiModuleInstalled,
  );
  const { emrConfiguration } = useEmrConfiguration();

  return useMemo(() => {
    const now = new Date();

    const allEncounterDateTimes = (visitToEdit?.encounters ?? []).map(({ encounterDatetime }) =>
      Date.parse(encounterDatetime),
    );

    const firstEncounterDateTime: number = Math.min(...allEncounterDateTimes);
    const lastEncounterDateTime: number = Math.max(...allEncounterDateTimes);

    const startDateTime = convertToDateTimeFields(visitToEdit?.startDatetime ?? now);
    const stopDateTime = convertToDateTimeFields(visitToEdit?.stopDatetime ?? now);

    const visitStatus: VisitStatus =
      visitToEdit == null ? 'new' : visitToEdit.stopDatetime === null ? 'ongoing' : 'past';

    const defaultValues: Partial<VisitFormData> = {
      visitStatus,
      visitStartDate: startDateTime.date,
      visitStartTime: startDateTime.time,
      visitStartTimeFormat: startDateTime.timeFormat,
      visitStopDate: stopDateTime.date,
      visitStopTime: stopDateTime.time,
      visitStopTimeFormat: stopDateTime.timeFormat,
      visitType: visitToEdit?.visitType?.uuid ?? emrConfiguration?.atFacilityVisitType?.uuid,
      visitLocation: visitToEdit?.location ?? defaultVisitLocation ?? {},
      visitAttributes:
        visitToEdit?.attributes.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.attributeType.uuid]: typeof curr.value === 'object' ? curr?.value?.uuid : `${curr.value ?? ''}`,
          }),
          {},
        ) ?? {},
    };

    const visitAttributes = (visitAttributeTypes ?? [])?.reduce(
      (acc, { uuid, required }) => ({
        ...acc,
        [uuid]: required
          ? z.string({ required_error: t('fieldRequired', 'This field is required') })
          : z.string().optional(),
      }),
      {},
    );

    const visitStatusEnum = z.enum(visitStatuses);
    const visitFormSchema = z
      .object({
        visitStatus: visitToEdit ? visitStatusEnum.exclude(['new']) : visitStatusEnum,
        visitStartDate: z.date().optional(),
        visitStartTime: z.string().regex(time12HourFormatRegex).optional(),
        visitStartTimeFormat: z.enum(['PM', 'AM']).optional(),
        visitStopDate: z.date().optional(),
        visitStopTime: z.string().regex(time12HourFormatRegex).optional(),
        visitStopTimeFormat: z.enum(['PM', 'AM']).optional(),
        programType: z.string().optional(),
        visitType: z.string({ required_error: t('visitTypeRequired', 'Visit type is required') }),
        visitLocation: z.object({
          display: z.string(),
          uuid: z.string({ required_error: t('visitLocationRequired', 'Visit location is required') }),
        }),
        visitAttributes: z.object(visitAttributes),
      })
      .superRefine((data, ctx) => {
        const {
          visitStatus,
          visitStartDate,
          visitStartTime,
          visitStartTimeFormat,
          visitStopDate,
          visitStopTime,
          visitStopTimeFormat,
        } = data;

        const visitStartDateTime = convertToDate(visitStartDate, visitStartTime, visitStartTimeFormat);
        const visitStopDateTime = convertToDate(visitStopDate, visitStopTime, visitStopTimeFormat);

        if (visitStatus === 'ongoing' || visitStatus === 'past') {
          if (visitStartDateTime === null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('visitStartDateTimeRequired', 'Start date and time are required'),
              path: ['visitStartDate'],
            });
          } else if (earliestAllowedStartDate && visitStartDateTime < earliestAllowedStartDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('visitStartDateBeforeBirthdate', "Start date cannot be before the patient's birth date"),
              path: ['visitStartDate'],
            });
          } else if (visitStartDateTime > now) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('futureStartTime', 'Start time cannot be in the future'),
              path: ['visitStartTime'],
            });
          } else if (visitStartDateTime.getTime() > firstEncounterDateTime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                'visitStartDateMustBeBeforeEarliestEncounter',
                'Start time must be on or before {{firstEncounterDatetime}}',
                {
                  firstEncounterDatetime: new Date(firstEncounterDateTime).toLocaleString(),
                  interpolation: {
                    escapeValue: false,
                  },
                },
              ),
              path: ['visitStartTime'],
            });
          }
        }

        if (visitStatus === 'past') {
          if (visitStopDateTime === null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('endDateTimeRequired', 'End date and time are required'),
              path: ['visitStopDate'],
            });
          } else if (visitStopDateTime > now) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('futureEndTime', 'End time cannot be in the future'),
              path: ['visitStopTime'],
            });
          } else if (visitStopDateTime < visitStartDateTime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('endTimeMustBeAfterStartTime', 'End time must be after start time'),
              path: ['visitStopDate'],
            });
          } else if (visitStopDateTime.getTime() < lastEncounterDateTime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                'endTimeMustBeAfterMostRecentEncounter',
                'End time must be on or after {{lastEncounterDatetime}}',
                {
                  lastEncounterDatetime: new Date(lastEncounterDateTime).toLocaleString(),
                  interpolation: {
                    escapeValue: false,
                  },
                },
              ),
              path: ['visitStopTime'],
            });
          }
        }
      });

    return { visitFormSchema, defaultValues, firstEncounterDateTime, lastEncounterDateTime };
  }, [t, visitAttributeTypes, visitToEdit, defaultVisitLocation, emrConfiguration, earliestAllowedStartDate]);
}

// Returns a Date object based on date, time and am/pm inputs from user.
// Note that the inputs are expected to be in local time.
// Returns a non-null Date only is the inputs are valid
export const convertToDate = (
  date: Date, // Date object that only contains info for year, month, day
  time12h: string, // hh:mm, where hh is 01 to 12
  timeFormat: amPm, // AM / PM
): Date | null => {
  if (!date || !time12h || !timeFormat) {
    return null;
  }
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  const ret = dayjs(`${dateStr} ${time12h} ${timeFormat}`, 'YYYY-MM-DD hh:mm A');
  return ret.isValid() ? ret.toDate() : null;
};

// The inverse of `convertToDate`. Takes a Date-like value and returns
// the date (with hour / minute / seconds truncated), time12h and timeFormat
export const convertToDateTimeFields = (dateTime: dayjs.ConfigType) => {
  const dateTimeDayjs = dayjs(dateTime);
  return {
    date: dateTimeDayjs.startOf('day').toDate(),
    time: dateTimeDayjs.format('hh:mm'),
    timeFormat: dateTimeDayjs.format('A') as amPm,
  };
};
