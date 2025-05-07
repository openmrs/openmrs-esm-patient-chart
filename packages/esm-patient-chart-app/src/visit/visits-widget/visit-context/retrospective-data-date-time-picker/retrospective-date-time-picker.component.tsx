import { SelectItem, TimePickerSelect, TimePicker, Checkbox } from '@carbon/react';
import { OpenmrsDatePicker, ResponsiveWrapper, useFeatureFlag, useVisit } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { type Control, Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './restrospective-date-time-picker.scss';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';

type TFormValues = {
  'retrospective-date': Date;
  'retrospective-time': string;
  'retrospective-time-format': string;
};

type IRetrospectiveDateTimePickerProps = {
  patientUuid: string;
  control: Control<TFormValues>;
  maxDate?: Date;
  minDate?: Date;
  onChange?: (data: TFormValues) => void;
};

const RetrospectiveDateTimePicker = ({
  patientUuid,
  control: propControl,
  maxDate,
  minDate,
  onChange,
}: IRetrospectiveDateTimePickerProps) => {
  const { t } = useTranslation();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isRdeEnabled = useFeatureFlag('rde');

  const showDatePicker = systemVisitEnabled && isRdeEnabled;

  const { currentVisit } = useVisit(patientUuid);
  const isActiveVisit = !Boolean(currentVisit && currentVisit.stopDatetime);

  const [manuallyEnableDateTimePicker, setManuallyEnableDateTimePicker] = useState<boolean | false>(false);

  // disable inputs if isActiveVisit and user has not manually enabled the picker.
  const disableInputs = isActiveVisit && !manuallyEnableDateTimePicker;

  // the below form is for when the caller does not pass a control prop
  // when this happens we assume the caller passed an onChange function which we
  // call to supply the data
  const form = useForm<TFormValues>();

  const retrospectiveDate = form.watch('retrospective-date');
  const retrospectiveTime = form.watch('retrospective-time');
  const retrospectiveTimeFormat = form.watch('retrospective-time-format');

  const control = propControl || form.control;

  useEffect(() => {
    if (onChange) {
      onChange({
        'retrospective-date': retrospectiveDate,
        'retrospective-time': retrospectiveTime,
        'retrospective-time-format': retrospectiveTimeFormat,
      });
    }
  }, [onChange, retrospectiveDate, retrospectiveTime, retrospectiveTimeFormat]);

  if (showDatePicker === false) {
    return null;
  }

  return (
    <section className={styles.wrapper}>
      <h4 className={styles.heading}>Encounter time</h4>
      {isActiveVisit && (
        <Checkbox
          checked={manuallyEnableDateTimePicker}
          className={styles.checkbox}
          id={'enable-date-time-picker'}
          labelText={t('enable', 'Enable')}
          onChange={(_, { checked, id }) => {
            setManuallyEnableDateTimePicker(checked);
          }}
        />
      )}
      <div className={styles.pickerWrapper}>
        <Controller
          name={'retrospective-date'}
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
            name={'retrospective-time'}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <div className={styles.timePickerWrapper}>
                <TimePicker
                  id={'retrospective-time-picker-input'}
                  labelText={t('time', 'Time')}
                  onBlur={onBlur}
                  onChange={(event) => onChange(event.target.value)}
                  pattern="^(0[1-9]|1[0-2]):([0-5][0-9])$"
                  value={value}
                  disabled={disableInputs}
                  className={styles.timePicker}
                >
                  <Controller
                    name={'retrospective-time-format'}
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

export default RetrospectiveDateTimePicker;
