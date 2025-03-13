import { SelectItem, TimePickerSelect, TimePicker } from '@carbon/react';
import { OpenmrsDatePicker, ResponsiveWrapper } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './retrospective-date-picker.scss';
import { type RetrospectiveVisitFormData } from './order-basket.workspace';

export const RetrospectiveDatePicker = ({ maxDate, minDate }: { maxDate: Date; minDate: Date }) => {
  const { t } = useTranslation();
  const { control } = useFormContext<RetrospectiveVisitFormData>();

  return (
    <section className={styles.wrapper}>
      <h4 className={styles.heading}>Encounter time</h4>
      <div className={styles.pickerWrapper}>
        <Controller
          name={'date'}
          control={control}
          render={({ field, fieldState }) => (
            <ResponsiveWrapper>
              <OpenmrsDatePicker
                {...field}
                id={'retrospective-date-picker-input'}
                labelText={t('date', 'Date')}
                invalid={Boolean(fieldState?.error?.message)}
                invalidText={fieldState?.error?.message}
                maxDate={maxDate}
                minDate={minDate}
              />
            </ResponsiveWrapper>
          )}
        />
        <ResponsiveWrapper>
          <Controller
            name={'time'}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <div>
                <TimePicker
                  id={'retrospective-time-picker-input'}
                  labelText={t('time', 'Time')}
                  onBlur={onBlur}
                  onChange={(event) => onChange(event.target.value)}
                  pattern="^(0[1-9]|1[0-2]):([0-5][0-9])$"
                  value={value}
                >
                  <Controller
                    name={'timePickerFormat'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TimePickerSelect
                        aria-label={t('timeFormat ', 'Time Format')}
                        id={`am-pm-input`}
                        onChange={(event) => onChange(event.target.value)}
                        value={value}
                      >
                        <SelectItem value="AM" text="AM" />
                        <SelectItem value="PM" text="PM" />
                      </TimePickerSelect>
                    )}
                  />
                </TimePicker>
              </div>
            )}
          />
        </ResponsiveWrapper>
      </div>
    </section>
  );
};
