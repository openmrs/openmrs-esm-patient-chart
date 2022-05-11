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
  RadioButton,
  RadioButtonGroup,
  Row,
  Select,
  SelectItem,
  Switch,
  TimePicker,
  TimePickerSelect,
} from 'carbon-components-react';
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

  useEffect(() => {
    if (locations && sessionUser?.sessionLocation?.uuid) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    }
  }, [locations, sessionUser]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

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
      };

      const abortController = new AbortController();
      saveVisit(payload, abortController)
        .pipe(first())
        .subscribe(
          (response) => {
            if (response.status === 201) {
              closeWorkspace();
              mutate();
              showToast({
                kind: 'success',
                description: t('startVisitSuccessfully', 'Visit started successfully'),
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
    [closeWorkspace, patientUuid, selectedLocation, t, timeFormat, visitDate, visitTime, visitType],
  );

  const handleOnChange = () => {
    setIgnoreChanges((prevState) => !prevState);
    promptBeforeClosing(() => true);
  };

  return (
    <Form className={styles.form} onChange={handleOnChange}>
      <div>
        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot extensionSlotName="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        )}
        <div className={styles.container}>
          <section>
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
              <TimePicker
                id="visitStartTime"
                labelText={t('time', 'Time')}
                light={isTablet}
                onChange={(event) => setVisitTime(event.target.value)}
                pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                style={{ marginLeft: '0.125rem', flex: 'none' }}
                value={visitTime}
              >
                <TimePickerSelect
                  id="visitStartTimeSelect"
                  onChange={(event) => setTimeFormat(event.target.value as amPm)}
                  value={timeFormat}
                  labelText={t('time', 'Time')}
                  aria-label={t('time', 'Time')}
                >
                  <SelectItem value="AM" text="AM" />
                  <SelectItem value="PM" text="PM" />
                </TimePickerSelect>
              </TimePicker>
            </div>
          </section>

          <section>
            <div className={styles.sectionTitle}>{t('visitLocation', 'Visit Location')}</div>
            <Select
              labelText={t('selectLocation', 'Select a location')}
              id="location"
              invalidText="Required"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              light={isTablet}
            >
              {locations?.length > 0 &&
                locations.map((location) => (
                  <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                    {location.display}
                  </SelectItem>
                ))}
            </Select>
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
              className={styles.contentSwitcher}
              size="lg"
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
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingVisitType', 'Missing visit type')}
                subtitle={t('selectVisitType', 'Please select a Visit Type')}
              />
            </section>
          )}
        </div>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace(ignoreChanges)}>
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleSubmit} className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('startVisit', 'Start visit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default StartVisitForm;
