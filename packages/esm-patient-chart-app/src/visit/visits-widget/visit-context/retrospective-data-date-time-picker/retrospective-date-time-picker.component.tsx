import { SelectItem, TimePickerSelect, TimePicker, Checkbox } from '@carbon/react';
import { OpenmrsDatePicker, ResponsiveWrapper, showSnackbar, useFeatureFlag, useVisit } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useState } from 'react';
import { type Control, Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './restrospective-date-time-picker.scss';
import { format } from 'date-fns';

type FormValues = {
  retrospectiveDate: string;
  retrospectiveTime: string;
  retrospectiveTimeFormat: string;
};

type RetrospectiveDateTimePickerProps = {
  patientUuid: string;
  control?: Control<FormValues>;
  onChange?: (data: FormValues) => void;
};

const RetrospectiveDateTimePicker = ({
  patientUuid,
  control: propControl,
  onChange,
}: RetrospectiveDateTimePickerProps) => {
  const { t } = useTranslation();
  const isRdeEnabled = useFeatureFlag('rde');

  const { currentVisit } = useVisit(patientUuid);
  const isActiveVisit = !Boolean(currentVisit && currentVisit.stopDatetime);
  const maxDate = currentVisit?.stopDatetime ?? new Date();
  const minDate = currentVisit?.startDatetime;

  const [manuallyEnableDateTimePicker, setManuallyEnableDateTimePicker] = useState<boolean>(false);

  // disable inputs if user has not manually enabled the picker.
  const disableInputs = isActiveVisit && !manuallyEnableDateTimePicker;

  // the below form is for when the caller does not pass a control prop
  // when this happens we assume the caller passed an onChange function which we
  // call to supply the data
  const form = useForm<FormValues>();

  const retrospectiveDate = form.watch('retrospectiveDate');
  const retrospectiveTime = form.watch('retrospectiveTime');
  const retrospectiveTimeFormat = form.watch('retrospectiveTimeFormat');

  const control = propControl || form.control;

  useEffect(() => {
    if (onChange) {
      onChange({
        retrospectiveDate: retrospectiveDate,
        retrospectiveTime: retrospectiveTime,
        retrospectiveTimeFormat: retrospectiveTimeFormat,
      });
    }
  }, [form, onChange, retrospectiveDate, retrospectiveTime, retrospectiveTimeFormat]);

  const resetFormForRetrospectiveVisit = useCallback(() => {
    const timeFormat = new Date(currentVisit.startDatetime).getHours() >= 12 ? 'PM' : 'AM';
    form.reset({
      retrospectiveDate: currentVisit.startDatetime,
      retrospectiveTime: format(new Date(currentVisit.startDatetime), 'hh:mm'),
      retrospectiveTimeFormat: timeFormat,
    });
  }, [currentVisit, form]);

  // each time the current visit changes, reset the form values
  useEffect(() => {
    if (currentVisit) {
      const currentVisitIsRetrospective = Boolean(currentVisit.stopDatetime);

      if (currentVisitIsRetrospective) {
        resetFormForRetrospectiveVisit();
        return;
      }

      form.reset({
        retrospectiveDate: '',
        retrospectiveTime: '',
        retrospectiveTimeFormat: '',
      });
      setManuallyEnableDateTimePicker(false);
    }
  }, [currentVisit, form, resetFormForRetrospectiveVisit]);

  if (!isRdeEnabled) {
    return null;
  }

  return (
    <section className={styles.wrapper}>
      <h4 className={styles.heading}>Order time</h4>
      {isActiveVisit && (
        <Checkbox
          checked={manuallyEnableDateTimePicker}
          className={styles.checkbox}
          id={'enable-date-time-picker'}
          labelText={t('inThePast', 'In the past')}
          onChange={(_, { checked, id }) => {
            setManuallyEnableDateTimePicker(checked);
            if (checked) {
              resetFormForRetrospectiveVisit();
            }
            if (!checked) {
              form.reset({
                retrospectiveDate: '',
                retrospectiveTime: '',
                retrospectiveTimeFormat: '',
              });
            }
          }}
        />
      )}
      <div className={styles.pickerWrapper}>
        <Controller
          name={'retrospectiveDate'}
          control={control}
          render={({ field, fieldState }) => (
            <ResponsiveWrapper>
              <OpenmrsDatePicker
                {...field}
                id={'retrospective-date-picker-input'}
                labelText={t('date', 'Date')}
                invalid={Boolean(fieldState?.error?.message)}
                invalidText={fieldState?.error?.message}
                isDisabled={disableInputs}
                maxDate={maxDate}
                minDate={minDate}
                className={styles.datePicker}
              />
            </ResponsiveWrapper>
          )}
        />
        <ResponsiveWrapper>
          <Controller
            name={'retrospectiveTime'}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <div className={styles.timePickerWrapper}>
                <TimePicker
                  id={'retrospective-time-picker-input'}
                  labelText={t('time', 'Time')}
                  onBlur={(event) => {
                    const timeValue = event.target.value;
                    if (timeValue) {
                      const pattern = /^(0[1-9]|1[0-2]):([0-5][0-9])$/;
                      if (!pattern.test(timeValue)) {
                        form.setError('retrospectiveTime', {
                          type: 'manual',
                          message: t(
                            'invalidTimeFormatMessage',
                            'Please enter a valid time in 12 HR format HH:MM (e.g., 02:30).',
                          ),
                        });
                        form.setValue('retrospectiveTime', '');
                      }
                    }
                  }}
                  onChange={(event) => onChange(event.target.value)}
                  pattern="^(0[1-9]|1[0-2]):([0-5][0-9])$"
                  value={value}
                  disabled={disableInputs}
                  className={styles.timePicker}
                  invalid={Boolean(form.formState.errors.retrospectiveTime)}
                  invalidText={form.formState.errors.retrospectiveTime?.message}
                  onFocus={() => form.clearErrors('retrospectiveTime')}
                >
                  <Controller
                    name={'retrospectiveTimeFormat'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TimePickerSelect
                        aria-label={t('timeFormat ', 'Time Format')}
                        id={`am-pm-input`}
                        onChange={(event) => onChange(event.target.value)}
                        value={value}
                        disabled={disableInputs}
                      >
                        <SelectItem value="" text="" />
                        <SelectItem value="AM" text={t('AM', 'AM')} />
                        <SelectItem value="PM" text={t('PM', 'PM')} />
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

export default RetrospectiveDateTimePicker;
