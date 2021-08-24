import React, { useState, useCallback, useMemo, useReducer } from 'react';
import Search from 'carbon-components-react/es/components/Search';
import Checkbox from 'carbon-components-react/es/components/Checkbox';
import Button from 'carbon-components-react/es/components/Button';
import styles from './clinical-view-form.component.scss';
import debounce from 'lodash-es/debounce';
import { useTranslation } from 'react-i18next';
import { detach, temporaryConfigStore, TemporaryConfigStore } from '@openmrs/esm-framework';
import { useClinicalView } from '../store';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import set from 'lodash-es/set';
import { StructuredListSkeleton } from 'carbon-components-react/es/components/StructuredList';

interface ClinicalViewFormProps {
  isTablet: boolean;
}
interface View {
  slotName: string;
  slot: string;
  checked: boolean;
}

const ClinicalViewForm: React.FC<ClinicalViewFormProps> = ({ isTablet }) => {
  const { t } = useTranslation();
  const { views, clinicalViews } = useClinicalView();
  const moduleName = '@openmrs/esm-patient-clinical-view-app';
  const path = useMemo(() => [moduleName, 'clinicalViews'], []);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [searchResults, setSearchResult] = React.useState<Array<View>>([]);
  const [tempConfig, setTempConfig] = useState<TemporaryConfigStore>(null);
  const [isPending, setIsPending] = useState<boolean>(true);

  React.useEffect(() => {
    if (!isEmpty(views)) {
      setSearchResult(views);
      setIsPending(false);
    }
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
      const results = searchResults.map((view) => (view.slot === slotName ? { ...view, checked: true } : view));
      setSearchResult(results);

      const viewConfig = tempConfig ? tempConfig.config[moduleName].clinicalViews : clinicalViews;
      const updateClinicalViews = [...viewConfig, { slot: slot, slotName: slotName }];
      const tempConfigUpdate = set(
        cloneDeep(temporaryConfigStore.getState()),
        ['config', ...path],
        updateClinicalViews,
      );
      setTempConfig(tempConfigUpdate);
    },
    [clinicalViews, path, searchResults, tempConfig],
  );

  const removeClinicalView = useCallback(
    (slot: string, slotName: string) => {
      const slotIndex = clinicalViews.findIndex((view: View) => view.slotName === slotName);
      clinicalViews.splice(slotIndex, 1);
      const tempConfigUpdate = set(cloneDeep(temporaryConfigStore.getState()), ['config', ...path], clinicalViews);
      setTempConfig(tempConfigUpdate);
      const results = searchResults.map((view) => (view.slot === slotName ? { ...view, checked: false } : view));
      setSearchResult(results);
    },
    [clinicalViews, path, searchResults],
  );

  const handleChange = useCallback(
    (slot: string, slotName: string, checked: boolean) => {
      checked ? addClinicalView(slot, slotName) : removeClinicalView(slot, slotName);
    },
    [addClinicalView, removeClinicalView],
  );

  const handleSave = useCallback(() => {
    temporaryConfigStore.setState(tempConfig);
    closeClinicalViewForm();
  }, [tempConfig, closeClinicalViewForm]);

  const handleReset = useCallback(() => {
    const tempConfigUpdate = set(cloneDeep(temporaryConfigStore.getState()), ['config', ...path], clinicalViews);
    setTempConfig(tempConfigUpdate);
    setSearchResult(views);
  }, [clinicalViews, path, views]);

  return (
    <>
      {isPending && <StructuredListSkeleton />}
      {!isPending && (
        <div className={styles.formContainer}>
          <div className={styles.searchContainer}>
            <Search
              placeholder={t('searchForView', 'Search for a view')}
              id="search"
              onChange={(event) => handleSearch(event.target.value)}
              labelText=""
              light={isTablet}
              size="xl"
            />
            <Button kind="ghost" onClick={handleReset}>
              {t('reset', 'Reset')}
            </Button>
          </div>
          <section className={styles.checkboxContainer}>
            {searchResults?.map((view) => (
              <Checkbox
                key={view.slot}
                id={view.slot}
                labelText={view.slotName}
                className={styles.checkBox}
                checked={view.checked}
                onChange={(checked) => handleChange(view.slotName, view.slot, checked)}
              />
            ))}
          </section>
          <div className={styles.buttonContainer}>
            <Button kind="secondary" onClick={closeClinicalViewForm}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} kind="primary">
              {t('saveAndClose', 'Save & Close')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ClinicalViewForm;
