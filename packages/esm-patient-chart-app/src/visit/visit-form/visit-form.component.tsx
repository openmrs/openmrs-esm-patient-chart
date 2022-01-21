import React, { useCallback, useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  Column,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  Form,
  Grid,
  InlineNotification,
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
  detach,
  getStartedVisit,
  saveVisit,
  showNotification,
  showToast,
  useLocations,
  useSessionUser,
  VisitMode,
  VisitStatus,
  ExtensionSlot,
  NewVisitPayload,
  toOmrsIsoString,
  toDateObjectStrict,
} from '@openmrs/esm-framework';
import { amPm, convertTime12to24 } from '@openmrs/esm-patient-common-lib';
import VisitTypeOverview from './visit-type-overview.component';
import styles from './visit-form.component.scss';

interface StartVisitFormProps {
  isTablet: boolean;
  patientUuid: string;
}

const StartVisitForm: React.FC<StartVisitFormProps> = ({ isTablet, patientUuid }) => {
  const { t } = useTranslation();
  const locations = useLocations();
  const sessionUser = useSessionUser();
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(1);
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [visitType, setVisitType] = useState<string | null>(null);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);

  useEffect(() => {
    if (locations && sessionUser?.sessionLocation?.uuid) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    }
  }, [locations, sessionUser]);

  const closeWorkspace = useCallback(() => detach('patient-chart-workspace-slot', 'start-visit-workspace-form'), []);

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

              getStartedVisit.next({
                mode: VisitMode?.NEWVISIT,
                visitData: response.data,
                status: VisitStatus?.ONGOING,
              });

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

  return (
    <Form onSubmit={handleSubmit} className={styles.form}>
      <Grid className={styles.grid}>
        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot extensionSlotName="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        )}
        <div className={styles.container}>
          <Row className={styles.gridRow}>
            <Column sm={1}>
              <span className={styles.columnLabel}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</span>
            </Column>
            <Column sm={3} style={{ display: 'flex' }}>
              <DatePicker
                dateFormat="d/m/Y"
                datePickerType="single"
                id="visitDate"
                light={isTablet}
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
            </Column>
          </Row>
          <Row className={styles.gridRow}>
            <Column sm={1}>
              <span className={styles.columnLabel}>{t('visitLocation', 'Visit Location')}</span>
            </Column>
            <Column sm={3}>
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
            </Column>
          </Row>
          <Row className={styles.gridRow}>
            <Column sm={1}>
              <span className={styles.columnLabel}>{t('visitType', 'Visit Type')}</span>
            </Column>
            <Column sm={3}>
              <ContentSwitcher
                selectedIndex={contentSwitcherIndex}
                className={styles.contentSwitcher}
                size="lg"
                onChange={({ index }) => setContentSwitcherIndex(index)}
              >
                <Switch name="recommended" text={t('recommended', 'Recommended')} />
                <Switch name="all" text={t('all', 'All')} />
              </ContentSwitcher>
              <VisitTypeOverview
                isTablet={isTablet}
                onChange={(visitType) => {
                  setVisitType(visitType);
                  setIsMissingVisitType(false);
                }}
              />
            </Column>
          </Row>
          {isMissingVisitType && (
            <Row className={styles.gridRow}>
              <Column sm={4}>
                <InlineNotification
                  style={{ margin: '0', minWidth: '100%' }}
                  kind="error"
                  lowContrast={true}
                  title={t('missingVisitType', 'Missing visit type')}
                  subtitle={t('selectVisitType', 'Please select a Visit Type')}
                />
              </Column>
            </Row>
          )}
        </div>
      </Grid>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('startVisit', 'Start visit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default StartVisitForm;
