import React, { useCallback, useMemo } from 'react';
import styles from './start-visit.component.scss';
import Button from 'carbon-components-react/es/components/Button';
import DatePicker from 'carbon-components-react/es/components/DatePicker';
import DatePickerInput from 'carbon-components-react/es/components/DatePickerInput';
import Form from 'carbon-components-react/es/components/Form';
import FormGroup from 'carbon-components-react/es/components/FormGroup';
import Search from 'carbon-components-react/es/components/Search';
import TextArea from 'carbon-components-react/es/components/TextArea';
import { useTranslation } from 'react-i18next';
import { Column, Grid, Row } from 'carbon-components-react/es/components/Grid';
import TimePicker from 'carbon-components-react/es/components/TimePicker';
import TimePickerSelect from 'carbon-components-react/es/components/TimePickerSelect';
import SelectItem from 'carbon-components-react/es/components/SelectItem';
import Dropdown from 'carbon-components-react/es/components/Dropdown';
import ContentSwitcher from 'carbon-components-react/es/components/ContentSwitcher';
import Switch from 'carbon-components-react/es/components/Switch';
import VisitTypeOverview from './visit-type-overview.component';
import { detach, useLocations } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

interface StartVisitFormProps {
  isTablet: boolean;
}

const StartVisitForm: React.FC<StartVisitFormProps> = ({ isTablet }) => {
  const { t } = useTranslation();
  const locations = useLocations();

  const visitLocations = useMemo(
    () =>
      locations?.map((location) => {
        return { id: location.uuid, label: location.display };
      }),
    [locations],
  );

  const isPM = () => new Date().getHours() >= 12;

  const handleCloseForm = useCallback(() => detach('patient-chart-workspace-slot', 'start-visit-workspace-form'), []);

  return (
    <Form className={styles.visitNoteForm}>
      <Grid style={{ margin: 0, padding: '0 1rem' }}>
        <Row style={{ marginTop: '0.5rem', marginBottom: '2.75rem' }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</span>
          </Column>
          <Column sm={3} style={{ display: 'flex' }}>
            <DatePicker light={isTablet} dateFormat="d/m/Y" datePickerType="single" maxDate={new Date().toISOString()}>
              <DatePickerInput
                id="visitDateTimePicker"
                labelText={t('date', 'Date')}
                placeholder="dd/mm/yyyy"
                style={{ width: '8.75rem' }}
              />
            </DatePicker>
            <TimePicker
              pattern="(1[012]|[1-9]):[0-5][0-9](\\s)?"
              value={dayjs(new Date()).format('hh:mm')}
              light={isTablet}
              style={{ marginLeft: '0.125rem' }}
              labelText={t('time', 'Time')}
              id="time-picker">
              <TimePickerSelect labelText={t('time', 'Time')} id="time-picker-select-1">
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
            <Dropdown
              light={isTablet}
              ariaLabel={t('selectALocation', 'Select a location')}
              id="selectLocation"
              items={visitLocations}
              label={t('selectALocation', 'Select a location')}
              titleText={t('selectALocation', 'Select a location')}
            />
          </Column>
        </Row>
        <Row style={{ marginTop: '0.5rem', marginBottom: '2.75rem' }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('visitType', 'Visit Type')}</span>
          </Column>
          <Column sm={3}>
            <ContentSwitcher className={styles.contentSwitcher} size="lg" onChange={console.log}>
              <Switch name={'recommended'} text={t('recommended', 'Recommended')} />
              <Switch name={'All'} text={t('all', 'All')} />
            </ContentSwitcher>
            <VisitTypeOverview isTablet={isTablet} />
          </Column>
        </Row>
        <Row>
          <Column>
            <Button onClick={handleCloseForm} kind="secondary" style={{ width: '50%' }}>
              {t('discard', 'Discard')}
            </Button>
            <Button kind="primary" style={{ width: '50%' }} type="submit">
              {t('startVisit', 'Start visit')}
            </Button>
          </Column>
        </Row>
      </Grid>
    </Form>
  );
};

export default StartVisitForm;
