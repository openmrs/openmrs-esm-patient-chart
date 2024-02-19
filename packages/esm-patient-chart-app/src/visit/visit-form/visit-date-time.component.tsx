import React from 'react';
import styles from './visit-form.scss';
import { Controller, useFormContext } from 'react-hook-form';
import { type VisitFormData } from './visit-form.resource';
import {
  DatePicker,
  DatePickerInput,
  Layer,
  SelectItem,
  TimePicker,
  TimePickerSelect,
  InlineNotification,
} from '@carbon/react';
import classNames from 'classnames';
import { useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type amPm } from '@openmrs/esm-patient-common-lib';

interface VisitDateTimeFieldProps {
  visitDatetimeLabel: string;
  datetimeFieldName: 'visitStartDatetime' | 'visitStopDatetime';
}

const VisitDateTimeField: React.FC<VisitDateTimeFieldProps> = ({ visitDatetimeLabel, datetimeFieldName }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const {
    control,
    formState: { errors },
    setError,
  } = useFormContext<VisitFormData>();

  const dateFieldName: 'visitStartDatetime.date' | 'visitStopDatetime.date' = `${datetimeFieldName}.date`;
  const timeFieldName: 'visitStartDatetime.time' | 'visitStopDatetime.time' = `${datetimeFieldName}.time`;
  const timeFormatFieldName:
    | 'visitStartDatetime.timeFormat'
    | 'visitStopDatetime.timeFormat' = `${datetimeFieldName}.timeFormat`;

  return (
    <section>
      <div className={styles.sectionTitle}>{visitDatetimeLabel}</div>
      <div className={classNames(styles.dateTimeSection, styles.sectionField)}>
        <Controller
          name={dateFieldName}
          control={control}
          render={({ field: dateField }) => (
            <ResponsiveWrapper isTablet={isTablet}>
              <DatePicker
                {...dateField}
                dateFormat="d/m/Y"
                datePickerType="single"
                id={dateFieldName}
                style={{ paddingBottom: '1rem' }}
                onChange={([date]) => dateField.onChange(date)}
                invalid={errors?.[datetimeFieldName]?.date?.message}
                invalidText={errors?.[datetimeFieldName]?.date?.message}
              >
                <DatePickerInput
                  id={`${dateFieldName}Input`}
                  labelText={t('date', 'Date')}
                  placeholder="dd/mm/yyyy"
                  style={{ width: '100%' }}
                />
              </DatePicker>
            </ResponsiveWrapper>
          )}
        />
        <ResponsiveWrapper isTablet={isTablet}>
          <Controller
            name={timeFieldName}
            control={control}
            render={({ field: timeField }) => (
              <TimePicker
                {...timeField}
                id={timeFieldName}
                labelText={t('time', 'Time')}
                onChange={(event) => timeField.onChange(event.target.value as amPm)}
                pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                style={{ marginLeft: '0.125rem', flex: 'none' }}
                invalid={errors?.[datetimeFieldName]?.time?.message}
                invalidText={errors?.[datetimeFieldName]?.time?.message}
              >
                <Controller
                  name={timeFormatFieldName}
                  control={control}
                  render={({ field: timeFormatField }) => (
                    <TimePickerSelect
                      {...timeFormatField}
                      id={`${timeFormatFieldName}Input`}
                      onChange={(event) => timeFormatField.onChange(event.target.value as amPm)}
                      aria-label={t('timeFormat ', 'Time Format')}
                      invalid={errors?.[datetimeFieldName]?.timeFormat?.message}
                      invalidText={errors?.[datetimeFieldName]?.timeFormat?.message}
                    >
                      <SelectItem value="AM" text={t('AM', 'AM')} />
                      <SelectItem value="PM" text={t('PM', 'PM')} />
                    </TimePickerSelect>
                  )}
                />
              </TimePicker>
            )}
          />
        </ResponsiveWrapper>
      </div>
      {errors?.[datetimeFieldName]?.root && (
        <InlineNotification
          aria-label="Close notification"
          kind="error"
          onClose={() => setError(datetimeFieldName, null)}
          statusIconDescription="notification"
          subtitle={errors?.[datetimeFieldName]?.root?.message}
          title={t('datetimeOutOfRange', 'Selected time is out of range')}
          lowContrast
        />
      )}
    </section>
  );
};

export default VisitDateTimeField;

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}
