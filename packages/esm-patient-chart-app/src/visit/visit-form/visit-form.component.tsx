import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
  Select,
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
  useLocations,
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
import styles from './visit-form.scss';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import { ChartConfig } from '../../config-schema';
import VisitAttributeTypeFields from './visit-attribute-type.component';
import {
  QueueEntryPayload,
  saveQueueEntry,
  usePriorities,
  useQueueLocations,
  useServices,
  useStatuses,
} from '../hooks/useServiceQueue';

const StartVisitForm: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace, promptBeforeClosing }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSession();
  const config = useConfig() as ChartConfig;
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [visitType, setVisitType] = useState<string | null>(null);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const allVisitTypes = useVisitTypes();
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const [enrollment, setEnrollment] = useState<PatientProgram>(activePatientEnrollment[0]);
  const { mutate } = useVisit(patientUuid);
  const [ignoreChanges, setIgnoreChanges] = useState(true);
  const [visitAttributes, setVisitAttributes] = useState<{ [uuid: string]: string }>({});
  const [isMissingRequiredAttributes, setIsMissingRequiredAttributes] = useState(false);
  const [priority, setPriority] = useState('');
  const { priorities } = usePriorities();
  const { statuses } = useStatuses();
  const [selectedStatus, setSelectedStatus] = useState(config.defaultStatusConceptUuid);
  const [errorFetchingResources, setErrorFetchingResources] = useState<{
    blockSavingForm: boolean;
  }>(null);
  const [selectedQueueLocation, setSelectedQueueLocation] = useState(sessionUser?.sessionLocation?.uuid);
  const { services, isLoadingServices } = useServices(selectedQueueLocation);
  const [selectedService, setSelectedService] = useState('');
  const { queueLocations } = useQueueLocations();

  useEffect(() => {
    if (!isLoading) {
      setSelectedService(services.length > 0 ? services[0].uuid : '');
    }
  }, [isLoading, isLoadingServices, services]);

  useEffect(() => {
    if (locations && sessionUser?.sessionLocation?.uuid) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
      setVisitType(allVisitTypes?.length === 1 ? allVisitTypes[0].uuid : null);
    }
  }, [allVisitTypes, locations, sessionUser]);

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
                const defaultStatus = config.defaultStatusConceptUuid;
                const defaultPriority = config.defaultPriorityConceptUuid;
                const queuePayload: QueueEntryPayload = {
                  visit: {
                    uuid: response.data.uuid,
                  },
                  queueEntry: {
                    status: {
                      uuid: selectedStatus ? selectedStatus : defaultStatus,
                    },
                    priority: {
                      uuid: priority ? priority : defaultPriority,
                    },
                    queue: {
                      uuid: selectedService,
                    },
                    patient: {
                      uuid: patientUuid,
                    },
                    startedAt: toDateObjectStrict(toOmrsIsoString(new Date())),
                  },
                };

                saveQueueEntry(queuePayload, abortController)
                  .pipe(first())
                  .subscribe(
                    (response) => {
                      if (response.status === 201) {
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
              mutate();
              closeWorkspace();

              showToast({
                critical: true,
                kind: 'success',
                description: t(
                  'visitStartedSuccessfully',
                  `${response?.data?.visitType?.display} started successfully`,
                ),
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
      config.defaultPriorityConceptUuid,
      config.defaultStatusConceptUuid,
      config.showServiceQueueFields,
      mutate,
      patientUuid,
      priority,
      selectedLocation,
      selectedService,
      selectedStatus,
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

  const locationSelect = (
    <Select
      labelText={t('selectLocation', 'Select a location')}
      id="location"
      invalidText="Required"
      value={selectedLocation}
      onChange={(event) => setSelectedLocation(event.target.value)}
    >
      {locations?.length > 0 &&
        locations.map((location) => (
          <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
            {location.display}
          </SelectItem>
        ))}
    </Select>
  );

  const datePicker = (
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
  );

  const timePicker = (
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
  );

  return (
    <Form className={styles.form} onChange={handleOnChange}>
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
            <ExtensionSlot extensionSlotName="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        )}
        <Stack gap={1} className={styles.container}>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</div>
            <div className={styles.dateTimeSection}>
              {isTablet ? <Layer>{datePicker}</Layer> : datePicker}
              {isTablet ? <Layer>{timePicker}</Layer> : timePicker}
            </div>
          </section>

          <section>
            <div className={styles.sectionTitle}>{t('visitLocation', 'Visit Location')}</div>
            <div className={styles.selectContainer}>{isTablet ? <Layer>{locationSelect}</Layer> : locationSelect}</div>
          </section>
          {config.showRecommendedVisitTypeTab && (
            <section>
              <div className={styles.sectionTitle}>{t('program', 'Program')}</div>
              <FormGroup legendText={t('selectProgramType', 'Select program type')}>
                <RadioButtonGroup
                  defaultSelected={enrollment?.program?.uuid}
                  orientation="vertical"
                  onChange={(uuid) =>
                    setEnrollment(activePatientEnrollment.find(({ program }) => program.uuid === uuid))
                  }
                  name="program-type-radio-group"
                  valueSelected="default-selected"
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
          <section>
            <div className={styles.sectionTitle}>{t('visitType', 'Visit Type')}</div>
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
          </section>
          {isMissingVisitType && (
            <section>
              <InlineNotification
                role="alert"
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingVisitType', 'Missing visit type')}
                subtitle={t('selectVisitType', 'Please select a Visit Type')}
              />
            </section>
          )}
          <section>
            <VisitAttributeTypeFields
              setVisitAttributes={setVisitAttributes}
              isMissingRequiredAttributes={isMissingRequiredAttributes}
              visitAttributes={visitAttributes}
              setErrorFetchingResources={setErrorFetchingResources}
            />
          </section>

          {config.showServiceQueueFields && (
            <>
              <section className={styles.section}>
                <div className={styles.queueSection}>
                  <div className={styles.sectionTitle}>{t('queueLocation', 'Queue location')}</div>
                  <Select
                    labelText={t('selectQueueLocation', 'Select a queue location')}
                    id="location"
                    invalidText="Required"
                    value={selectedQueueLocation}
                    onChange={(event) => {
                      setSelectedQueueLocation(event.target.value);
                    }}
                  >
                    {!selectedQueueLocation ? (
                      <SelectItem text={t('selectQueueLocation', 'Select a queue location')} value="" />
                    ) : null}
                    {queueLocations?.length > 0 &&
                      queueLocations.map((location) => (
                        <SelectItem key={location.id} text={location.name} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                  </Select>
                </div>

                <div className={styles.queueSection}>
                  <div className={styles.sectionTitle}>{t('service', 'Service')}</div>
                  {!services?.length ? (
                    <InlineNotification
                      className={styles.inlineNotification}
                      kind={'error'}
                      lowContrast
                      subtitle={t('configureServices', 'Please configure services to continue.')}
                      title={t('noServicesConfigured', 'No services configured')}
                    />
                  ) : (
                    <Select
                      labelText={t('selectService', 'Select a service')}
                      id="service"
                      invalidText="Required"
                      value={selectedService}
                      onChange={(event) => setSelectedService(event.target.value)}
                    >
                      {!selectedService ? <SelectItem text={t('chooseService', 'Select a service')} value="" /> : null}
                      {services?.length > 0 &&
                        services.map((service) => (
                          <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                            {service.display}
                          </SelectItem>
                        ))}
                    </Select>
                  )}
                </div>

                <div className={styles.queueSection}>
                  <div className={styles.sectionTitle}>{t('status', 'Status')}</div>
                  {!statuses?.length ? (
                    <InlineNotification
                      className={styles.inlineNotification}
                      kind={'error'}
                      lowContrast
                      subtitle={t('configureStatuses', 'Please configure statuses to continue.')}
                      title={t('noStatusesConfigured', 'No statuses configured')}
                    />
                  ) : (
                    <Select
                      labelText={t('selectStatus', 'Select a status')}
                      id="status"
                      invalidText="Required"
                      value={selectedStatus}
                      onChange={(event) => setSelectedStatus(event.target.value)}
                    >
                      {!selectedStatus ? <SelectItem text={t('chooseStatus', 'Select a status')} value="" /> : null}
                      {statuses?.length > 0 &&
                        statuses.map((service) => (
                          <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                            {service.display}
                          </SelectItem>
                        ))}
                    </Select>
                  )}
                </div>

                <div className={styles.queueSection}>
                  <div className={styles.sectionTitle}>{t('priority', 'Priority')}</div>
                  {!priorities?.length ? (
                    <InlineNotification
                      className={styles.inlineNotification}
                      kind={'error'}
                      lowContrast
                      subtitle={t('configurePriorities', 'Please configure priorities to continue.')}
                      title={t('noPrioritiesConfigured', 'No priorities configured')}
                    />
                  ) : (
                    <ContentSwitcher
                      size="sm"
                      selectionMode="manual"
                      onChange={(event) => {
                        setPriority(event.name as any);
                      }}
                    >
                      {priorities?.length > 0 &&
                        priorities.map(({ uuid, display }) => {
                          return <Switch name={uuid} text={display} value={uuid} index={uuid} />;
                        })}
                    </ContentSwitcher>
                  )}
                </div>
              </section>
            </>
          )}
        </Stack>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace(ignoreChanges)}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          onClick={handleSubmit}
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

export default StartVisitForm;
