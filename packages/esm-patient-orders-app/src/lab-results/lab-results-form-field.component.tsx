import React from 'react';
import { NumberInput, Select, SelectItem, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Control, Controller } from 'react-hook-form';
import { type LabOrderConcept } from './lab-results.resource';
import styles from './lab-results-form.scss';

interface ResultFormFieldProps {
  concept: LabOrderConcept;
  control: Control<any, any>;
  defaultValue: any;
}

const ResultFormField: React.FC<ResultFormFieldProps> = ({ concept, control, defaultValue }) => {
  const { t } = useTranslation();

  const isCoded = (concept: LabOrderConcept) => concept.datatype?.display === 'Coded';
  const isNumeric = (concept: LabOrderConcept) => concept.datatype?.display === 'Numeric';
  const isPanel = (concept: LabOrderConcept) => concept.setMembers?.length > 0;
  const isText = (concept: LabOrderConcept) => concept.datatype?.display === 'Text';

  const printValueRange = (concept: LabOrderConcept) => {
    if (concept?.datatype?.display === 'Numeric') {
      const maxVal = Math.max(concept?.hiAbsolute, concept?.hiCritical, concept?.hiNormal);
      const minVal = Math.min(concept?.lowAbsolute, concept?.lowCritical, concept?.lowNormal);
      return ` (${minVal ?? 0} - ${maxVal > 0 ? maxVal : '--'} ${concept?.units ?? ''})`;
    }
    return '';
  };

  const getSavedMemberValue = (conceptUuid: string, dataType: string) => {
    return dataType === 'Coded'
      ? defaultValue?.groupMembers?.find((member) => member.concept.uuid === conceptUuid)?.value?.uuid
      : defaultValue?.groupMembers?.find((member) => member.concept.uuid === conceptUuid)?.value;
  };

  return (
    <>
      {isText(concept) && (
        <Controller
          control={control}
          name={concept.uuid}
          render={({ field }) => (
            <TextInput
              className={styles.textInput}
              id={concept.uuid}
              key={concept.uuid}
              labelText={concept?.display ?? ''}
              type="text"
              {...field}
            />
          )}
        />
      )}

      {isNumeric(concept) && (
        <Controller
          control={control}
          name={concept.uuid}
          render={({ field }) => (
            <NumberInput
              allowEmpty
              className={styles.numberInput}
              disableWheel
              hideSteppers
              id={concept.uuid}
              key={concept.uuid}
              label={concept?.display + printValueRange(concept)}
              onChange={(event) => field.onChange(event.target.value)}
              value={field.value || ''}
            />
          )}
        />
      )}

      {isCoded(concept) && (
        <Controller
          name={concept.uuid}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              className={styles.textInput}
              defaultValue={defaultValue?.value?.uuid}
              id={`select-${concept.uuid}`}
              key={concept.uuid}
              labelText={concept?.display}
            >
              <SelectItem text={t('chooseAnOption', 'Choose an option')} value="" />
              {concept?.answers?.length &&
                concept?.answers?.map((answer) => (
                  <SelectItem key={answer.uuid} text={answer.display} value={answer.uuid}>
                    {answer.display}
                  </SelectItem>
                ))}
            </Select>
          )}
        />
      )}

      {isPanel(concept) &&
        concept.setMembers.map((member) => (
          <React.Fragment key={member.uuid}>
            {isText(member) && (
              <Controller
                control={control}
                name={member.uuid}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id={`text-${member.uuid}`}
                    className={styles.textInput}
                    key={member.uuid}
                    labelText={member?.display ?? ''}
                    type="text"
                  />
                )}
              />
            )}
            {isNumeric(member) && (
              <Controller
                control={control}
                name={member.uuid}
                render={({ field }) => (
                  <NumberInput
                    allowEmpty
                    className={styles.numberInput}
                    disableWheel
                    hideSteppers
                    id={`number-${member.uuid}`}
                    key={member.uuid}
                    label={member?.display + printValueRange(member)}
                    onChange={(event) => field.onChange(event.target.value)}
                    value={field.value || ''}
                  />
                )}
              />
            )}
            {isCoded(member) && (
              <Controller
                name={member.uuid}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    className={styles.textInput}
                    defaultValue={getSavedMemberValue(member.uuid, member.datatype.display)}
                    id={`select-${member.uuid}`}
                    key={member.uuid}
                    labelText={member?.display}
                    type="text"
                  >
                    <SelectItem text={t('chooseAnOption', 'Choose an option')} value="" />

                    {member?.answers?.map((answer) => (
                      <SelectItem key={answer.uuid} text={answer.display} value={answer.uuid}>
                        {answer.display}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            )}
          </React.Fragment>
        ))}
    </>
  );
};

export default ResultFormField;
