import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { DatePicker, DatePickerInput, SelectItem, TimePicker, TimePickerSelect } from '@carbon/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ResponsiveWrapper } from '@openmrs/esm-framework';
import { type amPm } from '@openmrs/esm-patient-common-lib';
import { type VisitFormData } from './visit-form.resource';
import styles from './visit-form.scss';

interface VisitDateTimeFieldProps {
  visitDatetimeLabel: string;
  dateFieldName: 'visitStartDate' | 'visitStopDate';
  timeFieldName: 'visitStartTime' | 'visitStopTime';
  timeFormatFieldName: 'visitStartTimeFormat' | 'visitStopTimeFormat';
  /** minDate: Milliseconds since Jan 1 1970. */
  minDate?: number;
  /** maxDate: Milliseconds since Jan 1 1970. */
  maxDate?: number;
}

const VisitDateTimeField: React.FC<VisitDateTimeFieldProps> = ({
  visitDatetimeLabel,
  dateFieldName,
  timeFieldName,
  timeFormatFieldName,
  minDate,
  maxDate,
}) => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext<VisitFormData>();

  // Since we have the separate date and time fields, the final validation needs to be done at the form
  // submission, hence just using the min date with hours/ minutes/ seconds set to 0 and max date set to
  // last second of the day. We want to just compare dates and not time.
  const minDateObj = minDate ? dayjs(new Date(minDate).setHours(0, 0, 0, 0)).format('DD/MM/YYYY') : null;
  const maxDateObj = maxDate ? dayjs(new Date(maxDate).setHours(23, 59, 59, 59)).format('DD/MM/YYYY') : null;

  return (
    <section>
      <div className={styles.sectionTitle}>{visitDatetimeLabel}</div>
      <div className={classNames(styles.dateTimeSection, styles.sectionField)}>
        <Controller
          name={dateFieldName}
          control={control}
          render={({ field: { onChange, value } }) => (
            <ResponsiveWrapper>
              <DatePicker
                className={styles.datePicker}
                dateFormat="d/m/Y"
                datePickerType="single"
                id={dateFieldName}
                minDate={minDateObj}
                maxDate={maxDateObj}
                onChange={([date]) => onChange(date)}
                value={value ? dayjs(value).format('DD/MM/YYYY') : null}
              >
                <DatePickerInput
                  id={`${dateFieldName}Input`}
                  labelText={t('date', 'Date')}
                  placeholder="dd/mm/yyyy"
                  style={{ width: '100%' }}
                  invalid={!!errors[dateFieldName]}
                  invalidText={errors[dateFieldName]?.message}
                />
              </DatePicker>
            </ResponsiveWrapper>
          )}
        />
        <ResponsiveWrapper>
          <Controller
            name={timeFieldName}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <TimePicker
                id={timeFieldName}
                labelText={t('time', 'Time')}
                onChange={(event) => onChange(event.target.value as amPm)}
                pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                style={{ marginLeft: '0.125rem', flex: 'none' }}
                value={value}
                onBlur={onBlur}
                invalid={!!errors[timeFieldName]}
                invalidText={errors[timeFieldName]?.message}
              >
                <Controller
                  name={timeFormatFieldName}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TimePickerSelect
                      id={`${timeFormatFieldName}Input`}
                      onChange={(event) => onChange(event.target.value as amPm)}
                      value={value}
                      aria-label={t('timeFormat ', 'Time Format')}
                      invalid={!!errors[timeFormatFieldName]}
                      invalidText={errors[timeFormatFieldName]?.message}
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
      </div>
    </section>
  );
};

export default VisitDateTimeField;
