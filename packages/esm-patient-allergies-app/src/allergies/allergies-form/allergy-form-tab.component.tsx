import React from 'react';
import styles from './allergy-form-tab.component.scss';
import { RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { OpenMRSResource } from '../../types';

interface AllergyFormTabProps {
  allergens: Array<OpenMRSResource>;
  selectedAllergen: string;
  handleChange: Function;
  name: string;
}

const AllergyFormTab: React.FC<AllergyFormTabProps> = ({ allergens, selectedAllergen, handleChange, name }) => {
  const handleOnChange = React.useCallback((event) => {
    handleChange(event);
  }, []);
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
