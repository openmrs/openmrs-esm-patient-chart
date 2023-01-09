import { useConfig } from '@openmrs/esm-framework';
import React, { useCallback, useMemo } from 'react';
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
  InlineNotification,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './visit-attribute-type.scss';
import dayjs from 'dayjs';

interface VisitAttributes {
  [uuid: string]: string;
}

interface VisitAttributeTypeFieldsProps {
  setVisitAttributes: React.Dispatch<React.SetStateAction<VisitAttributes>>;
  isMissingRequiredAttributes: boolean;
  visitAttributes: VisitAttributes;
}

const VisitAttributeTypeFields: React.FC<VisitAttributeTypeFieldsProps> = ({
  setVisitAttributes,
  isMissingRequiredAttributes,
  visitAttributes,
}) => {
  const { visitAttributeTypes } = useConfig() as ChartConfig;

  const setAttributeValue = useCallback(
    (uuid: string, value: string) => {
      setVisitAttributes((prevState) => ({
        ...prevState,
        [uuid]: value,
      }));
    },
    [setVisitAttributes],
  );

  if (visitAttributeTypes?.length) {
    return (
      <>
        {visitAttributeTypes.map((attributeType, indx) => (
          <AttributeTypeField
            key={indx}
            attributeType={attributeType}
            setVisitAttribute={(val: string) => setAttributeValue(attributeType.uuid, val)}
            isMissingRequiredAttributes={isMissingRequiredAttributes}
            visitAttributes={visitAttributes}
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
  setVisitAttribute: (val: string) => void;
  isMissingRequiredAttributes: boolean;
  visitAttributes: VisitAttributes;
}

const AttributeTypeField: React.FC<AttributeTypeFieldProps> = ({
  attributeType,
  setVisitAttribute,
  isMissingRequiredAttributes,
  visitAttributes,
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
          return (
            <InlineNotification
              kind="error"
              lowContrast
              title={`${t('error', 'Error')} ${errorFetchingVisitAttributeAnswers?.response?.status}`}
              subtitle={t(
                'errorFetchingVisitAttributeAnswers',
                'Error occured when fetching answers for visit attribute type',
              )}
            />
          );
        }

        return (
          <Select
            labelText={labelText}
            onChange={(e) => setVisitAttribute(e.target.value)}
            required={required}
            invalid={required && isMissingRequiredAttributes && !visitAttributes[uuid]}
            invalidText={t('fieldRequired', 'This field is required')}
          >
            <SelectItem text={t('selectAnOption', 'Select an option')} value={null} disabled={required} />
            {answers.map((ans, indx) => (
              <SelectItem key={indx} text={ans.display} value={ans.uuid} />
            ))}
          </Select>
        );
      case 'org.openmrs.customdatatype.datatype.FloatDatatype':
        return (
          <NumberInput
            label={labelText}
            required={required}
            hideSteppers
            onChange={(e) => setVisitAttribute(e.target.value?.toString())}
            invalid={required && isMissingRequiredAttributes && !visitAttributes[uuid]}
            invalidText={t('fieldRequired', 'This field is required')}
          />
        );
      case 'org.openmrs.customdatatype.datatype.FreeTextDatatype':
        return (
          <TextInput
            labelText={labelText}
            required={required}
            onChange={(e) => setVisitAttribute(e.target.value)}
            invalid={required && isMissingRequiredAttributes && !visitAttributes[uuid]}
            invalidText={t('fieldRequired', 'This field is required')}
          />
        );
      case 'org.openmrs.customdatatype.datatype.LongFreeTextDatatype':
        return (
          <TextArea
            labelText={labelText}
            required={required}
            onChange={(e) => setVisitAttribute(e.target.value)}
            invalid={required && isMissingRequiredAttributes && !visitAttributes[uuid]}
            invalidText={t('fieldRequired', 'This field is required')}
          />
        );
      case 'org.openmrs.customdatatype.datatype.BooleanDatatype':
        return (
          <Checkbox
            labelText={labelText}
            required={required}
            onChange={(e, { checked }) => setVisitAttribute(checked.toString())}
            invalid={required && isMissingRequiredAttributes && !visitAttributes[uuid]}
            invalidText={t('fieldRequired', 'This field is required')}
          />
        );
      case 'org.openmrs.customdatatype.datatype.DateDatatype':
        return (
          <DatePicker
            dateFormat="d/m/Y"
            datePickerType="single"
            onChange={([date]) => setVisitAttribute(dayjs(date).format('YYYY-MM-DD'))}
            required={required}
          >
            <DatePickerInput
              id="date-picker-default-id"
              placeholder="dd/mm/yyyy"
              labelText={labelText}
              type="text"
              invalid={required && isMissingRequiredAttributes && !visitAttributes[uuid]}
              invalidText={t('fieldRequired', 'This field is required')}
            />
          </DatePicker>
        );
      default:
        return (
          <TextInput labelText={labelText} required={required} onChange={(e) => setVisitAttribute(e.target.value)} />
        );
    }
  }, [
    answers,
    data,
    isLoading,
    isLoadingAnswers,
    isMissingRequiredAttributes,
    labelText,
    required,
    setVisitAttribute,
    t,
    uuid,
    visitAttributes,
    errorFetchingVisitAttributeType,
    errorFetchingVisitAttributeAnswers,
  ]);

  if (isLoading) {
    return (
      <div className={styles.visitAttributeField}>
        <TextInputSkeleton />
      </div>
    );
  }

  if (errorFetchingVisitAttributeType) {
    return (
      <div className={styles.visitAttributeField}>
        <InlineNotification
          kind="error"
          lowContrast
          title={`${t('error', 'Error')} ${errorFetchingVisitAttributeType?.response?.status}`}
          subtitle={t('errorFetchingVisitAttributeType', 'Error occured when fetching visit attribute type')}
        />
      </div>
    );
  }

  return <div className={styles.visitAttributeField}>{field}</div>;
};
export default VisitAttributeTypeFields;
