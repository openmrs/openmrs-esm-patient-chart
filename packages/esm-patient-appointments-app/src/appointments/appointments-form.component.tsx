import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  DatePickerInput,
  DatePicker,
  Form,
  InlineLoading,
  Layer,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TimePickerSelect,
  TimePicker,
} from '@carbon/react';
import { amPm, convertTime12to24 } from '@openmrs/esm-patient-common-lib';
import { useLocations, useSession, showToast, showNotification, useLayoutType } from '@openmrs/esm-framework';
import { saveAppointment, useAppointments, useAppointmentService } from './appointments.resource';
import { Appointment, AppointmentPayload } from '../types';
import styles from './appointments-form.scss';

const appointmentTypes = [{ name: 'Scheduled' }, { name: 'WalkIn' }];

interface AppointmentsFormProps {
  appointment?: Appointment;
  patientUuid?: string;
  context?: string;
  closeWorkspace: () => void;
}

const AppointmentsForm: React.FC<AppointmentsFormProps> = ({ patientUuid, closeWorkspace, appointment, context }) => {
  const editedAppointmentTimeFormat = new Date(appointment?.startDateTime).getHours() >= 12 ? 'PM' : 'AM';

  const defaultTimeFormat = appointment?.startDateTime
    ? editedAppointmentTimeFormat
    : new Date().getHours() >= 12
    ? 'PM'
    : 'AM';

  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const session = useSession();
  const [appointmentNote, setAppointmentNote] = useState(appointment?.comments || '');
  const [selectedAppointmentType, setSelectedAppointmentType] = useState(appointment?.appointmentKind || '');
  const [selectedService, setSelectedService] = useState(appointment?.service?.name || '');
  const [startDate, setStartDate] = useState(
    appointment?.startDateTime ? new Date(appointment?.startDateTime) : new Date(),
  );
  const [startTime, setStartTime] = useState(
    appointment?.startDateTime
      ? dayjs(new Date(appointment?.startDateTime)).format('hh:mm')
      : dayjs(new Date()).format('hh:mm'),
  );
  const [timeFormat, setTimeFormat] = useState<amPm>(defaultTimeFormat);
  const [userLocation, setUserLocation] = useState(appointment?.location?.uuid || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate } = useAppointments(patientUuid, new Date().toUTCString(), new AbortController());

  if (!userLocation && session?.sessionLocation?.uuid) {
    setUserLocation(session?.sessionLocation?.uuid);
  }

  const { data: services, isLoading } = useAppointmentService();

  // Same for creating and editing
  const handleSaveAppointment = () => {
    setIsSubmitting(true);

    // Construct payload
    const serviceUuid = services?.find((service) => service.name === selectedService)?.uuid;
    const serviceDuration = services?.find((service) => service.name === selectedService)?.durationMins;

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
      .add(serviceDuration, 'minutes')
      .toDate();

    const appointmentPayload: AppointmentPayload = {
      appointmentKind: selectedAppointmentType,
      serviceUuid: serviceUuid,
      startDateTime: dayjs(startDatetime).format(),
      endDateTime: dayjs(endDatetime).format(),
      providerUuid: session?.currentProvider?.uuid,
      providers: [{ uuid: session.currentProvider.uuid }],
      locationUuid: userLocation,
      patientUuid: patientUuid,
      comments: appointmentNote,
      uuid: context === 'editing' ? appointment.uuid : undefined,
    };

    const abortController = new AbortController();
    saveAppointment(appointmentPayload, abortController).then(
      ({ status }) => {
        if (status === 200) {
          setIsSubmitting(false);
          closeWorkspace();
          mutate();

          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title:
              context === 'editing'
                ? t('appointmentEdited', 'Appointment edited')
                : t('appointmentScheduled', 'Appointment scheduled'),
          });
        }
      },
      (error) => {
        setIsSubmitting(false);
        showNotification({
          title:
            context === 'editing'
              ? t('appointmentEditError', 'Error editing appointment')
              : t('appointmentFormError', 'Error scheduling appointment'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  };

  if (isLoading)
    return (
      <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} role="progressbar" />
    );

  return (
    <Form className={styles.formWrapper}>
      <Stack gap={4}>
        <section className={styles.formGroup}>
          <span>{t('location', 'Location')}</span>
          <div className={styles.selectContainer}>
            <ResponsiveWrapper isTablet={isTablet}>
              <Select
                id="location"
                invalidText="Required"
                labelText={t('selectLocation', 'Select a location')}
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
            </ResponsiveWrapper>
          </div>
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

            <ResponsiveWrapper isTablet={isTablet}>
              <TimePicker
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
                  aria-label={t('time', 'Time')}
                >
                  <SelectItem value="AM" text="AM" />
                  <SelectItem value="PM" text="PM" />
                </TimePickerSelect>
              </TimePicker>
            </ResponsiveWrapper>
          </div>
        </section>
        <section className={styles.formGroup}>
          <span>{t('service', 'Service')}</span>
          <ResponsiveWrapper isTablet={isTablet}>
            <Select
              id="service"
              invalidText="Required"
              labelText={t('selectService', 'Select a service')}
              onChange={(event) => setSelectedService(event.target.value)}
              value={selectedService}
            >
              {!selectedService ? <SelectItem text={t('chooseService', 'Select service')} value="" /> : null}
              {services?.length > 0 &&
                services.map((service) => (
                  <SelectItem key={service.uuid} text={service.name} value={service.name}>
                    {service.name}
                  </SelectItem>
                ))}
            </Select>
          </ResponsiveWrapper>
        </section>
        <section className={styles.formGroup}>
          <span>{t('appointmentType', 'Appointment Type')}</span>
          <ResponsiveWrapper isTablet={isTablet}>
            <Select
              disabled={!appointmentTypes?.length}
              id="appointmentType"
              invalidText="Required"
              labelText={t('selectAppointmentType', 'Select the type of appointment')}
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
          </ResponsiveWrapper>
        </section>
        <section className={styles.formGroup}>
          <span>{t('note', 'Note')}</span>
          <TextArea
            id="appointmentNote"
            light={isTablet}
            value={appointmentNote}
            labelText={t('appointmentNoteLabel', 'Write an additional note')}
            placeholder={t('appointmentNotePlaceholder', 'Write any additional points here')}
            onChange={(event) => setAppointmentNote(event.target.value)}
          />
        </section>
      </Stack>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} onClick={closeWorkspace} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={!selectedService || isSubmitting} onClick={handleSaveAppointment}>
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }) {
  return isTablet ? <Layer>{children}</Layer> : <div>{children}</div>;
}

export default AppointmentsForm;
