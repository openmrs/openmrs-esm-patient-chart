import { useConfig } from '@openmrs/esm-framework';
import React, { useCallback, useMemo } from 'react';
import { ChartConfig } from '../../config-schema';
import { useConceptAnswersForVisitAttributeType, useVisitAttributeType } from '../hooks/useVisitAttributeType';
import {
  TextInput,
  SkeletonText,
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
    (uuid, value) => {
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
            setVisitAttribute={(val) => setAttributeValue(attributeType.uuid, val)}
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
  setVisitAttribute: (val: string | boolean | number) => void;
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
  const { data, isLoading } = useVisitAttributeType(uuid);
  const { answers, isLoading: isLoadingAnswers } = useConceptAnswersForVisitAttributeType(data?.datatypeConfig);
  const { t } = useTranslation();
  const labelText = !required ? `${data?.name} (${t('optional', 'optional')})` : data?.name;

  const field = useMemo(() => {
    if (isLoading) {
      return <></>;
    }
    switch (data.datatypeClassname) {
      case 'org.openmrs.customdatatype.datatype.ConceptDatatype':
        return !isLoadingAnswers ? (
          <Select
            labelText={labelText}
            onChange={(e) => setVisitAttribute(e.target.value)}
            required={required}
            invalid={required && isMissingRequiredAttributes && !visitAttributes[uuid]}
            invalidText={t('fieldRequired', 'This field is required')}
          >
            <SelectItem text={t('selectAnOption', 'Select an option')} value={null} />
            {answers.map((ans, indx) => (
              <SelectItem key={indx} text={ans.display} value={ans.uuid} />
            ))}
          </Select>
        ) : (
          <SelectSkeleton />
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
    data.datatypeClassname,
    isLoading,
    isLoadingAnswers,
    isMissingRequiredAttributes,
    labelText,
    required,
    setVisitAttribute,
    t,
    uuid,
    visitAttributes,
  ]);

  if (isLoading) {
    return (
      <div className={styles.visitAttributeField}>
        <TextInputSkeleton />
      </div>
    );
  }

  return <div className={styles.visitAttributeField}>{field}</div>;
};
export default VisitAttributeTypeFields;
