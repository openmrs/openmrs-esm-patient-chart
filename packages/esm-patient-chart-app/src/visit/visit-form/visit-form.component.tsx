import React, { useCallback, useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  ContentSwitcher,
  Form,
  FormGroup,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  Row,
  Stack,
  Switch,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { first } from 'rxjs/operators';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  saveVisit,
  showSnackbar,
  useSession,
  ExtensionSlot,
  type NewVisitPayload,
  toOmrsIsoString,
  toDateObjectStrict,
  useLayoutType,
  useVisitTypes,
  useConfig,
  useVisit,
  type Visit,
  updateVisit,
  useConnectivity,
} from '@openmrs/esm-framework';
import {
  convertTime12to24,
  createOfflineVisitForPatient,
  type DefaultWorkspaceProps,
  time12HourFormatRegex,
  useActivePatientEnrollment,
} from '@openmrs/esm-patient-common-lib';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import { type ChartConfig } from '../../config-schema';
import { saveQueueEntry } from '../hooks/useServiceQueue';
import { type AppointmentPayload, saveAppointment } from '../hooks/useUpcomingAppointments';
import { useLocations } from '../hooks/useLocations';
import { useVisitQueueEntry } from '../queue-entry/queue.resource';
import BaseVisitType from './base-visit-type.component';
import LocationSelector from './location-selection.component';
import VisitAttributeTypeFields from './visit-attribute-type.component';
import styles from './visit-form.scss';
import { type VisitFormData } from './visit-form.resource';
import VisitDateTimeField from './visit-date-time.component';
import { useVisits } from '../visits-widget/visit.resource';
import { useOfflineVisitType } from '../hooks/useOfflineVisitType';

interface StartVisitFormProps extends DefaultWorkspaceProps {
  visitToEdit?: Visit;
  showVisitEndDateTimeFields: boolean;
}

const StartVisitForm: React.FC<StartVisitFormProps> = ({
  patientUuid,
  closeWorkspace,
  promptBeforeClosing,
  visitToEdit,
  showVisitEndDateTimeFields,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const isOnline = useConnectivity();
  const sessionUser = useSession();
  const { error: errorFetchingLocations } = isOnline ? useLocations() : { error: false };
  const sessionLocation = sessionUser?.sessionLocation;
  const config = useConfig() as ChartConfig;
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visitHeaderSlotState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const { mutateVisits } = useVisits(patientUuid);
  const allVisitTypes = isOnline ? useVisitTypes() : useOfflineVisitType();
  const { mutate } = useVisit(patientUuid);
  const [errorFetchingResources, setErrorFetchingResources] = useState<{
    blockSavingForm: boolean;
  }>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const upcomingAppointmentState = useMemo(() => ({ patientUuid, setUpcomingAppointment }), [patientUuid]);
  const visitQueueNumberAttributeUuid = config.visitQueueNumberAttributeUuid;
  const [visitUuid, setVisitUuid] = useState('');
  const { mutate: mutateQueueEntry } = useVisitQueueEntry(patientUuid, visitUuid);
  const [extraVisitInfo, setExtraVisitInfo] = useState(null);

  const displayVisitStopDateTimeFields = useMemo(
    () => visitToEdit?.stopDatetime || showVisitEndDateTimeFields,
    [visitToEdit?.stopDatetime, showVisitEndDateTimeFields],
  );

  const visitFormSchema = useMemo(() => {
    const visitAttributes = (config.visitAttributeTypes ?? [])?.reduce(
      (acc, { uuid, required }) => ({
        ...acc,
        [uuid]: required
          ? z
              .string({
                required_error: t('fieldRequired', 'This field is required'),
              })
              .refine((value) => !!value, t('fieldRequired', 'This field is required'))
          : z.string().optional(),
      }),
      {},
    );

    return z.object({
      visitStartDate: z.date(),
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
  }, [visitToEdit]);

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
  }, [isDirty]);

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

    return validSubmission;
  }, [setError]);

  const onSubmit = useCallback(
    (data: VisitFormData, event) => {
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
        attributes: Object.entries(visitAttributes)
          .filter(([key, value]) => !!value)
          .map(([key, value]) => ({
            attributeType: key,
            value: value as string,
          })),
      };
      if (visitToEdit?.uuid) {
        // The request throws 400 (Bad request)error when patient is passed in the update payload

        delete payload.patient;
      }

      if (displayVisitStopDateTimeFields) {
        const [visitStopHours, visitStopMinutes] = convertTime12to24(visitStopTime, visitStopTimeFormat);

        payload = {
          ...payload,
          stopDatetime: toDateObjectStrict(
            toOmrsIsoString(
              new Date(
                dayjs(visitStopDate).year(),
                dayjs(visitStopDate).month(),
                dayjs(visitStopDate).date(),
                visitStopHours,
                visitStopMinutes,
              ),
            ),
          ),
        };
      }

      const abortController = new AbortController();
      if (config.showExtraVisitAttributesSlot) {
        const { handleCreateExtraVisitInfo, attributes } = extraVisitInfo ?? {};
        payload.attributes.push(...attributes);
        handleCreateExtraVisitInfo && handleCreateExtraVisitInfo();
      }

      if (isOnline) {
        (visitToEdit?.uuid
          ? updateVisit(visitToEdit?.uuid, payload, abortController)
          : saveVisit(payload, abortController)
        )
          .pipe(first())
          .subscribe(
            (response) => {
              if (response.status === 201) {
                if (config.showServiceQueueFields) {
                  // retrieve values from queue extension
                  setVisitUuid(response.data.uuid);
                  const queueLocation = event?.target['queueLocation']?.value;
                  const serviceUuid = event?.target['service']?.value;
                  const priority = event?.target['priority']?.value;
                  const status = event?.target['status']?.value;
                  const sortWeight = event?.target['sortWeight']?.value;

                  saveQueueEntry(
                    response.data.uuid,
                    serviceUuid,
                    patientUuid,
                    priority,
                    status,
                    sortWeight,
                    new AbortController(),
                    queueLocation,
                    visitQueueNumberAttributeUuid,
                  ).then(
                    ({ status }) => {
                      if (status === 201) {
                        mutateCurrentVisit();
                        mutateVisits();
                        mutateQueueEntry();
                        showSnackbar({
                          kind: 'success',
                          title: t('visitStarted', 'Visit started'),
                          subtitle: t('queueAddedSuccessfully', `Patient added to the queue successfully.`),
                        });
                      }
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
                }
                if (config.showUpcomingAppointments && upcomingAppointment) {
                  const appointmentPayload: AppointmentPayload = {
                    appointmentKind: upcomingAppointment?.appointmentKind,
                    serviceUuid: upcomingAppointment?.service.uuid,
                    startDateTime: upcomingAppointment?.startDateTime,
                    endDateTime: upcomingAppointment?.endDateTime,
                    locationUuid: visitLocation?.uuid,
                    patientUuid: patientUuid,
                    uuid: upcomingAppointment?.uuid,
                    dateHonored: dayjs(visitStartDate).format(),
                  };
                  saveAppointment(appointmentPayload, abortController).then(
                    ({ status }) => {
                      if (status === 201) {
                        mutateCurrentVisit();
                        mutateVisits();
                        showSnackbar({
                          isLowContrast: true,
                          kind: 'success',
                          subtitle: t('appointmentUpdate', 'Upcoming appointment updated successfully'),
                          title: t('appointmentEdited', 'Appointment edited'),
                        });
                      }
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
              mutateCurrentVisit();
              mutateVisits();
              closeWorkspace({ ignoreChanges: true });

              showSnackbar({
                isLowContrast: true,
                timeoutInMs: 5000,
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
            },
            (error) => {
              showSnackbar({
                title: !visitToEdit
                  ? t('startVisitError', 'Error starting visit')
                  : t('errorUpdatingVisitDetails', 'Error updating visit details'),
                kind: 'error',
                isLowContrast: false,
                subtitle: error?.message,
              });
            },
          );
      } else {
        createOfflineVisitForPatient(
          patientUuid,
          visitLocation.uuid,
          config.offlineVisitTypeUuid,
          payload.startDatetime,
        ).then(
          (offlineVisit) => {
            mutate();
            closeWorkspace({ ignoreChanges: true });
            showSnackbar({
              isLowContrast: true,
              kind: 'success',
              subtitle: t('visitStartedSuccessfully', '{visit} started successfully', {
                visit: t('offlineVisit', 'Offline Visit'),
              }),
              title: t('visitStarted', 'Visit started'),
            });
          },
          (error) => {
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
      config.showServiceQueueFields,
      config.showUpcomingAppointments,
      visitQueueNumberAttributeUuid,
      mutateCurrentVisit,
      mutateVisits,
      patientUuid,
      upcomingAppointment,
      t,
      visitToEdit,
      displayVisitStopDateTimeFields,
    ],
  );

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
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
              visitDatetimeLabel={t('visitStartDatetime', 'Visit start date and time')}
              dateFieldName="visitStartDate"
              timeFieldName="visitStartTime"
              timeFormatFieldName="visitStartTimeFormat"
              maxDate={maxVisitStartDatetime}
            />

            {displayVisitStopDateTimeFields && (
              <VisitDateTimeField
                visitDatetimeLabel={t('visitStopDatetime', 'Visit stop date and time')}
                dateFieldName="visitStopDate"
                timeFieldName="visitStopTime"
                timeFormatFieldName="visitStopTimeFormat"
                minDate={minVisitStopDatetime}
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
            <LocationSelector />

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
                        onChange={(uuid) =>
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
                  <ExtensionSlot name="add-queue-entry-slot" />
                </div>
              </section>
            )}
          </Stack>
        </div>
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            disabled={isSubmitting || errorFetchingResources?.blockSavingForm}
            kind="primary"
            type="submit"
          >
            {!visitToEdit ? t('startVisit', 'Start visit') : t('updateVisitDetails', 'Update visit details')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default StartVisitForm;
