import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import dayjs from 'dayjs';
import {
  Button,
  DatePickerInput,
  DatePicker,
  SearchSkeleton,
  Select,
  SelectItem,
  TextArea,
  TimePickerSelect,
  TimePicker,
} from 'carbon-components-react';
import { amPm, convertTime12to24, DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { useLocations, useSessionUser, showToast, showNotification, useLayoutType } from '@openmrs/esm-framework';
import { appointmentsSearchUrl, createAppointment, useAppointmentService } from './appointments.resource';
import styles from './appointments-form.scss';
import { AppointmentPayload } from '../types';

const appointmentTypes = [{ name: 'Scheduled' }, { name: 'WalkIn' }];

const AppointmentsForm: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { mutate } = useSWRConfig();
  const locations = useLocations();
  const session = useSessionUser();
  const [appointmentNote, setAppointmentNote] = useState('');
  const [selectedAppointmentType, setSelectedAppointmentType] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [userLocation, setUserLocation] = useState('');

  if (!userLocation && session?.sessionLocation?.uuid) {
    setUserLocation(session?.sessionLocation?.uuid);
  }

  const { data: services, isLoading } = useAppointmentService();

  let serviceTypes;
  if (services?.length) {
    [{ serviceTypes }] = services;
  }

  const handleSubmit = () => {
    if (!selectedServiceType) return;

    const serviceType = serviceTypes.find((service) => service.name === selectedServiceType);

    const serviceUuid = services.find((service) => service.name === selectedService)?.uuid;

    const [hours, minutes] = convertTime12to24(startTime, timeFormat);

    const startDatetime = new Date(
      dayjs(startDate).year(),
      dayjs(startDate).month(),
      dayjs(startDate).date(),
      hours,
      minutes,
    );

    const endDatetime = dayjs(
      new Date(dayjs(startDate).year(), dayjs(startDate).month(), dayjs(startDate).date(), hours, minutes),
    )
      .add(serviceType.duration, 'minutes')
      .toDate();

    const appointmentPayload: AppointmentPayload = {
      appointmentKind: selectedAppointmentType,
      serviceUuid: serviceUuid,
      startDateTime: dayjs(startDatetime).format(),
      endDateTime: dayjs(endDatetime).format(),
      providerUuid: session?.currentProvider?.uuid,
      providers: [{ uuid: session.currentProvider.uuid, comments: appointmentNote }],
      locationUuid: userLocation,
      patientUuid: patientUuid,
    };

    const abortController = new AbortController();
    createAppointment(appointmentPayload, abortController).then(
      ({ status }) => {
        if (status === 200) {
          closeWorkspace();

          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title: t('appointmentScheduled', 'Appointment scheduled'),
          });
        }

        mutate(`${appointmentsSearchUrl}`);
      },
      (error) => {
        showNotification({
          title: t('appointmentFormError', 'Error scheduling appointment'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  };

  if (isLoading) return <SearchSkeleton role="progressbar" />;
  return (
    <div className={styles.formWrapper}>
      <section className={styles.formGroup}>
        <span>{t('location', 'Location')}</span>
        <Select
          id="location"
          invalidText="Required"
          labelText={t('selectLocation', 'Select a location')}
          light={isTablet}
          onChange={(event) => setUserLocation(event.target.value)}
          value={userLocation}
        >
          {!userLocation ? <SelectItem text={t('chooseLocation', 'Choose a location')} value="" /> : null}
          {locations?.length > 0 &&
            locations.map((location) => (
              <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                {location.display}
              </SelectItem>
            ))}
        </Select>
      </section>
      <section className={styles.formGroup}>
        <span>{t('dateTime', 'Date & Time')}</span>
        <div className={styles.datePickerControl}>
          <DatePicker
            datePickerType="single"
            dateFormat="d/m/Y"
            light={isTablet}
            value={startDate}
            onChange={([date]) => setStartDate(date)}
          >
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
            onChange={(event) => setStartTime(event.target.value)}
            value={startTime}
            style={{ marginLeft: '0.125rem', flex: 'none' }}
            labelText={t('time', 'Time')}
            id="time-picker"
          >
            <TimePickerSelect
              id="time-picker-select-1"
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
      <section className={styles.formGroup}>
        <span>{t('service', 'Service')}</span>
        <Select
          id="service"
          invalidText="Required"
          labelText={t('selectService', 'Select a service')}
          light={isTablet}
          onChange={(event) => setSelectedService(event.target.value)}
          value={selectedServiceType}
        >
          {!selectedService ? <SelectItem text={t('chooseService', 'Select service')} value="" /> : null}
          {services?.length > 0 &&
            services.map((service) => (
              <SelectItem key={service.uuid} text={service.name} value={service.name}>
                {service.name}
              </SelectItem>
            ))}
        </Select>
      </section>
      <section className={styles.formGroup}>
        <span>{t('serviceType', 'Service Type')}</span>
        <Select
          id="serviceType"
          invalidText="Required"
          labelText="Select the type of service"
          light={isTablet}
          onChange={(event) => setSelectedServiceType(event.target.value)}
          value={selectedServiceType}
        >
          {!selectedServiceType ? <SelectItem text={t('chooseService', 'Select service type')} value="" /> : null}
          {serviceTypes?.length > 0 &&
            serviceTypes.map((serviceType) => (
              <SelectItem key={serviceType.uuid} text={serviceType.name} value={serviceType.name}>
                {serviceType.name}
              </SelectItem>
            ))}
        </Select>
      </section>
      <section className={styles.formGroup}>
        <span>{t('appointmentType', 'Appointment Type')}</span>
        <Select
          disabled={!appointmentTypes?.length}
          id="appointmentType"
          invalidText="Required"
          labelText={t('selectAppointmentType', 'Select the type of appointment')}
          light={isTablet}
          onChange={(event) => setSelectedAppointmentType(event.target.value)}
          value={selectedAppointmentType}
        >
          {!selectedAppointmentType ? (
            <SelectItem text={t('chooseAppointmentType', 'Choose appointment type')} value="" />
          ) : null}
          {appointmentTypes?.length > 0 &&
            appointmentTypes.map((appointmentType, index) => (
              <SelectItem key={index} text={appointmentType.name} value={appointmentType.name}>
                {appointmentType.name}
              </SelectItem>
            ))}
        </Select>
      </section>
      <section className={styles.formGroup}>
        <span>{t('note', 'Note')}</span>
        <TextArea
          id="appointmentNote"
          light={isTablet}
          labelText={t('appointmentNoteLabel', 'Write an additional note')}
          placeholder={t('appointmentNotePlaceholder', 'Write any additional points here')}
          onChange={(event) => setAppointmentNote(event.target.value)}
        />
      </section>
      <section className={styles.buttonGroup}>
        <Button onClick={closeWorkspace} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button disabled={!selectedService} onClick={handleSubmit}>
          {t('saveAndClose', 'Save and close')}
        </Button>
      </section>
    </div>
  );
};

export default AppointmentsForm;
