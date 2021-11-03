import React from 'react';
import ChartLineSmooth16 from '@carbon/icons-react/es/chart--line-smooth/16';
import Table16 from '@carbon/icons-react/es/table/16';
import styles from './obs-switchable.scss';
import ObsGraph from '../obs-graph/obs-graph.component';
import ObsTable from '../obs-table/obs-table.component';
import { DataTableSkeleton, Button, InlineLoading } from 'carbon-components-react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useObs } from '../resources/useObs';
import { useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';

interface ObsSwitchableProps {
  patientUuid: string;
}

const ObsSwitchable: React.FC<ObsSwitchableProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const [chartView, setChartView] = React.useState<boolean>();
  const { data, error, isLoading, isValidating } = useObs(patientUuid);

  return (
    <>
      {(() => {
        if (isLoading) return <DataTableSkeleton role="progressbar" />;
        if (error) return <ErrorState error={error} headerTitle={config.title} />;
        if (data?.length) {
          return (
            <div className={styles.widgetContainer}>
              <div className={styles.headerContainer}>
                <h4>{config.title}</h4>
                <div className={styles.backgroundDataFetchingIndicator}>
                  <span>{isValidating ? <InlineLoading /> : null}</span>
                </div>
                <div className={styles.headerActionItems}>
                  <div className={styles.toggleButtons}>
                    <Button
                      className={styles.toggle}
                      size="field"
                      kind={chartView ? 'ghost' : 'tertiary'}
                      hasIconOnly
                      renderIcon={Table16}
                      iconDescription={t('tableView', 'Table View')}
                      onClick={() => setChartView(false)}
                    />
                    <Button
                      className={styles.toggle}
                      size="field"
                      kind={chartView ? 'tertiary' : 'ghost'}
                      hasIconOnly
                      renderIcon={ChartLineSmooth16}
                      iconDescription={t('chartView', 'Chart View')}
                      onClick={() => setChartView(true)}
                    />
                  </div>
                </div>
              </div>
              {chartView ? <ObsGraph patientUuid={patientUuid} /> : <ObsTable patientUuid={patientUuid} />}
            </div>
          );
        }
        return <EmptyState displayText={config.resultsName} headerTitle={config.title} />;
      })()}
    </>
  );
};

export default ObsSwitchable;
