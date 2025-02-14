import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { SelectItem, TimePicker, TimePickerSelect } from '@carbon/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { OpenmrsDatePicker, ResponsiveWrapper } from '@openmrs/esm-framework';
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
      <h1 className={styles.sectionTitle}>{visitDatetimeLabel}</h1>
      <div className={classNames(styles.dateTimeSection, styles.sectionField)}>
        <Controller
          name={dateFieldName}
          control={control}
          render={({ field, fieldState }) => (
            <ResponsiveWrapper>
              <OpenmrsDatePicker
                {...field}
                className={styles.datePicker}
                id={`${dateFieldName}Input`}
                data-testid={`${dateFieldName}Input`}
                maxDate={maxDateObj}
                minDate={minDateObj}
                labelText={t('date', 'Date')}
                invalid={Boolean(fieldState?.error?.message)}
                invalidText={fieldState?.error?.message}
              />
            </ResponsiveWrapper>
          )}
        />
        <ResponsiveWrapper>
          <Controller
            name={timeFieldName}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <div className={styles.timePickerContainer}>
                <TimePicker
                  className={styles.timePicker}
                  id={timeFieldName}
                  invalid={Boolean(errors[timeFieldName])}
                  invalidText={errors[timeFieldName]?.message}
                  labelText={t('time', 'Time')}
                  onBlur={onBlur}
                  onChange={(event) => onChange(event.target.value as amPm)}
                  pattern="^(0[1-9]|1[0-2]):([0-5][0-9])$"
                  value={value}
                >
                  <Controller
                    name={timeFormatFieldName}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TimePickerSelect
                        aria-label={t('timeFormat ', 'Time Format')}
                        className={classNames({
                          [styles.timePickerSelectError]: errors[timeFormatFieldName],
                        })}
                        id={`${timeFormatFieldName}Input`}
                        onChange={(event) => onChange(event.target.value as amPm)}
                        value={value}
                      >
                        <SelectItem value="" text="" />
                        <SelectItem value="AM" text="AM" />
                        <SelectItem value="PM" text="PM" />
                      </TimePickerSelect>
                    )}
                  />
                </TimePicker>
                {errors[timeFormatFieldName] && (
                  <div className={styles.timerPickerError}>{errors[timeFormatFieldName]?.message}</div>
                )}
              </div>
            )}
          />
        </ResponsiveWrapper>
      </div>
    </section>
  );
};

export default VisitDateTimeField;
