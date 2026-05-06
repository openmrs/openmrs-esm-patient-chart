import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectItem, TimePicker, TimePickerSelect } from '@carbon/react';
import { Controller, type Control } from 'react-hook-form';
import { OpenmrsDatePicker, ResponsiveWrapper } from '@openmrs/esm-framework';
import { type ProceduresFormSchema } from './procedures-form.workspace';
import styles from './procedures-form.scss';

const TIME_PATTERN = /^(1[0-2]|0?[1-9]):([0-5]\d)$/;

function formatTime(date: Date | null | undefined): string {
  if (!date) return '';
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getMeridiem(date: Date | null | undefined): 'AM' | 'PM' {
  if (!date) return 'AM';
  return date.getHours() >= 12 ? 'PM' : 'AM';
}

function to24Hour(hours12: number, meridiem: 'AM' | 'PM'): number {
  if (meridiem === 'AM') return hours12 === 12 ? 0 : hours12;
  return hours12 === 12 ? 12 : hours12 + 12;
}

interface DateTimeFieldProps {
  name: 'startDateTime' | 'endDateTime';
  idPrefix: string;
  control: Control<ProceduresFormSchema>;
}

export function DateTimeField({ name, idPrefix, control }: DateTimeFieldProps) {
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const dateValue = field.value ?? null;
        const errorText = fieldState?.error?.message;
        const invalid = Boolean(errorText);
        const meridiem = getMeridiem(dateValue);

        const handleDateChange = (next: Date | null | undefined) => {
          if (!next) {
            field.onChange(null);
            return;
          }
          const merged = new Date(next);
          if (dateValue) {
            merged.setHours(dateValue.getHours(), dateValue.getMinutes(), 0, 0);
          } else {
            merged.setHours(0, 0, 0, 0);
          }
          field.onChange(merged);
        };

        const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const raw = event.target.value;
          const match = TIME_PATTERN.exec(raw);
          if (!match) return;
          const base = dateValue ?? new Date();
          const merged = new Date(base);
          const hours12 = Number(match[1]);
          merged.setHours(to24Hour(hours12, meridiem), Number(match[2]), 0, 0);
          field.onChange(merged);
        };

        const handleMeridiemChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
          if (!dateValue) return;
          const next = event.target.value as 'AM' | 'PM';
          if (next === meridiem) return;
          const merged = new Date(dateValue);
          merged.setHours((dateValue.getHours() + 12) % 24, dateValue.getMinutes(), 0, 0);
          field.onChange(merged);
        };

        return (
          <div className={styles.dateTimeFieldGroup}>
            <ResponsiveWrapper>
              <OpenmrsDatePicker
                value={dateValue}
                onChange={handleDateChange}
                id={`${idPrefix}-date`}
                labelText={t('date', 'Date')}
                invalid={invalid}
                invalidText={errorText}
              />
            </ResponsiveWrapper>
            <TimePicker
              id={`${idPrefix}-time`}
              labelText={t('time', 'Time')}
              placeholder="hh:mm"
              pattern="(1[0-2]|0?[1-9]):[0-5][0-9]"
              maxLength={5}
              defaultValue={formatTime(dateValue)}
              onChange={handleTimeChange}
              disabled={!dateValue}
            >
              <TimePickerSelect
                id={`${idPrefix}-meridiem`}
                aria-label={t('amPm', 'AM/PM')}
                value={meridiem}
                onChange={handleMeridiemChange}
                disabled={!dateValue}
              >
                <SelectItem value="AM" text={t('am', 'AM')} />
                <SelectItem value="PM" text={t('pm', 'PM')} />
              </TimePickerSelect>
            </TimePicker>
          </div>
        );
      }}
    />
  );
}
