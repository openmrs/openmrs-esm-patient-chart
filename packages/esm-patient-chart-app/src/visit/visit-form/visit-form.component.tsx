import React, { useCallback, useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  InlineNotification,
  Layer,
  RadioButton,
  RadioButtonGroup,
  Row,
  SelectItem,
  Stack,
  Switch,
  TimePicker,
  TimePickerSelect,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { first } from 'rxjs/operators';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  saveVisit,
  showNotification,
  showToast,
  useSession,
  ExtensionSlot,
  NewVisitPayload,
  toOmrsIsoString,
  toDateObjectStrict,
  useLayoutType,
  useVisitTypes,
  useConfig,
  useVisit,
  Visit,
  updateVisit,
} from '@openmrs/esm-framework';
import {
  amPm,
  convertTime12to24,
  DefaultWorkspaceProps,
  useActivePatientEnrollment,
} from '@openmrs/esm-patient-common-lib';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import { ChartConfig } from '../../config-schema';
import { saveQueueEntry } from '../hooks/useServiceQueue';
import { AppointmentPayload, saveAppointment } from '../hooks/useUpcomingAppointments';
import { useLocations } from '../hooks/useLocations';
import BaseVisitType from './base-visit-type.component';
import LocationSelector from './location-selection.component';
import VisitAttributeTypeFields from './visit-attribute-type.component';
import styles from './visit-form.scss';
import { useVisitQueueEntry } from '../queue-entry/queue.resource';
import { useVisits } from '../visits-widget/visit.resource';

interface StartVisitFormProps extends DefaultWorkspaceProps {
  visitDetails: Visit;
  showVisitEndDateTimeFields: boolean;
}

export type VisitFormData = {
  visitDate: Date;
  visitTime: string;
  timeFormat: 'PM' | 'AM';
  programType: string;
  visitType: string;
  visitLocation: {
    display: string;
    uuid: string;
  };
  visitAttributes: {
    [x: string]: string;
  };
};

const StartVisitForm: React.FC<StartVisitFormProps> = ({
  patientUuid,
  closeWorkspace,
  promptBeforeClosing,
  visitDetails,
  showVisitEndDateTimeFields,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const sessionUser = useSession();
  const { error: errorFetchingLocations } = useLocations();
  const sessionLocation = sessionUser?.sessionLocation;
  const config = useConfig() as ChartConfig;
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visitHeaderSlotState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const allVisitTypes = useVisitTypes();
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const { mutateVisits } = useVisits(patientUuid);
  const [ignoreChanges, setIgnoreChanges] = useState(true);
  const [errorFetchingResources, setErrorFetchingResources] = useState<{
    blockSavingForm: boolean;
  }>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const upcomingAppointmentState = useMemo(() => ({ patientUuid, setUpcomingAppointment }), [patientUuid]);
  const visitQueueNumberAttributeUuid = config.visitQueueNumberAttributeUuid;
  const [visitUuid, setVisitUuid] = useState('');
  const { mutate: mutateQueueEntry } = useVisitQueueEntry(patientUuid, visitUuid);

  const inEditForm = useMemo(() => !!visitDetails?.uuid, [visitDetails]);
  const displayVisitEndDateTimeFields = useMemo(
    () => showVisitEndDateTimeFields || visitDetails?.stopDatetime,
    [showVisitEndDateTimeFields, visitDetails?.stopDatetime],
  );

  const [maxVisitStartDatetime, minVisitEndDatetime]: [Date, Date] = useMemo(() => {
    if (!inEditForm || !visitDetails?.encounters?.length) {
      return [new Date(), new Date(null)];
    }

    const allEncounterDates = visitDetails?.encounters?.map(({ encounterDatetime }) => Date.parse(encounterDatetime));
    const maxVisitStartDatetime = new Date(Math.min(...allEncounterDates));
    const minVisitEndDatetime = new Date(Math.max(...allEncounterDates));

    return [maxVisitStartDatetime, minVisitEndDatetime];
  }, [visitDetails, inEditForm]);

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

    return z
      .object({
        visitDate: z.date(),
        visitTime: z.string(),
        timeFormat: z.enum(['PM', 'AM']),
        visitEndDate: z.date().optional(),
        visitEndTime: z.string().optional(),
        visitEndTimeFormat: z.enum(['PM', 'AM']).optional(),
        programType: z.string().optional(),
        visitType: z.string().refine((value) => !!value, t('visitTypeRequired', 'Visit type is required')),
        visitLocation: z.object({
          display: z.string(),
          uuid: z.string(),
        }),
        visitAttributes: z.object(visitAttributes),
      })
      .superRefine(({ visitDate, visitEndDate, visitEndTime, visitTime, visitEndTimeFormat, timeFormat }, ctx) => {
        const [hours, minutes] = convertTime12to24(visitTime, timeFormat);
        const visitStartDatetime = visitDate.setHours(hours, minutes);

        if (visitStartDatetime > Date.parse(maxVisitStartDatetime.toISOString())) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
            message: t('invalidVisitStartDate', 'Start date needs to be on or before {{firstEncounterDatetime}}', {
              firstEncounterDatetime: maxVisitStartDatetime.toLocaleString(),
              interpolation: {
                escapeValue: false,
              },
            }),
          });
        }

        if (!visitEndDate) {
          return;
        }

        const [endHours, endMinutes] = convertTime12to24(visitEndTime, visitEndTimeFormat);
        const visitEndDatetime = visitEndDate.setHours(endHours, endMinutes);

        if (visitStartDatetime >= visitEndDatetime) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
            message: t('invalidVisitEndDatetime', 'End date needs to be on or after {{visitStartDatetime}}', {
              visitStartDatetime: new Date(visitStartDatetime).toLocaleString(),
              interpolation: {
                escapeValue: false,
              },
            }),
          });
        }

        if (visitEndDatetime < Date.parse(minVisitEndDatetime.toISOString())) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
            message: t('invalidVisitEndDatetime', 'End date needs to be on or after {{firstEncounterDatetime}}', {
              firstEncounterDatetime: minVisitEndDatetime.toLocaleString(),
              interpolation: {
                escapeValue: false,
              },
            }),
          });
        }
      });
  }, [t, config]);

  type VisitFormData = z.infer<typeof visitFormSchema>;

  const visitFormDefaultValues: VisitFormData = useMemo(() => {
    const visitStartDateTime = visitDetails?.startDatetime ? new Date(visitDetails?.startDatetime) : new Date();
    let defaultValues: VisitFormData = {
      visitDate: visitStartDateTime,
      visitTime: dayjs(visitStartDateTime).format('hh:mm'),
      timeFormat: (visitStartDateTime.getHours() >= 12 ? 'PM' : 'AM') as amPm,
      visitType: visitDetails?.visitType?.uuid,
      visitLocation: visitDetails?.location ?? sessionLocation ?? {},
      visitAttributes: visitDetails?.attributes?.reduce(
        (acc, curr) => ({
          ...acc,
          [curr?.attributeType?.uuid]: typeof curr.value === 'object' ? curr?.value?.uuid : `${curr.value ?? ''}`,
        }),
        {},
      ),
    };

    const visitEndDateTime = visitDetails?.stopDatetime ? new Date(visitDetails?.stopDatetime) : null;
    if (visitEndDateTime) {
      defaultValues = {
        ...defaultValues,
        visitEndDate: visitEndDateTime,
        visitEndTime: dayjs(visitEndDateTime).format('hh:mm'),
        visitEndTimeFormat: (visitEndDateTime.getHours() >= 12 ? 'PM' : 'AM') as amPm,
      };
    }
    return defaultValues;
  }, [visitDetails, sessionLocation]);

  const methods = useForm<VisitFormData>({
    mode: 'all',
    resolver: zodResolver(visitFormSchema),
    defaultValues: visitFormDefaultValues,
  });

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = methods;

  const onSubmit = useCallback(
    (data: VisitFormData, event) => {
      const {
        timeFormat,
        visitDate,
        visitLocation,
        visitTime,
        visitType,
        visitAttributes,
        visitEndDate,
        visitEndTime,
        visitEndTimeFormat,
      } = data;

      setIsSubmitting(true);

      const [hours, minutes] = convertTime12to24(visitTime, timeFormat);

      const payload: NewVisitPayload = {
        patient: patientUuid,
        startDatetime: toDateObjectStrict(
          toOmrsIsoString(
            new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date(), hours, minutes),
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

      if (inEditForm) {
        // The request throws 400 (Bad request)error when patient is passed in the update payload
        delete payload.patient;
        if (displayVisitEndDateTimeFields) {
          const [visitEndHours, visitEndMinutes] = convertTime12to24(visitEndTime, visitEndTimeFormat);

          payload.stopDatetime = toDateObjectStrict(
            toOmrsIsoString(
              new Date(
                dayjs(visitEndDate).year(),
                dayjs(visitEndDate).month(),
                dayjs(visitEndDate).date(),
                visitEndHours,
                visitEndMinutes,
              ),
            ),
          );
        }
      }

      const abortController = new AbortController();
      (visitDetails?.uuid
        ? updateVisit(visitDetails?.uuid, payload, abortController)
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
                      mutateQueueEntry();
                      showToast({
                        kind: 'success',
                        title: t('visitStarted', 'Visit started'),
                        description: t('queueAddedSuccessfully', `Patient added to the queue successfully.`),
                      });
                    }
                  },
                  (error) => {
                    showNotification({
                      title: t('queueEntryError', 'Error adding patient to the queue'),
                      kind: 'error',
                      critical: true,
                      description: error?.message,
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
                  dateHonored: dayjs(visitDate).format(),
                };
                saveAppointment(appointmentPayload, abortController).then(
                  ({ status }) => {
                    if (status === 201) {
                      mutateCurrentVisit();
                      showToast({
                        critical: true,
                        kind: 'success',
                        description: t('appointmentUpdate', 'Upcoming appointment updated successfully'),
                        title: t('appointmentEdited', 'Appointment edited'),
                      });
                    }
                  },
                  (error) => {
                    showNotification({
                      title: t('updateError', 'Error updating upcoming appointment'),
                      kind: 'error',
                      critical: true,
                      description: error?.message,
                    });
                  },
                );
              }
            }
            mutateCurrentVisit();
            mutateVisits();
            closeWorkspace();

            showToast({
              critical: true,
              kind: 'success',
              description: !inEditForm
                ? t('visitStartedSuccessfully', '{{visit}} started successfully', {
                    visit: response?.data?.visitType?.display ?? t('visit', 'Visit'),
                  })
                : t('visitDetailsUpdatedSuccessfully', '{{visit}} updated successfully', {
                    visit: response?.data?.visitType?.display ?? t('pastVisit', 'Past visit'),
                  }),
              title: !inEditForm
                ? t('visitStarted', 'Visit started')
                : t('visitDetailsUpdated', 'Visit details updated'),
            });
          },
          (error) => {
            showNotification({
              title: !inEditForm
                ? t('startVisitError', 'Error starting visit')
                : t('errorUpdatingVisitDetails', 'Error updating visit details'),
              kind: 'error',
              critical: true,
              description: error?.message,
            });
          },
        );
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
      inEditForm,
      displayVisitEndDateTimeFields,
    ],
  );

  const handleOnChange = () => {
    setIgnoreChanges((prevState) => !prevState);
    promptBeforeClosing(() => true);
  };

  useEffect(() => {
    if (errorFetchingLocations) {
      setErrorFetchingResources((prev) => ({
        blockSavingForm: prev?.blockSavingForm || false,
      }));
    }
  }, [errorFetchingLocations]);

  return (
    <FormProvider {...methods}>
      <Form className={styles.form} onChange={handleOnChange} onSubmit={handleSubmit(onSubmit)}>
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
            {/* Date and time of visit. Defaults to the current date and time. */}
            <section>
              <div className={styles.sectionTitle}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</div>
              <div className={`${styles.dateTimeSection} ${styles.sectionField}`}>
                <Controller
                  name="visitDate"
                  control={control}
                  render={({ field: { onBlur, onChange, value } }) => (
                    <ResponsiveWrapper isTablet={isTablet}>
                      <DatePicker
                        dateFormat="d/m/Y"
                        datePickerType="single"
                        id="visitDate"
                        style={{ paddingBottom: '1rem' }}
                        maxDate={maxVisitStartDatetime}
                        onChange={([date]) => onChange(date)}
                        value={value}
                      >
                        <DatePickerInput
                          id="visitStartDateInput"
                          labelText={
                            !displayVisitEndDateTimeFields ? t('date', 'Date') : t('visitStartDate', 'Visit start date')
                          }
                          placeholder="dd/mm/yyyy"
                          style={{ width: '100%' }}
                        />
                      </DatePicker>
                    </ResponsiveWrapper>
                  )}
                />
                <ResponsiveWrapper isTablet={isTablet}>
                  <Controller
                    name="visitTime"
                    control={control}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <TimePicker
                        id="visitStartTime"
                        labelText={
                          !displayVisitEndDateTimeFields ? t('time', 'Time') : t('visitStartTime', 'Visit start time')
                        }
                        onChange={(event) => onChange(event.target.value as amPm)}
                        pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                        style={{ marginLeft: '0.125rem', flex: 'none' }}
                        value={value}
                        onBlur={onBlur}
                      >
                        <Controller
                          name="timeFormat"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <TimePickerSelect
                              id="visitStartTimeSelect"
                              onChange={(event) => onChange(event.target.value as amPm)}
                              value={value}
                              aria-label={t('timeFormat ', 'Time Format')}
                            >
                              <SelectItem value="AM" text="AM" />
                              <SelectItem value="PM" text="PM" />
                            </TimePickerSelect>
                          )}
                        />
                      </TimePicker>
                    )}
                  />
                </ResponsiveWrapper>
              </div>
              {displayVisitEndDateTimeFields && (
                <div className={`${styles.dateTimeSection} ${styles.sectionField}`}>
                  <Controller
                    name="visitEndDate"
                    control={control}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <ResponsiveWrapper isTablet={isTablet}>
                        <DatePicker
                          dateFormat="d/m/Y"
                          datePickerType="single"
                          id="visitEndDate"
                          style={{ paddingBottom: '1rem' }}
                          minDate={minVisitEndDatetime}
                          onChange={([date]) => onChange(date)}
                          value={value}
                        >
                          <DatePickerInput
                            id="visitEndDateInput"
                            labelText={t('visitEndDate', 'Visit end date')}
                            placeholder="dd/mm/yyyy"
                            style={{ width: '100%' }}
                          />
                        </DatePicker>
                      </ResponsiveWrapper>
                    )}
                  />
                  <ResponsiveWrapper isTablet={isTablet}>
                    <Controller
                      name="visitEndTime"
                      control={control}
                      render={({ field: { onBlur, onChange, value } }) => (
                        <TimePicker
                          id="visitEndTime"
                          labelText={t('visitEndTime', 'Visit end time')}
                          onChange={(event) => onChange(event.target.value as amPm)}
                          pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                          style={{ marginLeft: '0.125rem', flex: 'none' }}
                          value={value}
                          onBlur={onBlur}
                        >
                          <Controller
                            name="visitEndTimeFormat"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <TimePickerSelect
                                id="visitEndTimeSelect"
                                onChange={(event) => onChange(event.target.value as amPm)}
                                value={value}
                                aria-label={t('visitEndTimeFormat ', 'Visit end time format')}
                              >
                                <SelectItem value="AM" text="AM" />
                                <SelectItem value="PM" text="PM" />
                              </TimePickerSelect>
                            )}
                          />
                        </TimePicker>
                      )}
                    />
                  </ResponsiveWrapper>
                </div>
              )}
            </section>

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
            <section>
              {Object.entries(errors)
                .filter(([key]) => !key)
                .map(([_, value]) => (
                  <InlineNotification
                    kind={'error'}
                    className={styles.inlineNotification}
                    title={t('error', 'Error')}
                    subtitle={value.message}
                  />
                ))}
            </section>
          </Stack>
        </div>
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace(ignoreChanges)}>
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            disabled={isSubmitting || errorFetchingResources?.blockSavingForm}
            kind="primary"
            type="submit"
          >
            {!inEditForm ? t('startVisit', 'Start visit') : t('updateVisitDetails', 'Update visit details')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

export default StartVisitForm;
