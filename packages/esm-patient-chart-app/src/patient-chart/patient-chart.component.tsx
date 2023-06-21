import React, { useEffect, useMemo } from 'react';
import { ExtensionSlot, setLeftNav, unsetLeftNav, useConfig, usePatient } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import {
  changeWorkspaceContext,
  useAutoCreatedOfflineVisit,
  useWorkspaceWindowSize,
} from '@openmrs/esm-patient-common-lib';
import ChartReview from '../patient-chart/chart-review/chart-review.component';
import ActionMenu from './action-menu/action-menu.component';
import Loader from '../loader/loader.component';
import WorkspaceNotification from '../workspace/workspace-notification.component';
import styles from './patient-chart.scss';
import { spaBasePath } from '../constants';

const PatientChart: React.FC = () => {
  const { patientUuid, view: encodedView } = useParams();
  const view = decodeURIComponent(encodedView);
  const { isLoading: isLoadingPatient, patient } = usePatient(patientUuid);
  const { windowSize, active } = useWorkspaceWindowSize();
  const state = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);
  const { offlineVisitTypeUuid } = useConfig();

  // We are responsible for creating a new offline visit while in offline mode.
  // The patient chart widgets assume that this is handled by the chart itself.
  // We are also the module that holds the offline visit type UUID config.
  // The following hook takes care of the creation.
  useAutoCreatedOfflineVisit(patientUuid, offlineVisitTypeUuid);

  useEffect(() => {
    changeWorkspaceContext(patientUuid);
  }, [patientUuid]);

  const leftNavBasePath = useMemo(() => spaBasePath.replace(':patientUuid', patientUuid), [patientUuid]);
  useEffect(() => {
    setLeftNav({ name: 'patient-chart-dashboard-slot', basePath: leftNavBasePath });
    return () => unsetLeftNav('patient-chart-dashboard-slot');
  }, [leftNavBasePath]);

  return (
    <main className={`omrs-main-content ${styles.chartContainer}`}>
      <>
        <div
          className={`${styles.innerChartContainer} ${
            windowSize.size === 'normal' && active ? styles.closeWorkspace : styles.activeWorkspace
          }`}
        >
          <ExtensionSlot name="breadcrumbs-slot" />
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
                <div className={styles.chartReview}>
                  <ChartReview {...state} view={view} />
                  <WorkspaceNotification />
                </div>
              </div>
            </>
          )}
        </div>
        <ActionMenu open={false} />
      </>
    </main>
  );
};

export default PatientChart;
