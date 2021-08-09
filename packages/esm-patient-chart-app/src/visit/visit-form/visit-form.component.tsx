import React, { useCallback, useEffect, useState } from 'react';
import styles from './visit-form.component.scss';
import Button from 'carbon-components-react/es/components/Button';
import DatePicker from 'carbon-components-react/es/components/DatePicker';
import DatePickerInput from 'carbon-components-react/es/components/DatePickerInput';
import Form from 'carbon-components-react/es/components/Form';
import { useTranslation } from 'react-i18next';
import { Column, Grid, Row } from 'carbon-components-react/es/components/Grid';
import TimePicker from 'carbon-components-react/es/components/TimePicker';
import TimePickerSelect from 'carbon-components-react/es/components/TimePickerSelect';
import SelectItem from 'carbon-components-react/es/components/SelectItem';
import ContentSwitcher from 'carbon-components-react/es/components/ContentSwitcher';
import Switch from 'carbon-components-react/es/components/Switch';
import Select from 'carbon-components-react/es/components/Select';
import VisitTypeOverview from './visit-type-overview.component';
import {
  createErrorHandler,
  detach,
  getStartedVisit,
  NewVisitPayload,
  saveVisit,
  showToast,
  useLocations,
  useSessionUser,
  VisitMode,
  VisitStatus,
} from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { convertTime12to24, getDatePart } from './start-visit-helper';

interface StartVisitFormProps {
  isTablet: boolean;
  patientUuid: string;
}

const StartVisitForm: React.FC<StartVisitFormProps> = ({ isTablet, patientUuid }) => {
  const { t } = useTranslation();
  const locations = useLocations();
  const sessionUser = useSessionUser();
  const isPM = useCallback(() => new Date().getHours() >= 12, []);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>(dayjs(new Date()).format('DD/MM/YYYY'));
  const [visitTime, setVisitTime] = useState<string>(dayjs(new Date()).format('hh:mm'));
  const [timeFormat, setTimeFormat] = useState<string>(isPM() ? 'PM' : 'AM');
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState<number>(1);
  const [visitType, setVisitType] = useState<string>();

  useEffect(() => {
    if (locations && sessionUser?.sessionLocation?.uuid) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    }
  }, [locations, sessionUser]);

  const handleCloseForm = useCallback(() => detach('patient-chart-workspace-slot', 'start-visit-workspace-form'), []);

  const handleStartVisit = useCallback(
    (event) => {
      event.preventDefault();
      const [hours, minutes] = convertTime12to24(visitTime, timeFormat);
      let visitPayload: NewVisitPayload = {
        patient: patientUuid,
        startDatetime: new Date(
          getDatePart('year', visitDate),
          getDatePart('month', visitDate),
          getDatePart('date', visitDate),
          hours,
          minutes,
        ),
        visitType: visitType,
        location: selectedLocation,
      };

      saveVisit(visitPayload, new AbortController()).subscribe(
        (response) => {
          if (response.status === 201) {
            getStartedVisit.next({
              mode: VisitMode.NEWVISIT,
              visitData: response.data,
              status: VisitStatus.ONGOING,
            });
            handleCloseForm();
            showToast({
              kind: 'success',
              description: t('startVisitSuccessfully', 'Visit has been started successfully'),
            });
          }
        },
        (error) => {
          createErrorHandler();
          showToast({
            kind: 'error',
            description: t('startVisitErrorMessage', 'An error occurred while starting a visit'),
          });
        },
      );
    },
    [handleCloseForm, patientUuid, selectedLocation, t, timeFormat, visitDate, visitTime, visitType],
  );

  return (
    <Form>
      <Grid style={{ margin: 0, padding: '0 1rem' }}>
        <Row style={{ marginTop: '0.5rem', marginBottom: '2.75rem' }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</span>
          </Column>
          <Column sm={3} style={{ display: 'flex' }}>
            <DatePicker light={isTablet} dateFormat="d/m/Y" datePickerType="single" maxDate={new Date().toISOString()}>
              <DatePickerInput
                value={visitDate}
                onChange={(event) => setVisitDate(event.target.value)}
                id="visitDateTimePicker"
                labelText={t('date', 'Date')}
                placeholder="dd/mm/yyyy"
                style={{ width: '100%' }}
              />
            </DatePicker>
            <TimePicker
              pattern="([\d]+:[\d]{2})"
              value={visitTime}
              onChange={(event) => setVisitTime(event.target.value)}
              light={isTablet}
              style={{ marginLeft: '0.125rem', flex: 'none' }}
              labelText={t('time', 'Time')}
              id="time-picker">
              <TimePickerSelect
                onChange={(event) => setTimeFormat(event.target.value)}
                value={timeFormat}
                labelText={t('time', 'Time')}
                id="time-picker-select-1">
                <SelectItem value="AM" text="AM" />
                <SelectItem value="PM" text="PM" />
              </TimePickerSelect>
            </TimePicker>
          </Column>
        </Row>
        <Row style={{ marginTop: '0.5rem', marginBottom: '2.75rem' }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('visitLocation', 'Visit Location')}</span>
          </Column>
          <Column sm={3}>
            <Select
              labelText={t('searchForALocation', 'Select a location')}
              id="location"
              invalidText="Required"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              light={isTablet}>
              {locations?.length > 0 &&
                locations.map((location) => (
                  <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                    {location.display}
                  </SelectItem>
                ))}
            </Select>
          </Column>
        </Row>
        <Row style={{ marginTop: '0.5rem', marginBottom: '2.75rem' }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('visitType', 'Visit Type')}</span>
          </Column>
          <Column sm={3}>
            <ContentSwitcher
              selectedIndex={contentSwitcherIndex}
              className={styles.contentSwitcher}
              size="lg"
              onChange={({ index }) => setContentSwitcherIndex(index)}>
              <Switch name={'recommended'} text={t('recommended', 'Recommended')} />
              <Switch name={'All'} text={t('all', 'All')} />
            </ContentSwitcher>
            <VisitTypeOverview isTablet={isTablet} onChange={setVisitType} />
          </Column>
        </Row>
        <Row>
          <Column className={styles.buttonContainer}>
            <Button onClick={handleCloseForm} kind="secondary" style={{ width: '100%' }}>
              {t('discard', 'Discard')}
            </Button>
            <Button onClick={handleStartVisit} kind="primary" style={{ width: '100%' }} type="submit">
              {t('startVisit', 'Start visit')}
            </Button>
          </Column>
        </Row>
      </Grid>
    </Form>
  );
};

export default StartVisitForm;
