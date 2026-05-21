import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectItem, TimePicker, TimePickerSelect } from '@carbon/react';
import { OpenmrsDatePicker, ResponsiveWrapper } from '@openmrs/esm-framework';
import styles from './date-time-field.scss';

const TIME_PATTERN = /^(1[0-2]|0?[1-9]):([0-5]\d)$/;

const formatTime = (date: Date | null | undefined): string => {
  if (!date) return '';
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getMeridiem = (date: Date | null | undefined): 'AM' | 'PM' => {
  if (!date) return 'AM';
  return date.getHours() >= 12 ? 'PM' : 'AM';
};

const to24Hour = (hours12: number, meridiem: 'AM' | 'PM'): number => {
  if (meridiem === 'AM') return hours12 === 12 ? 0 : hours12;
  return hours12 === 12 ? 12 : hours12 + 12;
};

interface DateTimeFieldProps {
  idPrefix: string;
  value: Date | null | undefined;
  onChange: (next: Date | null) => void;
  invalid?: boolean;
  invalidText?: string;
}

export const DateTimeField = ({ idPrefix, value, onChange, invalid, invalidText }: DateTimeFieldProps) => {
  const { t } = useTranslation();
  const dateValue = value ?? null;
  const meridiem = getMeridiem(dateValue);

  const handleDateChange = (next: Date | null | undefined) => {
    if (!next) {
      onChange(null);
      return;
    }
    const merged = new Date(next);
    if (dateValue) {
      merged.setHours(dateValue.getHours(), dateValue.getMinutes(), 0, 0);
    } else {
      merged.setHours(0, 0, 0, 0);
    }
    onChange(merged);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const match = TIME_PATTERN.exec(raw);
    if (!match) return;
    const base = dateValue ?? new Date();
    const merged = new Date(base);
    const hours12 = Number(match[1]);
    merged.setHours(to24Hour(hours12, meridiem), Number(match[2]), 0, 0);
    onChange(merged);
  };

  const handleMeridiemChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!dateValue) return;
    const next = event.target.value as 'AM' | 'PM';
    if (next === meridiem) return;
    const merged = new Date(dateValue);
    merged.setHours((dateValue.getHours() + 12) % 24, dateValue.getMinutes(), 0, 0);
    onChange(merged);
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
          invalidText={invalidText}
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
};
