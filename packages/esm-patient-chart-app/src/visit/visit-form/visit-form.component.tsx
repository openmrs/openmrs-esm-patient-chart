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
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import { ChartConfig } from '../../config-schema';
import VisitAttributeTypeFields from './visit-attribute-type.component';
import { saveQueueEntry } from '../hooks/useServiceQueue';
import styles from './visit-form.scss';
import { useDefaultLoginLocation } from '../hooks/useDefaultLocation';
import isEmpty from 'lodash-es/isEmpty';

const StartVisitForm: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace, promptBeforeClosing }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSession();
  const sessionLocation = sessionUser?.sessionLocation?.uuid;
  const config = useConfig() as ChartConfig;
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
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
  const visitQueueNumberAttributeUuid = config.visitQueueNumberAttributeUuid;
  const { defaultFacility, isLoading: loadingDefaultFacility } = useDefaultLoginLocation();

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
      visitQueueNumberAttributeUuid,
      mutate,
      patientUuid,
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
            <ExtensionSlot extensionSlotName="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        )}
        <Stack gap={1} className={styles.container}>
          {/* Date and time of visit. Defaults to the current date and time. */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</div>
            <div className={styles.dateTimeSection}>
              <DatePicker
                dateFormat="d/m/Y"
                datePickerType="single"
                id="visitDate"
                light={isTablet}
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

          {/* This field lets the user select a location for the visit. The location is required for the visit to be saved. Defaults to the active session location */}
          <section>
            <div className={styles.sectionTitle}>{t('visitLocation', 'Visit Location')}</div>
            <div className={styles.selectContainer}>
              <Select
                labelText={t('selectLocation', 'Select a location')}
                light={isTablet}
                id="location"
                invalidText="Required"
                value={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}
              >
                {!selectedLocation ? <SelectItem text={t('selectOption', 'Select an option')} value="" /> : null}
                {!isEmpty(defaultFacility) && !loadingDefaultFacility ? (
                  <SelectItem
                    key={defaultFacility?.uuid}
                    text={defaultFacility?.display}
                    value={defaultFacility?.uuid}>
                    {defaultFacility?.display}
                  </SelectItem>
                ) : locations?.length > 0 ? (
                  locations.map((location) => (
                    <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                      {location.display}
                    </SelectItem>
                  ))
                ) : null}
              </Select>
            </div>
          </section>

          {/* Lists available program types. This feature is dependent on the `showRecommendedVisitTypeTab` config being set
          to true. */}
          {config.showRecommendedVisitTypeTab && (
            <section>
              <div className={styles.sectionTitle}>{t('program', 'Program')}</div>
              <FormGroup legendText={t('selectProgramType', 'Select program type')}>
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
            <div className={styles.sectionTitle}>{t('visitType', 'Visit Type')}</div>

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

          {/* Visit type attribute fields. These get shown when visit attribute types are configured */}
          <section>
            <VisitAttributeTypeFields
              setVisitAttributes={setVisitAttributes}
              isMissingRequiredAttributes={isMissingRequiredAttributes}
              visitAttributes={visitAttributes}
              setErrorFetchingResources={setErrorFetchingResources}
            />
          </section>

          {/* Queue location and queue fields. These get shown when queue location and queue fields are configured */}
          {config.showServiceQueueFields && <ExtensionSlot extensionSlotName="add-queue-entry-slot" />}
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
