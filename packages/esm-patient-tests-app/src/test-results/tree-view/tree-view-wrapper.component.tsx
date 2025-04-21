import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type viewOpts } from '../../types';
import { useGetManyObstreeData } from '../grouped-timeline';
import { FilterProvider } from '../filter/filter-context';
import TreeView from './tree-view.component';

interface TreeViewWrapperProps {
  patientUuid: string;
  basePath: string;
  testUuid: string;
  expanded: boolean;
  type: string;
  view?: viewOpts;
}

const TreeViewWrapper: React.FC<TreeViewWrapperProps> = (props) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const conceptUuids = config?.resultsViewerConcepts?.map((c) => c.conceptUuid) ?? [];
  const { roots, isLoading, error, mutate } = useGetManyObstreeData(conceptUuids);

  useEffect(() => {
    const interval = setInterval(() => {
      mutate();
    }, 30000);

    return () => clearInterval(interval);
  }, [mutate]);

  if (error) return <ErrorState error={error} headerTitle={t('dataLoadError', 'Data load error')} />;

  if (roots?.length) {
    return (
      <FilterProvider roots={!isLoading ? roots : []}>
        <TreeView {...props} isLoading={isLoading} />
      </FilterProvider>
    );
  }

  return (
    <EmptyState
      headerTitle={t('testResults_title', 'Test Results')}
      displayText={t('testResultsData', 'Test results data')}
    />
  );
};

export default TreeViewWrapper;
