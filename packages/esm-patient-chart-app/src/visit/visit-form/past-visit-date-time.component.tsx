import { TimePicker, TimePickerSelect, SelectItem } from '@carbon/react';
import { ResponsiveWrapper, OpenmrsDatePicker } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './past-visit.scss';
import { type VisitFormData } from './visit-form.resource';

export const PastVisitDateTimeComponent = () => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext<VisitFormData>();

  return (
    <section>
      <h1 className={styles.heading}>{t('visitStartAndEndDate', 'Visit start and end date')}</h1>
      <ResponsiveWrapper>
        <div className={styles.startDatePickerContainer}>
          <Controller
            name={'pastVisitStartDate'}
            control={control}
            render={({ field, fieldState }) => (
              <ResponsiveWrapper>
                <OpenmrsDatePicker
                  {...field}
                  id={`pastVisitDateInput`}
                  labelText={t('startDate', 'Start date')}
                  invalid={Boolean(fieldState?.error?.message)}
                  invalidText={fieldState?.error?.message}
                />
              </ResponsiveWrapper>
            )}
          />
          <Controller
            name={'pastVisitStartTime'}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <TimePicker
                id={'pastVisitStartTime'}
                labelText={t('time', 'Time')}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.value)}
                pattern="^(0[1-9]|1[0-2]):([0-5][0-9])$"
                value={value}
              >
                <Controller
                  name={'pastVisitStartTimeFormat'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TimePickerSelect
                      aria-label={t('timeFormat ', 'Time Format')}
                      id={`pastVisitStartTimeFormatInput`}
                      onChange={(event) => onChange(event.target.value)}
                      value={value}
                    >
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  )}
                />
              </TimePicker>
            )}
          />
        </div>
        <div className={styles.endDatePickerContainer}>
          <Controller
            name={'pastVisitEndDate'}
            control={control}
            render={({ field, fieldState }) => (
              <ResponsiveWrapper>
                <OpenmrsDatePicker
                  {...field}
                  id={`pastVisitEndDate`}
                  labelText={t('startDate', 'Start date')}
                  invalid={Boolean(fieldState?.error?.message)}
                  invalidText={fieldState?.error?.message}
                />
              </ResponsiveWrapper>
            )}
          />
          <Controller
            name={'pastVisitEndTime'}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <TimePicker
                className={styles.timePicker}
                id={'pastVisitEndTimeField'}
                labelText={t('time', 'Time')}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.value)}
                pattern="^(0[1-9]|1[0-2]):([0-5][0-9])$"
                value={value}
              >
                <Controller
                  name={'pastVisitEndTimeFormat'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TimePickerSelect
                      aria-label={t('timeFormat ', 'Time Format')}
                      id={`pastVisitEndTimeFieldInput`}
                      onChange={(event) => onChange(event.target.value)}
                      value={value}
                    >
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  )}
                />
              </TimePicker>
            )}
          />
        </div>
      </ResponsiveWrapper>
    </section>
  );
};
