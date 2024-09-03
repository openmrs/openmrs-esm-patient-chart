import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { FilterProvider } from '../filter/filter-context';
import TreeView from './tree-view.component';
import { useConfig } from '@openmrs/esm-framework';
import { useGetManyObstreeData } from '../grouped-timeline';
import { type viewOpts } from '../../types';

interface TreeViewWrapperProps {
  patientUuid: string;
  basePath: string;
  testUuid: string;
  expanded: boolean;
  type: string;
  view?: viewOpts;
}

const TreeViewWrapper: React.FC<TreeViewWrapperProps> = (props) => {
  const config = useConfig();
  const conceptUuids = config?.resultsViewerConcepts?.map((c) => c.conceptUuid) ?? [];
  const { roots, loading, error } = useGetManyObstreeData(conceptUuids);
  const { t } = useTranslation();

  if (error) return <ErrorState error={error} headerTitle={t('dataLoadError', 'Data load error')} />;

  if (roots?.length) {
    return (
      <FilterProvider roots={!loading ? roots : []}>
        <TreeView {...props} loading={loading} />
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
