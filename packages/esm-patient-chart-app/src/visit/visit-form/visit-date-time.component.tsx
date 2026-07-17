import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { type Control, Controller, type FieldPath, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectItem, TimePicker, TimePickerSelect, Toggle } from '@carbon/react';
import { type amPm } from '@openmrs/esm-patient-common-lib';
import { OpenmrsDatePicker, ResponsiveWrapper } from '@openmrs/esm-framework';
import { convertToDate, type VisitFormData } from './visit-form.resource';
import styles from './visit-form.scss';

// Helpers to safely compute min/max across optional values
const minOf = (...values: Array<number | undefined | null>) => {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  return nums.length ? Math.min(...nums) : undefined;
};

const maxOf = (...values: Array<number | undefined | null>) => {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  return nums.length ? Math.max(...nums) : undefined;
};

interface VisitDateTimeSectionProps {
  control: Control<VisitFormData, any>;
  earliestStartDate?: number;
  firstEncounterDateTime: number;
  lastEncounterDateTime: number;
}

/**
 * The component conditionally renders the Visit start and end
 * date / time fields based on the visit status (new / ongoing / past)
 */
const VisitDateTimeSection: React.FC<VisitDateTimeSectionProps> = ({
  control,
  earliestStartDate,
  firstEncounterDateTime,
  lastEncounterDateTime,
}) => {
  const { t } = useTranslation();
  const { getValues, setValue } = useFormContext<VisitFormData>();
  const [
    visitStatus,
    visitStartDate,
    visitStartTime,
    visitStartTimeFormat,
    visitStopDate,
    visitStopTime,
    visitStopTimeFormat,
    isFullDayVisit,
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
      'isFullDayVisit',
    ],
  });

  const hasStopTime = 'past' === visitStatus;
  const isFullDay = hasStopTime && Boolean(isFullDayVisit);
  const previousManualTimeValuesRef = React.useRef<{
    visitStartTime: VisitFormData['visitStartTime'];
    visitStartTimeFormat: VisitFormData['visitStartTimeFormat'];
    visitStopTime: VisitFormData['visitStopTime'];
    visitStopTimeFormat: VisitFormData['visitStopTimeFormat'];
  } | null>(null);
  // Tracks the pre-auto-correct start date (to restore) and the value the auto-correct set it
  // to (to detect whether the user has since edited the date themselves while full-day was on,
  // in which case their edit wins and we don't clobber it on uncheck).
  const previousManualStartDateRef = React.useRef<Date | null>(null);
  const autoCorrectedStartDateRef = React.useRef<Date | null>(null);
  const wasFullDayRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasStopTime) {
      previousManualTimeValuesRef.current = null;
      previousManualStartDateRef.current = null;
      autoCorrectedStartDateRef.current = null;
      wasFullDayRef.current = false;
      return;
    }

    if (isFullDay && !wasFullDayRef.current) {
      previousManualTimeValuesRef.current = {
        visitStartTime: getValues('visitStartTime'),
        visitStartTimeFormat: getValues('visitStartTimeFormat'),
        visitStopTime: getValues('visitStopTime'),
        visitStopTimeFormat: getValues('visitStopTimeFormat'),
      };

      setValue('visitStartTime', undefined as unknown as VisitFormData['visitStartTime'], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue('visitStartTimeFormat', undefined as unknown as VisitFormData['visitStartTimeFormat'], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue('visitStopTime', undefined as unknown as VisitFormData['visitStopTime'], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue('visitStopTimeFormat', undefined as unknown as VisitFormData['visitStopTimeFormat'], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      // Today is not a selectable date once full-day mode is on (see maxDate below), so if the
      // currently selected date is today, it's no longer valid — bump it back to yesterday.
      const currentStartDate = getValues('visitStartDate');
      if (currentStartDate && dayjs(currentStartDate).isSame(dayjs(), 'day')) {
        const correctedStartDate = dayjs().subtract(1, 'day').startOf('day').toDate();
        previousManualStartDateRef.current = currentStartDate;
        autoCorrectedStartDateRef.current = correctedStartDate;

        setValue('visitStartDate', correctedStartDate, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      } else {
        previousManualStartDateRef.current = null;
        autoCorrectedStartDateRef.current = null;
      }
    } else if (!isFullDay && wasFullDayRef.current) {
      if (previousManualTimeValuesRef.current) {
        const previousManualTimeValues = previousManualTimeValuesRef.current;

        setValue('visitStartTime', previousManualTimeValues.visitStartTime, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue('visitStartTimeFormat', previousManualTimeValues.visitStartTimeFormat, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue('visitStopTime', previousManualTimeValues.visitStopTime, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue('visitStopTimeFormat', previousManualTimeValues.visitStopTimeFormat, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });

        previousManualTimeValuesRef.current = null;
      }

      if (previousManualStartDateRef.current) {
        // Only restore if the date is still exactly what the auto-correct set it to — if the
        // user has since picked a different date while full-day was on, that's a deliberate
        // edit and must not be overwritten.
        const currentStartDate = getValues('visitStartDate');
        const unchangedSinceAutoCorrect =
          autoCorrectedStartDateRef.current &&
          currentStartDate &&
          dayjs(currentStartDate).isSame(dayjs(autoCorrectedStartDateRef.current), 'day');

        if (unchangedSinceAutoCorrect) {
          setValue('visitStartDate', previousManualStartDateRef.current, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }

        previousManualStartDateRef.current = null;
        autoCorrectedStartDateRef.current = null;
      }
    }

    wasFullDayRef.current = isFullDay;
  }, [getValues, hasStopTime, isFullDay, setValue]);

  const selectedVisitStartDateTime = convertToDate(visitStartDate, visitStartTime, visitStartTimeFormat);
  const selectedVisitStopDateTime = convertToDate(visitStopDate, visitStopTime, visitStopTimeFormat);

  if (visitStatus === 'new') {
    return null;
  }

  return (
    <section>
      <div className={styles.sectionTitle}>
        {visitStatus === 'ongoing'
          ? t('visitStartDate', 'Visit start date')
          : isFullDay
            ? t('visitDate', 'Visit date')
            : t('visitStartAndEndDate', 'Visit start and end date')}
      </div>
      {hasStopTime && (
        <Controller
          name="isFullDayVisit"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Toggle
              className={styles.sectionField}
              id="isFullDayVisit"
              labelText={t('fullDayVisit', 'Full day visit')}
              labelA={t('off', 'Off')}
              labelB={t('on', 'On')}
              toggled={Boolean(value)}
              onToggle={(checked) => onChange(checked)}
            />
          )}
        />
      )}
      <VisitDateTimeField
        dateField={{ name: 'visitStartDate', label: isFullDay ? t('date', 'Date') : t('startDate', 'Start date') }}
        timeField={{ name: 'visitStartTime', label: t('startTime', 'Start time') }}
        timeFormatField={{ name: 'visitStartTimeFormat', label: t('startTimeFormat', 'Start time format') }}
        minDate={earliestStartDate}
        maxDate={minOf(
          // Full-day visits are meant for past, already-complete days — today isn't a valid
          // choice for them, so the ceiling is the end of yesterday instead of "now".
          isFullDay ? dayjs().subtract(1, 'day').endOf('day').valueOf() : Date.now(),
          firstEncounterDateTime,
          isFullDay ? undefined : selectedVisitStopDateTime?.getTime(),
        )}
        hideTime={isFullDay}
      />
      {hasStopTime && !isFullDay && (
        <VisitDateTimeField
          dateField={{ name: 'visitStopDate', label: t('endDate', 'End date') }}
          timeField={{ name: 'visitStopTime', label: t('endTime', 'End time') }}
          timeFormatField={{ name: 'visitStopTimeFormat', label: t('endTimeFormat', 'End time format') }}
          minDate={maxOf(lastEncounterDateTime, selectedVisitStartDateTime?.getTime())}
          maxDate={Date.now()}
        />
      )}
    </section>
  );
};

interface VisitDateTimeFieldProps {
  dateField: Field;
  timeField: Field;
  timeFormatField: Field;
  minDate?: dayjs.ConfigType;
  maxDate?: dayjs.ConfigType;
  disabled?: boolean;
  hideTime?: boolean;
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
const VisitDateTimeField: React.FC<VisitDateTimeFieldProps> = ({
  dateField,
  timeField,
  timeFormatField,
  minDate,
  maxDate,
  disabled,
  hideTime,
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
        render={({ field, fieldState }) => (
          <ResponsiveWrapper>
            <OpenmrsDatePicker
              {...field}
              value={field.value as Date}
              className={styles.datePicker}
              id={`${dateField.name}Input`}
              data-testid={`${dateField.name}Input`}
              maxDate={maxDateObj}
              minDate={minDateObj}
              labelText={dateField.label}
              invalid={Boolean(fieldState?.error?.message)}
              invalidText={fieldState?.error?.message}
            />
          </ResponsiveWrapper>
        )}
      />
      {!hideTime && (
        <ResponsiveWrapper>
          <Controller
            name={timeField.name}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <div className={styles.timePickerContainer}>
                <TimePicker
                  className={styles.timePicker}
                  disabled={disabled}
                  id={timeField.name}
                  invalid={Boolean(errors[timeField.name])}
                  invalidText={errors[timeField.name]?.message}
                  labelText={timeField.label}
                  onBlur={onBlur}
                  onChange={(event) => onChange(event.target.value)}
                  pattern="^(0[1-9]|1[0-2]):([0-5][0-9])$"
                  value={value as string}
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
                        disabled={disabled}
                        id={`${timeFormatField.name}Input`}
                        onChange={(event) => onChange(event.target.value as amPm)}
                        value={value as amPm}
                      >
                        <SelectItem value="AM" text={t('AM', 'AM')} />
                        <SelectItem value="PM" text={t('PM', 'PM')} />
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
      )}
    </div>
  );
};

export default VisitDateTimeSection;
