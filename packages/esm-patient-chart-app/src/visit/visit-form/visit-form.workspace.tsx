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
  saveVisit,
  showSnackbar,
  updateVisit,
  useConfig,
  useConnectivity,
  useEmrConfiguration,
  useFeatureFlag,
  useLayoutType,
  useSession,
  useVisit,
  type AssignedExtension,
  type NewVisitPayload,
  type Visit,
} from '@openmrs/esm-framework';
import {
  createOfflineVisitForPatient,
  useActivePatientEnrollment,
  type DefaultPatientWorkspaceProps,
} from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type ChartConfig } from '../../config-schema';
import { useDefaultVisitLocation } from '../hooks/useDefaultVisitLocation';
import { useVisitAttributeTypes } from '../hooks/useVisitAttributeType';
import { invalidateUseVisits, useInfiniteVisits } from '../visits-widget/visit.resource';
import BaseVisitType from './base-visit-type.component';
import LocationSelector from './location-selector.component';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import VisitAttributeTypeFields from './visit-attribute-type.component';
import VisitDateTimeSection from './visit-date-time.component';
import {
  convertToDate,
  createVisitAttribute,
  deleteVisitAttribute,
  updateVisitAttribute,
  useConditionalVisitTypes,
  useVisitFormCallbacks,
  useVisitFormSchemaAndDefaultValues,
  visitStatuses,
  type VisitFormCallbacks,
  type VisitFormData,
} from './visit-form.resource';
import styles from './visit-form.scss';
dayjs.extend(isSameOrBefore);

interface VisitFormProps extends DefaultPatientWorkspaceProps {
  /**
   * A unique string identifying where the visit form is opened from.
   * This string is passed into various extensions within the form to
   * affect how / if they should be rendered.
   */
  openedFrom: string;
  showPatientHeader?: boolean;
  visitToEdit?: Visit;
}
/**
 * This form is used for starting a new visit and for editing
 * an existing visit
 */
const VisitForm: React.FC<VisitFormProps> = ({
  closeWorkspace,
  patient,
  patientUuid,
  promptBeforeClosing,
  showPatientHeader = false,
  visitToEdit,
  openedFrom,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const isOnline = useConnectivity();
  const config = useConfig<ChartConfig>();
  const { emrConfiguration } = useEmrConfiguration();
  const [visitTypeContentSwitcherIndex, setVisitTypeContentSwitcherIndex] = useState(
    config.showRecommendedVisitTypeTab ? 0 : 1,
  );
  const visitHeaderSlotState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const { mutateVisits: mutateInfiniteVisits } = useInfiniteVisits(patientUuid);
  const allVisitTypes = useConditionalVisitTypes();

  const [errorFetchingResources, setErrorFetchingResources] = useState<{
    blockSavingForm: boolean;
  }>(null);
  const { visitAttributeTypes } = useVisitAttributeTypes();
  const [visitFormCallbacks, setVisitFormCallbacks] = useVisitFormCallbacks();
  const [extraVisitInfo, setExtraVisitInfo] = useState(null);

  const { visitFormSchema, defaultValues, firstEncounterDateTime, lastEncounterDateTime } =
    useVisitFormSchemaAndDefaultValues(visitToEdit);

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
    reset,
  } = methods;

  // default values are cached so form needs to be reset when they change (e.g. when default visit location finishes loading)
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

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
      const {
        visitStatus,
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

      const { handleCreateExtraVisitInfo, attributes: extraAttributes } = extraVisitInfo ?? {};
      const hasStartTime = ['ongoing', 'past'].includes(visitStatus);
      const hasStopTime = 'past' == visitStatus;
      const startDatetime = convertToDate(visitStartDate, visitStartTime, visitStartTimeFormat);
      const stopDatetime = convertToDate(visitStopDate, visitStopTime, visitStopTimeFormat);

      let payload: NewVisitPayload = {
        visitType: visitType,
        location: visitLocation?.uuid,
        startDatetime: hasStartTime ? startDatetime : null,
        stopDatetime: hasStopTime ? stopDatetime : null,
        // The request throws 400 (Bad request) error when the patient is passed in the update payload for existing visit
        ...(!visitToEdit && { patient: patientUuid }),
        ...(config.showExtraVisitAttributesSlot && extraAttributes && { attributes: extraAttributes }),
      };

      if (config.showExtraVisitAttributesSlot) {
        handleCreateExtraVisitInfo?.();
      }

      const abortController = new AbortController();
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
            mutateCurrentVisit();
            invalidateUseVisits(patientUuid);
            mutateInfiniteVisits();
          });
      } else {
        createOfflineVisitForPatient(
          patientUuid,
          visitLocation.uuid,
          config.offlineVisitTypeUuid,
          payload.startDatetime,
        ).then(
          () => {
            mutateCurrentVisit();
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
      extraVisitInfo,
      handleVisitAttributes,
      isOnline,
      mutateCurrentVisit,
      mutateInfiniteVisits,
      visitFormCallbacks,
      patientUuid,
      t,
      visitToEdit,
    ],
  );

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
          <Stack gap={4} className={styles.container}>
            <section>
              <div className={styles.sectionTitle}>{t('theVisitIs', 'The visit is')}</div>
              <FormGroup>
                <Controller
                  name="visitStatus"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    const validVisitStatuses = visitToEdit ? ['ongoing', 'past'] : visitStatuses;
                    const selectedIndex = validVisitStatuses.indexOf(value) ?? 0;

                    // For some reason, Carbon throws NPE when trying to conditionally
                    // render a <Switch> component
                    return visitToEdit ? (
                      <ContentSwitcher selectedIndex={selectedIndex} onChange={({ name }) => onChange(name)}>
                        <Switch name="ongoing" text={t('ongoing', 'Ongoing')} />
                        <Switch name="past" text={t('ended', 'Ended')} />
                      </ContentSwitcher>
                    ) : (
                      <ContentSwitcher selectedIndex={selectedIndex} onChange={({ name }) => onChange(name)}>
                        <Switch name="new" text={t('new', 'New')} />
                        <Switch name="ongoing" text={t('ongoing', 'Ongoing')} />
                        <Switch name="past" text={t('inThePast', 'In the past')} />
                      </ContentSwitcher>
                    );
                  }}
                />
              </FormGroup>
            </section>
            <VisitDateTimeSection {...{ control, firstEncounterDateTime, lastEncounterDateTime }} />
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
                        selectedIndex={visitTypeContentSwitcherIndex}
                        onChange={({ index }) => setVisitTypeContentSwitcherIndex(index)}
                      >
                        <Switch name="recommended" text={t('recommended', 'Recommended')} />
                        <Switch name="all" text={t('all', 'All')} />
                      </ContentSwitcher>
                      {visitTypeContentSwitcherIndex === 0 && !isLoading && (
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
                      {visitTypeContentSwitcherIndex === 1 && <BaseVisitType visitTypes={allVisitTypes} />}
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

export default VisitForm;
