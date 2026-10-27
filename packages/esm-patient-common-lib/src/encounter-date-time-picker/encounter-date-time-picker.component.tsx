import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, FormGroup, SelectItem, Switch, TimePicker, TimePickerSelect } from '@carbon/react';
import { OpenmrsDatePicker, ResponsiveWrapper } from '@openmrs/esm-framework';
import { convertTime12to24, time12HourFormatRegex, type amPm } from '../time-helper';
import {
  resolveNewEncounterDatetime,
  useEncounterBackdating,
  type EncounterDatetimeError,
  type VisitWindow,
} from '../encounter-datetime';
import styles from './encounter-date-time-picker.scss';

export interface EncounterDateTimePickerProps {
  /** The visit the encounter belongs to; its start and stop datetimes bound the selectable datetime. */
  visit?: VisitWindow | null;
  /** The chosen encounter datetime. `null` means "now": the server stamps the encounter. */
  value: Date | null;
  onChange: (value: Date | null) => void;
  /** Called whenever the validity of the chosen datetime changes. `undefined` means valid. */
  onValidityChange?: (error?: EncounterDatetimeError) => void;
  /** Label of the date input, e.g. "Visit note date". */
  dateLabel: string;
  /** Legend of the "Now" / "In the past" switcher shown for an active visit, e.g. "This visit note is". */
  timingLabel: string;
  /** Label of the time input. Defaults to "Time". */
  timeLabel?: string;
  /**
   * Whether the user may choose "Now" for an encounter of an active visit, in which case the server stamps the
   * encounter. Turn this off when an existing encounter is edited, as it already has a datetime.
   */
  allowNow?: boolean;
  isDisabled?: boolean;
  /** Prefix for the ids of the inputs, to keep them unique if several pickers are on the page. */
  id?: string;
}

interface PickerParts {
  date: Date | null;
  time: string;
  timeFormat: amPm;
}

function toParts(value: Date): PickerParts {
  const hours = value.getHours();
  const minutes = value.getMinutes();
  return {
    date: value,
    time: `${String(hours % 12 === 0 ? 12 : hours % 12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    timeFormat: hours >= 12 ? 'PM' : 'AM',
  };
}

function toDate({ date, time, timeFormat }: PickerParts): Date | null {
  if (!date || !time12HourFormatRegex.test(time)) {
    return null;
  }
  const [hours, minutes] = convertTime12to24(time, timeFormat);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Lets the user backdate an encounter to any time within its visit's window. Renders nothing when the
 * user is not allowed to choose the encounter datetime for the visit (see `useEncounterBackdating`).
 */
export function EncounterDateTimePicker({
  visit,
  value,
  onChange,
  onValidityChange,
  dateLabel,
  timingLabel,
  timeLabel,
  allowNow = true,
  isDisabled = false,
  id = 'encounter',
}: EncounterDateTimePickerProps) {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');
  const { canBackdate, isActiveVisit, getBounds, validate } = useEncounterBackdating(visit);
  const [parts, setParts] = useState<PickerParts>(() =>
    toParts(value ?? resolveNewEncounterDatetime(null, visit) ?? new Date()),
  );

  // Keep the inputs in sync when the value is changed from the outside (e.g. reset to now)
  useEffect(() => {
    const current = toDate(parts);
    if (value === null) {
      return;
    }
    if (current?.getTime() !== value.getTime()) {
      setParts(toParts(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const updateParts = useCallback(
    (update: Partial<PickerParts>) => {
      const next = { ...parts, ...update };
      setParts(next);
      const nextDate = toDate(next);
      if (nextDate) {
        onChange(nextDate);
      }
    },
    [parts, onChange],
  );

  // "Now" only makes sense in an active visit; in a past visit a null value is pinned to the visit start
  const showNowChoice = allowNow && isActiveVisit;
  const isNow = showNowChoice && value === null;
  const error = validate(value);
  // While the typed time is malformed, `value` keeps the last valid datetime, so report it as an error
  // to keep the host from saving that stale datetime.
  const timeIsInvalid = canBackdate && !isNow && !time12HourFormatRegex.test(parts.time);

  const validityError: EncounterDatetimeError | undefined = timeIsInvalid ? 'invalidTime' : error;
  useEffect(() => {
    onValidityChange?.(validityError);
  }, [validityError, onValidityChange]);

  const errorText = useMemo(() => {
    switch (error) {
      case 'beforeVisitStart':
        return t('encounterBeforeVisitStart', 'The date and time cannot be before the start of the visit');
      case 'afterVisitEnd':
        return t('encounterAfterVisitEnd', 'The date and time cannot be after the end of the visit');
      case 'inFuture':
        return t('encounterInFuture', 'The date and time cannot be in the future');
      default:
        return undefined;
    }
  }, [error, t]);

  if (!canBackdate) {
    return null;
  }

  const bounds = getBounds();

  const handleModeChange = (mode?: string | number) => {
    if (mode === 'now') {
      onChange(null);
    } else {
      const current = toDate(parts);
      const next = current ?? toDate(toParts(new Date()));
      if (next) {
        onChange(next);
      }
    }
  };

  return (
    <section className={styles.wrapper}>
      {showNowChoice && (
        <FormGroup className={styles.timingSwitcher} legendText={timingLabel} disabled={isDisabled}>
          <ContentSwitcher selectedIndex={isNow ? 0 : 1} size="md" onChange={({ name }) => handleModeChange(name)}>
            <Switch name="now" disabled={isDisabled}>
              {t('now', 'Now')}
            </Switch>
            <Switch name="past" disabled={isDisabled}>
              {t('inThePast', 'In the past')}
            </Switch>
          </ContentSwitcher>
        </FormGroup>
      )}
      {!isNow && (
        <div className={styles.pickerWrapper}>
          <ResponsiveWrapper>
            <OpenmrsDatePicker
              id={`${id}-date-picker`}
              className={styles.datePicker}
              labelText={dateLabel}
              value={parts.date}
              minDate={bounds.min}
              maxDate={bounds.max}
              isDisabled={isDisabled}
              invalid={Boolean(error)}
              invalidText={errorText}
              onChange={(date: Date) => updateParts({ date })}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <TimePicker
              id={`${id}-time-picker`}
              className={styles.timePicker}
              labelText={timeLabel ?? t('time', 'Time')}
              pattern="^(1[0-2]|0?[1-9]):[0-5][0-9]$"
              value={parts.time}
              disabled={isDisabled}
              invalid={timeIsInvalid || Boolean(error)}
              invalidText={timeIsInvalid ? t('invalidTime', 'Enter a time in hh:mm format') : errorText}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateParts({ time: event.target.value })}
            >
              <TimePickerSelect
                id={`${id}-am-pm`}
                aria-label={t('timeFormat', 'Time Format')}
                value={parts.timeFormat}
                disabled={isDisabled}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  updateParts({ timeFormat: event.target.value as amPm })
                }
              >
                <SelectItem value="AM" text={t('AM', 'AM')} />
                <SelectItem value="PM" text={t('PM', 'PM')} />
              </TimePickerSelect>
            </TimePicker>
          </ResponsiveWrapper>
        </div>
      )}
    </section>
  );
}
