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
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Extension,
  ExtensionSlot,
  formatDatetime,
  saveVisit,
  showSnackbar,
  toDateObjectStrict,
  toOmrsIsoString,
  updateVisit,
  useConfig,
  useConnectivity,
  useFeatureFlag,
  useLayoutType,
  usePatient,
  useSession,
  type AssignedExtension,
  type NewVisitPayload,
  type Visit,
} from '@openmrs/esm-framework';
import {
  convertTime12to24,
  createOfflineVisitForPatient,
  time12HourFormatRegex,
  useActivePatientEnrollment,
  useMutateVisits,
  type DefaultPatientWorkspaceProps,
} from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { type ChartConfig } from '../../config-schema';
import { useDefaultVisitLocation } from '../hooks/useDefaultVisitLocation';
import { useEmrConfiguration } from '../hooks/useEmrConfiguration';
import { useVisitAttributeTypes } from '../hooks/useVisitAttributeType';
import BaseVisitType from './base-visit-type.component';
import LocationSelector from './location-selector.component';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import VisitAttributeTypeFields from './visit-attribute-type.component';
import VisitDateTimeField from './visit-date-time.component';
import {
  createVisitAttribute,
  deleteVisitAttribute,
  updateVisitAttribute,
  useConditionalVisitTypes,
  useVisitFormCallbacks,
  type VisitFormCallbacks,
  type VisitFormData,
} from './visit-form.resource';
import styles from './visit-form.scss';
dayjs.extend(isSameOrBefore);

interface StartVisitFormProps extends DefaultPatientWorkspaceProps {
  /**
   * A unique string identifying where the visit form is opened from.
   * This string is passed into various extensions within the form to
   * affect how / if they should be rendered.
   */
  openedFrom: string;
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
  openedFrom,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const isEmrApiModuleInstalled = useFeatureFlag('emrapi-module');
  const isOnline = useConnectivity();
  const config = useConfig<ChartConfig>();
  const sessionUser = useSession();
  const sessionLocation = sessionUser?.sessionLocation;
  const defaultVisitLocation = useDefaultVisitLocation(
    sessionLocation,
    config.restrictByVisitLocationTag && isEmrApiModuleInstalled,
  );
  const { emrConfiguration } = useEmrConfiguration(isEmrApiModuleInstalled);
  const { patientUuid, patient } = usePatient(initialPatientUuid);
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const visitHeaderSlotState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const { mutateVisits } = useMutateVisits(patientUuid);
  const allVisitTypes = useConditionalVisitTypes();

  const [errorFetchingResources, setErrorFetchingResources] = useState<{
    blockSavingForm: boolean;
  }>(null);
  const { visitAttributeTypes } = useVisitAttributeTypes();
  const [visitFormCallbacks, setVisitFormCallbacks] = useVisitFormCallbacks();
  const [extraVisitInfo, setExtraVisitInfo] = useState(null);

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

    const hadPreviousStopDateTime = Boolean(visitToEdit?.stopDatetime);

    return z
      .object({
        visitStartDate: z.date().refine(
          (value) => {
            const today = dayjs();
            const startDate = dayjs(value);

            return startDate.isSameOrBefore(today, 'day');
          },
          t('invalidVisitStartDate', 'Start date needs to be on or before {{firstEncounterDatetime}}', {
            firstEncounterDatetime: formatDatetime(new Date()),
          }),
        ),
        visitStartTime: z
          .string()
          .refine((value) => value.match(time12HourFormatRegex), t('invalidTimeFormat', 'Invalid time format')),
        visitStartTimeFormat: z.enum(['PM', 'AM']),
        visitStopDate: displayVisitStopDateTimeFields && hadPreviousStopDateTime ? z.date() : z.date().optional(),
        visitStopTime:
          displayVisitStopDateTimeFields && hadPreviousStopDateTime
            ? z.string().refine((value) => value.match(time12HourFormatRegex), t('invalidTimeFormat'))
            : z
                .string()
                .refine((value) => !value || value.match(time12HourFormatRegex), t('invalidTimeFormat'))
                .optional(),
        visitStopTimeFormat:
          displayVisitStopDateTimeFields && hadPreviousStopDateTime
            ? z.enum(['PM', 'AM'])
            : z.enum(['PM', 'AM']).optional(),
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
      })
      .refine((data) => !(displayVisitStopDateTimeFields && data.visitStopDate && !data.visitStopTime), {
        message: t('visitStopTimeRequired', 'Visit stop time is required'),
        path: ['visitStopTime'],
      })
      .refine(
        (data) =>
          !(displayVisitStopDateTimeFields && data.visitStopDate && data.visitStopTime && !data.visitStopTimeFormat),
        {
          message: t('visitStopTimeFormatRequired', 'Visit stop time format is required'),
          path: ['visitStopTimeFormat'],
        },
      );
  }, [config.visitAttributeTypes, visitToEdit?.stopDatetime, t, displayVisitStopDateTimeFields]);

  const defaultValues = useMemo(() => {
    const visitStartDate = visitToEdit?.startDatetime ? new Date(visitToEdit?.startDatetime) : new Date();
    const visitStopDate = visitToEdit?.stopDatetime ? new Date(visitToEdit?.stopDatetime) : null;

    let defaultValues: Partial<VisitFormData> = {
      visitStartDate,
      visitStartTime: dayjs(visitStartDate).format('hh:mm'),
      visitStartTimeFormat: new Date(visitStartDate).getHours() >= 12 ? 'PM' : 'AM',
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

    if (visitStopDate) {
      defaultValues = {
        ...defaultValues,
        visitStopDate,
        visitStopTime: dayjs(visitStopDate).format('hh:mm'),
        visitStopTimeFormat: visitStopDate.getHours() >= 12 ? 'PM' : 'AM',
      };
    }

    return defaultValues;
  }, [visitToEdit, defaultVisitLocation, emrConfiguration]);

  const methods = useForm<VisitFormData>({
    mode: 'all',
    resolver: zodResolver(visitFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors, isDirty, isSubmitting },
    setError,
    reset,
  } = methods;

  // default values are cached so form needs to be reset when they change (e.g. when default visit location finishes loading)
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  let [maxVisitStartDatetime, minVisitStopDatetime] = useMemo(() => {
    const now = Date.now();

    if (!visitToEdit?.encounters?.length) {
      return [now, null];
    }

    const allEncounterDatetimes = visitToEdit?.encounters?.map(({ encounterDatetime }) =>
      Date.parse(encounterDatetime),
    );

    const maxVisitStartDatetime = Math.min(...allEncounterDatetimes);
    const minVisitStopDatetime = Math.max(...allEncounterDatetimes);
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
          firstEncounterDatetime: formatDatetime(new Date(maxVisitStartDatetime)),
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
              lastEncounterDatetime: formatDatetime(new Date(minVisitStopDatetime)),
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
                updateVisitAttribute(visitUuid, attributeToEdit.uuid, value).catch((err) => {
                  showSnackbar({
                    title: t('errorUpdatingVisitAttribute', 'Error updating the {{attributeName}} visit attribute', {
                      attributeName: attributeToEdit.attributeType.display,
                    }),
                    kind: 'error',
                    isLowContrast: false,
                    subtitle: err?.message,
                  });
                  return Promise.reject(err); // short-circuit promise chain
                }),
              );
            } else {
              // Delete attribute if no value is provided
              promises.push(
                deleteVisitAttribute(visitUuid, attributeToEdit.uuid).catch((err) => {
                  showSnackbar({
                    title: t('errorDeletingVisitAttribute', 'Error deleting the {{attributeName}} visit attribute', {
                      attributeName: attributeToEdit.attributeType.display,
                    }),
                    kind: 'error',
                    isLowContrast: false,
                    subtitle: err?.message,
                  });
                  return Promise.reject(err); // short-circuit promise chain
                }),
              );
            }
          }
        } else {
          if (value) {
            promises.push(
              createVisitAttribute(visitUuid, attributeType, value).catch((err) => {
                showSnackbar({
                  title: t('errorCreatingVisitAttribute', 'Error creating the {{attributeName}} visit attribute', {
                    attributeName: visitAttributeTypes?.find((type) => type.uuid === attributeType)?.display,
                  }),
                  kind: 'error',
                  isLowContrast: false,
                  subtitle: err?.message,
                });
                return Promise.reject(err); // short-circuit promise chain
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

      const [hours, minutes] = convertTime12to24(visitStartTime, visitStartTimeFormat);
      const currentSeconds = new Date().getSeconds();
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
              currentSeconds,
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
              currentSeconds,
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
        const visitRequest = visitToEdit?.uuid
          ? updateVisit(visitToEdit?.uuid, payload, abortController)
          : saveVisit(payload, abortController);

        visitRequest
          .then((response) => {
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
            return response;
          })
          .catch((error) => {
            showSnackbar({
              title: !visitToEdit
                ? t('startVisitError', 'Error starting visit')
                : t('errorUpdatingVisitDetails', 'Error updating visit details'),
              kind: 'error',
              isLowContrast: false,
              subtitle: error?.message,
            });
            return Promise.reject(error); // short-circuit promise chain
          })
          .then((response) => {
            // now that visit is created / updated, we run post-submit actions
            // to update visit attributes or any other OnVisitCreatedOrUpdated actions
            const visit = response.data;

            // handleVisitAttributes already has code to show error snackbar when attribute fails to update
            // no need for catch block here
            const visitAttributesRequest = handleVisitAttributes(visitAttributes, response.data.uuid).then(
              (visitAttributesResponses) => {
                if (visitAttributesResponses.length > 0) {
                  showSnackbar({
                    isLowContrast: true,
                    kind: 'success',
                    title: t(
                      'additionalVisitInformationUpdatedSuccessfully',
                      'Additional visit information updated successfully',
                    ),
                  });
                }
              },
            );

            const onVisitCreatedOrUpdatedRequests = [...visitFormCallbacks.values()].map((callbacks) =>
              callbacks.onVisitCreatedOrUpdated(visit),
            );

            return Promise.all([visitAttributesRequest, ...onVisitCreatedOrUpdatedRequests]);
          })
          .then(() => {
            closeWorkspace({ ignoreChanges: true });
          })
          .catch(() => {
            // do nothing, this catches any reject promises used for short-circuiting
          })
          .finally(() => {
            mutateVisits(visitToEdit?.uuid);
          });
      } else {
        createOfflineVisitForPatient(
          patientUuid,
          visitLocation.uuid,
          config.offlineVisitTypeUuid,
          payload.startDatetime,
        ).then(
          () => {
            mutateVisits(visitToEdit?.uuid);
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
      displayVisitStopDateTimeFields,
      extraVisitInfo,
      handleVisitAttributes,
      isOnline,
      mutateVisits,
      visitFormCallbacks,
      patientUuid,
      t,
      validateVisitStartStopDatetime,
      visitToEdit,
    ],
  );

  const visitStartDate = getValues('visitStartDate') ?? new Date();
  minVisitStopDatetime = minVisitStopDatetime ?? Date.parse(visitStartDate.toLocaleString());
  const minVisitStopDatetimeFallback = Date.parse(visitStartDate.toLocaleString());
  minVisitStopDatetime = minVisitStopDatetime || minVisitStopDatetimeFallback;

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

            {/* Upcoming appointments. This get shown when config.showUpcomingAppointments is true. */}
            {config.showUpcomingAppointments && (
              <section>
                <h1 className={styles.sectionTitle}></h1>
                <div className={styles.sectionField}>
                  <VisitFormExtensionSlot
                    name="visit-form-top-slot"
                    patientUuid={patientUuid}
                    visitFormOpenedFrom={openedFrom}
                    setVisitFormCallbacks={setVisitFormCallbacks}
                  />
                </div>
              </section>
            )}

            {/* This field lets the user select a location for the visit. The location is required for the visit to be saved. Defaults to the active session location */}
            <LocationSelector control={control} />

            {/* Lists available program types. This feature is dependent on the `showRecommendedVisitTypeTab` config being set
          to true. */}
            {config.showRecommendedVisitTypeTab && (
              <section>
                <h1 className={styles.sectionTitle}>{t('program', 'Program')}</h1>
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

            {/* Lists available visit types if no atFacilityVisitType enabled. The content switcher only gets shown when recommended visit types are enabled */}
            {!emrConfiguration?.atFacilityVisitType && (
              <section>
                <h1 className={styles.sectionTitle}>{t('visitType_title', 'Visit Type')}</h1>
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

                {errors?.visitType && (
                  <section>
                    <h1 className={styles.sectionTitle}></h1>
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
              </section>
            )}

            <ExtensionSlot state={{ patientUuid, setExtraVisitInfo }} name="extra-visit-attribute-slot" />

            {/* Visit type attribute fields. These get shown when visit attribute types are configured */}
            <section>
              <h1 className={styles.sectionTitle}>{isTablet && t('visitAttributes', 'Visit attributes')}</h1>
              <div className={styles.sectionField}>
                <VisitAttributeTypeFields setErrorFetchingResources={setErrorFetchingResources} />
              </div>
            </section>

            {/* Queue location and queue fields. These get shown when config.showServiceQueueFields is true,
                or when the form is opened from the queues app */}
            <section>
              <h1 className={styles.sectionTitle}></h1>
              <div className={styles.sectionField}>
                <VisitFormExtensionSlot
                  name="visit-form-bottom-slot"
                  patientUuid={patientUuid}
                  visitFormOpenedFrom={openedFrom}
                  setVisitFormCallbacks={setVisitFormCallbacks}
                />
              </div>
            </section>
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

interface VisitFormExtensionSlotProps {
  name: string;
  patientUuid: string;
  visitFormOpenedFrom: string;
  setVisitFormCallbacks: React.Dispatch<React.SetStateAction<Map<string, VisitFormCallbacks>>>;
}

type VisitFormExtensionState = {
  patientUuid: string;

  /**
   * This function allows an extension to register callbacks for visit form submission.
   * This callbacks can be used to make further requests. The callbacks should handle its own UI notification
   * on success / failure, and its returned Promise MUST resolve on success and MUST reject on failure.
   * @param callback
   * @returns
   */
  setVisitFormCallbacks(callbacks: VisitFormCallbacks);

  visitFormOpenedFrom: string;
  patientChartConfig: ChartConfig;
};

const VisitFormExtensionSlot: React.FC<VisitFormExtensionSlotProps> = React.memo(
  ({ name, patientUuid, visitFormOpenedFrom, setVisitFormCallbacks }) => {
    const config = useConfig<ChartConfig>();

    return (
      <ExtensionSlot name={name}>
        {(extension: AssignedExtension) => {
          const state: VisitFormExtensionState = {
            patientUuid,
            setVisitFormCallbacks: (callbacks) => {
              setVisitFormCallbacks((old) => {
                return new Map(old).set(extension.id, callbacks);
              });
            },
            visitFormOpenedFrom,
            patientChartConfig: config,
          };
          return <Extension state={state} />;
        }}
      </ExtensionSlot>
    );
  },
);

export default StartVisitForm;
