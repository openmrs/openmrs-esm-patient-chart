import React, { useEffect, useState } from 'react';
import { type Allergen } from './allergy-form.resource';
import { Search } from '@carbon/react';
import styles from './allergen-picker.component.scss';
import { AllergenType } from '../../types';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';

export interface AllergenPickerProps {
  allergens: Allergen[];
  selectedAllergen?: Allergen;
  onAllergenChange: (allergen: Allergen) => void;
}
function AllergenPicker({ allergens, selectedAllergen, onAllergenChange }: AllergenPickerProps) {
  const { t } = useTranslation();
  const { otherConceptUuid } = useConfig().concepts;
  const [allergenSearch, setAllergenSearch] = useState('');
  const [filteredAllergens, setFilteredAllergens] = useState<Allergen[]>([]);

  const filterAllergens = (keyword: string) => {
    const filteredAllergens = allergens.filter((allergen) =>
      allergen.display.toLowerCase().includes(keyword.toLowerCase()),
    );
    setFilteredAllergens(filteredAllergens);
  };

  useEffect(() => {
    setFilteredAllergens(allergens);
  }, [allergens]);

  return (
    <>
      <Search
        size="md"
        id="allergenSearch"
        labelText={t('allergen', 'Allergen')}
        closeButtonLabelText={t('clearAllergenSearch', 'Clear allergen search')}
        placeholder={t('searchAllergen', 'Search allergen')}
        onChange={(event) => {
          setAllergenSearch(event.target.value);
          filterAllergens(event.target.value);
        }}
        value={selectedAllergen ? selectedAllergen.display : allergenSearch}
        onFocus={() => {
          onAllergenChange(null);
        }}
        onClear={() => {
          onAllergenChange(null);
        }}
      />
      {selectedAllergen == null && (
        <ul className={styles.allergenSearchResults} role="menu">
          {filteredAllergens.map((allergen) => (
            <li role="menuitem" key={allergen.uuid} onClick={() => onAllergenChange(allergen)}>
              {allergen.display}
            </li>
          ))}
          <li
            role="menuitem"
            key="other"
            onClick={() => onAllergenChange({ display: 'Other', uuid: otherConceptUuid, type: AllergenType.OTHER })}
          >
            {t('other', 'Other')}
          </li>
        </ul>
      )}
    </>
  );
}

export default AllergenPicker;
