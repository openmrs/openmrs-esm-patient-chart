import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
  Button,
  ButtonSet,
  ContentSwitcher,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  Row,
  Stack,
  Switch,
} from '@carbon/react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ExtensionSlot,
  formatDatetime,
  type NewVisitPayload,
  openmrsFetch,
  restBaseUrl,
  saveVisit,
  showSnackbar,
  toDateObjectStrict,
  toOmrsIsoString,
  updateVisit,
  useConfig,
  useConnectivity,
  useLayoutType,
  usePatient,
  useSession,
  useVisit,
  useVisitTypes,
  type Visit,
} from '@openmrs/esm-framework';
import {
  convertTime12to24,
  createOfflineVisitForPatient,
  type DefaultPatientWorkspaceProps,
  time12HourFormatRegex,
  useActivePatientEnrollment,
} from '@openmrs/esm-patient-common-lib';
import { type ChartConfig } from '../../config-schema';
import { type VisitFormData } from './visit-form.resource';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import { saveQueueEntry } from '../hooks/useServiceQueue';
import { updateAppointmentStatus } from '../hooks/useUpcomingAppointments';
import { useLocations } from '../hooks/useLocations';
import { useMutateAppointments } from '../hooks/useMutateAppointments';
import { useOfflineVisitType } from '../hooks/useOfflineVisitType';
import { useVisitAttributeTypes } from '../hooks/useVisitAttributeType';
import { useVisitQueueEntry } from '../queue-entry/queue.resource';
import { useInfiniteVisits, useVisits } from '../visits-widget/visit.resource';
import BaseVisitType from './base-visit-type.component';
import LocationSelector from './location-selector.component';
import VisitAttributeTypeFields from './visit-attribute-type.component';
import VisitDateTimeField from './visit-date-time.component';
import styles from './visit-form.scss';

dayjs.extend(isSameOrBefore);

interface StartVisitFormProps extends DefaultPatientWorkspaceProps {
  showPatientHeader?: boolean;
  showVisitEndDateTimeFields: boolean;
  visitToEdit?: Visit;
}

const StartVisitForm: React.FC<StartVisitFormProps> = ({
  closeWorkspace,
  patientUuid: initialPatientUuid,
  promptBeforeClosing,
  showPatientHeader = false,
  showVisitEndDateTimeFields,
  visitToEdit,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const isOnline = useConnectivity();
  const sessionUser = useSession();
  const { error } = useLocations();
  const errorFetchingLocations = isOnline ? error : false;
  const sessionLocation = sessionUser?.sessionLocation;
  const config = useConfig() as ChartConfig;
  const { patientUuid, patient } = usePatient(initialPatientUuid);
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visitHeaderSlotState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const { mutateVisits } = useVisits(patientUuid);
  const { mutateVisits: mutateInfiniteVisits } = useInfiniteVisits(patientUuid);
  const { mutateAppointments } = useMutateAppointments();
  const allVisitTypes = useConditionalVisitTypes();

  const { mutate } = useVisit(patientUuid);
  const [errorFetchingResources, setErrorFetchingResources] = useState<{
    blockSavingForm: boolean;
  }>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const upcomingAppointmentState = useMemo(() => ({ patientUuid, setUpcomingAppointment }), [patientUuid]);
  const visitQueueNumberAttributeUuid = config.visitQueueNumberAttributeUuid;
  const [visitUuid, setVisitUuid] = useState('');
  const { mutate: mutateQueueEntry } = useVisitQueueEntry(patientUuid, visitUuid);
  const { visitAttributeTypes } = useVisitAttributeTypes();
  const [extraVisitInfo, setExtraVisitInfo] = useState(null);
  const [{ service, priority, status, sortWeight, queueLocation }, setVisitFormFields] = useState({
    service: null,
    priority: null,
    status: null,
    sortWeight: null,
    queueLocation: null,
  });

  const displayVisitStopDateTimeFields = useMemo(
    () => Boolean(visitToEdit?.uuid || showVisitEndDateTimeFields),
    [visitToEdit?.uuid, showVisitEndDateTimeFields],
  );

  const visitFormSchema = useMemo(() => {
    const createVisitAttributeSchema = (required: boolean) =>
      required
        ? z.string({
            required_error: t('fieldRequired', 'This field is required'),
          })
        : z.string().optional();

    const visitAttributes = (config.visitAttributeTypes ?? [])?.reduce(
      (acc, { uuid, required }) => ({
        ...acc,
        [uuid]: createVisitAttributeSchema(required),
      }),
      {},
    );

    // Validates that the start time is not in the future
    const validateStartTime = (data: z.infer<typeof visitFormSchema>) => {
      const [visitStartHours, visitStartMinutes] = convertTime12to24(data.visitStartTime, data.visitStartTimeFormat);
      const visitStartDatetime = new Date(data.visitStartDate).setHours(visitStartHours, visitStartMinutes);
      return new Date(visitStartDatetime) <= new Date();
    };

    return z
      .object({
        visitStartDate: z.date().refine(
          (value) => {
            const today = dayjs();
            const startDate = dayjs(value);
            return displayVisitStopDateTimeFields ? true : startDate.isSameOrBefore(today, 'day');
          },
          t('invalidVisitStartDate', 'Start date needs to be on or before {{firstEncounterDatetime}}', {
            firstEncounterDatetime: formatDatetime(new Date()),
            interpolation: {
              escapeValue: false,
            },
          }),
        ),
        visitStartTime: z
          .string()
          .refine((value) => value.match(time12HourFormatRegex), t('invalidTimeFormat', 'Invalid time format')),
        visitStartTimeFormat: z.enum(['PM', 'AM']),
        visitStopDate: displayVisitStopDateTimeFields ? z.date() : z.date().optional(),
        visitStopTime: displayVisitStopDateTimeFields
          ? z
              .string()
              .refine((value) => value.match(time12HourFormatRegex), t('invalidTimeFormat', 'Invalid time format'))
          : z.string().optional(),
        visitStopTimeFormat: displayVisitStopDateTimeFields ? z.enum(['PM', 'AM']) : z.enum(['PM', 'AM']).optional(),
        programType: z.string().optional(),
        visitType: z.string().refine((value) => !!value, t('visitTypeRequired', 'Visit type is required')),
        visitLocation: z.object({
          display: z.string(),
          uuid: z.string(),
        }),
        visitAttributes: z.object(visitAttributes),
      })
      .refine((data) => validateStartTime(data), {
        message: t('futureStartTime', 'Visit start time cannot be in the future'),
        path: ['visitStartTime'],
      });
  }, [t, config, displayVisitStopDateTimeFields]);

  const defaultValues = useMemo(() => {
    const visitStartDate = visitToEdit?.startDatetime ? new Date(visitToEdit?.startDatetime) : new Date();
    const visitStopDate = visitToEdit?.stopDatetime ? new Date(visitToEdit?.stopDatetime) : null;

    let defaultValues: Partial<VisitFormData> = {
      visitStartDate,
      visitStartTime: dayjs(visitStartDate).format('hh:mm'),
      visitStartTimeFormat: visitStartDate.getHours() >= 12 ? 'PM' : 'AM',

      visitType: visitToEdit?.visitType?.uuid,
      visitLocation: visitToEdit?.location ?? sessionLocation ?? {},
      visitAttributes:
        visitToEdit?.attributes.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.attributeType.uuid]: typeof curr.value === 'object' ? curr?.value?.uuid : `${curr.value ?? ''}`,
          }),
          {},
        ) ?? {},
    };

    if (visitStopDate) {
      defaultValues = {
        ...defaultValues,
        visitStopDate,
        visitStopTime: dayjs(visitStopDate).format('hh:mm'),
        visitStopTimeFormat: visitStopDate.getHours() >= 12 ? 'PM' : 'AM',
      };
    }

    return defaultValues;
  }, [visitToEdit, sessionLocation]);

  const methods = useForm<VisitFormData>({
    mode: 'all',
    resolver: zodResolver(visitFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors, isDirty },
    setError,
  } = methods;

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  let [maxVisitStartDatetime, minVisitStopDatetime] = useMemo(() => {
    if (!visitToEdit?.encounters?.length) {
      return [null, null];
    }

    const allEncountersDateTime = visitToEdit?.encounters?.map(({ encounterDatetime }) =>
      Date.parse(encounterDatetime),
    );
    const maxVisitStartDatetime = Math.min(...allEncountersDateTime);
    const minVisitStopDatetime = Math.max(...allEncountersDateTime);
    return [maxVisitStartDatetime, minVisitStopDatetime];
  }, [visitToEdit]);

  const validateVisitStartStopDatetime = useCallback(() => {
    let visitStartDate = getValues('visitStartDate');
    const visitStartTime = getValues('visitStartTime');
    const visitStartTimeFormat = getValues('visitStartTimeFormat');

    const [visitStartHours, visitStartMinutes] = convertTime12to24(visitStartTime, visitStartTimeFormat);

    const visitStartDatetime = visitStartDate.setHours(visitStartHours, visitStartMinutes);

    let validSubmission = true;

    if (maxVisitStartDatetime && visitStartDatetime >= maxVisitStartDatetime) {
      validSubmission = false;
      setError('visitStartDate', {
        message: t('invalidVisitStartDate', 'Start date needs to be on or before {{firstEncounterDatetime}}', {
          firstEncounterDatetime: new Date(maxVisitStartDatetime).toLocaleString(),
          interpolation: {
            escapeValue: false,
          },
        }),
      });
    }

    if (!displayVisitStopDateTimeFields) {
      return validSubmission;
    }

    let visitStopDate = getValues('visitStopDate');
    const visitStopTime = getValues('visitStopTime');
    const visitStopTimeFormat = getValues('visitStopTimeFormat');

    if (visitStopDate && visitStopTime && visitStopTimeFormat) {
      const [visitStopHours, visitStopMinutes] = convertTime12to24(visitStopTime, visitStopTimeFormat);

      const visitStopDatetime = visitStopDate.setHours(visitStopHours, visitStopMinutes);

      if (minVisitStopDatetime && visitStopDatetime <= minVisitStopDatetime) {
        validSubmission = false;
        setError('visitStopDate', {
          message: t(
            'visitStopDateMustBeAfterMostRecentEncounter',
            'Stop date needs to be on or after {{lastEncounterDatetime}}',
            {
              lastEncounterDatetime: new Date(minVisitStopDatetime).toLocaleString(),
              interpolation: {
                escapeValue: false,
              },
            },
          ),
        });
      }

      if (visitStartDatetime >= visitStopDatetime) {
        validSubmission = false;
        setError('visitStopDate', {
          message: t('invalidVisitStopDate', 'Visit stop date time cannot be on or before visit start date time'),
        });
      }
    }

    return validSubmission;
  }, [displayVisitStopDateTimeFields, getValues, maxVisitStartDatetime, minVisitStopDatetime, setError, t]);

  const handleVisitAttributes = useCallback(
    (visitAttributes: { [p: string]: string }, visitUuid: string) => {
      const existingVisitAttributeTypes =
        visitToEdit?.attributes?.map((attribute) => attribute.attributeType.uuid) || [];

      const promises = [];

      for (const [attributeType, value] of Object.entries(visitAttributes)) {
        if (attributeType && existingVisitAttributeTypes.includes(attributeType)) {
          const attributeToEdit = visitToEdit.attributes.find((attr) => attr.attributeType.uuid === attributeType);

          if (attributeToEdit) {
            // continue to next attribute if the previous value is same as new value
            const isSameValue =
              typeof attributeToEdit.value === 'object'
                ? attributeToEdit.value.uuid === value
                : attributeToEdit.value === value;

            if (isSameValue) {
              continue;
            }

            if (value) {
              // Update attribute with new value
              promises.push(
                openmrsFetch(`${restBaseUrl}/visit/${visitUuid}/attribute/${attributeToEdit.uuid}`, {
                  method: 'POST',
                  headers: { 'Content-type': 'application/json' },
                  body: { value },
                }).catch((err) => {
                  showSnackbar({
                    title: t('errorUpdatingVisitAttribute', 'Error updating the {{attributeName}} visit attribute', {
                      attributeName: attributeToEdit.attributeType.display,
                    }),
                    kind: 'error',
                    isLowContrast: false,
                    subtitle: err?.message,
                  });
                }),
              );
            } else {
              // Delete attribute if no value is provided
              promises.push(
                openmrsFetch(`${restBaseUrl}/visit/${visitUuid}/attribute/${attributeToEdit.uuid}`, {
                  method: 'DELETE',
                }).catch((err) => {
                  showSnackbar({
                    title: t('errorDeletingVisitAttribute', 'Error deleting the {{attributeName}} visit attribute', {
                      attributeName: attributeToEdit.attributeType.display,
                    }),
                    kind: 'error',
                    isLowContrast: false,
                    subtitle: err?.message,
                  });
                }),
              );
            }
          }
        } else {
          if (value) {
            promises.push(
              openmrsFetch(`${restBaseUrl}/visit/${visitUuid}/attribute`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: { attributeType, value },
              }).catch((err) => {
                showSnackbar({
                  title: t('errorCreatingVisitAttribute', 'Error creating the {{attributeName}} visit attribute', {
                    attributeName: visitAttributeTypes?.find((type) => type.uuid === attributeType)?.display,
                  }),
                  kind: 'error',
                  isLowContrast: false,
                  subtitle: err?.message,
                });
              }),
            );
          }
        }
      }

      return Promise.all(promises);
    },
    [visitToEdit, t, visitAttributeTypes],
  );

  const onSubmit = useCallback(
    (data: VisitFormData) => {
      if (visitToEdit && !validateVisitStartStopDatetime()) {
        return;
      }

      const {
        visitStartTimeFormat,
        visitStartDate,
        visitLocation,
        visitStartTime,
        visitType,
        visitAttributes,
        visitStopDate,
        visitStopTime,
        visitStopTimeFormat,
      } = data;

      setIsSubmitting(true);

      const [hours, minutes] = convertTime12to24(visitStartTime, visitStartTimeFormat);

      let payload: NewVisitPayload = {
        patient: patientUuid,
        startDatetime: toDateObjectStrict(
          toOmrsIsoString(
            new Date(
              dayjs(visitStartDate).year(),
              dayjs(visitStartDate).month(),
              dayjs(visitStartDate).date(),
              hours,
              minutes,
            ),
          ),
        ),
        visitType: visitType,
        location: visitLocation?.uuid,
      };

      if (visitToEdit?.uuid) {
        // The request throws 400 (Bad request) error when the patient is passed in the update payload
        delete payload.patient;
      }

      if (displayVisitStopDateTimeFields && visitStopDate && visitStopTime && visitStopTimeFormat) {
        const [visitStopHours, visitStopMinutes] = convertTime12to24(visitStopTime, visitStopTimeFormat);

        payload.stopDatetime = toDateObjectStrict(
          toOmrsIsoString(
            new Date(
              dayjs(visitStopDate).year(),
              dayjs(visitStopDate).month(),
              dayjs(visitStopDate).date(),
              visitStopHours,
              visitStopMinutes,
            ),
          ),
        );
      }

      const abortController = new AbortController();

      if (config.showExtraVisitAttributesSlot) {
        const { handleCreateExtraVisitInfo, attributes } = extraVisitInfo ?? {};
        if (!payload.attributes) {
          payload.attributes = [];
        }
        payload.attributes.push(...attributes);
        handleCreateExtraVisitInfo && handleCreateExtraVisitInfo();
      }

      if (isOnline) {
        (visitToEdit?.uuid
          ? updateVisit(visitToEdit?.uuid, payload, abortController)
          : saveVisit(payload, abortController)
        )
          .pipe(first())
          .subscribe({
            next: (response) => {
              if (config.showServiceQueueFields && queueLocation && service && priority) {
                // retrieve values from the queue extension
                setVisitUuid(response.data.uuid);

                saveQueueEntry(
                  response.data.uuid,
                  service,
                  patientUuid,
                  priority,
                  status,
                  sortWeight,
                  queueLocation,
                  visitQueueNumberAttributeUuid,
                  abortController,
                ).then(
                  ({ status }) => {
                    mutateCurrentVisit();
                    mutateVisits();
                    mutateInfiniteVisits();
                    mutateQueueEntry();
                    showSnackbar({
                      kind: 'success',
                      title: t('visitStarted', 'Visit started'),
                      subtitle: t('queueAddedSuccessfully', `Patient added to the queue successfully.`),
                    });
                  },
                  (error) => {
                    showSnackbar({
                      title: t('queueEntryError', 'Error adding patient to the queue'),
                      kind: 'error',
                      isLowContrast: false,
                      subtitle: error?.message,
                    });
                  },
                );

                if (config.showUpcomingAppointments && upcomingAppointment) {
                  updateAppointmentStatus('CheckedIn', upcomingAppointment.uuid, abortController).then(
                    () => {
                      mutateCurrentVisit();
                      mutateVisits();
                      mutateInfiniteVisits();
                      mutateAppointments();
                      showSnackbar({
                        isLowContrast: true,
                        kind: 'success',
                        subtitle: t('appointmentMarkedChecked', 'Appointment marked as Checked In'),
                        title: t('appointmentCheckedIn', 'Appointment Checked In'),
                      });
                    },
                    (error) => {
                      showSnackbar({
                        title: t('updateError', 'Error updating upcoming appointment'),
                        kind: 'error',
                        isLowContrast: false,
                        subtitle: error?.message,
                      });
                    },
                  );
                }
              }

              from(handleVisitAttributes(visitAttributes, response.data.uuid))
                .pipe(first())
                .subscribe({
                  next: (attributesResponses) => {
                    setIsSubmitting(false);
                    // Check for no undefined,
                    // that if there was no failed requests on either creating, updating or deleting an attribute
                    // then continue and close workspace
                    if (!attributesResponses.includes(undefined)) {
                      mutateCurrentVisit();
                      mutateVisits();
                      mutateInfiniteVisits();
                      closeWorkspace({ ignoreChanges: true });
                      showSnackbar({
                        isLowContrast: true,
                        kind: 'success',
                        subtitle: !visitToEdit
                          ? t('visitStartedSuccessfully', '{{visit}} started successfully', {
                              visit: response?.data?.visitType?.display ?? t('visit', 'Visit'),
                            })
                          : t('visitDetailsUpdatedSuccessfully', '{{visit}} updated successfully', {
                              visit: response?.data?.visitType?.display ?? t('pastVisit', 'Past visit'),
                            }),
                        title: !visitToEdit
                          ? t('visitStarted', 'Visit started')
                          : t('visitDetailsUpdated', 'Visit details updated'),
                      });
                    }
                  },
                  error: (error) => {
                    showSnackbar({
                      title: !visitToEdit
                        ? t('startVisitError', 'Error starting visit')
                        : t('errorUpdatingVisitDetails', 'Error updating visit details'),
                      kind: 'error',
                      isLowContrast: false,
                      subtitle: error?.message,
                    });
                  },
                });
            },
            error: (error) => {
              showSnackbar({
                title: !visitToEdit
                  ? t('startVisitError', 'Error starting visit')
                  : t('errorUpdatingVisitDetails', 'Error updating visit details'),
                kind: 'error',
                isLowContrast: false,
                subtitle: error?.message,
              });
            },
          });
      } else {
        createOfflineVisitForPatient(
          patientUuid,
          visitLocation.uuid,
          config.offlineVisitTypeUuid,
          payload.startDatetime,
        ).then(
          () => {
            mutate();
            closeWorkspace({ ignoreChanges: true });
            showSnackbar({
              isLowContrast: true,
              kind: 'success',
              subtitle: t('visitStartedSuccessfully', '{{visit}} started successfully', {
                visit: t('offlineVisit', 'Offline Visit'),
              }),
              title: t('visitStarted', 'Visit started'),
            });
          },
          (error: Error) => {
            showSnackbar({
              title: t('startVisitError', 'Error starting visit'),
              kind: 'error',
              isLowContrast: false,
              subtitle: error?.message,
            });
          },
        );
        return;
      }
    },
    [
      closeWorkspace,
      config.offlineVisitTypeUuid,
      config.showExtraVisitAttributesSlot,
      config.showServiceQueueFields,
      config.showUpcomingAppointments,
      displayVisitStopDateTimeFields,
      extraVisitInfo,
      handleVisitAttributes,
      isOnline,
      mutate,
      mutateAppointments,
      mutateCurrentVisit,
      mutateQueueEntry,
      mutateVisits,
      mutateInfiniteVisits,
      patientUuid,
      priority,
      queueLocation,
      service,
      sortWeight,
      status,
      t,
      upcomingAppointment,
      validateVisitStartStopDatetime,
      visitQueueNumberAttributeUuid,
      visitToEdit,
    ],
  );

  const visitStartDate = getValues('visitStartDate') ?? new Date();
  minVisitStopDatetime = minVisitStopDatetime ?? Date.parse(visitStartDate.toLocaleString());
  const minVisitStopDatetimeFallback = Date.parse(visitStartDate.toLocaleString());
  minVisitStopDatetime = minVisitStopDatetime || minVisitStopDatetimeFallback;

  useEffect(() => {
    if (errorFetchingLocations) {
      setErrorFetchingResources((prev) => ({
        blockSavingForm: prev?.blockSavingForm || false,
      }));
    }
  }, [errorFetchingLocations]);

  return (
    <FormProvider {...methods}>
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)} data-openmrs-role="Start Visit Form">
        {showPatientHeader && patient && (
          <ExtensionSlot
            name="patient-header-slot"
            state={{
              patient,
              patientUuid: patientUuid,
              hideActionsOverflow: true,
            }}
          />
        )}
        {errorFetchingResources && (
          <InlineNotification
            kind={errorFetchingResources?.blockSavingForm ? 'error' : 'warning'}
            lowContrast
            className={styles.inlineNotification}
            title={t('partOfFormDidntLoad', 'Part of the form did not load')}
            subtitle={t('refreshToTryAgain', 'Please refresh to try again')}
          />
        )}
        <div>
          {isTablet && (
            <Row className={styles.headerGridRow}>
              <ExtensionSlot
                name="visit-form-header-slot"
                className={styles.dataGridRow}
                state={visitHeaderSlotState}
              />
            </Row>
          )}
          <Stack gap={1} className={styles.container}>
            <VisitDateTimeField
              dateFieldName="visitStartDate"
              maxDate={maxVisitStartDatetime}
              timeFieldName="visitStartTime"
              timeFormatFieldName="visitStartTimeFormat"
              visitDatetimeLabel={t('visitStartDatetime', 'Visit start date and time')}
            />

            {displayVisitStopDateTimeFields && (
              <VisitDateTimeField
                dateFieldName="visitStopDate"
                minDate={minVisitStopDatetime}
                timeFieldName="visitStopTime"
                timeFormatFieldName="visitStopTimeFormat"
                visitDatetimeLabel={t('visitStopDatetime', 'Visit stop date and time')}
              />
            )}

            {/* Upcoming appointments. This get shown when upcoming appointments are configured */}
            {config.showUpcomingAppointments && (
              <section>
                <div className={styles.sectionTitle}></div>
                <div className={styles.sectionField}>
                  <ExtensionSlot state={upcomingAppointmentState} name="upcoming-appointment-slot" />
                </div>
              </section>
            )}

            {/* This field lets the user select a location for the visit. The location is required for the visit to be saved. Defaults to the active session location */}
            <LocationSelector control={control} />

            {/* Lists available program types. This feature is dependent on the `showRecommendedVisitTypeTab` config being set
          to true. */}
            {config.showRecommendedVisitTypeTab && (
              <section>
                <div className={styles.sectionTitle}>{t('program', 'Program')}</div>
                <FormGroup legendText={t('selectProgramType', 'Select program type')} className={styles.sectionField}>
                  <Controller
                    name="programType"
                    control={control}
                    render={({ field: { onChange } }) => (
                      <RadioButtonGroup
                        orientation="vertical"
                        onChange={(uuid: string) =>
                          onChange(activePatientEnrollment.find(({ program }) => program.uuid === uuid)?.uuid)
                        }
                        name="program-type-radio-group"
                      >
                        {activePatientEnrollment.map(({ uuid, display, program }) => (
                          <RadioButton
                            key={uuid}
                            className={styles.radioButton}
                            id={uuid}
                            labelText={display}
                            value={program.uuid}
                          />
                        ))}
                      </RadioButtonGroup>
                    )}
                  />
                </FormGroup>
              </section>
            )}

            {/* Lists available visit types. The content switcher only gets shown when recommended visit types are enabled */}
            <section>
              <div className={styles.sectionTitle}>{t('visitType_title', 'Visit Type')}</div>
              <div className={styles.sectionField}>
                {config.showRecommendedVisitTypeTab ? (
                  <>
                    <ContentSwitcher
                      selectedIndex={contentSwitcherIndex}
                      onChange={({ index }) => setContentSwitcherIndex(index)}
                    >
                      <Switch name="recommended" text={t('recommended', 'Recommended')} />
                      <Switch name="all" text={t('all', 'All')} />
                    </ContentSwitcher>
                    {contentSwitcherIndex === 0 && !isLoading && (
                      <MemoizedRecommendedVisitType
                        patientUuid={patientUuid}
                        patientProgramEnrollment={(() => {
                          return activePatientEnrollment?.find(
                            ({ program }) => program.uuid === getValues('programType'),
                          );
                        })()}
                        locationUuid={getValues('visitLocation')?.uuid}
                      />
                    )}
                    {contentSwitcherIndex === 1 && <BaseVisitType visitTypes={allVisitTypes} />}
                  </>
                ) : (
                  // Defaults to showing all possible visit types if recommended visits are not enabled
                  <BaseVisitType visitTypes={allVisitTypes} />
                )}
              </div>
            </section>

            {errors?.visitType && (
              <section>
                <div className={styles.sectionTitle}></div>
                <div className={styles.sectionField}>
                  <InlineNotification
                    role="alert"
                    style={{ margin: '0', minWidth: '100%' }}
                    kind="error"
                    lowContrast={true}
                    title={t('missingVisitType', 'Missing visit type')}
                    subtitle={t('selectVisitType', 'Please select a Visit Type')}
                  />
                </div>
              </section>
            )}

            <ExtensionSlot state={{ patientUuid, setExtraVisitInfo }} name="extra-visit-attribute-slot" />

            {/* Visit type attribute fields. These get shown when visit attribute types are configured */}
            <section>
              <div className={styles.sectionTitle}>{isTablet && t('visitAttributes', 'Visit attributes')}</div>
              <div className={styles.sectionField}>
                <VisitAttributeTypeFields setErrorFetchingResources={setErrorFetchingResources} />
              </div>
            </section>

            {/* Queue location and queue fields. These get shown when queue location and queue fields are configured */}
            {config.showServiceQueueFields && (
              <section>
                <div className={styles.sectionTitle}></div>
                <div className={styles.sectionField}>
                  <ExtensionSlot name="visit-form-queue-slot" state={{ setFormFields: setVisitFormFields }} />
                </div>
              </section>
            )}
          </Stack>
        </div>
        <ButtonSet
          className={classNames(styles.buttonSet, {
            [styles.tablet]: isTablet,
            [styles.desktop]: !isTablet,
          })}
        >
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            disabled={isSubmitting || errorFetchingResources?.blockSavingForm}
            kind="primary"
            type="submit"
          >
            {isSubmitting ? (
              <InlineLoading
                className={styles.spinner}
                description={
                  visitToEdit
                    ? t('updatingVisit', 'Updating visit') + '...'
                    : t('startingVisit', 'Starting visit') + '...'
                }
              />
            ) : (
              <span>{visitToEdit ? t('updateVisit', 'Update visit') : t('startVisit', 'Start visit')}</span>
            )}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

function useConditionalVisitTypes() {
  const isOnline = useConnectivity();

  const visitTypesHook = isOnline ? useVisitTypes : useOfflineVisitType;

  return visitTypesHook();
}

export default StartVisitForm;
