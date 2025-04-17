import React from 'react';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { type OpenmrsResource } from '@openmrs/esm-framework';
import styles from './allergy-form-tab.scss';

interface AllergyFormTabProps {
  allergens: Array<OpenmrsResource>;
  selectedAllergen: string;
  handleChange: Function;
  name: string;
}

const AllergyFormTab: React.FC<AllergyFormTabProps> = ({ allergens, selectedAllergen, handleChange, name }) => {
  const handleOnChange = React.useCallback(
    (event) => {
      handleChange(event);
    },
    [handleChange],
  );
  return (
    <RadioButtonGroup
      className={styles.radioButtonWrapper}
      name={name}
      valueSelected={selectedAllergen}
      orientation="vertical"
      onChange={handleOnChange}
    >
      {allergens?.map((allergen) => (
        <RadioButton key={allergen.uuid} labelText={allergen.display} value={allergen.uuid} />
      ))}
    </RadioButtonGroup>
  );
};

export default AllergyFormTab;
