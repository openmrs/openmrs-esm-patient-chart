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
  MultiSelect,
  NumberInput,
  Select,
  SelectItem,
  Stack,
  RadioButtonGroup,
  RadioButton,
  TextArea,
  TimePickerSelect,
  TimePicker,
} from '@carbon/react';
import { useLocations, useSession, showToast, showNotification, useLayoutType } from '@openmrs/esm-framework';
import { amPm, convertTime12to24 } from '@openmrs/esm-patient-common-lib';
import {
  saveAppointment,
  saveRecurringAppointments,
  useAppointments,
  useAppointmentService,
} from './appointments.resource';
import { Appointment, AppointmentPayload, RecurringPattern } from '../types';
import { dateFormat, datePickerFormat, datePickerPlaceHolder, weekDays } from '../constants';
import styles from './appointments-form.scss';

const appointmentTypes = [{ name: 'Scheduled' }, { name: 'WalkIn' }];

interface AppointmentsFormProps {
  appointment?: Appointment;
  recurringPattern?: RecurringPattern;
  patientUuid?: string;
  context?: string;
  closeWorkspace: () => void;
}

const AppointmentsForm: React.FC<AppointmentsFormProps> = ({
  appointment,
  recurringPattern,
  patientUuid,
  context,
  closeWorkspace,
}) => {
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
  const { data: services, isLoading } = useAppointmentService();
  const [appointmentNote, setAppointmentNote] = useState(appointment?.comments || '');
  const [selectedAppointmentType, setSelectedAppointmentType] = useState(appointment?.appointmentKind || '');
  const [selectedService, setSelectedService] = useState(appointment?.service?.name || '');
  const [startDate, setStartDate] = useState(
    appointment?.startDateTime
      ? dayjs(new Date(appointment.startDateTime)).format(dateFormat)
      : dayjs(new Date()).format(dateFormat),
  );
  const [startTime, setStartTime] = useState(
    appointment?.startDateTime
      ? dayjs(new Date(appointment?.startDateTime)).format('hh:mm')
      : dayjs(new Date()).format('hh:mm'),
  );
  const [duration, setDuration] = useState(
    services?.find((service) => service.name === selectedService)?.durationMins || 15,
  );
  const [timeFormat, setTimeFormat] = useState<amPm>(defaultTimeFormat);
  const [userLocation, setUserLocation] = useState(appointment?.location?.uuid || '');
  const [recurringPatternType, setRecurringPatternType] = useState(recurringPattern?.type || 'DAY');
  const [recurringPatternPeriod, setRecurringPatternPeriod] = useState(recurringPattern?.period || 1);
  const [recurringPatternDaysOfWeek, setRecurringPatternDaysOfWeek] = useState(recurringPattern?.daysOfWeek || []);
  const [recurringPatternEndDate, setRecurringPatternEndDate] = useState(
    recurringPattern?.endDate ? dayjs(new Date(recurringPattern.endDate)).format(dateFormat) : '',
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useAppointments(patientUuid, new Date().toUTCString(), new AbortController());

  if (!userLocation && session?.sessionLocation?.uuid) {
    setUserLocation(session?.sessionLocation?.uuid);
  }

  const isScheduledType = (): boolean => {
    return selectedAppointmentType == 'Scheduled';
  };

  const isRecurringPatternTypeWeek = (): boolean => {
    return recurringPatternType == 'WEEK';
  };

  const handleMultiselectChange = (e) => {
    {
      setRecurringPatternDaysOfWeek(
        e.selectedItems.map((s) => {
          return s.id;
        }),
      );
    }
  };
  const handleServiceChange = (value) => {
    {
      setSelectedService(value);
      setDuration(services?.find((service) => service.name === value)?.durationMins);
    }
  };

  // Same for creating and editing
  const handleSaveAppointment = () => {
    setIsSubmitting(true);

    // Construct appointment payload
    const appointmentPayload = constructAppointmentPayload();

    // Construct recurring pattern payload
    const recurringAppointmentPayload = {
      appointmentRequest: appointmentPayload,
      recurringPattern: constructRecurringPattern(),
    };

    const abortController = new AbortController();
    (isScheduledType()
      ? saveRecurringAppointments(recurringAppointmentPayload, abortController)
      : saveAppointment(appointmentPayload, abortController)
    ).then(
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
        if (status === 204) {
          setIsSubmitting(false);
          showNotification({
            title:
              context === 'editing'
                ? t('appointmentEditError', 'Error editing appointment')
                : t('appointmentFormError', 'Error scheduling appointment'),
            kind: 'error',
            critical: true,
            description: t('noContent', 'No Content'),
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

  const constructAppointmentPayload = (): AppointmentPayload => {
    const serviceUuid = services?.find((service) => service.name === selectedService)?.uuid;
    const [hours, minutes] = convertTime12to24(startTime, timeFormat);
    const startDatetime = createDate(startDate, hours, minutes);
    const endDatetime = dayjs(startDatetime).add(duration, 'minutes').toDate();

    return {
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
  };

  const constructRecurringPattern = (): RecurringPattern => {
    const endDate = createDate(startDate, 23, 59);

    return {
      type: recurringPatternType,
      period: recurringPatternPeriod,
      endDate: endDate,
      daysOfWeek: recurringPatternDaysOfWeek,
    };
  };

  const createDate = (date: string, hours, minutes): Date => {
    return new Date(dayjs(date).year(), dayjs(date).month(), dayjs(date).date(), hours, minutes);
  };

  if (isLoading)
    return (
      <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} role="progressbar" />
    );

  const timeDurationLayout = () => {
    return (
      <div className={styles.inLine}>
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
        <ResponsiveWrapper isTablet={isTablet}>
          <div className={styles.duration}>
            <NumberInput
              id="duration"
              min={0}
              max={1440}
              label={t('duration', 'Duration')}
              invalidText={t('invalidNumber', 'Number is not valid')}
              helperText="Value in minutes"
              size="md"
              value={duration}
              onChange={(e, { value }) => {
                setDuration(value);
              }}
            />
          </div>
        </ResponsiveWrapper>
      </div>
    );
  };

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
          <span>{t('service', 'Service')}</span>
          <ResponsiveWrapper isTablet={isTablet}>
            <Select
              id="service"
              invalidText="Required"
              labelText={t('selectService', 'Select a service')}
              onChange={(event) => handleServiceChange(event.target.value)}
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
          <span>{t('appointmentType_title', 'Appointment Type')}</span>
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

        {isScheduledType() ? (
          <section className={styles.formGroup}>
            <span>{t('scheduledDateTime', 'Scheduled Date & Time')}</span>
            <div className={styles.rangeDatePickerControl}>
              <DatePicker datePickerType="range" light={isTablet} dateFormat={datePickerFormat}>
                <DatePickerInput
                  id="startDatePickerInput"
                  labelText={t('startDate', 'Start date')}
                  style={{ width: '100%' }}
                  placeholder={datePickerPlaceHolder}
                  value={startDate}
                  onChange={([startDate]) => setStartDate(startDate)}
                />
                <DatePickerInput
                  id="endDatePickerInput"
                  labelText={t('endDate', 'End date')}
                  style={{ width: '100%' }}
                  placeholder={datePickerPlaceHolder}
                  value={recurringPatternEndDate}
                  onChange={([endDate]) => setRecurringPatternEndDate(endDate)}
                />
              </DatePicker>

              <div className={styles.inLine}>
                <ResponsiveWrapper isTablet={isTablet}>
                  <NumberInput
                    id="repeatNumber"
                    min={1}
                    max={356}
                    label={t('repeatEvery', 'Repeat every')}
                    invalidText={t('invalidNumber', 'Number is not valid')}
                    size="md"
                    value={recurringPatternPeriod}
                    onChange={(e, { value }) => {
                      setRecurringPatternPeriod(value);
                    }}
                  />
                </ResponsiveWrapper>
                <ResponsiveWrapper isTablet={isTablet}>
                  <RadioButtonGroup
                    name="radio-button-group"
                    className={styles.recurringPatternType}
                    valueSelected={recurringPatternType}
                    onChange={(type) => setRecurringPatternType(type)}
                  >
                    <RadioButton labelText={t('day', 'Day')} value="DAY" id="radioDay" />
                    <RadioButton labelText={t('week', 'Week')} value="WEEK" id="radioWeek" />
                  </RadioButtonGroup>
                </ResponsiveWrapper>
                {isRecurringPatternTypeWeek() && (
                  <MultiSelect
                    label={t('daysOfWeek', 'Days of the week')}
                    id="daysOfWeek"
                    items={weekDays}
                    itemToString={(item) => (item ? t(item.labelCode, item.label) : '')}
                    selectionFeedback="top-after-reopen"
                    initialSelectedItems={weekDays.filter((i) => {
                      return recurringPatternDaysOfWeek.includes(i.id);
                    })}
                    onChange={(e) => handleMultiselectChange(e)}
                  />
                )}
              </div>
              {timeDurationLayout()}
            </div>
          </section>
        ) : (
          <section className={styles.formGroup}>
            <span>{t('dateTime', 'Date & Time')}</span>
            <div className={styles.inLine}>
              <ResponsiveWrapper isTablet={isTablet}>
                <DatePicker
                  datePickerType="single"
                  dateFormat={datePickerFormat}
                  light={isTablet}
                  value={startDate}
                  onChange={([date]) => setStartDate(date)}
                >
                  <DatePickerInput
                    id="datePickerInput"
                    labelText={t('date', 'Date')}
                    style={{ width: '100%' }}
                    placeholder={datePickerPlaceHolder}
                  />
                </DatePicker>
              </ResponsiveWrapper>
              {timeDurationLayout()}
            </div>
          </section>
        )}
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
