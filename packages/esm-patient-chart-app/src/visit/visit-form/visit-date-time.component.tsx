import { DatePicker, DatePickerInput, SelectItem, TimePicker, TimePickerSelect } from '@carbon/react';
import { ResponsiveWrapper } from '@openmrs/esm-framework';
import { type amPm } from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';
import { type Control, Controller, type FieldPath, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { convertToDate, type VisitFormData } from './visit-form.resource';
import styles from './visit-form.scss';

interface VisitDateTimeSectionProps {
  control: Control<VisitFormData, any>;
  firstEncounterDateTime: number;
  lastEncounterDateTime: number;
}

/**
 * The component conditionally renders the Visit start and end
 * date / time fields based on the visit status (new / ongoing / past)
 */
const VisitDateTimeSection: React.FC<VisitDateTimeSectionProps> = ({
  control,
  firstEncounterDateTime,
  lastEncounterDateTime,
}) => {
  const { t } = useTranslation();
  const [
    visitStatus,
    visitStartDate,
    visitStartTime,
    visitStartTimeFormat,
    visitStopDate,
    visitStopTime,
    visitStopTimeFormat,
  ] = useWatch({
    control,
    name: [
      'visitStatus',
      'visitStartDate',
      'visitStartTime',
      'visitStartTimeFormat',
      'visitStopDate',
      'visitStopTime',
      'visitStopTimeFormat',
    ],
  });

  const hasStartTime = ['ongoing', 'past'].includes(visitStatus);
  const hasStopTime = 'past' == visitStatus;
  const selectedVisitStartDateTime = convertToDate(visitStartDate, visitStartTime, visitStartTimeFormat);
  const selectedVisitStopDateTime = convertToDate(visitStopDate, visitStopTime, visitStopTimeFormat);

  if (visitStatus == 'new') {
    return <></>;
  }

  return (
    <section>
      <div className={styles.sectionTitle}>
        {visitStatus == 'ongoing'
          ? t('visitStartDate', 'Visit start date')
          : t('visitStartAndEndDate', 'Visit start and end date')}
      </div>
      {hasStartTime && (
        <VisitDateTimeField
          dateField={{ name: 'visitStartDate', label: t('startDate', 'Start date') }}
          timeField={{ name: 'visitStartTime', label: t('startTime', 'Start time') }}
          timeFormatField={{ name: 'visitStartTimeFormat', label: t('startTimeFormat', 'Start time format') }}
          maxDate={Math.min(firstEncounterDateTime, selectedVisitStopDateTime?.getTime(), Date.now())}
        />
      )}
      {hasStopTime && (
        <VisitDateTimeField
          dateField={{ name: 'visitStopDate', label: t('endDate', 'End date') }}
          timeField={{ name: 'visitStopTime', label: t('endTime', 'End time') }}
          timeFormatField={{ name: 'visitStopTimeFormat', label: t('endTimeFormat', 'End time format') }}
          minDate={Math.max(lastEncounterDateTime, selectedVisitStartDateTime?.getTime())}
          maxDate={Date.now()}
        />
      )}
    </section>
  );
};

interface DateTimeFieldProps {
  dateField: Field;
  timeField: Field;
  timeFormatField: Field;
  minDate?: dayjs.ConfigType;
  maxDate?: dayjs.ConfigType;
  disabled?: boolean;
}

interface Field {
  name: FieldPath<VisitFormData>;
  label: string;
}

/**
 * This components renders a DatePicker, TimePicker and AM / PM dropdown
 * used to input a Date.
 * It is used by the visit form for the start and end time inputs.
 */
const VisitDateTimeField: React.FC<DateTimeFieldProps> = ({
  dateField,
  timeField,
  timeFormatField,
  minDate,
  maxDate,
  disabled,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<VisitFormData>();
  const { t } = useTranslation();

  // Since we have the separate date and time fields, the full validation is done by zod.
  // We are just using minDateObj and maxDateObj to restrict the bounds of the DatePicker.
  const minDateObj = minDate ? dayjs(minDate).startOf('day') : null;
  const maxDateObj = maxDate ? dayjs(maxDate).endOf('day') : null;

  return (
    <div className={classNames(styles.dateTimeSection, styles.sectionField)}>
      <Controller
        name={dateField.name}
        control={control}
        render={({ field: { onChange, value, onBlur } }) => {
          return (
            <ResponsiveWrapper>
              <DatePicker
                dateFormat="d/m/Y"
                datePickerType="single"
                id={dateField.name}
                maxDate={maxDateObj?.valueOf()}
                minDate={minDateObj?.valueOf()}
                onChange={([date]: [date: Date]) => {
                  onChange(dayjs(date).format('YYYY-MM-DD'));
                }}
                value={dayjs(value as string).valueOf()}
                onBlur={onBlur}
              >
                <DatePickerInput
                  id={`${dateField.name}Input`}
                  invalid={Boolean(errors[dateField.name])}
                  invalidText={errors[dateField.name]?.message}
                  labelText={dateField.label}
                  placeholder="dd/mm/yyyy"
                  style={{ width: '100%' }}
                  disabled={disabled}
                />
              </DatePicker>
            </ResponsiveWrapper>
          );
        }}
      />
      <ResponsiveWrapper>
        <Controller
          name={timeField.name}
          control={control}
          render={({ field: { onBlur, onChange, value } }) => (
            <div className={styles.timePickerContainer}>
              <TimePicker
                className={styles.timePicker}
                id={timeField.name}
                invalid={Boolean(errors[timeField.name])}
                invalidText={errors[timeField.name]?.message}
                labelText={timeField.label}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.value as amPm)}
                pattern="^(0[1-9]|1[0-2]):([0-5][0-9])$"
                value={value}
                disabled={disabled}
              >
                <Controller
                  name={timeFormatField.name}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TimePickerSelect
                      aria-label={timeFormatField.label}
                      className={classNames({
                        [styles.timePickerSelectError]: errors[timeFormatField.name],
                      })}
                      id={`${timeFormatField.name}Input`}
                      onChange={(event) => onChange(event.target.value as amPm)}
                      value={value}
                      disabled={disabled}
                    >
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  )}
                />
              </TimePicker>
              {errors[timeFormatField.name] && (
                <div className={styles.timerPickerError}>{errors[timeFormatField.name]?.message}</div>
              )}
            </div>
          )}
        />
      </ResponsiveWrapper>
    </div>
  );
};

export default VisitDateTimeSection;
