import { ExtensionSlot, useLeftNav } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { spaBasePath } from '../constants';
import Loader from '../loader/loader.component';
import ChartReview from '../patient-chart/chart-review/chart-review.component';
import SideMenuPanel from '../side-nav/side-menu.component';
import { type LayoutMode } from './chart-review/dashboard-view.component';
import styles from './patient-chart.scss';
import { usePatientChartPatientAndVisit } from './patient-chart.resources';

const PatientChart: React.FC = () => {
  const { patientUuid, view: encodedView } = useParams();

  // specify key to ensure that WrapPatientChart instance is re-created
  // when we switch patient
  return <WrappedPatientChart key={patientUuid} patientUuid={patientUuid} encodedView={encodedView} />;
};

interface WrappedPatientChartProps {
  patientUuid: string;
  encodedView: string;
}

const WrappedPatientChart: React.FC<WrappedPatientChartProps> = ({ patientUuid, encodedView }) => {
  const view = decodeURIComponent(encodedView);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>();
  const state = usePatientChartPatientAndVisit(patientUuid);
  const { isLoadingPatient, patient } = state;

  const leftNavBasePath = useMemo(() => spaBasePath.replace(':patientUuid', patientUuid), [patientUuid]);

  useLeftNav({ name: 'patient-chart-dashboard-slot', basePath: leftNavBasePath });

  return (
    <>
      <SideMenuPanel />
      <main className={classNames('omrs-main-content', styles.chartContainer)}>
        <>
          <div className={classNames(styles.innerChartContainer)}>
            {isLoadingPatient ? (
              <Loader />
            ) : (
              <>
                <aside>
                  <ExtensionSlot name="patient-header-slot" state={state} />
                  <ExtensionSlot name="patient-highlights-bar-slot" state={state} />
                  <ExtensionSlot name="patient-info-slot" state={state} />
                </aside>
                <div className={styles.grid}>
                  <div
                    className={classNames(styles.chartReview, { [styles.widthContained]: layoutMode == 'contained' })}
                  >
                    <ChartReview
                      patient={patient}
                      patientUuid={patientUuid}
                      view={view}
                      setDashboardLayoutMode={setLayoutMode}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      </main>
    </>
  );
};

export default PatientChart;
