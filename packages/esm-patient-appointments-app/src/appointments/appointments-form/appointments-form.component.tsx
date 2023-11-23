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
  Toggle,
} from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocations, useSession, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { convertTime12to24 } from '@openmrs/esm-patient-common-lib';
import {
  saveAppointment,
  saveRecurringAppointments,
  useAppointments,
  useAppointmentService,
} from '../appointments.resource';
import type { Appointment, AppointmentPayload, RecurringPattern } from '../../types';
import { dateFormat, datePickerFormat, datePickerPlaceHolder, weekDays } from '../../constants';
import styles from './appointments-form.scss';

const appointmentTypes = [{ name: 'Scheduled' }, { name: 'WalkIn' }];

const appointmentsFormSchema = z.object({
  duration: z.number(),
  location: z.string().refine((value) => value !== ''),
  appointmentNote: z.string(),
  appointmentType: z.string().refine((value) => value !== ''),
  selectedService: z.string().refine((value) => value !== ''),
  recurringPatternType: z.enum(['DAY', 'WEEK']),
  recurringPatternPeriod: z.number(),
  recurringPatternDaysOfWeek: z.array(z.string()),
  selectedDaysOfWeekText: z.string().optional(),
  startTime: z.string(),
  timeFormat: z.enum(['AM', 'PM']),
  appointmentDateTime: z.object({
    startDate: z.date(),
    startDateText: z.string(),
    recurringPatternEndDate: z.date().nullable(),
    recurringPatternEndDateText: z.string().nullable(),
  }),
});

type AppointmentFormData = z.infer<typeof appointmentsFormSchema>;

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

  const [isRecurringAppointment, setIsRecurringAppointment] = useState(false);

  const defaultRecurringPatternType = recurringPattern?.type || 'DAY';
  const defaultRecurringPatternPeriod = recurringPattern?.period || 1;
  const defaultRecurringPatternDaysOfWeek = recurringPattern?.daysOfWeek || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useAppointments(patientUuid, new Date().toUTCString(), new AbortController());

  const defaultStartDate = appointment?.startDateTime ? new Date(appointment?.startDateTime) : new Date();
  const defaultEndDate = recurringPattern?.endDate ? new Date(recurringPattern?.endDate) : null;
  const defaultEndDateText = recurringPattern?.endDate
    ? dayjs(new Date(recurringPattern.endDate)).format(dateFormat)
    : '';
  const defaultStartDateText = appointment?.startDateTime
    ? dayjs(new Date(appointment.startDateTime)).format(dateFormat)
    : dayjs(new Date()).format(dateFormat);

  const defaultAppointmentStartDate = appointment?.startDateTime
    ? dayjs(new Date(appointment?.startDateTime)).format('hh:mm')
    : dayjs(new Date()).format('hh:mm');

  const { control, getValues, setValue, watch, handleSubmit } = useForm<AppointmentFormData>({
    mode: 'all',
    resolver: zodResolver(appointmentsFormSchema),
    defaultValues: {
      location: appointment?.location?.uuid ?? session?.sessionLocation?.uuid ?? '',
      appointmentNote: appointment?.comments || '',
      appointmentType: appointment?.appointmentKind || '',
      selectedService: appointment?.service?.name || '',
      recurringPatternType: defaultRecurringPatternType,
      recurringPatternPeriod: defaultRecurringPatternPeriod,
      recurringPatternDaysOfWeek: defaultRecurringPatternDaysOfWeek,
      startTime: defaultAppointmentStartDate,
      timeFormat: defaultTimeFormat,
      appointmentDateTime: {
        startDate: defaultStartDate,
        startDateText: defaultStartDateText,
        recurringPatternEndDate: defaultEndDate,
        recurringPatternEndDateText: defaultEndDateText,
      },
    },
  });

  const handleMultiselectChange = (e) => {
    setValue(
      'selectedDaysOfWeekText',
      (() => {
        if (e?.selectedItems?.length < 1) {
          return t('daysOfWeek', 'Days of the week');
        } else {
          return e.selectedItems
            .map((weekDay) => {
              return weekDay.label;
            })
            .join(', ');
        }
      })(),
    );
    setValue(
      'recurringPatternDaysOfWeek',
      e.selectedItems.map((s) => {
        return s.id;
      }),
    );
  };

  const defaultSelectedDaysOfWeekText: string = (() => {
    if (getValues('recurringPatternDaysOfWeek')?.length < 1) {
      return t('daysOfWeek', 'Days of the week');
    } else {
      return weekDays
        .filter((weekDay) => getValues('recurringPatternDaysOfWeek').includes(weekDay.id))
        .map((weekDay) => {
          return weekDay.label;
        })
        .join(', ');
    }
  })();

  // Same for creating and editing
  const handleSaveAppointment = (data: AppointmentFormData) => {
    setIsSubmitting(true);

    // Construct appointment payload
    const appointmentPayload = constructAppointmentPayload(data);

    // Construct recurring pattern payload
    const recurringAppointmentPayload = {
      appointmentRequest: appointmentPayload,
      recurringPattern: constructRecurringPattern(data),
    };

    const abortController = new AbortController();
    (isRecurringAppointment
      ? saveRecurringAppointments(recurringAppointmentPayload, abortController)
      : saveAppointment(appointmentPayload, abortController)
    ).then(
      ({ status }) => {
        if (status === 200) {
          setIsSubmitting(false);
          closeWorkspace();
          mutate();

          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            subtitle: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title:
              context === 'editing'
                ? t('appointmentEdited', 'Appointment edited')
                : t('appointmentScheduled', 'Appointment scheduled'),
          });
        }
        if (status === 204) {
          setIsSubmitting(false);
          showSnackbar({
            title:
              context === 'editing'
                ? t('appointmentEditError', 'Error editing appointment')
                : t('appointmentFormError', 'Error scheduling appointment'),
            kind: 'error',
            isLowContrast: false,
            subtitle: t('noContent', 'No Content'),
          });
        }
      },
      (error) => {
        setIsSubmitting(false);
        showSnackbar({
          title:
            context === 'editing'
              ? t('appointmentEditError', 'Error editing appointment')
              : t('appointmentFormError', 'Error scheduling appointment'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      },
    );
  };

  const constructAppointmentPayload = (data: AppointmentFormData): AppointmentPayload => {
    const {
      selectedService,
      startTime,
      timeFormat,
      appointmentDateTime: { startDate },
      duration,
      appointmentType: selectedAppointmentType,
      location: userLocation,
      appointmentNote,
    } = data;

    const serviceUuid = services?.find((service) => service.name === selectedService)?.uuid;
    const [hours, minutes] = convertTime12to24(startTime, timeFormat);
    const startDatetime = startDate.setHours(hours, minutes);
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

  const constructRecurringPattern = (data: AppointmentFormData): RecurringPattern => {
    const {
      appointmentDateTime: { recurringPatternEndDate },
      recurringPatternType,
      recurringPatternPeriod,
      recurringPatternDaysOfWeek,
    } = data;

    const [hours, minutes] = [23, 59];
    const endDate = recurringPatternEndDate?.setHours(hours, minutes);

    return {
      type: recurringPatternType,
      period: recurringPatternPeriod,
      endDate: endDate ? dayjs(endDate).format() : null,
      daysOfWeek: recurringPatternDaysOfWeek,
    };
  };

  if (isLoading)
    return (
      <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} role="progressbar" />
    );

  return (
    <Form className={styles.formWrapper}>
      <Stack gap={4}>
        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('location', 'Location')}</span>
          <div>
            <ResponsiveWrapper isTablet={isTablet}>
              <Controller
                name="location"
                control={control}
                render={({ field: { onChange, value, onBlur, ref } }) => (
                  <Select
                    id="location"
                    invalidText="Required"
                    labelText={t('selectLocation', 'Select a location')}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    ref={ref}
                  >
                    <SelectItem text={t('chooseLocation', 'Choose a location')} value="" />
                    {locations?.length > 0 &&
                      locations.map((location) => (
                        <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                          {location.display}
                        </SelectItem>
                      ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </div>
        </section>
        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('service', 'Service')}</span>
          <ResponsiveWrapper isTablet={isTablet}>
            <Controller
              name="selectedService"
              control={control}
              render={({ field: { onBlur, onChange, value, ref } }) => (
                <Select
                  id="service"
                  invalidText="Required"
                  labelText={t('selectService', 'Select a service')}
                  onChange={(event) => {
                    onChange(event);
                    setValue(
                      'duration',
                      services?.find((service) => service.name === event.target.value)?.durationMins,
                    );
                  }}
                  onBlur={onBlur}
                  value={value}
                  ref={ref}
                >
                  <SelectItem text={t('chooseService', 'Select service')} value="" />
                  {services?.length > 0 &&
                    services.map((service) => (
                      <SelectItem key={service.uuid} text={service.name} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
          </ResponsiveWrapper>
        </section>

        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('appointmentType_title', 'Appointment Type')}</span>
          <ResponsiveWrapper isTablet={isTablet}>
            <Controller
              name="appointmentType"
              control={control}
              render={({ field: { onBlur, onChange, value, ref } }) => (
                <Select
                  disabled={!appointmentTypes?.length}
                  id="appointmentType"
                  invalidText="Required"
                  labelText={t('selectAppointmentType', 'Select the type of appointment')}
                  onChange={onChange}
                  value={value}
                  ref={ref}
                  onBlur={onBlur}
                >
                  <SelectItem text={t('chooseAppointmentType', 'Choose appointment type')} value="" />
                  {appointmentTypes?.length > 0 &&
                    appointmentTypes.map((appointmentType, index) => (
                      <SelectItem key={index} text={appointmentType.name} value={appointmentType.name}>
                        {appointmentType.name}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
          </ResponsiveWrapper>
        </section>

        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('recurringAppointment', 'Recurring Appointment')}</span>
          <Toggle
            id="recurringToggle"
            labelB={t('yes', 'Yes')}
            labelA={t('no', 'No')}
            labelText={t('isRecurringAppointment', 'Is this a recurring appoinment?')}
            onClick={() => setIsRecurringAppointment(!isRecurringAppointment)}
          />
        </section>

        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('dateTime', 'Date & Time')}</span>
          <div>
            {isRecurringAppointment && (
              <div className={styles.inputContainer}>
                <ResponsiveWrapper isTablet={isTablet}>
                  <Controller
                    name="appointmentDateTime"
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <ResponsiveWrapper isTablet={isTablet}>
                        <DatePicker
                          datePickerType="range"
                          dateFormat={datePickerFormat}
                          value={[value.startDate, value.recurringPatternEndDate]}
                          ref={ref}
                          onChange={([startDate, endDate]) => {
                            onChange({
                              startDate: new Date(startDate),
                              recurringPatternEndDate: new Date(endDate),
                              recurringPatternEndDateText: dayjs(new Date(endDate)).format(dateFormat),
                              startDateText: dayjs(new Date(startDate)).format(dateFormat),
                            });
                          }}
                        >
                          <DatePickerInput
                            id="startDatePickerInput"
                            labelText={t('startDate', 'Start date')}
                            style={{ width: '100%' }}
                            value={watch('appointmentDateTime').startDateText}
                          />
                          <DatePickerInput
                            id="endDatePickerInput"
                            labelText={t('endDate', 'End date')}
                            style={{ width: '100%' }}
                            placeholder={datePickerPlaceHolder}
                            value={watch('appointmentDateTime').recurringPatternEndDateText}
                          />
                        </DatePicker>
                      </ResponsiveWrapper>
                    )}
                  />
                </ResponsiveWrapper>

                <TimeAndDuration
                  control={control}
                  isTablet={isTablet}
                  setValue={setValue}
                  getValues={getValues}
                  services={services}
                  watch={watch}
                  t={t}
                />

                <ResponsiveWrapper isTablet={isTablet}>
                  <Controller
                    name="recurringPatternPeriod"
                    control={control}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <NumberInput
                        hideSteppers
                        id="repeatNumber"
                        min={1}
                        max={356}
                        label={t('repeatEvery', 'Repeat every')}
                        invalidText={t('invalidNumber', 'Number is not valid')}
                        size="md"
                        value={value}
                        onBlur={onBlur}
                        onChange={(e, { value }) => {
                          onChange(Number(e.target.value));
                        }}
                      />
                    )}
                  />
                </ResponsiveWrapper>

                <ResponsiveWrapper isTablet={isTablet}>
                  <Controller
                    name="recurringPatternType"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <RadioButtonGroup
                        legendText={t('period', 'Period')}
                        name="radio-button-group"
                        onChange={(type) => onChange(type)}
                        valueSelected={value}
                      >
                        <RadioButton labelText={t('day', 'Day')} value="DAY" id="radioDay" />
                        <RadioButton labelText={t('week', 'Week')} value="WEEK" id="radioWeek" />
                      </RadioButtonGroup>
                    )}
                  />
                </ResponsiveWrapper>

                {watch('recurringPatternType') === 'WEEK' && (
                  <div>
                    <Controller
                      name="selectedDaysOfWeekText"
                      control={control}
                      defaultValue={defaultSelectedDaysOfWeekText}
                      render={({ field: { onChange, value } }) => (
                        <MultiSelect
                          className={styles.weekSelect}
                          label={getValues('selectedDaysOfWeekText')}
                          id="daysOfWeek"
                          items={weekDays}
                          itemToString={(item) => (item ? t(item.labelCode, item.label) : '')}
                          selectionFeedback="top-after-reopen"
                          sortItems={(items) => {
                            return items.sort((a, b) => a.order > b.order);
                          }}
                          initialSelectedItems={weekDays.filter((i) => {
                            return getValues('recurringPatternDaysOfWeek').includes(i.id);
                          })}
                          onChange={(e) => {
                            onChange(e);
                            handleMultiselectChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {!isRecurringAppointment && (
              <div className={styles.inputContainer}>
                <ResponsiveWrapper isTablet={isTablet}>
                  <Controller
                    name="appointmentDateTime"
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <DatePicker
                        datePickerType="single"
                        dateFormat={datePickerFormat}
                        value={value.startDate}
                        onChange={([date]) => onChange({ startDate: date })}
                      >
                        <DatePickerInput
                          id="datePickerInput"
                          labelText={t('date', 'Date')}
                          style={{ width: '100%' }}
                          placeholder={datePickerPlaceHolder}
                          ref={ref}
                        />
                      </DatePicker>
                    )}
                  />
                </ResponsiveWrapper>

                <TimeAndDuration
                  isTablet={isTablet}
                  control={control}
                  setValue={setValue}
                  getValues={getValues}
                  services={services}
                  watch={watch}
                  t={t}
                />
              </div>
            )}
          </div>
        </section>
        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('note', 'Note')}</span>

          <Controller
            name="appointmentNote"
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <ResponsiveWrapper isTablet={isTablet}>
                <TextArea
                  id="appointmentNote"
                  value={value}
                  labelText={t('appointmentNoteLabel', 'Write an additional note')}
                  placeholder={t('appointmentNotePlaceholder', 'Write any additional points here')}
                  onChange={onChange}
                  onBlur={onBlur}
                  ref={ref}
                />
              </ResponsiveWrapper>
            )}
          />
        </section>
      </Stack>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} onClick={closeWorkspace} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} onClick={handleSubmit(handleSaveAppointment)}>
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }) {
  return isTablet ? <Layer>{children}</Layer> : <div>{children}</div>;
}

function TimeAndDuration({ isTablet, t, setValue, getValues, watch, control, services }) {
  const defaultDuration = services?.find((service) => service.name === watch('selectedService'))?.durationMins || null;

  return (
    <React.Fragment>
      <ResponsiveWrapper isTablet={isTablet}>
        <Controller
          name="startTime"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TimePicker
              id="time-picker"
              pattern="([\d]+:[\d]{2})"
              onChange={(event) => onChange(event.target.value)}
              value={value}
              style={{ marginLeft: '0.125rem', flex: 'none' }}
              labelText={t('time', 'Time')}
            >
              <Controller
                name="timeFormat"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TimePickerSelect
                    id="time-picker-select-1"
                    onChange={(event) => onChange(event.target.value as 'AM' | 'PM')}
                    value={value}
                    aria-label={t('time', 'Time')}
                  >
                    <SelectItem value="AM" text="AM" />
                    <SelectItem value="PM" text="PM" />
                  </TimePickerSelect>
                )}
              />
            </TimePicker>
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper isTablet={isTablet}>
        <Controller
          name="duration"
          control={control}
          defaultValue={defaultDuration}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <NumberInput
              hideSteppers
              id="duration"
              min={0}
              max={1440}
              label={t('durationInMinutes', 'Duration (minutes)')}
              invalidText={t('invalidNumber', 'Number is not valid')}
              size="md"
              onBlur={onBlur}
              onChange={(event, { value }) => onChange(Number(event.target.value))}
              value={value}
              ref={ref}
            />
          )}
        />
      </ResponsiveWrapper>
    </React.Fragment>
  );
}

export default AppointmentsForm;
