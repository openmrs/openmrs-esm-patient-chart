import React, { useState, useCallback, useMemo } from 'react';
import Search from 'carbon-components-react/es/components/Search';
import Checkbox from 'carbon-components-react/es/components/Checkbox';
import Button from 'carbon-components-react/es/components/Button';
import styles from './clinical-view-form.component.scss';
import debounce from 'lodash-es/debounce';
import { useTranslation } from 'react-i18next';
import { detach, temporaryConfigStore, TemporaryConfigStore, useConfig } from '@openmrs/esm-framework';
import { useClinicalView } from '../store';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import set from 'lodash-es/set';

interface ClinicalViewFormProps {}
interface View {
  slotName: string;
  slot: string;
}

const ClinicalViewForm: React.FC<ClinicalViewFormProps> = () => {
  const { t } = useTranslation();
  const { clinicalViews } = useConfig();
  const moduleName = '@openmrs/esm-patient-clinical-view-app';
  const path = useMemo(() => [moduleName, 'clinicalViews'], []);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [searchResults, setSearchResult] = React.useState<Array<View>>([]);
  const [views, setViews] = React.useState<Array<View>>(useClinicalView());
  const [tempConfig, setTempConfig] = useState<TemporaryConfigStore>(null);

  React.useEffect(() => {
    !isEmpty(views) && setSearchResult(views);
  }, [views]);

  React.useEffect(() => {
    const results = views.filter(
      (view) => view.slotName.toLocaleLowerCase().search(searchTerm.toLocaleLowerCase()) !== -1,
    );
    setSearchResult(results);
  }, [searchTerm, views]);

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  const closeClinicalViewForm = useCallback(() => {
    detach('patient-chart-workspace-slot', 'patient-clinical-view-form-workspace');
  }, []);

  const addClinicalView = useCallback(
    (slot: string, slotName: string) => {
      const viewConfig = tempConfig ? tempConfig.config[moduleName].clinicalViews : clinicalViews;
      const updateClinicalViews = [...viewConfig, { slot: slot, slotName: slotName }];
      const tempConfigUpdate = set(
        cloneDeep(temporaryConfigStore.getState()),
        ['config', ...path],
        updateClinicalViews,
      );
      setTempConfig(tempConfigUpdate);
    },
    [clinicalViews, tempConfig, path],
  );

  const removeClinicalView = useCallback(
    (slot: string, slotName: string) => {
      const slotIndex = clinicalViews.findIndex((view: View) => view.slotName === slotName);
      clinicalViews.splice(slotIndex, 1);
      const tempConfigUpdate = set(cloneDeep(temporaryConfigStore.getState()), ['config', ...path], clinicalViews);
      setTempConfig(tempConfigUpdate);
    },
    [clinicalViews, path],
  );

  const handleChange = useCallback(
    (slot: string, slotName: string, checked: boolean) => {
      checked ? addClinicalView(slot, slotName) : removeClinicalView(slot, slotName);
    },
    [removeClinicalView, addClinicalView],
  );

  const handleSave = useCallback(() => {
    temporaryConfigStore.setState(tempConfig);
    closeClinicalViewForm();
  }, [tempConfig, closeClinicalViewForm]);

  const isChecked = (slot: string): boolean => clinicalViews.some((view) => view.slotName === slot);

  return (
    <div className={styles.formContainer}>
      <Search
        placeholder={t('searchForView', 'Search for a view')}
        id="search"
        onChange={(event) => handleSearch(event.target.value)}
        labelText=""
      />
      <div className={styles.checkboxContainer}>
        {searchResults.map((view) => (
          <Checkbox
            key={view.slot}
            id={view.slot}
            labelText={view.slotName}
            className={styles.checkBox}
            defaultChecked={isChecked(view.slot)}
            onChange={(checked) => handleChange(view.slotName, view.slot, checked)}
          />
        ))}
      </div>
      <div className={styles.buttonContainer}>
        <Button kind="secondary" onClick={closeClinicalViewForm}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSave} kind="primary">
          {t('saveAndClose', 'Save & Close')}
        </Button>
      </div>
    </div>
  );
};

export default ClinicalViewForm;
