import { useConfig } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
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

interface VisitAttributeTypeFieldsProps {
  setVisitAttributes: React.Dispatch<
    React.SetStateAction<{
      [uuid: string]: string | number | boolean;
    }>
  >;
}

const VisitAttributeTypeFields: React.FC<VisitAttributeTypeFieldsProps> = ({ setVisitAttributes }) => {
  const { visitAttributeTypes } = useConfig() as ChartConfig;

  const setAttributeValue = (uuid, value) => {
    setVisitAttributes((prevState) => ({
      ...prevState,
      [uuid]: value,
    }));
  };

  if (visitAttributeTypes.length) {
    return (
      <>
        {visitAttributeTypes.map((attributeType) => (
          <AttributeTypeField
            attributeType={attributeType}
            setVisitAttribute={(val) => setAttributeValue(attributeType.uuid, val)}
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
}

const AttributeTypeField: React.FC<AttributeTypeFieldProps> = ({ attributeType, setVisitAttribute }) => {
  const { uuid, required } = attributeType;
  const { data, isLoading } = useVisitAttributeType(uuid);
  const { answers, isLoading: isLoadingAnswers } = useConceptAnswersForVisitAttributeType(data?.datatypeConfig);
  const { t } = useTranslation();
  const labelText = !required ? `${data?.name} (${t('optional', 'optional')})` : data?.name;

  const getField = () => {
    if (isLoading) {
      return <></>;
    }
    switch (data.datatypeClassname) {
      case 'org.openmrs.customdatatype.datatype.ConceptDatatype':
        return !isLoadingAnswers ? (
          <Select labelText={labelText} onChange={(e) => setVisitAttribute(e.target.value)}>
            <SelectItem text={t('selectAnOption', 'Select an option')} value={null} />
            {answers.map((ans) => (
              <SelectItem text={ans.display} value={ans.uuid} />
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
            onChange={(e) => setVisitAttribute(parseInt(e.target.value))}
          />
        );
      case 'Free Text':
        return (
          <TextInput labelText={labelText} required={required} onChange={(e) => setVisitAttribute(e.target.value)} />
        );
      case 'Long Free Text':
        return (
          <TextArea labelText={labelText} required={required} onChange={(e) => setVisitAttribute(e.target.value)} />
        );
      case 'Boolean':
        return (
          <Checkbox
            labelText={labelText}
            required={required}
            onChange={(e, { checked }) => setVisitAttribute(checked)}
          />
        );
      case 'Date':
        return (
          <DatePicker dateFormat="m/d/Y" datePickerType="single">
            <DatePickerInput
              id="date-picker-default-id"
              placeholder="mm/dd/yyyy"
              labelText={labelText}
              onChange={([date]) => setVisitAttribute(dayjs(date).format('mm-dd-YYYY'))}
              type="text"
            />
          </DatePicker>
        );
      default:
        return (
          <TextInput labelText={labelText} required={required} onChange={(e) => setVisitAttribute(e.target.value)} />
        );
    }
  };

  if (isLoading) {
    return (
      <div className={styles.visitAttributeField}>
        <TextInputSkeleton />
      </div>
    );
  }

  return <div className={styles.visitAttributeField}>{getField()}</div>;
};
export default VisitAttributeTypeFields;
