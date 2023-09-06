import { useConfig } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ChartConfig } from '../../config-schema';
import { useConceptAnswersForVisitAttributeType, useVisitAttributeType } from '../hooks/useVisitAttributeType';
import {
  TextInput,
  TextInputSkeleton,
  TextArea,
  NumberInput,
  SelectSkeleton,
  Select,
  SelectItem,
  Checkbox,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './visit-attribute-type.scss';
import dayjs from 'dayjs';
import { useController, useFormContext } from 'react-hook-form';
import { VisitFormData } from './visit-form.component';

interface VisitAttributes {
  [uuid: string]: string;
}

interface VisitAttributeTypeFieldsProps {
  isMissingRequiredAttributes: boolean;
  setErrorFetchingResources: React.Dispatch<
    React.SetStateAction<{
      blockSavingForm: boolean;
    }>
  >;
}

const VisitAttributeTypeFields: React.FC<VisitAttributeTypeFieldsProps> = ({
  isMissingRequiredAttributes,
  setErrorFetchingResources,
}) => {
  const { visitAttributeTypes } = useConfig<ChartConfig>();
  const { getValues, setValue } = useFormContext<VisitFormData>();
  const visitAttributes = getValues('visitAttributes');

  if (visitAttributeTypes?.length) {
    return (
      <>
        {visitAttributeTypes.map((attributeType, indx) => (
          <AttributeTypeField
            key={indx}
            attributeType={attributeType}
            isMissingRequiredAttributes={isMissingRequiredAttributes}
            setErrorFetchingResources={setErrorFetchingResources}
          />
        ))}
      </>
    );
  }

  return null;
};

interface AttributeTypeFieldProps {
  attributeType: {
    uuid: string;
    required: boolean;
  };
  isMissingRequiredAttributes: boolean;
  setErrorFetchingResources: React.Dispatch<
    React.SetStateAction<{
      blockSavingForm: boolean;
    }>
  >;
}

const AttributeTypeField: React.FC<AttributeTypeFieldProps> = ({
  attributeType,
  isMissingRequiredAttributes,
  setErrorFetchingResources,
}) => {
  const { uuid, required } = attributeType;

  const { data, isLoading, error: errorFetchingVisitAttributeType } = useVisitAttributeType(uuid);
  const {
    answers,
    isLoading: isLoadingAnswers,
    error: errorFetchingVisitAttributeAnswers,
  } = useConceptAnswersForVisitAttributeType(data?.datatypeConfig);
  const { t } = useTranslation();
  const labelText = !required ? `${data?.display} (${t('optional', 'optional')})` : data?.display;
  const { control, setValue } = useFormContext<VisitFormData>();

  const {
    field: { onBlur, onChange, value, ref },
    fieldState,
  } = useController({
    name: `visitAttributes.${uuid}`,
    control: control,
    rules: { required: required },
  });

  useEffect(() => {
    if (errorFetchingVisitAttributeType || errorFetchingVisitAttributeAnswers) {
      setErrorFetchingResources((prev) => ({
        blockSavingForm: prev?.blockSavingForm || required,
      }));
    }
  }, [errorFetchingVisitAttributeAnswers, errorFetchingVisitAttributeType, required, setErrorFetchingResources]);

  useEffect(() => {
    setValue(`visitAttributeTypes.${uuid}`, { required: required });
  }, [required, setValue, uuid]);

  const field = useMemo(() => {
    if (isLoading) {
      return <></>;
    }

    if (errorFetchingVisitAttributeType) {
      return null;
    }

    switch (data?.datatypeClassname) {
      case 'org.openmrs.customdatatype.datatype.ConceptDatatype':
        if (isLoadingAnswers) {
          return <SelectSkeleton />;
        }

        if (errorFetchingVisitAttributeAnswers) {
          return null;
        }

        return (
          <Select
            labelText={labelText}
            onChange={onChange}
            value={value}
            ref={ref}
            onBlur={onBlur}
            invalid={!!fieldState?.error?.message}
          >
            <SelectItem text={t('selectAnOption', 'Select an option')} value={null} />
            {answers.map((ans, indx) => (
              <SelectItem key={indx} text={ans.display} value={ans.uuid} />
            ))}
          </Select>
        );
      case 'org.openmrs.customdatatype.datatype.FloatDatatype':
        return (
          <NumberInput
            label={labelText}
            hideSteppers
            onChange={onChange}
            value={value}
            ref={ref}
            onBlur={onBlur}
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.FreeTextDatatype':
        return (
          <TextInput
            labelText={labelText}
            onChange={onChange}
            onBlur={onBlur}
            ref={ref}
            value={value}
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.LongFreeTextDatatype':
        return (
          <TextArea
            labelText={labelText}
            onChange={onChange}
            onBlur={onBlur}
            ref={ref}
            value={value}
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.BooleanDatatype':
        return (
          <Checkbox
            labelText={labelText}
            onChange={onChange}
            onBlur={onBlur}
            ref={ref}
            value={value}
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.DateDatatype':
        return (
          <DatePicker
            dateFormat="d/m/Y"
            datePickerType="single"
            onChange={([date]) => onChange(dayjs(date).format('YYYY-MM-DD'))}
          >
            <DatePickerInput
              id="date-picker-default-id"
              placeholder="dd/mm/yyyy"
              labelText={labelText}
              onBlur={onBlur}
              ref={ref}
              value={value}
              type="text"
              invalid={!!fieldState?.error?.message}
              invalidText={fieldState?.error?.message}
            />
          </DatePicker>
        );
      default:
        return (
          <TextInput
            labelText={labelText}
            onChange={onChange}
            onBlur={onBlur}
            ref={ref}
            value={value}
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
    }
  }, [
    isLoading,
    errorFetchingVisitAttributeType,
    data?.datatypeClassname,
    isLoadingAnswers,
    errorFetchingVisitAttributeAnswers,
    labelText,
    onChange,
    value,
    ref,
    onBlur,
    fieldState?.error?.message,
    t,
    answers,
  ]);

  if (isLoading) {
    return (
      <div className={styles.visitAttributeField}>
        <TextInputSkeleton />
      </div>
    );
  }

  if (errorFetchingVisitAttributeType) {
    return null;
  }

  return <div className={styles.visitAttributeField}>{field}</div>;
};
export default VisitAttributeTypeFields;
