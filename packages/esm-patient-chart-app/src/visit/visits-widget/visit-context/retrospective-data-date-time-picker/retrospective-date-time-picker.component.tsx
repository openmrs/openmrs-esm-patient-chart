import { SelectItem, TimePickerSelect, TimePicker, Checkbox } from '@carbon/react';
import { OpenmrsDatePicker, ResponsiveWrapper, useFeatureFlag, useVisit } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './restrospective-date-time-picker.scss';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';

type TFormValues = {
  'retrospective-date': string;
  'retrospective-time': string;
  'retrospective-time-format': string;
};

const RetrospectiveDateTimePicker = ({
  patientUuid,
  onChange,
}: {
  patientUuid: string;
  onChange?: (data: TFormValues) => void;
}) => {
  const { t } = useTranslation();
  const formContext = useFormContext<TFormValues>();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isRdeEnabled = useFeatureFlag('rde');

  const showDatePicker = systemVisitEnabled && isRdeEnabled;

  const { currentVisit, isLoading } = useVisit(patientUuid);
  const isActiveVisit = !Boolean(currentVisit && currentVisit.stopDatetime);

  const [manuallyEnableDateTimePicker, setManuallyEnableDateTimePicker] = useState<boolean | false>(false);

  // this form is for when the component is not rendered inside a form context
  // when this happens we assume the caller passed an onChange function which we
  // call to supply the data
  const form = useForm<TFormValues>();
  const unManagedFormValues = form.getValues();

  const control = formContext ? formContext.control : form.control;

  // disable inputs if isActiveVisit and user has not manually enabled the picker.
  const disableInputs = isActiveVisit && !manuallyEnableDateTimePicker;

  useEffect(() => {
    onChange?.(unManagedFormValues);
  }, [onChange, unManagedFormValues]);

  if (showDatePicker === false) {
    return null;
  }

  return (
    <section className={styles.wrapper}>
      <h4 className={styles.heading}>Encounter time</h4>
      <div className={styles.pickerWrapper}>
        <Controller
          name={'retrospective-date'}
          control={control}
          render={({ field, fieldState }) => (
            <OpenmrsDatePicker
              {...field}
              id={'retrospective-date-picker-input'}
              labelText={t('date', 'Date')}
              invalid={Boolean(fieldState?.error?.message)}
              invalidText={fieldState?.error?.message}
              isDisabled={disableInputs}
            />
          )}
        />
        <Controller
          name={'retrospective-time'}
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
                isDisabled={disableInputs}
              >
                <Controller
                  name={'retrospective-time-format'}
                  control={formContext.control}
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
        {!isActiveVisit && (
          <Checkbox
            checked={manuallyEnableDateTimePicker}
            className={styles.checkbox}
            labelText={'Enable'}
            onChange={(_, { checked, id }) => {
              setManuallyEnableDateTimePicker(checked);
            }}
          />
        )}
      </div>
    </section>
  );
};

export default RetrospectiveDateTimePicker;
