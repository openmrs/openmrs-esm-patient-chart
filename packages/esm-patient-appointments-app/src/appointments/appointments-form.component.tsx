import React, { useState, useCallback, useMemo } from 'react';
import styles from './appointments-form.scss';
import { useTranslation } from 'react-i18next';
import {
  DataTableSkeleton,
  TextArea,
  SelectItem,
  DatePickerInput,
  DatePicker,
  TimePickerSelect,
  TimePicker,
  ComboBox,
  Button,
} from 'carbon-components-react';
import { useLocations, useSessionUser, detach, showToast, showNotification } from '@openmrs/esm-framework';
import useAppointmentService from '../hooks/useAppointmentService';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { AppointmentPayload, ServiceTypes } from '../types';
import dayjs from 'dayjs';
import isEmpty from 'lodash-es/isEmpty';
import { amPm, convertTime12to24 } from './appointments.helpers';
import { createAppointment } from './appointments.resource';

interface AppointmentsFormProps {
  patientUuid: string;
  isTablet: boolean;
  closeWorkspace: () => {};
}
const AppointmentKinds = [{ name: 'Scheduled' }, { name: 'WalkIn' }];

interface AppointmentFormData {
  timeFormat?: amPm;
  startDate?: string;
  startTime?: string;
  serviceType?: ServiceTypes;
  appointmentKind?: string;
  comments?: string;
  serviceUuid?: string;
  locationUuid?: string;
}

const AppointmentsForm: React.FC<AppointmentsFormProps> = ({ patientUuid, isTablet, closeWorkspace }) => {
  const { t } = useTranslation();
  const locations = useLocations();
  const session = useSessionUser();
  const { status, services, error } = useAppointmentService();

  const [formData, setFormData] = useState<AppointmentFormData>({
    timeFormat: new Date().getHours() >= 12 ? 'PM' : 'AM',
    startDate: new Date().toISOString(),
    startTime: dayjs(new Date()).format('hh:mm'),
  });

  const serviceTypes = useMemo(
    () => services.find((service) => service.uuid === formData?.serviceUuid)?.serviceTypes ?? [],
    [services, formData],
  );

  const handleSubmit = () => {
    const { startDate, timeFormat, startTime, serviceType, serviceUuid, comments, locationUuid } = formData;
    const [hours, minutes] = convertTime12to24(startTime, timeFormat);
    const startDatetime = new Date(
      dayjs(startDate).year(),
      dayjs(startDate).month(),
      dayjs(startDate).date(),
      hours,
      minutes,
    );
    dayjs();
    const endDatetime = dayjs(
      new Date(dayjs(startDate).year(), dayjs(startDate).month(), dayjs(startDate).date(), hours, minutes),
    )
      .add(serviceType.duration, 'minutes')
      .toDate();

    const payload: AppointmentPayload = {
      startDateTime: startDatetime,
      endDateTime: endDatetime,
      serviceUuid: serviceUuid,
      providerUuid: session?.currentProvider?.uuid,
      providers: [{ uuid: session.currentProvider.uuid, comments: comments }],
      locationUuid: locationUuid ?? session.sessionLocation.uuid,
      patientUuid: patientUuid,
      appointmentKind: formData.appointmentKind,
    };

    createAppointment(payload, new AbortController()).then(
      ({ status }) => {
        if (status === 200) {
          closeWorkspace();
          showToast({
            kind: 'success',
            description: t('appointmentScheduledSuccessfully', 'Appointment scheduled successfully'),
          });
        }
      },
      (error) => {
        showNotification({
          title: t('appointmentFormError', 'Error scheduling an appointment'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  };

  const onChange = useCallback((name: string, value: string | Date | Object) => {
    setFormData((prevState) => {
      return { ...prevState, [name]: value };
    });
  }, []);

  const handleClose = useCallback(() => detach('patient-chart-workspace-slot', 'appointment-form-workspace'), []);

  return (
    <>
      {status === 'resolved' && session?.sessionLocation && (
        <div className={styles.formWrapper}>
          <section className={styles.formGroup}>
            <span>{t('location', 'Location')}</span>
            <ComboBox
              light={isTablet}
              onChange={({ selectedItem }) => onChange('locationUuid', selectedItem?.uuid)}
              id="locationCombo"
              items={locations}
              itemToString={(location) => (location ? location.display : '')}
              placeholder="Search for a location"
              titleText={t('Select a location')}
              initialSelectedItem={session?.sessionLocation}
            />
          </section>
          <section className={styles.formGroup}>
            <span>{t('dateTime', 'Date and time')}</span>
            <div className={styles.datePickerControl}>
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                light={isTablet}
                value={formData.startDate}
                onChange={([date]) => onChange('startDate', date)}>
                <DatePickerInput
                  id="datePickerInput"
                  labelText={t('date', 'Date')}
                  style={{ width: '100%' }}
                  placeholder="dd/mm/yyyy"
                />
              </DatePicker>
              <TimePicker
                light={isTablet}
                pattern="([\d]+:[\d]{2})"
                onChange={(event) => onChange('startTime', event.target.value)}
                value={formData.startTime}
                style={{ marginLeft: '0.125rem', flex: 'none' }}
                labelText={t('time', 'Time')}
                id="time-picker">
                <TimePickerSelect
                  onChange={(event) => onChange('timeFormat', event.target.value)}
                  value={formData.timeFormat}
                  labelText={t('time', 'Time')}
                  id="time-picker-select-1">
                  <SelectItem value="AM" text="AM" />
                  <SelectItem value="PM" text="PM" />
                </TimePickerSelect>
              </TimePicker>
            </div>
          </section>
          <section className={styles.formGroup}>
            <span>{t('service', 'Service')}</span>
            <ComboBox
              light={isTablet}
              onChange={({ selectedItem }) => onChange('serviceUuid', selectedItem?.uuid)}
              id="serviceComboBox"
              items={services}
              itemToString={(item) => (item ? item.name : '')}
              placeholder={t('Search for a service')}
              titleText={t('selectServices', 'Select services')}
            />
          </section>

          <section className={styles.formGroup}>
            <span>{t('serviceType', 'Service Type')}</span>
            <ComboBox
              disabled={isEmpty(serviceTypes)}
              light={isTablet}
              onChange={({ selectedItem }) => onChange('serviceType', selectedItem)}
              id="serviceTypeCombobox"
              items={serviceTypes}
              itemToString={(item) => (item ? item.name : '')}
              placeholder={t('Search for a service type')}
              titleText={t('selectServices', 'Select services type')}
            />
          </section>

          <section className={styles.formGroup}>
            <span>{t('appointmentKind', 'Appointment Kind')}</span>
            <ComboBox
              light={isTablet}
              onChange={({ selectedItem }) => onChange('appointmentKind', selectedItem.name)}
              id="appointmentKindCombo"
              items={AppointmentKinds}
              itemToString={(item) => (item ? item.name : '')}
              placeholder={t('Select appointment kind')}
              titleText={t('selectAppointmentKind', 'Select appointment kind')}
            />
          </section>
          <section className={styles.formGroup}>
            <span>{t('note', 'Note')}</span>
            <TextArea
              id="appointmentComment"
              onChange={(event) => onChange('comments', event.target.value)}
              light={isTablet}
              labelText={t('writeAnAdditionalNote', 'Write an additional note')}
              placeholder={t('writeAnAdditionalNote', 'Write an additional note')}
            />
          </section>
          <section className={styles.buttonGroup}>
            <Button onClick={handleClose} kind="secondary">
              {t('discard', 'Discard')}
            </Button>
            <Button onClick={handleSubmit}>{t('saveAndClose', 'Save and close')}</Button>
          </section>
        </div>
      )}
      {status === 'pending' && <DataTableSkeleton rowCount={5} />}
      {status === 'error' && <ErrorState headerTitle={t('appointmentForm', 'Appointment Form')} error={error} />}
    </>
  );
};

export default AppointmentsForm;
