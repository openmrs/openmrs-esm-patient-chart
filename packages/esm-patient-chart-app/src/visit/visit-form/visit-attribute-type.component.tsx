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
import { Controller, ControllerRenderProps, useFormContext } from 'react-hook-form';
import { VisitFormData } from './visit-form.component';
import dayjs from 'dayjs';

interface VisitAttributes {
  [uuid: string]: string;
}

interface VisitAttributeTypeFieldsProps {
  setErrorFetchingResources: React.Dispatch<
    React.SetStateAction<{
      blockSavingForm: boolean;
    }>
  >;
}

const VisitAttributeTypeFields: React.FC<VisitAttributeTypeFieldsProps> = ({ setErrorFetchingResources }) => {
  const { visitAttributeTypes } = useConfig() as ChartConfig;
  const { control } = useFormContext<VisitFormData>();

  if (visitAttributeTypes?.length) {
    return (
      <>
        {visitAttributeTypes.map((attributeType, indx) => (
          <Controller
            name={`visitAttributes.${attributeType.uuid}`}
            control={control}
            render={({ field }) => (
              <AttributeTypeField
                key={indx}
                attributeType={attributeType}
                setErrorFetchingResources={setErrorFetchingResources}
                fieldProps={field}
              />
            )}
          />
        ))}
      </>
    );
  }

  return null;
};

interface AttributeTypeFieldProps {
  fieldProps: ControllerRenderProps<VisitFormData, `visitAttributes.${string}`>;
  attributeType: {
    uuid: string;
    required: boolean;
  };
  setErrorFetchingResources: React.Dispatch<
    React.SetStateAction<{
      blockSavingForm: boolean;
    }>
  >;
}

const AttributeTypeField: React.FC<AttributeTypeFieldProps> = ({
  attributeType,
  setErrorFetchingResources,
  fieldProps,
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

  const {
    formState: { errors },
  } = useFormContext<VisitFormData>();

  useEffect(() => {
    if (errorFetchingVisitAttributeType || errorFetchingVisitAttributeAnswers) {
      setErrorFetchingResources((prev) => ({
        blockSavingForm: prev?.blockSavingForm || required,
      }));
    }
  }, [errorFetchingVisitAttributeAnswers, errorFetchingVisitAttributeType, required, setErrorFetchingResources]);

  const fieldToRender = useMemo(() => {
    const { onChange } = fieldProps;
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
            {...fieldProps}
            labelText={labelText}
            invalid={!!errors.visitAttributes?.[uuid]}
            invalidText={errors.visitAttributes?.[uuid]?.message}
          >
            <SelectItem text={t('selectAnOption', 'Select an option')} value={''} />
            {answers.map((ans, indx) => (
              <SelectItem key={indx} text={ans.display} value={ans.uuid} />
            ))}
          </Select>
        );
      case 'org.openmrs.customdatatype.datatype.FloatDatatype':
        return (
          <NumberInput
            {...fieldProps}
            label={labelText}
            hideSteppers
            invalid={!!errors.visitAttributes?.[uuid]}
            invalidText={errors.visitAttributes?.[uuid]?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.FreeTextDatatype':
        return (
          <TextInput
            {...fieldProps}
            labelText={labelText}
            invalid={!!errors.visitAttributes?.[uuid]}
            invalidText={errors.visitAttributes?.[uuid]?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.LongFreeTextDatatype':
        return (
          <TextArea
            {...fieldProps}
            labelText={labelText}
            invalid={!!errors.visitAttributes?.[uuid]}
            invalidText={errors.visitAttributes?.[uuid]?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.BooleanDatatype':
        return (
          <Checkbox
            {...fieldProps}
            labelText={labelText}
            invalid={!!errors.visitAttributes?.[uuid]}
            invalidText={errors.visitAttributes?.[uuid]?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.DateDatatype':
        return (
          <DatePicker
            {...fieldProps}
            dateFormat="d/m/Y"
            datePickerType="single"
            onChange={([date]) => onChange(dayjs(date).format('YYYY-MM-DD'))}
          >
            <DatePickerInput
              id="date-picker-default-id"
              placeholder="dd/mm/yyyy"
              labelText={labelText}
              type="text"
              invalid={!!errors.visitAttributes?.[uuid]}
              invalidText={errors.visitAttributes?.[uuid]?.message}
            />
          </DatePicker>
        );
      default:
        return (
          <TextInput
            {...fieldProps}
            labelText={labelText}
            invalid={!!errors.visitAttributes?.[uuid]}
            invalidText={errors.visitAttributes?.[uuid]?.message}
          />
        );
    }
  }, [
    uuid,
    answers,
    data,
    isLoading,
    isLoadingAnswers,
    labelText,
    t,
    errorFetchingVisitAttributeType,
    errorFetchingVisitAttributeAnswers,
    fieldProps,
    errors.visitAttributes,
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

  return <div className={styles.visitAttributeField}>{fieldToRender}</div>;
};
export default VisitAttributeTypeFields;
