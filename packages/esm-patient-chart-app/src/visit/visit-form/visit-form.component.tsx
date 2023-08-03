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
import { first } from 'rxjs/operators';
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
} from '@openmrs/esm-framework';
import {
  amPm,
  convertTime12to24,
  DefaultWorkspaceProps,
  useActivePatientEnrollment,
  PatientProgram,
} from '@openmrs/esm-patient-common-lib';
import BaseVisitType from './base-visit-type.component';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import { ChartConfig } from '../../config-schema';
import VisitAttributeTypeFields from './visit-attribute-type.component';
import { saveQueueEntry } from '../hooks/useServiceQueue';
import styles from './visit-form.scss';
import LocationSelector from './location-selection.component';
import { AppointmentPayload, saveAppointment } from '../hooks/useUpcomingAppointments';
import { useLocations } from '../hooks/useLocations';

const StartVisitForm: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace, promptBeforeClosing }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const sessionUser = useSession();
  const { error: errorFetchingLocations } = useLocations();
  const sessionLocation = sessionUser?.sessionLocation?.uuid;
  const config = useConfig() as ChartConfig;
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const visitHeaderSlotState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const allVisitTypes = useVisitTypes();
  const [enrollment, setEnrollment] = useState<PatientProgram>(activePatientEnrollment[0]);
  const { mutate } = useVisit(patientUuid);
  const [ignoreChanges, setIgnoreChanges] = useState(true);
  const [visitAttributes, setVisitAttributes] = useState<{ [uuid: string]: string }>({});
  const [isMissingRequiredAttributes, setIsMissingRequiredAttributes] = useState(false);
  const [errorFetchingResources, setErrorFetchingResources] = useState<{
    blockSavingForm: boolean;
  }>(null);
  const [selectedLocation, setSelectedLocation] = useState(() => (sessionLocation ? sessionLocation : ''));
  const [visitType, setVisitType] = useState<string | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const upcomingAppointmentState = useMemo(() => ({ patientUuid, setUpcomingAppointment }), [patientUuid]);
  const visitQueueNumberAttributeUuid = config.visitQueueNumberAttributeUuid;

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (config.visitAttributeTypes?.find(({ uuid, required }) => required && !visitAttributes[uuid])) {
        setIsMissingRequiredAttributes(true);
        return;
      }
      if (!visitType) {
        setIsMissingVisitType(true);
        return;
      }

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
        location: selectedLocation,
        attributes: Object.entries(visitAttributes)
          .filter(([key, value]) => !!value)
          .map(([key, value]) => ({
            attributeType: key,
            value,
          })),
      };

      const abortController = new AbortController();
      saveVisit(payload, abortController)
        .pipe(first())
        .subscribe(
          (response) => {
            if (response.status === 201) {
              if (config.showServiceQueueFields) {
                // retrieve values from queue extension

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
                      mutate();
                      showToast({
                        kind: 'success',
                        title: t('visitStarted', 'Visit started'),
                        description: t(
                          'queueAddedSuccessfully',
                          `Patient has been added to the queue successfully.`,
                          `${hours} : ${minutes}`,
                        ),
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
                  locationUuid: selectedLocation,
                  patientUuid: patientUuid,
                  uuid: upcomingAppointment?.uuid,
                  dateHonored: dayjs(visitDate).format(),
                };
                saveAppointment(appointmentPayload, abortController).then(
                  ({ status }) => {
                    if (status === 201) {
                      mutate();
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
              mutate();
              closeWorkspace();

              showToast({
                critical: true,
                kind: 'success',
                description: t('visitStartedSuccessfully', '{visit} started successfully', {
                  visit: response?.data?.visitType?.display ?? `Visit`,
                }),
                title: t('visitStarted', 'Visit started'),
              });
            }
          },
          (error) => {
            showNotification({
              title: t('startVisitError', 'Error starting visit'),
              kind: 'error',
              critical: true,
              description: error?.message,
            });
          },
        );
    },
    [
      closeWorkspace,
      config.visitAttributeTypes,
      config.showServiceQueueFields,
      config.showUpcomingAppointments,
      visitQueueNumberAttributeUuid,
      mutate,
      patientUuid,
      upcomingAppointment,
      selectedLocation,
      t,
      timeFormat,
      visitDate,
      visitTime,
      visitType,
      visitAttributes,
      setIsMissingRequiredAttributes,
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
    <Form className={styles.form} onChange={handleOnChange} onSubmit={handleSubmit}>
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
            <ExtensionSlot name="patient-details-header-slot" state={visitHeaderSlotState} />
          </Row>
        )}
        <Stack gap={1} className={styles.container}>
          {/* Date and time of visit. Defaults to the current date and time. */}
          <section>
            <div className={styles.sectionTitle}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</div>
            <div className={`${styles.dateTimeSection} ${styles.sectionField}`}>
              <ResponsiveWrapper isTablet={isTablet}>
                <DatePicker
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  id="visitDate"
                  style={{ paddingBottom: '1rem' }}
                  maxDate={new Date().toISOString()}
                  onChange={([date]) => setVisitDate(date)}
                  value={visitDate}
                >
                  <DatePickerInput
                    id="visitStartDateInput"
                    labelText={t('date', 'Date')}
                    placeholder="dd/mm/yyyy"
                    style={{ width: '100%' }}
                  />
                </DatePicker>
              </ResponsiveWrapper>
              <ResponsiveWrapper isTablet={isTablet}>
                <TimePicker
                  id="visitStartTime"
                  labelText={t('time', 'Time')}
                  onChange={(event) => setVisitTime(event.target.value as amPm)}
                  pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                  style={{ marginLeft: '0.125rem', flex: 'none' }}
                  value={visitTime}
                >
                  <TimePickerSelect
                    id="visitStartTimeSelect"
                    onChange={(event) => setTimeFormat(event.target.value as amPm)}
                    value={timeFormat}
                    aria-label={t('time', 'Time')}
                  >
                    <SelectItem value="AM" text="AM" />
                    <SelectItem value="PM" text="PM" />
                  </TimePickerSelect>
                </TimePicker>
              </ResponsiveWrapper>
            </div>
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
          <LocationSelector selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />

          {/* Lists available program types. This feature is dependent on the `showRecommendedVisitTypeTab` config being set
          to true. */}
          {config.showRecommendedVisitTypeTab && (
            <section>
              <div className={styles.sectionTitle}>{t('program', 'Program')}</div>
              <FormGroup legendText={t('selectProgramType', 'Select program type')} className={styles.sectionField}>
                <RadioButtonGroup
                  defaultSelected={enrollment?.program?.uuid ?? ''}
                  orientation="vertical"
                  onChange={(uuid) =>
                    setEnrollment(activePatientEnrollment.find(({ program }) => program.uuid === uuid))
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
                      onChange={(visitType) => {
                        setVisitType(visitType);
                        setIsMissingVisitType(false);
                      }}
                      patientUuid={patientUuid}
                      patientProgramEnrollment={enrollment}
                      locationUuid={selectedLocation}
                    />
                  )}
                  {contentSwitcherIndex === 1 && (
                    <BaseVisitType
                      onChange={(visitType) => {
                        setVisitType(visitType);
                        setIsMissingVisitType(false);
                      }}
                      visitTypes={allVisitTypes}
                      patientUuid={patientUuid}
                    />
                  )}
                </>
              ) : (
                // Defaults to showing all possible visit types if recommended visits are not enabled
                <BaseVisitType
                  onChange={(visitType) => {
                    setVisitType(visitType);
                    setIsMissingVisitType(false);
                  }}
                  visitTypes={allVisitTypes}
                  patientUuid={patientUuid}
                />
              )}
            </div>
          </section>

          {isMissingVisitType && (
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
              <VisitAttributeTypeFields
                setVisitAttributes={setVisitAttributes}
                isMissingRequiredAttributes={isMissingRequiredAttributes}
                visitAttributes={visitAttributes}
                setErrorFetchingResources={setErrorFetchingResources}
              />
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
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace(ignoreChanges)}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          disabled={isSubmitting || errorFetchingResources?.blockSavingForm}
          kind="primary"
          type="submit"
        >
          {t('startVisit', 'Start visit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

export default StartVisitForm;
