import React, { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, DataTableSkeleton, IconSwitch, InlineLoading } from '@carbon/react';
import { Analytics, Table } from '@carbon/react/icons';
import { CardHeader, EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useObs } from '../resources/useObs';
import { type ConfigObjectSwitchable } from '../config-schema-obs-switchable';
import ObsGraph from '../obs-graph/obs-graph.component';
import ObsTable from '../obs-table/obs-table.component';
import styles from './obs-switchable.scss';

interface ObsSwitchableProps {
  patientUuid: string;
}

const ObsSwitchable: React.FC<ObsSwitchableProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObjectSwitchable>();
  const [chartView, setChartView] = React.useState<boolean>(config.showGraphByDefault);
  const isTablet = !isDesktop(useLayoutType());

  const {
    data: { observations },
    error,
    isLoading,
    isValidating,
  } = useObs(patientUuid);

  const isNumeric = observations.find((obs) => obs.dataType === 'Numeric');

  return (
    <>
      {(() => {
        if (isLoading) return <DataTableSkeleton role="progressbar" />;
        if (error) return <ErrorState error={error} headerTitle={config.title} />;
        if (observations?.length) {
          return (
            <div className={styles.widgetContainer}>
              <CardHeader title={t(config.title)}>
                <div className={styles.backgroundDataFetchingIndicator}>
                  <span>{isValidating ? <InlineLoading /> : null}</span>
                </div>
                {isNumeric ? (
                  <div className={styles.headerActionItems}>
                    <ContentSwitcher
                      onChange={(evt: ChangeEvent<HTMLButtonElement> & { name: string }) =>
                        setChartView(evt.name === 'chartView')
                      }
                      size={isTablet ? 'md' : 'sm'}
                      selectedIndex={chartView ? 1 : 0}
                    >
                      <IconSwitch name="tableView" text="Table view">
                        <Table size={16} />
                      </IconSwitch>
                      <IconSwitch name="chartView" text="Chart view">
                        <Analytics size={16} />
                      </IconSwitch>
                    </ContentSwitcher>
                  </div>
                ) : null}
              </CardHeader>
              {chartView && isNumeric ? <ObsGraph patientUuid={patientUuid} /> : <ObsTable patientUuid={patientUuid} />}
            </div>
          );
        }
        return <EmptyState displayText={config.resultsName} headerTitle={config.title} />;
      })()}
    </>
  );
};

export default ObsSwitchable;
