import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import dayjs from 'dayjs';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  openmrsFetch,
  restBaseUrl,
  useConfig,
  useConnectivity,
  useEmrConfiguration,
  useFeatureFlag,
  useSession,
  useVisitTypes,
  type Visit,
  type FetchResponse,
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
    globalErrors?: FieldError;
  };
};

export function extractErrorMessagesFromResponse(errorObject: ErrorObject, t: TFunction) {
  const {
    error: { fieldErrors, globalErrors, message, code },
  } = errorObject ?? {};

  if (fieldErrors) {
    return Object.values(fieldErrors)
      .flatMap((errors) => errors.map((error) => error.message))
      .join('\n');
  }

  if (globalErrors) {
    return Object.values(globalErrors)
      .flatMap((errors) => errors.map((error) => error.message))
      .join('\n');
  }

  return message ?? code ?? t('unknownError', 'Unknown error');
}
// *****************

export function useConditionalVisitTypes() {
  const isOnline = useConnectivity();

  const visitTypesHook = isOnline ? useVisitTypes : useOfflineVisitType;

  return visitTypesHook();
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

export async function findOverlappingVisits(
  patientUuid: string,
  visitStartDateTime: Date | null,
  visitStopDateTime: Date | null,
  currentVisitUuid?: string,
): Promise<Array<Visit>> {
  if (!visitStartDateTime) {
    return [];
  }

  const params = new URLSearchParams({
    patient: patientUuid,
    v: 'custom:(uuid,startDatetime,stopDatetime,visitType:(uuid,name,display))',
    toStartDate: (visitStopDateTime || new Date()).toISOString(),
    fromStopDate: visitStartDateTime.toISOString(),
  });

  const response: FetchResponse<{ results: Array<Visit> }> = await openmrsFetch(
    `${restBaseUrl}/visit?${params.toString()}`,
  );

  return response.data.results.filter((visit) => visit.uuid !== currentVisitUuid);
}

export function useVisitFormSchemaAndDefaultValues(visitToEdit: Visit) {
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
  }, [t, visitAttributeTypes, visitToEdit, defaultVisitLocation, emrConfiguration]);
}

export function createVisitFormResolver(
  visitFormSchema: z.ZodSchema,
  patientUuid: string | undefined,
  visitToEdit: Visit | null,
  t: TFunction,
) {
  return async (data, context, options) => {
    const zodResult = await zodResolver(visitFormSchema)(data, context, options);

    if (zodResult.errors && Object.keys(zodResult.errors).length > 0) {
      return zodResult;
    }

    const {
      visitStatus,
      visitStartDate,
      visitStartTime,
      visitStartTimeFormat,
      visitStopDate,
      visitStopTime,
      visitStopTimeFormat,
    } = data;

    if (patientUuid && (visitStatus === 'ongoing' || visitStatus === 'past')) {
      const visitStartDateTime = convertToDate(visitStartDate, visitStartTime, visitStartTimeFormat);
      const visitStopDateTime = convertToDate(visitStopDate, visitStopTime, visitStopTimeFormat);

      // Skip overlap check if editing an existing visit and dates haven't changed
      if (visitToEdit) {
        const existingStart = visitToEdit.startDatetime ? new Date(visitToEdit.startDatetime) : null;
        const existingStop = visitToEdit.stopDatetime ? new Date(visitToEdit.stopDatetime) : null;

        const datesUnchanged =
          existingStart &&
          visitStartDateTime &&
          existingStart.getTime() === visitStartDateTime.getTime() &&
          ((existingStop === null && visitStopDateTime === null) ||
            (existingStop && visitStopDateTime && existingStop.getTime() === visitStopDateTime.getTime()));

        if (datesUnchanged) {
          return zodResult;
        }
      }

      if (visitStartDateTime !== null) {
        try {
          const overlappingVisits = await findOverlappingVisits(
            patientUuid,
            visitStartDateTime,
            visitStopDateTime,
            visitToEdit?.uuid,
          );

          if (overlappingVisits.length > 0) {
            const overlappingVisit = overlappingVisits[0];
            const overlapStart = overlappingVisit.startDatetime
              ? new Date(overlappingVisit.startDatetime).toLocaleString()
              : t('unknown', 'Unknown');
            const overlapEnd = overlappingVisit.stopDatetime
              ? new Date(overlappingVisit.stopDatetime).toLocaleString()
              : t('ongoing', 'Ongoing');
            const visitTypeName = overlappingVisit.visitType?.display || t('visit', 'Visit');

            return {
              values: {},
              errors: {
                visitStartDate: {
                  type: 'custom',
                  message: t(
                    'visitOverlapsWithExisting',
                    'This visit overlaps with an existing {{visitType}} from {{startDate}} to {{endDate}}',
                    {
                      visitType: visitTypeName,
                      startDate: overlapStart,
                      endDate: overlapEnd,
                      interpolation: {
                        escapeValue: false,
                      },
                    },
                  ),
                },
              },
            };
          }
        } catch (error) {
          console.error('Failed to check for overlapping visits:', error);
        }
      }
    }

    return zodResult;
  };
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
