import React from 'react';
import styles from './visit-form.scss';
import { Controller, useFormContext } from 'react-hook-form';
import { VisitFormData } from './visit-form.resource';
import { DatePicker, DatePickerInput, Layer, SelectItem, TimePicker, TimePickerSelect } from '@carbon/react';
import classNames from 'classnames';
import { useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { amPm } from '@openmrs/esm-patient-common-lib';

interface VisitDateTimeFieldProps {
  visitDatetimeLabel: string;
  dateFieldName: 'visitStartDate' | 'visitStopDate';
  timeFieldName: 'visitStartTime' | 'visitStopTime';
  timeFormatFieldName: 'visitStartTimeFormat' | 'visitStopTimeFormat';
  minDate?: number;
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
  const isTablet = useLayoutType() === 'tablet';
  const {
    control,
    formState: { errors },
  } = useFormContext<VisitFormData>();

  // Since we have the separate date and time fields, the final validation needs to be done at the form
  // submission, hence just using the min date with hours/ minutes/ seconds set to 0 and max date set to
  // last second of the day. We want to just compare dates and not time.
  minDate = minDate ? new Date(minDate).setHours(0, 0, 0, 0) : null;
  maxDate = maxDate ? new Date(maxDate).setHours(23, 59, 59, 59) : null;

  return (
    <section>
      <div className={styles.sectionTitle}>{visitDatetimeLabel}</div>
      <div className={classNames(styles.dateTimeSection, styles.sectionField)}>
        <Controller
          name={dateFieldName}
          control={control}
          render={({ field: { onBlur, onChange, value } }) => (
            <ResponsiveWrapper isTablet={isTablet}>
              <DatePicker
                dateFormat="d/m/Y"
                datePickerType="single"
                id={dateFieldName}
                style={{ paddingBottom: '1rem' }}
                minDate={minDate}
                maxDate={maxDate}
                onChange={([date]) => onChange(date)}
                value={value}
              >
                <DatePickerInput
                  id={`${dateFieldName}Input`}
                  labelText={t('date', 'Date')}
                  placeholder="dd/mm/yyyy"
                  style={{ width: '100%' }}
                  invalid={errors[dateFieldName]?.message}
                  invalidText={errors[dateFieldName]?.message}
                />
              </DatePicker>
            </ResponsiveWrapper>
          )}
        />
        <ResponsiveWrapper isTablet={isTablet}>
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
                invalid={errors[timeFieldName]?.message}
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
                      invalid={errors[timeFormatFieldName]?.message}
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

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}
