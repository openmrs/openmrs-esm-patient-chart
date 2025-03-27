import React, { useEffect, useId, useMemo } from 'react';
import {
  Checkbox,
  NumberInput,
  Select,
  SelectItem,
  SelectSkeleton,
  TextArea,
  TextInput,
  TextInputSkeleton,
} from '@carbon/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Controller, type ControllerFieldState, type ControllerRenderProps, useFormContext } from 'react-hook-form';
import { OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import { type ChartConfig } from '../../config-schema';
import { useConceptAnswersForVisitAttributeType, useVisitAttributeType } from '../hooks/useVisitAttributeType';
import { type VisitFormData } from './visit-form.resource';
import styles from './visit-attribute-type.scss';

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

/**
 * Evaluates a given expression using the provided visitAttributes.
 *
 * @param {string} expression - The expression to be evaluated. This should be a string of JavaScript code.
 * @param {VisitAttributes} visitAttributes - An object containing visit attributes which will be used in the evaluation of the expression.
 *
 * @returns {boolean} - The boolean value of the result of the evaluated expression.
 *
 */
function evaluateExpression(expression: string, visitAttributes: VisitAttributes) {
  const func = new Function('visitAttributes', `return ${expression};`);

  const result = func(visitAttributes);

  return Boolean(result);
}

const VisitAttributeTypeFields: React.FC<VisitAttributeTypeFieldsProps> = ({ setErrorFetchingResources }) => {
  const { visitAttributeTypes } = useConfig<ChartConfig>();
  const { control, getValues } = useFormContext<VisitFormData>();

  if (visitAttributeTypes?.length) {
    return (
      <>
        {visitAttributeTypes.map((attributeType) => {
          const { visitAttributes } = getValues();

          const showAttributeType = attributeType?.showWhenExpression
            ? evaluateExpression(attributeType?.showWhenExpression, visitAttributes)
            : true;

          return (
            showAttributeType && (
              <Controller
                key={attributeType.uuid}
                name={`visitAttributes.${attributeType.uuid}`}
                control={control}
                render={({ field, fieldState }) => (
                  <AttributeTypeField
                    key={attributeType.uuid}
                    attributeType={attributeType}
                    setErrorFetchingResources={setErrorFetchingResources}
                    fieldProps={field}
                    fieldState={fieldState}
                  />
                )}
              />
            )
          );
        })}
      </>
    );
  }

  return null;
};

interface AttributeTypeFieldProps {
  fieldProps: ControllerRenderProps<VisitFormData, `visitAttributes.${string}`>;
  fieldState: ControllerFieldState;
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
  fieldState,
}) => {
  const { uuid, required } = attributeType;
  const { data, isLoading, error: errorFetchingVisitAttributeType } = useVisitAttributeType(uuid);
  const {
    answers,
    isLoading: isLoadingAnswers,
    error: errorFetchingVisitAttributeAnswers,
  } = useConceptAnswersForVisitAttributeType(data?.datatypeConfig);
  const { t } = useTranslation();
  const id = useId();
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
            id={`select-${id}`}
            {...fieldProps}
            labelText={labelText}
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
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
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.FreeTextDatatype':
        return (
          <TextInput
            {...fieldProps}
            id={uuid}
            labelText={labelText}
            placeholder={labelText}
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.LongFreeTextDatatype':
        return (
          <TextArea
            {...fieldProps}
            labelText={labelText}
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.BooleanDatatype':
        return (
          <Checkbox
            {...fieldProps}
            labelText={labelText}
            invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
      case 'org.openmrs.customdatatype.datatype.DateDatatype':
        return (
          <OpenmrsDatePicker
            {...fieldProps}
            id={`date-picker-${uuid}`}
            labelText={labelText}
            aria-invalid={!!fieldState?.error?.message}
            invalidText={fieldState?.error?.message}
          />
        );
      default:
        return (
          <TextInput
            {...fieldProps}
            labelText={labelText}
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
    id,
    fieldProps,
    labelText,
    fieldState?.error?.message,
    t,
    answers,
    uuid,
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
