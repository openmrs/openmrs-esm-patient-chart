import { ComboBox } from '@carbon/react';
import { useConfig, useDebounce } from '@openmrs/esm-framework';
import React, { useMemo, useState } from 'react';
import { getTemplateOrderBasketItem, useDrugSearch, useDrugTemplates } from './drug-search.resource';
import { type DrugOrderBasketItem } from '../../types';
import { type ConfigObject } from '../../config-schema';
import { useTranslation } from 'react-i18next';

interface DrugSearchComboBoxProps {
  setSelectedDrugItem(drug: DrugOrderBasketItem);
}

/**
 * This component is a ComboBox for searching for drugs. Similar to drug-search.component.tsx,
 * but allows for custom behavior when a drug is selected.
 * This extension is currently not used anywhere in the patient-medications-app, but
 * is used by other apps (ex: dispensing) for selecting drugs.
 */
const DrugSearchComboBox: React.FC<DrugSearchComboBoxProps> = ({ setSelectedDrugItem }) => {
  const { daysDurationUnit } = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const [drugSearchTerm, setDrugSearchTerm] = useState('');
  const debouncedDrugSearchTerm = useDebounce(drugSearchTerm);
  const { drugs } = useDrugSearch(debouncedDrugSearchTerm);
  const { templateByDrugUuid } = useDrugTemplates(drugs);
  const drugItemTemplateOptions: Array<DrugOrderBasketItem> = useMemo(() => {
    return drugs?.flatMap((drug) => {
      const templates = templateByDrugUuid.get(drug.uuid);
      if (templates?.length > 0) {
        return templates.map((template) => getTemplateOrderBasketItem(drug, daysDurationUnit, template));
      } else {
        return [getTemplateOrderBasketItem(drug, daysDurationUnit)];
      }
    });
  }, [drugs, templateByDrugUuid, daysDurationUnit]);

  return (
    <ComboBox
      id="drug-search-combobox"
      items={drugItemTemplateOptions ?? []}
      onChange={({ selectedItem }) => {
        setSelectedDrugItem(selectedItem);
      }}
      onInputChange={(inputText) => {
        setDrugSearchTerm(inputText);
      }}
      itemToString={(item: DrugOrderBasketItem) => item?.display ?? ''}
      placeholder={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
      titleText={t('drugName', 'Drug name')}
    />
  );
};

export default DrugSearchComboBox;
